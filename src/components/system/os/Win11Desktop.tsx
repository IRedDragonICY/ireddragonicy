'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Win11ThemeProvider, useWin11Theme, CalculatorApp, SettingsApp } from './win11';
import StartMenu from './win11/ui/StartMenu';
import CalendarPanel from './win11/ui/CalendarPanel';
import LockScreen from './win11/ui/LockScreen';

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

type AppId = 'explorer' | 'notepad' | 'paint' | 'calc' | 'edge' | 'settings' | 'taskmgr' | 'portfolio';

type IconName = 'start' | 'explorer' | 'edge' | 'notepad' | 'paint' | 'calc' | 'settings' | 'pc' | 'portfolio';

const Icon: React.FC<{ name: IconName; className?: string }> = ({ name, className }) => {
  if (name === 'start') {
    return (
      <svg viewBox="0 0 48 48" className={className} aria-hidden>
        <g fill="currentColor">
          <rect x="4" y="4" width="18" height="18" rx="2" />
          <rect x="26" y="4" width="18" height="18" rx="2" />
          <rect x="4" y="26" width="18" height="18" rx="2" />
          <rect x="26" y="26" width="18" height="18" rx="2" />
        </g>
      </svg>
    );
  }
  if (name === 'explorer') {
    return (
      <svg viewBox="0 0 48 48" className={className} aria-hidden>
        <path fill="currentColor" d="M6 14h12l3-4h10a5 5 0 0 1 5 5v21a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V19a5 5 0 0 1 5-5Zm0 6h36v3H6v-3Z"/>
      </svg>
    );
  }
  if (name === 'edge') {
    return (
      <svg viewBox="0 0 48 48" className={className} aria-hidden>
        <path fill="currentColor" d="M24 6c9.94 0 18 8.06 18 18 0 1.6-.2 3.16-.57 4.65C39.1 24.7 33.87 21 27.83 21c-6.74 0-12.2 5.46-12.2 12.2 0 2.63.85 5.06 2.3 7.04A18.01 18.01 0 0 1 6 24C6 14.06 14.06 6 24 6Z"/>
      </svg>
    );
  }
  if (name === 'notepad') {
    return (
      <svg viewBox="0 0 48 48" className={className} aria-hidden>
        <path fill="currentColor" d="M10 6h24a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V10a4 4 0 0 1 4-4Zm4 10h16v3H14v-3Zm0 8h16v3H14v-3Z"/>
      </svg>
    );
  }
  if (name === 'paint') {
    return (
      <svg viewBox="0 0 48 48" className={className} aria-hidden>
        <path fill="currentColor" d="M30 6c6.63 0 12 5.37 12 12 0 6.08-3.42 8-7 8h-5c-2.76 0-5 2.24-5 5 0 2.2-1.8 4-4 4-3.31 0-6-2.69-6-6 0-12.15 6.37-23 15-23Zm-9 29a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/>
      </svg>
    );
  }
  if (name === 'calc') {
    return (
      <svg viewBox="0 0 48 48" className={className} aria-hidden>
        <path fill="currentColor" d="M10 6h28a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V10a4 4 0 0 1 4-4Zm5 7h18v6H15v-6Zm0 12h6v6h-6v-6Zm8 0h6v6h-6v-6Zm8 0h6v6h-6v-6Zm-16 8h6v6h-6v-6Zm8 0h6v6h-6v-6Zm8 0h6v6h-6v-6Z"/>
      </svg>
    );
  }
  if (name === 'settings') {
    return (
      <svg viewBox="0 0 48 48" className={className} aria-hidden>
        <path fill="currentColor" d="M26.6 6.5 28 10a15.9 15.9 0 0 1 4.05 2.35l3.54-1.44 3 5.2-3 2.59c.14.99.14 2.02 0 3l3 2.59-3 5.2L32.05 28A15.9 15.9 0 0 1 28 30.05L26.6 33.5h-6.2L19 30.05A15.9 15.9 0 0 1 14.95 28l-3.54 1.44-3-5.2 3-2.59a12.9 12.9 0 0 1 0-3l-3-2.59 3-5.2 3.54 1.44A15.9 15.9 0 0 1 19 10l1.4-3.5h6.2ZM24 18a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z"/>
      </svg>
    );
  }
  if (name === 'portfolio') {
    return (
      <svg viewBox="0 0 48 48" className={className} aria-hidden>
        <rect x="6" y="10" width="30" height="22" rx="3" fill="currentColor" opacity="0.25"/>
        <rect x="10" y="14" width="22" height="14" rx="2" fill="currentColor"/>
        <path d="M38 24l6-4v8l-6-4Z" fill="currentColor"/>
      </svg>
    );
  }
  // pc / monitor
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <path fill="currentColor" d="M6 10h36a2 2 0 0 1 2 2v20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2Zm10 28h16v4H16v-4Z"/>
    </svg>
  );
};

const APP_META: Record<AppId, { label: string; icon: IconName }> = {
  explorer: { label: 'File Explorer', icon: 'explorer' },
  edge: { label: 'Microsoft Edge', icon: 'edge' },
  notepad: { label: 'Notepad', icon: 'notepad' },
  paint: { label: 'Paint', icon: 'paint' },
  calc: { label: 'Calculator', icon: 'calc' },
  settings: { label: 'Settings', icon: 'settings' },
  taskmgr: { label: 'Task Manager', icon: 'settings' },
  portfolio: { label: 'Portfolio', icon: 'portfolio' },
};

// System tray icons (wifi/volume/battery)
const WifiIcon: React.FC<{ on?: boolean; className?: string }> = ({ on = true, className }) => (
  <svg viewBox="0 0 48 48" className={className}><path fill="currentColor" d="M24 36a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm0-8c4.97 0 9.48 2.03 12.73 5.27l-2.83 2.83A15.96 15.96 0 0 0 24 32c-4.28 0-8.17 1.66-11.1 4.37l-2.82-2.83A19.97 19.97 0 0 1 24 28Zm0-8c7.5 0 14.29 3.05 19.2 7.96l-2.83 2.83A23.93 23.93 0 0 0 24 24c-6.61 0-12.59 2.69-16.97 7.04l-2.83-2.83C9.61 19.91 16.41 16 24 16Z" opacity={on ? 1 : 0.35}/></svg>
);
const VolumeIcon: React.FC<{ muted?: boolean; className?: string }> = ({ muted = false, className }) => (
  <svg viewBox="0 0 48 48" className={className}><path fill="currentColor" d="M6 20h8l10-8v24l-10-8H6z"/><path fill="currentColor" d="M32 18c2.2 2.2 2.2 9.8 0 12" opacity={muted ? 0.2 : 1}/><path fill="currentColor" d="M36 14c4.4 4.4 4.4 16.6 0 21" opacity={muted ? 0.2 : 1}/>{muted && <path d="M30 14 42 34" stroke="currentColor" strokeWidth="3"/>}</svg>
);
const BatteryIcon: React.FC<{ level?: number; charging?: boolean; className?: string }> = ({ level = 0.98, charging = false, className }) => (
  <svg viewBox="0 0 64 32" className={className}>
    <rect x="2" y="6" width="54" height="20" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
    <rect x="58" y="12" width="4" height="8" rx="1" fill="currentColor" />
    <rect x="4" y="8" width={50 * Math.max(0, Math.min(1, level))} height="16" rx="3" fill="currentColor" opacity={0.6} />
    {charging && <path d="M30 9 24 18h6l-4 8 12-12h-8z" fill="currentColor" />}
  </svg>
);

interface WindowSpec {
  id: string;
  app: AppId;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
  // Last non-maximized geometry for proper restore
  restore?: { x: number; y: number; w: number; h: number };
}

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
        {[
          { id:'processes', label:'Processes' },
          { id:'performance', label:'Performance' },
          { id:'startup', label:'Startup apps' },
          { id:'users', label:'Users' },
        ].map(it => (
          <button key={it.id} className={`w-full text-left px-3 py-2 rounded ${tab===it.id ? 'bg-white/10' : 'hover:bg-white/5'}`} onClick={()=>setTab(it.id as any)}>{it.label}</button>
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
  const [phase, setPhase] = useState<'splash' | 'lock' | 'desktop'>('splash');
  const [windows, setWindows] = useState<WindowSpec[]>([]);
  const [zTop, setZTop] = useState(10);
  const [taskbarPinned] = useState<AppId[]>(['explorer','edge','notepad','paint','calc','settings','taskmgr']);
  const [startPinned] = useState<AppId[]>(['explorer','edge','notepad','paint','calc','settings','taskmgr','portfolio']);
  const [startOpen, setStartOpen] = useState(false);
  const [startPowerOpen, setStartPowerOpen] = useState(false);
  const [startSearch, setStartSearch] = useState('');
  const dragRef = useRef<{ id: string; dx: number; dy: number } | null>(null);
  const [clock, setClock] = useState<string>(new Date().toLocaleTimeString());
  // Window resize state/ref
  type ResizeDir = 'n' | 'e' | 's' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
  const resizeRef = useRef<{ id: string; dir: ResizeDir; startX: number; startY: number; startW: number; startH: number; startL: number; startT: number } | null>(null);
  // Desktop icons state with drag positions
  const [desktopIcons, setDesktopIcons] = useState<{ app: AppId; x: number; y: number }[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem('win11_desktop_icons');
        if (raw) return JSON.parse(raw);
      } catch {}
    }
    return [
      { app: 'explorer', x: 20, y: 20 },
      { app: 'notepad', x: 20, y: 120 },
      { app: 'paint', x: 20, y: 220 },
      { app: 'calc', x: 20, y: 320 },
      { app: 'settings', x: 20, y: 420 },
      { app: 'portfolio', x: 20, y: 520 },
    ];
  });
  useEffect(() => {
    try { window.localStorage.setItem('win11_desktop_icons', JSON.stringify(desktopIcons)); } catch {}
  }, [desktopIcons]);
  const iconDragRef = useRef<{ idx: number; ox: number; oy: number; dx: number; dy: number } | null>(null);
  const startDragIcon = (idx: number, e: React.MouseEvent) => {
    const ico = desktopIcons[idx];
    iconDragRef.current = { idx, ox: ico.x, oy: ico.y, dx: e.clientX - ico.x, dy: e.clientY - ico.y };
  };
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!iconDragRef.current) return;
      const { idx, dx, dy } = iconDragRef.current;
      const nx = e.clientX - dx;
      const ny = e.clientY - dy;
      const snap = (v: number, g: number) => Math.round(v / g) * g;
      setDesktopIcons(prev => prev.map((ic, i) => i === idx ? { ...ic, x: snap(nx, 20), y: snap(ny, 20) } : ic));
    };
    const onUp = () => { iconDragRef.current = null; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);
  // Quick settings / tray state
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

  // Boot audio (simple chord chime)
  useEffect(() => {
    if (phase !== 'splash') return;
    const audio = new (window.AudioContext || (window as any).webkitAudioContext)();
    const freqs = [587, 784, 880];
    const gains: GainNode[] = [];
    const oscs: OscillatorNode[] = [];
    freqs.forEach((f, i) => {
      const o = audio.createOscillator();
      const g = audio.createGain();
      o.type = 'sine';
      o.frequency.value = f;
      o.connect(g);
      g.connect(audio.destination);
      g.gain.setValueAtTime(0.0001, audio.currentTime);
      g.gain.exponentialRampToValueAtTime(0.15 / (i + 1), audio.currentTime + 0.08 + i * 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 1.4 + i * 0.02);
      o.start();
      o.stop(audio.currentTime + 1.5 + i * 0.02);
      gains.push(g); oscs.push(o);
    });
    const t = setTimeout(() => setPhase('lock'), 1800);
    return () => { oscs.forEach(o => o.disconnect()); gains.forEach(g => g.disconnect()); clearTimeout(t); };
  }, [phase]);

  const openApp = (app: AppId) => {
    if (app === 'portfolio') {
      if (typeof window !== 'undefined') {
        try {
          // Mark that OS continues running in background; we do not change power
          window.localStorage.setItem('os.current', 'windows');
          window.localStorage.setItem('os.power', 'on');
        } catch {}
        window.location.assign('/');
      }
      return;
    }
    setWindows((prev) => {
      const id = `${app}-${Date.now()}`;
      return [
        ...prev,
        {
          id,
          app,
          title: APP_META[app].label,
          x: 160 + (prev.length * 24) % 300,
          y: 120 + (prev.length * 16) % 200,
          w: 900,
          h: 600,
          z: zTop + 1,
          minimized: false,
          maximized: false,
          restore: { x: 160 + (prev.length * 24) % 300, y: 120 + (prev.length * 16) % 200, w: 900, h: 600 },
        }
      ];
    });
    setZTop((z) => z + 1);
  };

  const closeWindow = (id: string) => setWindows((prev) => prev.filter(w => w.id !== id));
  const focusWindow = (id: string) => {
    setWindows((prev) => prev.map(w => w.id === id ? { ...w, z: zTop + 1 } : w));
    setZTop((z) => z + 1);
  };
  const toggleMinimize = (id: string) => setWindows((prev) => prev.map(w => {
    if (w.id !== id) return w;
    if (w.minimized) {
      // restore. If maximized, use full screen. If not, use last restore bounds.
      if (w.maximized) {
        return { ...w, minimized: false, x: 0, y: 0, w: window.innerWidth, h: window.innerHeight - 48 };
      }
      const rb = w.restore || { x: w.x, y: w.y, w: w.w, h: w.h };
      const maxW = window.innerWidth, maxH = window.innerHeight - 48;
      return { ...w, minimized: false, x: Math.max(0, Math.min(rb.x, maxW - rb.w)), y: Math.max(0, Math.min(rb.y, maxH - rb.h)), w: Math.min(rb.w, maxW), h: Math.min(rb.h, maxH) };
    }
    return { ...w, minimized: true };
  }));
  const toggleMaximize = (id: string) => setWindows((prev) => prev.map(w => {
    if (w.id !== id) return w;
    if (!w.maximized) {
      // store current geometry before maximizing
      const restore = { x: w.x, y: w.y, w: w.w, h: w.h };
      return {
        ...w,
        maximized: true,
        restore,
        x: 0,
        y: 0,
        w: window.innerWidth,
        h: window.innerHeight - 48,
      };
    } else {
      // restore to last known non-maximized geometry
      const rb = w.restore || { x: w.x, y: w.y, w: Math.min(w.w, window.innerWidth), h: Math.min(w.h, window.innerHeight - 48) };
      const maxW = window.innerWidth, maxH = window.innerHeight - 48;
      const nx = Math.max(0, Math.min(rb.x, maxW - rb.w));
      const ny = Math.max(0, Math.min(rb.y, maxH - rb.h));
      const nw = Math.min(rb.w, maxW);
      const nh = Math.min(rb.h, maxH);
      return { ...w, maximized: false, x: nx, y: ny, w: nw, h: nh };
    }
  }));

  // Clock
  useEffect(() => {
    const i = setInterval(() => setClock(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(i);
  }, []);

  // Window dragging
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const { id, dx, dy } = dragRef.current;
      setWindows((prev) => prev.map(w => {
        if (w.id !== id || w.maximized) return w;
        const nx = e.clientX - dx;
        const ny = e.clientY - dy;
        const vw = window.innerWidth;
        const vh = window.innerHeight - 48; // taskbar
        const clampedX = Math.min(Math.max(0, nx), Math.max(0, vw - w.w));
        const clampedY = Math.min(Math.max(0, ny), Math.max(0, vh - w.h));
        return { ...w, x: clampedX, y: clampedY, restore: { x: clampedX, y: clampedY, w: w.w, h: w.h } };
      }));
    };
    const onUp = () => { dragRef.current = null; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  // Resizing handler
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!resizeRef.current) return;
      const { id, dir, startX, startY, startW, startH, startL, startT } = resizeRef.current;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const minW = 420, minH = 260;
      setWindows(prev => prev.map(w => {
        if (w.id !== id || w.maximized) return w;
        let x = startL, y = startT, width = startW, height = startH;
        if (dir.includes('e')) width = Math.max(minW, startW + dx);
        if (dir.includes('s')) height = Math.max(minH, startH + dy);
        if (dir.includes('w')) { width = Math.max(minW, startW - dx); x = startL + (startW - width); }
        if (dir.includes('n')) { height = Math.max(minH, startH - dy); y = startT + (startH - height); }
        const vw = window.innerWidth, vh = window.innerHeight - 48;
        width = Math.min(width, vw - x); height = Math.min(height, vh - y);
        return { ...w, x, y, w: width, h: height, restore: { x, y, w: width, h: height } };
      }));
    };
    const onUp = () => { resizeRef.current = null; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.altKey && e.key.toLowerCase() === 'delete') || e.key === 'F9') {
        e.preventDefault();
        onReboot('restart');
      }
      if (e.key === 'Meta' || e.key === 'Escape') { setStartOpen(false); setStartPowerOpen(false); }
      // Ctrl+Shift+Esc -> Task Manager
      if (e.ctrlKey && e.shiftKey && (e.key === 'Escape' || e.key === 'Esc')) {
        e.preventDefault();
        openApp('taskmgr');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onReboot]);

  const { themeMode, accentColor, transparency } = useWin11Theme();
  // Taskbar live preview state
  const [tbPreview, setTbPreview] = useState<{ windowId: string; x: number; y: number } | null>(null);

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
        clone.querySelectorAll('*').forEach(n => { (n as HTMLElement).style.pointerEvents = 'none'; (n as HTMLElement).setAttribute('disabled','true'); });
        const scale = Math.max(0.1, Math.min(width / rect.width, height / rect.height));
        clone.style.transformOrigin = 'top left';
        clone.style.transform = `scale(${scale})`;
        clone.style.width = `${rect.width}px`;
        clone.style.height = `${rect.height}px`;
        host.appendChild(clone);
      };
      render();
      const i = window.setInterval(render, 500);
      return () => { const host = hostRef.current; if (host) host.innerHTML = ''; window.clearInterval(i); };
    }, [windowId, width, height]);
    return <div ref={hostRef} style={{ width, height, overflow: 'hidden', borderRadius: 10 }} />;
  };

  const showTaskbarPreview = (appId: AppId, targetEl: HTMLElement) => {
    const liveWin = [...windows].reverse().find(w => w.app === appId && !w.minimized);
    if (!liveWin) { setTbPreview(null); return; }
    const rect = targetEl.getBoundingClientRect();
    const desiredWidth = 236, desiredHeight = 160;
    const x = rect.left + rect.width / 2 - desiredWidth / 2;
    const y = window.innerHeight - 48 - (desiredHeight + 16);
    const clampedX = Math.max(8, Math.min(x, window.innerWidth - desiredWidth - 8));
    const clampedY = Math.max(8, y);
    setTbPreview({ windowId: liveWin.id, x: clampedX, y: clampedY });
  };
  const hideTaskbarPreview = () => setTbPreview(null);

  return (
    <div className={`fixed inset-0 ${themeMode==='dark' ? 'dark' : ''}`} style={{
      // Accent via CSS variable used across UI pieces
      ['--accent' as any]: accentColor,
      ['--panelBG' as any]: transparency ? 'rgba(255,255,255,0.6)' : '#f5f5f5',
      ['--panelBGDark' as any]: transparency ? 'rgba(0,0,0,0.35)' : '#111827',
    }}>
      {phase === 'splash' && (
        <div className="w-full h-full bg-black flex flex-col items-center justify-center select-none">
          <div className="text-white text-2xl">Windows</div>
          <div className="mt-2 text-gray-400 text-xs">Starting...</div>
        </div>
      )}

      {phase === 'lock' && (
        <LockScreen onUnlock={() => setPhase('desktop')} />
      )}

      {phase === 'desktop' && (
        <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2069&auto=format&fit=crop')] bg-cover">
          {/* Desktop icons (draggable) */}
          <div className="absolute inset-0 text-white select-none">
            {desktopIcons.map((ic, idx) => (
              <div
                key={`${ic.app}-${idx}`}
                className="absolute flex flex-col items-center w-20 cursor-default"
                style={{ left: ic.x, top: ic.y }}
                onDoubleClick={() => openApp(ic.app)}
                onMouseDown={(e) => startDragIcon(idx, e)}
              >
                <div className="w-12 h-12 flex items-center justify-center">
                  <Icon name={ic.app === 'explorer' ? 'pc' : APP_META[ic.app].icon} className="w-10 h-10 text-white/90 drop-shadow" />
                </div>
                <div className="text-center text-xs mt-1 drop-shadow">{ic.app === 'explorer' ? 'This PC' : APP_META[ic.app].label}</div>
              </div>
            ))}
          </div>

          {/* Windows */}
          {windows.map((w) => (
            <div
              key={w.id}
              className={
                'absolute bg-white rounded shadow-xl border border-black/10 overflow-hidden ' +
                (w.maximized ? 'inset-0' : '') + (w.minimized ? ' hidden' : '')
              }
              style={w.maximized ? { zIndex: w.z } : { left: w.x, top: w.y, width: w.w, height: w.h, zIndex: w.z }}
              onMouseDown={() => focusWindow(w.id)}
            >
              <div
                className="h-10 flex items-center justify-between px-3 select-none cursor-move"
                style={{
                  background: themeMode==='dark' ? 'rgba(255,255,255,0.08)' : '#e6e6e6',
                  borderBottom: themeMode==='dark' ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.08)'
                }}
                onMouseDown={(e) => {
                  // Ignore when clicking buttons
                  const target = e.target as HTMLElement;
                  if (target.closest('button')) return;
                  dragRef.current = { id: w.id, dx: e.clientX - w.x, dy: e.clientY - w.y };
                }}
                onDoubleClick={() => toggleMaximize(w.id)}
              >
                <div className="text-sm text-black">{w.title}</div>
                <div className="flex items-center gap-1">
                  <button aria-label="minimize" className="w-9 h-9 flex items-center justify-center rounded hover:bg-black/10 text-black" onClick={() => toggleMinimize(w.id)}>
                    <svg viewBox="0 0 24 24" className="w-4 h-4"><rect x="5" y="12" width="14" height="2" fill="currentColor"/></svg>
                  </button>
                  <button aria-label="maximize" className="w-9 h-9 flex items-center justify-center rounded hover:bg-black/10 text-black" onClick={() => toggleMaximize(w.id)}>
                    <svg viewBox="0 0 24 24" className="w-4 h-4"><rect x="6" y="6" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"/></svg>
                  </button>
                  <button aria-label="close" className="w-9 h-9 flex items-center justify-center rounded hover:bg-red-600 hover:text-white text-black" onClick={() => closeWindow(w.id)}>
                    <svg viewBox="0 0 24 24" className="w-4 h-4"><path d="M6 6 18 18M18 6 6 18" stroke="currentColor" strokeWidth="2"/></svg>
                  </button>
                </div>
              </div>
              <div id={`window-content-${w.id}`} className="w-full h-[calc(100%-40px)] relative">
                {w.app === 'settings' ? (
                  <SettingsApp />
                ) : (
                  <AppContent app={w.app} openApp={openApp} />
                )}
                {!w.maximized && (
                  <>
                    <div className="absolute inset-x-0 top-0 h-1.5 cursor-n-resize" onMouseDown={(e) => { (resizeRef as any).current = { id: w.id, dir: 'n', startX: e.clientX, startY: e.clientY, startW: w.w, startH: w.h, startL: w.x, startT: w.y }; }} />
                    <div className="absolute inset-x-0 bottom-0 h-1.5 cursor-s-resize" onMouseDown={(e) => { (resizeRef as any).current = { id: w.id, dir: 's', startX: e.clientX, startY: e.clientY, startW: w.w, startH: w.h, startL: w.x, startT: w.y }; }} />
                    <div className="absolute inset-y-0 left-0 w-1.5 cursor-w-resize" onMouseDown={(e) => { (resizeRef as any).current = { id: w.id, dir: 'w', startX: e.clientX, startY: e.clientY, startW: w.w, startH: w.h, startL: w.x, startT: w.y }; }} />
                    <div className="absolute inset-y-0 right-0 w-1.5 cursor-e-resize" onMouseDown={(e) => { (resizeRef as any).current = { id: w.id, dir: 'e', startX: e.clientX, startY: e.clientY, startW: w.w, startH: w.h, startL: w.x, startT: w.y }; }} />
                    <div className="absolute left-0 top-0 w-2 h-2 cursor-nw-resize" onMouseDown={(e) => { (resizeRef as any).current = { id: w.id, dir: 'nw', startX: e.clientX, startY: e.clientY, startW: w.w, startH: w.h, startL: w.x, startT: w.y }; }} />
                    <div className="absolute right-0 top-0 w-2 h-2 cursor-ne-resize" onMouseDown={(e) => { (resizeRef as any).current = { id: w.id, dir: 'ne', startX: e.clientX, startY: e.clientY, startW: w.w, startH: w.h, startL: w.x, startT: w.y }; }} />
                    <div className="absolute left-0 bottom-0 w-2 h-2 cursor-sw-resize" onMouseDown={(e) => { (resizeRef as any).current = { id: w.id, dir: 'sw', startX: e.clientX, startY: e.clientY, startW: w.w, startH: w.h, startL: w.x, startT: w.y }; }} />
                    <div className="absolute right-0 bottom-0 w-2 h-2 cursor-se-resize" onMouseDown={(e) => { (resizeRef as any).current = { id: w.id, dir: 'se', startX: e.clientX, startY: e.clientY, startW: w.w, startH: w.h, startL: w.x, startT: w.y }; }} />
                  </>
                )}
              </div>
            </div>
          ))}

          {/* Taskbar */}
          <div style={{
            background: 'var(--panelBG)',
            backdropFilter: transparency ? 'blur(10px)' : 'none',
            borderTop: themeMode==='dark' ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(0,0,0,0.2)'
          }} className="absolute left-0 right-0 bottom-0 h-12 flex items-center justify-center gap-3">
            <button aria-label="start" className={`w-10 h-10 rounded hover:bg-white/60 flex items-center justify-center ${startOpen ? 'bg-white/60' : ''}`} onClick={() => setStartOpen((o) => !o)}>
              <Icon name="start" className="w-7 h-7 text-black/70" />
            </button>
            {taskbarPinned.map((a) => {
              const running = windows.some(w => w.app === a && !w.minimized);
              return (
                <button key={a} className="relative w-10 h-10 rounded hover:bg-white/60 flex items-center justify-center" onClick={() => openApp(a)} aria-label={APP_META[a].label}
                  onMouseEnter={(e)=> showTaskbarPreview(a, e.currentTarget)}
                  onMouseLeave={hideTaskbarPreview}
                >
                  <Icon name={APP_META[a].icon} className="w-6 h-6 text-black/70" />
                  {running && <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-black/60" />}
                </button>
              );
            })}
            {/* Right cluster: tray + clock */}
            <div className="absolute right-3 flex items-center gap-2">
              <button className="w-8 h-8 rounded hover:bg-white/60 flex items-center justify-center" onClick={() => { setQsOpen(v => !v); setNcOpen(false); }} aria-label="Quick Settings">
                <WifiIcon on={wifiOn && !airplaneOn} className="w-5 h-5 text-black/70" />
              </button>
              <button className="w-8 h-8 rounded hover:bg-white/60 flex items-center justify-center" onClick={() => { setQsOpen(v => !v); setNcOpen(false); }} aria-label="Volume">
                <VolumeIcon muted={muted} className="w-5 h-5 text-black/70" />
              </button>
              <button className="w-8 h-8 rounded hover:bg-white/60 flex items-center justify-center" onClick={() => { setQsOpen(v => !v); setNcOpen(false); }} aria-label="Battery">
                <BatteryIcon level={batteryLevel / 100} className="w-7 h-4 text-black/70" />
              </button>
              <button className="px-2 h-10 rounded hover:bg-white/60 text-xs text-black/80 leading-4 text-right" onClick={() => { setNcOpen(v => !v); setQsOpen(false); }} aria-label="Clock">
                <div>{clock}</div>
                <div>{new Date().toLocaleDateString()}</div>
              </button>
            </div>
          </div>

          {/* Quick Settings Panel */}
          {qsOpen && (
            <div className="absolute right-2 bottom-14 w-[380px] rounded-xl shadow-2xl p-3" style={{
              background: themeMode==='dark' ? 'var(--panelBGDark)' : 'var(--panelBG)',
              border: themeMode==='dark' ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(0,0,0,0.1)',
              backdropFilter: transparency ? 'blur(10px)' : 'none',
              color: themeMode==='dark' ? 'white' : 'black'
            }}>
              {(() => {
                const accent = accentColor;
                const btnStyle = (active: boolean) => ({
                  background: active ? accent : (themeMode==='dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
                  color: active ? 'white' : (themeMode==='dark' ? 'white' : 'black'),
                  border: themeMode==='dark' ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.12)'
                } as React.CSSProperties);
                return (
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      <button className="h-16 rounded-lg text-sm" style={btnStyle(wifiOn)} onClick={() => setWifiOn(v => !v)}>Wi‑Fi</button>
                      <button className="h-16 rounded-lg text-sm" style={btnStyle(btOn)} onClick={() => setBtOn(v => !v)}>Bluetooth</button>
                      <button className="h-16 rounded-lg text-sm" style={btnStyle(airplaneOn)} onClick={() => setAirplaneOn(v => !v)}>Airplane</button>
                      <button className="h-16 rounded-lg text-sm" style={btnStyle(energySaver)} onClick={() => setEnergySaver(v => !v)}>Energy saver</button>
                      <button className="h-16 rounded-lg text-sm" style={btnStyle(accessibilityOn)} onClick={() => setAccessibilityOn(v => !v)}>Accessibility</button>
                      <button className="h-16 rounded-lg text-sm" style={btnStyle(hotspotOn)} onClick={() => setHotspotOn(v => !v)}>Mobile hotspot</button>
                    </div>
                    <div className="mt-3">
                      <div className="text-xs mb-1">Brightness</div>
                      <input type="range" min={0} max={100} value={brightness} onChange={(e) => setBrightness(parseInt(e.target.value))} className="w-full" style={{ accentColor: accent }} />
                    </div>
                    <div className="mt-2">
                      <div className="text-xs mb-1 flex items-center gap-2"><VolumeIcon muted={muted} className="w-4 h-4"/> Volume</div>
                      <input type="range" min={0} max={100} value={muted ? 0 : volume} onChange={(e) => { setMuted(false); setVolume(parseInt(e.target.value)); }} className="w-full" style={{ accentColor: accent }} />
                    </div>
                    <div className="mt-2 text-xs flex items-center justify-between" style={{ color: themeMode==='dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.7)' }}>
                      <div className="flex items-center gap-2"><BatteryIcon level={batteryLevel/100} className="w-7 h-4"/> {batteryLevel}%</div>
                      <button className="px-2 py-1 rounded" style={{ background: themeMode==='dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', border: '1px solid rgba(0,0,0,0.12)' }} onClick={() => setQsOpen(false)}>Done</button>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* Notification Center / Calendar */}
          {ncOpen && (
            <div className="absolute right-2 bottom-14">
              <CalendarPanel />
            </div>
          )}

          {startOpen && (
            <StartMenu
              open={startOpen}
              pinned={startPinned.map((id)=>({ id, label: APP_META[id].label, icon: APP_META[id].icon }))}
              onOpenApp={(id)=>openApp(id as AppId)}
              onClose={()=>setStartOpen(false)}
              renderIcon={(name, cls) => (<Icon name={name as any} className={cls || "w-8 h-8"} />)}
              onReboot={onReboot}
              startPowerOpen={startPowerOpen}
              setStartPowerOpen={setStartPowerOpen}
              onSleep={() => setPhase('lock')}
            />
          )}

          {tbPreview && (
            <div className="absolute z-[9999]" style={{ left: tbPreview.x, top: tbPreview.y }} onMouseEnter={()=>{}} onMouseLeave={hideTaskbarPreview}>
              <div className="rounded-xl shadow-2xl border" style={{ background: themeMode==='dark' ? 'rgba(0,0,0,0.85)' : '#ffffff', border: themeMode==='dark' ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.1)' }}>
                <LiveDomPreview windowId={tbPreview.windowId} />
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


