'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Win11ThemeProvider, useWin11Theme, CalculatorApp, SettingsApp } from './win11';
import StartMenu from './win11/ui/StartMenu';
import CalendarPanel from './win11/ui/CalendarPanel';
import LockScreen from './win11/ui/LockScreen';
import DesktopContextMenu from './win11/desktop/DesktopContextMenu';
import DesktopIconGrid from './win11/desktop/DesktopIconGrid';
import Taskbar from './win11/desktop/Taskbar';
import WindowFrame from './win11/desktop/WindowFrame';
import IconGlyph from './win11/desktop/IconGlyph';
import {
  APP_META,
  DEFAULT_DESKTOP_ICONS,
  DEFAULT_START_PINNED,
  DEFAULT_TASKBAR_PINNED,
  DESKTOP_GRID_SIZE,
  DESKTOP_STORAGE_KEY,
} from './win11/desktop/constants';
import type {
  AppId,
  ContextMenuItem,
  ContextMenuState,
  DesktopIconItem,
  ResizeDir,
  WindowSpec,
} from './win11/desktop/types';
import { BatteryIcon, VolumeIcon } from './win11/desktop/icons';

// Simple canvas-based paint tool
const PaintApp: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let drawing = false;
    const getPos = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onDown = (e: MouseEvent) => { drawing = true; const p = getPos(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); };
    const onMove = (e: MouseEvent) => { if (!drawing) return; const p = getPos(e); ctx.lineTo(p.x, p.y); ctx.strokeStyle = '#222'; ctx.lineWidth = 2; ctx.stroke(); };
    const onUp = () => { drawing = false; };
    canvas.addEventListener('mousedown', onDown);
    canvas.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { canvas.removeEventListener('mousedown', onDown); canvas.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);
  return (
    <div className="w-full h-full bg-white text-black p-3 text-sm">
      <div>Simple Paint: Use mouse to draw.</div>
      <canvas ref={canvasRef} className="mt-2 border border-gray-300" width={900} height={520}></canvas>
    </div>
  );
};
 

interface Win11DesktopProps {
  onReboot: (reason?: 'restart' | 'shutdown') => void;
}

const MENU_ICON_CLASS = 'w-5 h-5 text-black/60 dark:text-white/70';

const MENU_ICONS = {
  share: (
    <svg viewBox="0 0 24 24" className={MENU_ICON_CLASS}>
      <circle cx="5" cy="12" r="1.7" fill="currentColor" />
      <circle cx="12" cy="7" r="1.7" fill="currentColor" />
      <circle cx="19" cy="12" r="1.7" fill="currentColor" />
      <path d="M6.6 11.3 11 8.9M13 8.9l4.4 2.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  shield: (
    <svg viewBox="0 0 24 24" className={MENU_ICON_CLASS}>
      <path d="M12 3 5 6v5c0 4.6 3.1 8.9 7 10 3.9-1.1 7-5.4 7-10V6l-7-3Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  ),
  shieldStar: (
    <svg viewBox="0 0 24 24" className={MENU_ICON_CLASS}>
      <path d="M12 3 5 6v5c0 4.6 3.1 8.9 7 10 3.9-1.1 7-5.4 7-10V6l-7-3Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="m12 9.2 1 2.2 2.5.2-1.9 1.6.6 2.4L12 14.4l-2.2 1.2.6-2.4-1.9-1.6 2.5-.2Z" fill="currentColor" />
    </svg>
  ),
  pin: (
    <svg viewBox="0 0 24 24" className={MENU_ICON_CLASS}>
      <path d="M8 3h8l-1 7 3 2-5 5-5-5 3-2Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 17v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  star: (
    <svg viewBox="0 0 24 24" className={MENU_ICON_CLASS}>
      <path d="m12 4 2.1 4.6 5.1.6-3.7 3.4.9 4.9L12 15.8l-4.4 2.7.9-4.9L4.8 9.2l5.1-.6Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  ),
  archive: (
    <svg viewBox="0 0 24 24" className={MENU_ICON_CLASS}>
      <rect x="4" y="4" width="16" height="5" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6 9h12v9a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M10 12h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  copy: (
    <svg viewBox="0 0 24 24" className={MENU_ICON_CLASS}>
      <rect x="8" y="7" width="11" height="13" rx="1.6" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <rect x="5" y="4" width="11" height="13" rx="1.6" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.6" />
    </svg>
  ),
  rename: (
    <svg viewBox="0 0 24 24" className={MENU_ICON_CLASS}>
      <path d="M5 6h14M5 18h14M9 6v12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  info: (
    <svg viewBox="0 0 24 24" className={MENU_ICON_CLASS}>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 10v6M12 7v.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  pencil: (
    <svg viewBox="0 0 24 24" className={MENU_ICON_CLASS}>
      <path d="m7 17-2 4 4-2 10-10-2-2Z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="m14 6 2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  more: (
    <svg viewBox="0 0 24 24" className={MENU_ICON_CLASS}>
      <circle cx="6" cy="12" r="1.6" fill="currentColor" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      <circle cx="18" cy="12" r="1.6" fill="currentColor" />
    </svg>
  ),
  refresh: (
    <svg viewBox="0 0 24 24" className={MENU_ICON_CLASS}>
      <path d="M4 12a8 8 0 0 1 13.6-5.4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18 6v4h-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20 12a8 8 0 0 1-13.6 5.4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6 18v-4h4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  grid: (
    <svg viewBox="0 0 24 24" className={MENU_ICON_CLASS}>
      <rect x="4" y="4" width="6" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <rect x="14" y="4" width="6" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <rect x="4" y="14" width="6" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <rect x="14" y="14" width="6" height="6" rx="1" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  ),
  sort: (
    <svg viewBox="0 0 24 24" className={MENU_ICON_CLASS}>
      <path d="M8 6h8M8 12h5M8 18h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="m15 9 3-3 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  plus: (
    <svg viewBox="0 0 24 24" className={MENU_ICON_CLASS}>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  monitor: (
    <svg viewBox="0 0 24 24" className={MENU_ICON_CLASS}>
      <rect x="3" y="5" width="18" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9 19h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  palette: (
    <svg viewBox="0 0 24 24" className={MENU_ICON_CLASS}>
      <path d="M12 4a8 8 0 1 0 0 16h2.5a1.5 1.5 0 0 0 0-3H12a2 2 0 0 1-2-2c0-1.1.9-2 2-2h4a4 4 0 0 0 0-8Z" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="8.5" cy="10" r="1" fill="currentColor" />
      <circle cx="9.5" cy="6.5" r="1" fill="currentColor" />
      <circle cx="14.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  ),
  folder: (
    <svg viewBox="0 0 24 24" className={MENU_ICON_CLASS}>
      <path d="M4 6h6l2 2h8a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  ),
  doc: (
    <svg viewBox="0 0 24 24" className={MENU_ICON_CLASS}>
      <path d="M7 3h8l4 4v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M15 3v4h4" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M9 13h6M9 17h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  link: (
    <svg viewBox="0 0 24 24" className={MENU_ICON_CLASS}>
      <path d="M10.5 7h-3a4 4 0 0 0 0 8h3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M13.5 7h3a4 4 0 0 1 0 8h-3" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M8 12h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
};

const CHECK_ICON = (
  <svg viewBox="0 0 20 20" className="w-4 h-4 text-[var(--accent,theme(colors.blue.500))]">
    <path d="M4 10.5 7.5 14 16 5.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

type AppContentProps = { app: AppId; openApp: (app: AppId) => void };

// Simple task manager (emulated)
const TaskManagerApp: React.FC<{ openApp: (app: AppId) => void }> = ({ openApp }) => {
  type Proc = { pid: number; name: string; type: 'App' | 'Background'; cpu: number; mem: number; disk: number; net: number; status?: string };
  const [tab, setTab] = useState<'processes' | 'performance' | 'startup' | 'users'>('processes');
  const [procs, setProcs] = useState<Proc[]>(() => {
    const seed: Proc[] = [
      { pid: 1001, name: 'File Explorer', type: 'App', cpu: 1.2, mem: 330, disk: 0, net: 0 },
      { pid: 1002, name: 'Microsoft Edge', type: 'App', cpu: 2.1, mem: 512, disk: 0.1, net: 0.2 },
      { pid: 1003, name: 'Notepad', type: 'App', cpu: 0.3, mem: 45, disk: 0, net: 0 },
      { pid: 1004, name: 'Paint', type: 'App', cpu: 0.5, mem: 120, disk: 0, net: 0 },
      { pid: 1005, name: 'Calculator', type: 'App', cpu: 0.2, mem: 60, disk: 0, net: 0 },
      { pid: 1006, name: 'Task Manager', type: 'App', cpu: 1.8, mem: 95, disk: 0, net: 0 },
      // background
      { pid: 2001, name: 'Windows Explorer', type: 'Background', cpu: 0.4, mem: 140, disk: 0, net: 0 },
      { pid: 2002, name: 'System', type: 'Background', cpu: 0.9, mem: 210, disk: 0, net: 0 },
      { pid: 2003, name: 'Runtime Broker', type: 'Background', cpu: 0.2, mem: 80, disk: 0, net: 0 },
    ];
    return seed;
  });
  const [selectedPid, setSelectedPid] = useState<number | null>(null);
  const [cpuHistory, setCpuHistory] = useState<number[]>(new Array(60).fill(10));
  const [memHistory, setMemHistory] = useState<number[]>(new Array(60).fill(30));
  const totalMemGb = 64;

  useEffect(() => {
    const id = setInterval(() => {
      setProcs(prev => prev.map(p => {
        const jitter = (n: number) => Math.max(0, n + (Math.random() - 0.5) * 2);
        return { ...p, cpu: Math.min(30, jitter(p.cpu)), mem: Math.max(20, p.mem + (Math.random() - 0.5) * 5) };
      }));
      const cpu = procs.reduce((a,b)=>a+b.cpu,0);
      const mem = procs.reduce((a,b)=>a+b.mem,0) / 1024 * 100 / (totalMemGb / 1); // rough %
      setCpuHistory(h => [...h.slice(1), Math.min(100, cpu)]);
      setMemHistory(h => [...h.slice(1), Math.min(100, mem)]);
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const endTask = () => {
    if (selectedPid == null) return;
    setProcs(prev => prev.filter(p => p.pid !== selectedPid));
    setSelectedPid(null);
  };

  const runNewTask = () => openApp('notepad');

  const Graph: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
    const width = 320, height = 120; const max = 100;
    const points = data.map((v,i)=>`${(i/(data.length-1))*width},${height - (v/max)*height}`).join(' ');
    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-28">
        <polyline points={points} fill="none" stroke={color} strokeWidth="2" />
      </svg>
    );
  };

  return (
    <div className="w-full h-full bg-[#111827] text-gray-200 flex">
      <div className="w-48 border-r border-black/40 p-2 space-y-1 text-sm">
        {([
          { id: 'processes', label: 'Processes' },
          { id: 'performance', label: 'Performance' },
          { id: 'startup', label: 'Startup apps' },
          { id: 'users', label: 'Users' },
        ] satisfies Array<{ id: typeof tab; label: string }>).map((item) => (
          <button
            key={item.id}
            className={`w-full text-left px-3 py-2 rounded ${tab === item.id ? 'bg-white/10' : 'hover:bg-white/5'}`}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="flex-1 p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="text-base font-medium capitalize">{tab}</div>
          <div className="flex items-center gap-2">
            <button className="px-2 py-1 text-xs rounded bg-white/10 hover:bg-white/20" onClick={runNewTask}>Run new task</button>
            {tab==='processes' && <button className="px-2 py-1 text-xs rounded bg-white/10 hover:bg-white/20 disabled:opacity-40" disabled={selectedPid==null} onClick={endTask}>End task</button>}
          </div>
        </div>

        {tab==='processes' && (
          <div className="overflow-auto border border-white/10 rounded">
            <table className="w-full text-sm">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left px-3 py-2 w-48">Name</th>
                  <th className="text-left px-3 py-2">Type</th>
                  <th className="text-right px-3 py-2">CPU</th>
                  <th className="text-right px-3 py-2">Memory (MB)</th>
                  <th className="text-right px-3 py-2">Disk (MB/s)</th>
                  <th className="text-right px-3 py-2">Network (Mbps)</th>
                </tr>
              </thead>
              <tbody>
                {procs.map(p => (
                  <tr key={p.pid} className={`hover:bg-white/5 cursor-default ${selectedPid===p.pid?'bg-white/10':''}`} onClick={()=>setSelectedPid(p.pid)}>
                    <td className="px-3 py-2">{p.name}</td>
                    <td className="px-3 py-2">{p.type}</td>
                    <td className="px-3 py-2 text-right">{p.cpu.toFixed(1)}%</td>
                    <td className="px-3 py-2 text-right">{p.mem.toFixed(0)}</td>
                    <td className="px-3 py-2 text-right">{p.disk.toFixed(1)}</td>
                    <td className="px-3 py-2 text-right">{p.net.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab==='performance' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded p-3">
              <div className="text-sm mb-2">CPU</div>
              <Graph data={cpuHistory} color="#34d399" />
            </div>
            <div className="bg-white/5 rounded p-3">
              <div className="text-sm mb-2">Memory</div>
              <Graph data={memHistory} color="#60a5fa" />
            </div>
          </div>
        )}

        {tab==='startup' && (
          <div className="space-y-2 text-sm">
            {[{name:'Edge'},{name:'Teams'},{name:'Copilot'},{name:'OneDrive'},{name:'Spotify'}].map((app,i)=> (
              <div key={i} className="flex items-center justify-between bg-white/5 rounded px-3 py-2">
                <div>{app.name}</div>
                <button className="px-2 py-1 rounded bg-white/10 hover:bg-white/20">Disabled</button>
              </div>
            ))}
          </div>
        )}

        {tab==='users' && (
          <div className="bg-white/5 rounded p-3 text-sm">
            <div className="flex items-center justify-between">
              <div>user@emulated</div>
              <div className="text-xs text-gray-400">CPU {(cpuHistory[cpuHistory.length-1]||0).toFixed(0)}% • Memory {(memHistory[memHistory.length-1]||0).toFixed(0)}%</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AppContent: React.FC<AppContentProps> = ({ app, openApp }) => {
  const { themeMode } = useWin11Theme();
  const surfaceBG = themeMode === 'dark' ? 'rgba(17,24,39,1)' : '#ffffff';
  const surfaceText = themeMode === 'dark' ? 'white' : 'black';
  const softBG = themeMode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)';
  if (app === 'notepad') {
    return (
      <textarea className="w-full h-full outline-none p-3 text-[13px]" style={{ background: surfaceBG, color: surfaceText }} defaultValue={'Untitled - Notepad\n\nType here...'} />
    );
  }
  if (app === 'paint') {
    return (
      <div className="w-full h-full p-3 text-sm" style={{ background: surfaceBG, color: surfaceText }}>
        <PaintApp />
      </div>
    );
  }
  if (app === 'taskmgr') {
    return (
      <TaskManagerApp openApp={openApp} />
    );
  }
  if (app === 'calc') {
    return <CalculatorApp />
  }
  if (app === 'settings') {
    return <SettingsApp />
  }
  if (app === 'edge') {
    return (
      <iframe title="Browser" className="w-full h-full" style={{ background: surfaceBG }} src="https://example.com" />
    );
  }
  // explorer
  return (
    <div className="w-full h-full p-3 text-sm" style={{ background: surfaceBG, color: surfaceText }}>
      <div className="mb-2">This PC</div>
      <div className="grid grid-cols-6 gap-4">
        {['Desktop','Documents','Downloads','Pictures','Music','Videos'].map((f) => (
          <div key={f} className="p-3 border rounded" style={{ background: softBG, borderColor: themeMode==='dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }}>{f}</div>
        ))}
      </div>
    </div>
  );
};

const DesktopChrome: React.FC<Win11DesktopProps> = ({ onReboot }) => {
  const { themeMode, accentColor, transparency } = useWin11Theme();
  const [phase, setPhase] = useState<'splash' | 'lock' | 'desktop'>('splash');
  const [windows, setWindows] = useState<WindowSpec[]>([]);
  const [zTop, setZTop] = useState(10);
  const [taskbarPinned] = useState<AppId[]>(DEFAULT_TASKBAR_PINNED);
  const [startPinned, setStartPinned] = useState<AppId[]>(DEFAULT_START_PINNED);
  const [startOpen, setStartOpen] = useState(false);
  const [startPowerOpen, setStartPowerOpen] = useState(false);
  const [qsOpen, setQsOpen] = useState(false);
  const [ncOpen, setNcOpen] = useState(false);
  const [wifiOn, setWifiOn] = useState(true);
  const [btOn, setBtOn] = useState(false);
  const [airplaneOn, setAirplaneOn] = useState(false);
  const [energySaver, setEnergySaver] = useState(false);
  const [accessibilityOn, setAccessibilityOn] = useState(false);
  const [hotspotOn, setHotspotOn] = useState(false);
  const [brightness, setBrightness] = useState(80);
  const [volume, setVolume] = useState(40);
  const [muted, setMuted] = useState(false);
  const [batteryLevel] = useState(98);
  const [clock, setClock] = useState<string>(new Date().toLocaleTimeString());
  const [iconSize, setIconSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [showDesktopIcons, setShowDesktopIcons] = useState(true);
  const [autoArrange, setAutoArrange] = useState(false);
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const dragRef = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const resizeRef = useRef<{ id: string; dir: ResizeDir; startX: number; startY: number; startW: number; startH: number; startL: number; startT: number } | null>(null);
  const iconDragRef = useRef<{ id: string; idx: number; offsetX: number; offsetY: number } | null>(null);
  const [tbPreview, setTbPreview] = useState<{ windowId: string; x: number; y: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ open: false, x: 0, y: 0, targetType: 'desktop', items: [] });
  const [selectedIcons, setSelectedIcons] = useState<string[]>([]);
  const [renameId, setRenameId] = useState<string | null>(null);

  const loadDesktopIcons = (): DesktopIconItem[] => {
    if (typeof window === 'undefined') return DEFAULT_DESKTOP_ICONS;
    try {
      const raw = window.localStorage.getItem(DESKTOP_STORAGE_KEY);
      if (!raw) return DEFAULT_DESKTOP_ICONS;
      const parsed = JSON.parse(raw) as unknown;
      if (!Array.isArray(parsed)) return DEFAULT_DESKTOP_ICONS;
      const normalized: DesktopIconItem[] = parsed
        .map((entry, idx) => {
          if (typeof entry !== 'object' || entry === null) return null;
          const candidate = entry as Partial<DesktopIconItem> & { app?: string };
          const app = candidate.app;
          if (!app || !APP_META[app as AppId]) return null;
          const appId = app as AppId;
          const defaultIcon = DEFAULT_DESKTOP_ICONS[Math.min(idx, DEFAULT_DESKTOP_ICONS.length - 1)];
          const labelSource = typeof candidate.label === 'string' && candidate.label.trim().length
            ? candidate.label
            : appId === 'explorer'
              ? 'This PC'
              : APP_META[appId].label;
          return {
            id: candidate.id ?? `${appId}-${idx}`,
            app: appId,
            x: typeof candidate.x === 'number' ? candidate.x : defaultIcon.x,
            y: typeof candidate.y === 'number' ? candidate.y : defaultIcon.y,
            label: labelSource,
          } satisfies DesktopIconItem;
        })
        .filter((icon): icon is DesktopIconItem => Boolean(icon));
      const missingDefaults = DEFAULT_DESKTOP_ICONS.filter(def => !normalized.some(icon => icon.app === def.app));
      return [...normalized, ...missingDefaults];
    } catch {
      return DEFAULT_DESKTOP_ICONS;
    }
  };

  const [desktopIcons, setDesktopIcons] = useState<DesktopIconItem[]>(loadDesktopIcons);

  const persistIcons = (iconsToPersist: DesktopIconItem[]) => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(DESKTOP_STORAGE_KEY, JSON.stringify(iconsToPersist));
    } catch {
      // ignore storage errors
    }
  };

  useEffect(() => {
    persistIcons(desktopIcons);
  }, [desktopIcons]);

  const showToast = (message: string) => {
    if (typeof window === 'undefined') return;
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    const id = Date.now();
    setToast({ id, message });
    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimerRef.current = null;
    }, 2600);
  };

  const closeContextMenu = () => setContextMenu(prev => ({ ...prev, open: false }));

  const arrangeIcons = (source?: DesktopIconItem[]) => {
    if (typeof window === 'undefined') return;
    const list = source ? [...source] : [...desktopIcons];
    const sorted = [...list].sort((a, b) => a.label.localeCompare(b.label));
    const columnWidth = iconSize === 'large' ? 120 : iconSize === 'small' ? 80 : 100;
    const rowHeight = iconSize === 'large' ? 120 : iconSize === 'small' ? 80 : 96;
    const paddingX = 20;
    const paddingY = 20;
    const maxHeight = window.innerHeight - 160;
    let x = paddingX;
    let y = paddingY;
    const rearranged = sorted.map(icon => {
      const next = { ...icon, x, y };
      y += rowHeight;
      if (y > maxHeight) {
        y = paddingY;
        x += columnWidth;
      }
      return next;
    });
    setDesktopIcons(rearranged);
  };

  useEffect(() => {
    if (autoArrange) arrangeIcons();
  }, [autoArrange, iconSize]);

  const sortDesktopIcons = (mode: 'name' | 'type') => {
    const comparator =
      mode === 'name'
        ? (a: DesktopIconItem, b: DesktopIconItem) => a.label.localeCompare(b.label)
        : (a: DesktopIconItem, b: DesktopIconItem) => APP_META[a.app].label.localeCompare(APP_META[b.app].label);
    const sorted = [...desktopIcons].sort(comparator);
    if (autoArrange) {
      arrangeIcons(sorted);
    } else {
      setDesktopIcons(sorted);
    }
  };

  const copyToClipboard = async (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard');
        return;
      } catch {
        // fallthrough
      }
    }
    showToast('Clipboard unavailable');
  };

  const openApp = (app: AppId) => {
    closeContextMenu();
    setStartOpen(false);
    setStartPowerOpen(false);
    setQsOpen(false);
    setNcOpen(false);
    if (app === 'portfolio') {
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem('os.current', 'windows');
          window.localStorage.setItem('os.power', 'on');
        } catch {}
        window.location.assign('/');
      }
      return;
    }
    let shouldRaise = true;
    setWindows(prev => {
      const existing = [...prev].reverse().find(w => w.app === app);
      if (existing) {
        const maxZ = prev.reduce((max, win) => Math.max(max, win.z), 0);
        return prev.map(w => {
          if (w.id !== existing.id) return w;
          if (w.minimized || existing.z < maxZ) {
            const restore = w.restore || { x: w.x, y: w.y, w: w.w, h: w.h };
            return {
              ...w,
              minimized: false,
              x: restore.x,
              y: restore.y,
              w: restore.w,
              h: restore.h,
              z: zTop + 1,
            };
          }
          shouldRaise = false;
          return { ...w, minimized: true };
        });
      }
      const baseX = 160 + (prev.length * 24) % 300;
      const baseY = 120 + (prev.length * 16) % 200;
      const id = `${app}-${Date.now()}`;
      const win: WindowSpec = {
        id,
        app,
        title: APP_META[app].label,
        x: baseX,
        y: baseY,
        w: 900,
        h: 600,
        z: zTop + 1,
        minimized: false,
        maximized: false,
        restore: { x: baseX, y: baseY, w: 900, h: 600 },
      };
      return [...prev, win];
    });
    if (shouldRaise) {
      setZTop(z => z + 1);
    }
  };

  const closeWindow = (id: string) => setWindows(prev => prev.filter(w => w.id !== id));

  const focusWindow = (id: string) => {
    setWindows(prev => prev.map(w => (w.id === id ? { ...w, z: zTop + 1 } : w)));
    setZTop(z => z + 1);
    closeContextMenu();
  };

  const toggleMinimize = (id: string) => {
    setWindows(prev => prev.map(w => {
      if (w.id !== id) return w;
      if (w.minimized) {
        if (w.maximized) {
          return { ...w, minimized: false, x: 0, y: 0, w: window.innerWidth, h: window.innerHeight - 48 };
        }
        const rb = w.restore || { x: w.x, y: w.y, w: w.w, h: w.h };
        const maxW = window.innerWidth;
        const maxH = window.innerHeight - 48;
        return {
          ...w,
          minimized: false,
          x: Math.max(0, Math.min(rb.x, maxW - rb.w)),
          y: Math.max(0, Math.min(rb.y, maxH - rb.h)),
          w: Math.min(rb.w, maxW),
          h: Math.min(rb.h, maxH),
        };
      }
      return { ...w, minimized: true };
    }));
  };

  const toggleMaximize = (id: string) => {
    setWindows(prev => prev.map(w => {
      if (w.id !== id) return w;
      if (!w.maximized) {
        return {
          ...w,
          maximized: true,
          restore: { x: w.x, y: w.y, w: w.w, h: w.h },
          x: 0,
          y: 0,
          w: window.innerWidth,
          h: window.innerHeight - 48,
        };
      }
      const rb = w.restore || { x: w.x, y: w.y, w: Math.min(w.w, window.innerWidth), h: Math.min(w.h, window.innerHeight - 48) };
      const maxW = window.innerWidth;
      const maxH = window.innerHeight - 48;
      const nx = Math.max(0, Math.min(rb.x, maxW - rb.w));
      const ny = Math.max(0, Math.min(rb.y, maxH - rb.h));
      const nw = Math.min(rb.w, maxW);
      const nh = Math.min(rb.h, maxH);
      return { ...w, maximized: false, x: nx, y: ny, w: nw, h: nh };
    }));
  };

  const handleWindowDragStart = (id: string, event: React.MouseEvent<HTMLDivElement>) => {
    const win = windows.find(w => w.id === id);
    if (!win || win.maximized) return;
    dragRef.current = { id, dx: event.clientX - win.x, dy: event.clientY - win.y };
  };

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      if (!dragRef.current) return;
      const { id, dx, dy } = dragRef.current;
      setWindows(prev => prev.map(w => {
        if (w.id !== id || w.maximized) return w;
        const vw = window.innerWidth;
        const vh = window.innerHeight - 48;
        const nx = Math.min(Math.max(0, event.clientX - dx), Math.max(0, vw - w.w));
        const ny = Math.min(Math.max(0, event.clientY - dy), Math.max(0, vh - w.h));
        return { ...w, x: nx, y: ny, restore: { x: nx, y: ny, w: w.w, h: w.h } };
      }));
    };
    const onUp = () => {
      dragRef.current = null;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const handleBeginResize = (id: string, dir: ResizeDir, event: React.MouseEvent<HTMLDivElement>) => {
    const win = windows.find(w => w.id === id);
    if (!win || win.maximized) return;
    resizeRef.current = {
      id,
      dir,
      startX: event.clientX,
      startY: event.clientY,
      startW: win.w,
      startH: win.h,
      startL: win.x,
      startT: win.y,
    };
  };

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      if (!resizeRef.current) return;
      const { id, dir, startX, startY, startW, startH, startL, startT } = resizeRef.current;
      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      const minW = 420;
      const minH = 260;
      setWindows(prev => prev.map(w => {
        if (w.id !== id || w.maximized) return w;
        let x = startL;
        let y = startT;
        let width = startW;
        let height = startH;
        if (dir.includes('e')) width = Math.max(minW, startW + dx);
        if (dir.includes('s')) height = Math.max(minH, startH + dy);
        if (dir.includes('w')) {
          width = Math.max(minW, startW - dx);
          x = startL + (startW - width);
        }
        if (dir.includes('n')) {
          height = Math.max(minH, startH - dy);
          y = startT + (startH - height);
        }
        const vw = window.innerWidth;
        const vh = window.innerHeight - 48;
        width = Math.min(width, vw - x);
        height = Math.min(height, vh - y);
        return { ...w, x, y, w: width, h: height, restore: { x, y, w: width, h: height } };
      }));
    };
    const onUp = () => {
      resizeRef.current = null;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      if (!iconDragRef.current) return;
      const { idx, offsetX, offsetY } = iconDragRef.current;
      setDesktopIcons(prev => {
        const icon = prev[idx];
        if (!icon) return prev;
        const snap = (value: number) => Math.round(value / DESKTOP_GRID_SIZE) * DESKTOP_GRID_SIZE;
        const maxX = Math.max(16, window.innerWidth - 120);
        const maxY = Math.max(16, window.innerHeight - 140);
        const nx = Math.min(Math.max(snap(event.clientX - offsetX), 16), maxX);
        const ny = Math.min(Math.max(snap(event.clientY - offsetY), 16), maxY);
        const copy = [...prev];
        copy[idx] = { ...icon, x: nx, y: ny };
        return copy;
      });
    };
    const onUp = () => {
      if (autoArrange) arrangeIcons();
      iconDragRef.current = null;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [autoArrange]);

  useEffect(() => {
    if (phase !== 'splash') return;
    if (typeof window === 'undefined') return;
    const audioCtor = window.AudioContext ?? (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!audioCtor) {
      const fallback = window.setTimeout(() => setPhase('lock'), 1200);
      return () => window.clearTimeout(fallback);
    }
    const audio = new audioCtor();
    const gains: GainNode[] = [];
    const oscs: OscillatorNode[] = [];
    const freqs = [587, 784, 880];
    freqs.forEach((freq, idx) => {
      const osc = audio.createOscillator();
      const gain = audio.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(audio.destination);
      const startTime = audio.currentTime;
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.15 / (idx + 1), startTime + 0.08 + idx * 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 1.4 + idx * 0.02);
      osc.start();
      osc.stop(startTime + 1.5 + idx * 0.02);
      gains.push(gain);
      oscs.push(osc);
    });
    const timer = window.setTimeout(() => setPhase('lock'), 1800);
    return () => {
      gains.forEach(g => g.disconnect());
      oscs.forEach(o => o.disconnect());
      window.clearTimeout(timer);
    };
  }, [phase]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const timer = window.setInterval(() => setClock(new Date().toLocaleTimeString()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey && event.altKey && event.key.toLowerCase() === 'delete') || event.key === 'F9') {
        event.preventDefault();
        onReboot('restart');
      }
      if (event.key === 'Escape') {
        setStartOpen(false);
        setStartPowerOpen(false);
        setQsOpen(false);
        setNcOpen(false);
        closeContextMenu();
        setRenameId(null);
      }
      if (event.ctrlKey && event.shiftKey && (event.key === 'Escape' || event.key === 'Esc')) {
        event.preventDefault();
        openApp('taskmgr');
      }
      if (phase !== 'desktop') return;
      if (!selectedIcons.length) return;
      const primaryId = selectedIcons[selectedIcons.length - 1];
      const primaryIcon = desktopIcons.find(icon => icon.id === primaryId);
      if (!primaryIcon) return;
      if (event.key === 'Enter') {
        event.preventDefault();
        openApp(primaryIcon.app);
      }
      if (event.key === 'F2') {
        event.preventDefault();
        setRenameId(primaryIcon.id);
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'c') {
        event.preventDefault();
        copyToClipboard(APP_META[primaryIcon.app].path);
      }
      if (event.key === 'Delete') {
        event.preventDefault();
        showToast('Deleting system icons is disabled in this demo');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, selectedIcons, desktopIcons, onReboot]);

  const showTaskbarPreview = (appId: AppId, targetEl: HTMLElement) => {
    const liveWin = [...windows].reverse().find(w => w.app === appId && !w.minimized);
    if (!liveWin) {
      setTbPreview(null);
      return;
    }
    const rect = targetEl.getBoundingClientRect();
    const desiredWidth = 236;
    const desiredHeight = 160;
    const x = rect.left + rect.width / 2 - desiredWidth / 2;
    const y = window.innerHeight - 48 - (desiredHeight + 16);
    const clampedX = Math.max(8, Math.min(x, window.innerWidth - desiredWidth - 8));
    const clampedY = Math.max(8, y);
    setTbPreview({ windowId: liveWin.id, x: clampedX, y: clampedY });
  };

  const hideTaskbarPreview = () => setTbPreview(null);

  const handleSelectIcon = (id: string, event: React.MouseEvent) => {
    closeContextMenu();
    setRenameId(null);
    setSelectedIcons(prev => {
      if (event.shiftKey && prev.length) {
        const lastId = prev[prev.length - 1];
        const startIndex = desktopIcons.findIndex(icon => icon.id === lastId);
        const endIndex = desktopIcons.findIndex(icon => icon.id === id);
        if (startIndex < 0 || endIndex < 0) return [id];
        const [from, to] = startIndex < endIndex ? [startIndex, endIndex] : [endIndex, startIndex];
        return desktopIcons.slice(from, to + 1).map(icon => icon.id);
      }
      if (event.ctrlKey || event.metaKey) {
        if (prev.includes(id)) {
          return prev.filter(item => item !== id);
        }
        return [...prev, id];
      }
      return [id];
    });
  };

  const handleRenameSubmit = (id: string, nextLabel: string) => {
    const trimmed = nextLabel.trim() || 'Untitled';
    setDesktopIcons(prev => prev.map(icon => (icon.id === id ? { ...icon, label: trimmed } : icon)));
    setRenameId(null);
    showToast(`Renamed to “${trimmed}”`);
  };

  const buildIconMenu = (icon: DesktopIconItem): ContextMenuItem[] => {
    const meta = APP_META[icon.app];
    const pinned = startPinned.includes(icon.app);
    const togglePin = () => {
      setStartPinned(prev => {
        if (prev.includes(icon.app)) {
          showToast(`${meta.label} removed from Start`);
          return prev.filter(app => app !== icon.app);
        }
        showToast(`${meta.label} pinned to Start`);
        return [...prev, icon.app];
      });
    };
    const shareItem = async () => {
      const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
      if (!canShare) {
        showToast('Sharing not supported');
        return;
      }
      try {
        await navigator.share({
          title: icon.label,
          text: `Check out ${icon.label}`,
        });
        showToast('Shared successfully');
      } catch (err) {
        const aborted = err instanceof DOMException && err.name === 'AbortError';
        if (!aborted) {
          showToast('Share cancelled');
        }
      }
    };
    return [
      { id: 'open', label: 'Open', icon: <IconGlyph name={meta.icon} className="w-5 h-5 text-black/70" />, onSelect: () => openApp(icon.app) },
      { id: 'share', label: 'Share with', icon: MENU_ICONS.share, onSelect: shareItem },
      { id: 'run-admin', label: 'Run as administrator', icon: MENU_ICONS.shield, onSelect: () => showToast(`Pretending to elevate ${icon.label}`) },
      { id: 'run-trusted', label: 'Run as trustedinstaller', icon: MENU_ICONS.shieldStar, onSelect: () => showToast('TrustedInstaller privileges granted (not really)') },
      { id: 'open-location', label: 'Open file location', icon: <IconGlyph name="explorer" className="w-5 h-5 text-black/70" />, onSelect: () => { openApp('explorer'); showToast('Opening file location'); } },
      { id: 'pin-start', label: pinned ? 'Unpin from Start' : 'Pin to Start', icon: MENU_ICONS.pin, onSelect: togglePin },
      { id: 'favorites', label: 'Add to Favorites', icon: MENU_ICONS.star, onSelect: () => showToast(`${icon.label} added to Favorites`) },
      { id: 'divider-ic-1', divider: true },
      { id: 'compress', label: 'Compress to...', icon: MENU_ICONS.archive, onSelect: () => showToast('Launching compression wizard...') },
      { id: 'copy-path', label: 'Copy as path', icon: MENU_ICONS.copy, shortcut: 'Ctrl+Shift+C', onSelect: () => copyToClipboard(meta.path) },
      { id: 'rename', label: 'Rename', icon: MENU_ICONS.rename, shortcut: 'F2', onSelect: () => setRenameId(icon.id) },
      { id: 'properties', label: 'Properties', icon: MENU_ICONS.info, shortcut: 'Alt+Enter', onSelect: () => showToast('Properties dialog unavailable in demo') },
      { id: 'edit-notepad', label: 'Edit in Notepad', icon: <IconGlyph name="notepad" className="w-5 h-5 text-black/70" />, onSelect: () => openApp('notepad') },
      {
        id: 'winrar',
        label: 'WinRAR',
        icon: MENU_ICONS.archive,
        children: [
          { id: 'winrar-add', label: `Add to "${icon.label}.rar"`, onSelect: () => showToast('Archive created') },
          { id: 'winrar-zip', label: `Add to "${icon.label}.zip"`, onSelect: () => showToast('Zip file ready') },
          { id: 'winrar-email', label: 'Add and email...', onSelect: () => showToast('Sending archive via imaginary email') },
        ],
      },
      { id: 'divider-ic-2', divider: true },
      { id: 'more', label: 'Show more options', icon: MENU_ICONS.more, onSelect: () => showToast('Classic context menu summoned (in your mind)') },
    ];
  };

  const buildDesktopMenu = (): ContextMenuItem[] => [
    {
      id: 'view',
      label: 'View',
      icon: MENU_ICONS.grid,
      children: [
        { id: 'view-large', label: 'Large icons', accessory: iconSize === 'large' ? CHECK_ICON : undefined, onSelect: () => setIconSize('large') },
        { id: 'view-medium', label: 'Medium icons', accessory: iconSize === 'medium' ? CHECK_ICON : undefined, onSelect: () => setIconSize('medium') },
        { id: 'view-small', label: 'Small icons', accessory: iconSize === 'small' ? CHECK_ICON : undefined, onSelect: () => setIconSize('small') },
        {
          id: 'view-auto-arrange',
          label: 'Auto arrange icons',
          accessory: autoArrange ? CHECK_ICON : undefined,
          onSelect: () => setAutoArrange(prev => {
            const next = !prev;
            if (next) arrangeIcons();
            showToast(next ? 'Auto arrange enabled' : 'Auto arrange disabled');
            return next;
          }),
        },
        {
          id: 'view-show-icons',
          label: 'Show desktop icons',
          accessory: showDesktopIcons ? CHECK_ICON : undefined,
          onSelect: () => setShowDesktopIcons(prev => {
            const next = !prev;
            showToast(next ? 'Desktop icons visible' : 'Desktop icons hidden');
            return next;
          }),
        },
      ],
    },
    {
      id: 'sort',
      label: 'Sort by',
      icon: MENU_ICONS.sort,
      children: [
        { id: 'sort-name', label: 'Name', onSelect: () => sortDesktopIcons('name') },
        { id: 'sort-type', label: 'Item type', onSelect: () => sortDesktopIcons('type') },
      ],
    },
    { id: 'refresh', label: 'Refresh', icon: MENU_ICONS.refresh, onSelect: () => { arrangeIcons(); showToast('Refreshed'); } },
    { id: 'divider-d-1', divider: true },
    {
      id: 'new',
      label: 'New',
      icon: MENU_ICONS.plus,
      children: [
        { id: 'new-folder', label: 'Folder', icon: MENU_ICONS.folder, onSelect: () => showToast('Folder creation not enabled in demo') },
        { id: 'new-shortcut', label: 'Shortcut', icon: MENU_ICONS.link, onSelect: () => showToast('Shortcut wizard unavailable') },
        { id: 'new-text', label: 'Text Document', icon: MENU_ICONS.doc, onSelect: () => showToast('Use Notepad to create documents') },
      ],
    },
    { id: 'display', label: 'Display settings', icon: MENU_ICONS.monitor, onSelect: () => openApp('settings') },
    { id: 'personalize', label: 'Personalize', icon: MENU_ICONS.palette, onSelect: () => openApp('settings') },
  ];

  const handleIconContextMenu = (event: React.MouseEvent, icon: DesktopIconItem) => {
    event.preventDefault();
    setSelectedIcons(prev => (prev.includes(icon.id) ? prev : [icon.id]));
    setRenameId(null);
    setStartOpen(false);
    setStartPowerOpen(false);
    setQsOpen(false);
    setNcOpen(false);
    setContextMenu({
      open: true,
      x: event.clientX,
      y: event.clientY,
      targetType: 'icon',
      targetId: icon.id,
      items: buildIconMenu(icon),
    });
  };

  const handleDesktopContextMenu = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.closest('[data-window-frame="true"]') || target.closest('[data-taskbar="true"]') || target.closest('[data-context-keep="true"]')) {
      return;
    }
    event.preventDefault();
    setSelectedIcons([]);
    setRenameId(null);
    setStartOpen(false);
    setStartPowerOpen(false);
    setQsOpen(false);
    setNcOpen(false);
    setContextMenu({
      open: true,
      x: event.clientX,
      y: event.clientY,
      targetType: 'desktop',
      items: buildDesktopMenu(),
    });
  };

  useEffect(() => {
    if (!autoArrange) return;
    arrangeIcons();
  }, [iconSize]);

  const LiveDomPreview: React.FC<{ windowId: string; width?: number; height?: number }> = ({ windowId, width = 236, height = 160 }) => {
    const hostRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
      const render = () => {
        const el = document.getElementById(`window-content-${windowId}`) as HTMLElement | null;
        const host = hostRef.current;
        if (!host) return;
        host.innerHTML = '';
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const clone = el.cloneNode(true) as HTMLElement;
        clone.style.pointerEvents = 'none';
        clone.style.userSelect = 'none';
        clone.querySelectorAll('*').forEach(node => {
          const element = node as HTMLElement;
          element.style.pointerEvents = 'none';
          element.setAttribute('disabled', 'true');
        });
        const scale = Math.max(0.1, Math.min(width / rect.width, height / rect.height));
        clone.style.transformOrigin = 'top left';
        clone.style.transform = `scale(${scale})`;
        clone.style.width = `${rect.width}px`;
        clone.style.height = `${rect.height}px`;
        host.appendChild(clone);
      };
      render();
      const interval = window.setInterval(render, 500);
      return () => {
        const host = hostRef.current;
        if (host) host.innerHTML = '';
        window.clearInterval(interval);
      };
    }, [windowId, width, height]);
    return <div ref={hostRef} style={{ width, height, overflow: 'hidden', borderRadius: 12 }} />;
  };

  const rootStyle = useMemo<React.CSSProperties>(
    () =>
      ({
        '--accent': accentColor,
        '--panelBG': transparency ? 'rgba(255,255,255,0.6)' : '#f5f5f5',
        '--panelBGDark': transparency ? 'rgba(0,0,0,0.35)' : '#111827',
      }) as React.CSSProperties,
    [accentColor, transparency]
  );

  return (
    <div
      className={`fixed inset-0 ${themeMode === 'dark' ? 'dark' : ''}`}
      style={rootStyle}
      onMouseDown={(event) => {
        if (event.button !== 0) return;
        const target = event.target as HTMLElement;
        if (target.closest('[data-window-frame="true"]') || target.closest('[data-taskbar="true"]') || target.closest('[data-context-keep="true"]') || target.closest('[data-icon-node="true"]')) {
          return;
        }
        setSelectedIcons([]);
        setRenameId(null);
        closeContextMenu();
      }}
    >
      {phase === 'splash' && (
        <div className="w-full h-full bg-black flex flex-col items-center justify-center select-none">
          <div className="text-white text-2xl">Windows</div>
          <div className="mt-2 text-gray-400 text-xs">Starting...</div>
        </div>
      )}

      {phase === 'lock' && <LockScreen onUnlock={() => setPhase('desktop')} />}

      {phase === 'desktop' && (
        <div
          className="w-full h-full bg-[url('https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2069&auto=format&fit=crop')] bg-cover"
          onContextMenu={handleDesktopContextMenu}
          data-context-keep="true"
        >
          {showDesktopIcons && (
            <DesktopIconGrid
              icons={desktopIcons}
              selectedIds={selectedIcons}
              renameId={renameId}
              iconSize={iconSize}
              onRenameSubmit={handleRenameSubmit}
              onRenameCancel={() => setRenameId(null)}
              onDoubleClick={(icon) => openApp(icon.app)}
              onSelect={handleSelectIcon}
              onStartDrag={(index, event) => {
                if (event.button !== 0 || autoArrange) {
                  if (autoArrange) showToast('Disable auto arrange to move icons');
                  return;
                }
                const icon = desktopIcons[index];
                if (!icon) return;
                iconDragRef.current = {
                  id: icon.id,
                  idx: index,
                  offsetX: event.clientX - icon.x,
                  offsetY: event.clientY - icon.y,
                };
              }}
              onContextMenu={handleIconContextMenu}
            />
          )}

          {windows.map(win => (
            <WindowFrame
              key={win.id}
              win={win}
              themeMode={themeMode}
              onFocus={focusWindow}
              onClose={closeWindow}
              onToggleMinimize={toggleMinimize}
              onToggleMaximize={toggleMaximize}
              onStartDrag={handleWindowDragStart}
              onBeginResize={handleBeginResize}
              renderContent={(windowSpec) =>
                windowSpec.app === 'settings' ? <SettingsApp /> : <AppContent app={windowSpec.app} openApp={openApp} />
              }
            />
          ))}

          <Taskbar
            pinnedApps={taskbarPinned}
            windows={windows}
            startOpen={startOpen}
            themeMode={themeMode === 'dark' ? 'dark' : 'light'}
            transparency={transparency}
            onToggleStart={() => {
              setStartOpen(prev => !prev);
              setStartPowerOpen(false);
              closeContextMenu();
            }}
            onLaunchApp={openApp}
            onHoverApp={showTaskbarPreview}
            onLeaveHover={hideTaskbarPreview}
            tray={{
              clock,
              date: new Date().toLocaleDateString(),
              wifiOn: wifiOn && !airplaneOn,
              muted,
              batteryLevel,
              onQuickSettings: () => {
                setQsOpen(prev => !prev);
                setNcOpen(false);
                closeContextMenu();
              },
              onClock: () => {
                setNcOpen(prev => !prev);
                setQsOpen(false);
                closeContextMenu();
              },
            }}
          />

          {qsOpen && (
            <div
              className="absolute right-2 bottom-14 w-[380px] rounded-xl shadow-2xl p-3"
              style={{
                background: themeMode === 'dark' ? 'var(--panelBGDark)' : 'var(--panelBG)',
                border: themeMode === 'dark' ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.1)',
                backdropFilter: transparency ? 'blur(10px)' : 'none',
                color: themeMode === 'dark' ? 'white' : 'black',
              }}
              data-context-keep="true"
            >
              {(() => {
                const accent = accentColor;
                const btnStyle = (active: boolean) =>
                  ({
                    background: active ? accent : themeMode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                    color: active ? 'white' : themeMode === 'dark' ? 'white' : 'black',
                    border: themeMode === 'dark' ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.12)',
                  } as React.CSSProperties);
                return (
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      <button className="h-16 rounded-lg text-sm" style={btnStyle(wifiOn && !airplaneOn)} onClick={() => setWifiOn(v => !v)}>
                        Wi‑Fi
                      </button>
                      <button className="h-16 rounded-lg text-sm" style={btnStyle(btOn)} onClick={() => setBtOn(v => !v)}>
                        Bluetooth
                      </button>
                      <button className="h-16 rounded-lg text-sm" style={btnStyle(airplaneOn)} onClick={() => setAirplaneOn(v => !v)}>
                        Airplane
                      </button>
                      <button className="h-16 rounded-lg text-sm" style={btnStyle(energySaver)} onClick={() => setEnergySaver(v => !v)}>
                        Energy saver
                      </button>
                      <button className="h-16 rounded-lg text-sm" style={btnStyle(accessibilityOn)} onClick={() => setAccessibilityOn(v => !v)}>
                        Accessibility
                      </button>
                      <button className="h-16 rounded-lg text-sm" style={btnStyle(hotspotOn)} onClick={() => setHotspotOn(v => !v)}>
                        Mobile hotspot
                      </button>
                    </div>
                    <div className="mt-3">
                      <div className="text-xs mb-1">Brightness</div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={brightness}
                        onChange={e => setBrightness(parseInt(e.target.value, 10))}
                        className="w-full"
                        style={{ accentColor: accent }}
                      />
                    </div>
                    <div className="mt-2">
                      <div className="text-xs mb-1 flex items-center gap-2">
                        <VolumeIcon muted={muted} className="w-4 h-4" />
                        Volume
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={muted ? 0 : volume}
                        onChange={e => {
                          setMuted(false);
                          setVolume(parseInt(e.target.value, 10));
                        }}
                        className="w-full"
                        style={{ accentColor: accent }}
                      />
                    </div>
                    <div
                      className="mt-2 text-xs flex items-center justify-between"
                      style={{ color: themeMode === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)' }}
                    >
                      <div className="flex items-center gap-2">
                        <BatteryIcon level={batteryLevel / 100} className="w-7 h-4" />
                        {batteryLevel}%
                      </div>
                      <button
                        className="px-2 py-1 rounded"
                        style={{
                          background: themeMode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)',
                          border: '1px solid rgba(0,0,0,0.12)',
                        }}
                        onClick={() => setQsOpen(false)}
                      >
                        Done
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {ncOpen && (
            <div className="absolute right-2 bottom-14" data-context-keep="true">
              <CalendarPanel />
            </div>
          )}

          {startOpen && (
            <StartMenu
              open={startOpen}
              pinned={startPinned.map((id) => ({
                id,
                label: APP_META[id].label,
                icon: APP_META[id].icon,
              }))}
              onOpenApp={(id) => openApp(id as AppId)}
              onClose={() => setStartOpen(false)}
              renderIcon={(name, cls) => <IconGlyph name={name} className={cls || 'w-8 h-8'} />}
              onReboot={onReboot}
              startPowerOpen={startPowerOpen}
              setStartPowerOpen={setStartPowerOpen}
              onSleep={() => setPhase('lock')}
            />
          )}

          {tbPreview && (
            <div
              className="absolute z-[9999]"
              style={{ left: tbPreview.x, top: tbPreview.y }}
              onMouseLeave={hideTaskbarPreview}
              data-context-keep="true"
            >
              <div
                className="rounded-xl shadow-2xl border"
                style={{
                  background: themeMode === 'dark' ? 'rgba(0,0,0,0.85)' : '#ffffff',
                  border: themeMode === 'dark' ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.1)',
                }}
              >
                <LiveDomPreview windowId={tbPreview.windowId} />
              </div>
            </div>
          )}

          <DesktopContextMenu state={contextMenu} onClose={closeContextMenu} />

          {toast && (
            <div className="fixed bottom-16 right-8 z-[6000]" data-context-keep="true">
              <div
                className="px-4 py-3 rounded-2xl text-sm shadow-2xl border"
                style={{
                  background: themeMode === 'dark' ? 'rgba(17,24,39,0.9)' : 'rgba(255,255,255,0.94)',
                  borderColor: themeMode === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)',
                  backdropFilter: 'blur(18px)',
                }}
              >
                {toast.message}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Win11Desktop: React.FC<Win11DesktopProps> = (props) => {
  return (
    <Win11ThemeProvider>
      <DesktopChrome {...props} />
    </Win11ThemeProvider>
  );
};

export default Win11Desktop;


