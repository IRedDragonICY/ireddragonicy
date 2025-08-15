'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useWin11Theme } from '../Win11ThemeContext';
import { IconName } from '../types';

export interface StartMenuItem { id: string; label: string; icon: IconName }

interface StartMenuProps {
  open: boolean;
  pinned: StartMenuItem[];
  onOpenApp: (id: string) => void;
  onClose: () => void;
  renderIcon: (name: IconName, className?: string) => React.ReactNode;
  onReboot: (reason?: 'restart' | 'shutdown') => void;
  startPowerOpen: boolean;
  setStartPowerOpen: (open: boolean) => void;
  onSleep?: () => void;
}

const StartMenu: React.FC<StartMenuProps> = ({ open, pinned, onOpenApp, onClose, renderIcon, onReboot, startPowerOpen, setStartPowerOpen, onSleep }) => {
  const { themeMode, transparency, accentColor } = useWin11Theme();
  if (!open) return null;

  // Container ref (previews are taskbar-only; none in Start)
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Dynamic sizing/position so the menu hugs the taskbar and never looks "floating"
  const [menuHeight, setMenuHeight] = useState<number>(560);
  const taskbarHeight = 48; // must match desktop taskbar height
  const gap = 12; // small gap above taskbar like Windows
  React.useEffect(() => {
    const update = () => {
      const h = Math.min(560, Math.max(420, (window.innerHeight - taskbarHeight - gap*2)));
      setMenuHeight(h);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);


  return (
    <div ref={containerRef} className="fixed left-1/2 -translate-x-1/2 z-[5000] w-[760px] rounded-2xl shadow-2xl border" style={{
      bottom: taskbarHeight + gap,
      height: menuHeight,
      background: themeMode==='dark' ? (transparency ? 'rgba(0,0,0,0.45)' : '#111827') : (transparency ? 'rgba(255,255,255,0.9)' : '#ffffff'),
      borderColor: themeMode==='dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
      backdropFilter: transparency ? 'blur(10px)' : 'none',
      color: themeMode==='dark' ? 'white' : 'black'
    }}>
      <div className="px-6 pt-6">
        <input placeholder="Search for apps, settings, and documents" className="w-full h-10 rounded-full px-4 text-sm outline-none" style={{
          background: themeMode==='dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
        }} />
      </div>
      <div className="px-6 mt-4 flex items-center justify-between">
        <div className="text-sm opacity-70">Pinned</div>
        <div className="text-xs opacity-60">All</div>
      </div>
      <div className="px-6 grid grid-cols-6 gap-3 mt-3">
        {pinned.map((a) => (
          <button key={a.id} className="h-24 rounded-xl border flex flex-col items-center justify-center gap-2"
            style={{
            borderColor: themeMode==='dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
            background: themeMode==='dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
          }}
            onClick={() => { onOpenApp(a.id); onClose(); }}
          >
            {renderIcon(a.icon, "w-8 h-8 text-black/70 dark:text-white/80")}
            <div className="text-xs opacity-80">{a.label}</div>
          </button>
        ))}
      </div>
      {/* Hover previews are removed in Start menu */}
      <div className="px-6 mt-6 text-sm opacity-70">Recommended</div>
      <div className="px-6 mt-2 grid grid-cols-3 gap-3 text-sm">
        {['README.md','docs/GettingStarted.pdf','design/wireframe.fig'].map((r) => (
          <div key={r} className="p-3 rounded-xl border flex items-center gap-2" style={{
            borderColor: themeMode==='dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)',
            background: themeMode==='dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'
          }}>
            <div className="w-8 h-8 rounded bg-black/20" />
            <div className="truncate">{r}</div>
          </div>
        ))}
      </div>
      <div className="px-6 mt-4 py-3 border-t flex items-center justify-between text-sm" style={{ borderColor: themeMode==='dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)' }}>
        <div>Mohammad Farid Hendianto</div>
        <div className="flex items-center gap-4 opacity-70">
          <div>Recent</div>
          <div>All</div>
          <div className="relative">
            <button className="w-9 h-9 rounded flex items-center justify-center" style={{ background: startPowerOpen ? (themeMode==='dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)') : 'transparent' }} aria-label="Power" onClick={() => setStartPowerOpen(!startPowerOpen)}>
              <svg viewBox="0 0 24 24" className="w-5 h-5" style={{ color: themeMode==='dark' ? 'white' : 'black' }}>
                <path d="M12 3v7" stroke="currentColor" strokeWidth="2"/>
                <path d="M6.3 6.3a8 8 0 1 0 11.4 0" fill="none" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </button>
            {startPowerOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded shadow-lg text-sm border" style={{ background: themeMode==='dark' ? 'rgba(17,24,39,1)' : '#ffffff', borderColor: themeMode==='dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)', color: themeMode==='dark' ? 'white' : 'black' }}>
                <button className="w-full text-left px-3 py-2 hover:bg-[var(--accent)] hover:text-white" onClick={() => { setStartPowerOpen(false); onClose(); onSleep?.(); }}>Sleep</button>
                <button className="w-full text-left px-3 py-2 hover:bg-[var(--accent)] hover:text-white" onClick={() => { setStartPowerOpen(false); onClose(); onReboot('restart'); }}>Restart</button>
                <button className="w-full text-left px-3 py-2 hover:bg-[var(--accent)] hover:text-white" onClick={() => { setStartPowerOpen(false); onClose(); onReboot('shutdown'); }}>Shut down</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartMenu;


