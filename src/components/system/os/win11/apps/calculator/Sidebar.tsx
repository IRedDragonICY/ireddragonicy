'use client';

import React from 'react';
import { useWin11Theme } from '../..';

export type CalcSection =
  | 'standard'
  | 'scientific'
  | 'graphing'
  | 'programmer'
  | 'date'
  | 'converter'
  | 'currency'
  | 'conv:length'
  | 'conv:volume'
  | 'conv:weight'
  | 'conv:temperature'
  | 'conv:energy'
  | 'conv:area'
  | 'conv:speed'
  | 'conv:time'
  | 'conv:power'
  | 'conv:data'
  | 'conv:pressure'
  | 'conv:angle';

const Sidebar: React.FC<{
  section: CalcSection;
  setSection: (s: CalcSection) => void;
  open: boolean;
  onClose: () => void;
}> = ({ section, setSection, open, onClose }) => {
  const { themeMode, transparency } = useWin11Theme();
  const panelBG = themeMode==='dark' ? (transparency ? 'rgba(0,0,0,0.85)' : '#0b0f19') : (transparency ? 'rgba(255,255,255,0.85)' : '#f3f4f6');
  const border = themeMode==='dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.1)';
  const text = themeMode==='dark' ? 'white' : 'black';
  const accent = 'var(--accent)';
  const itemCls = (active:boolean) => `w-full text-left px-3 py-2 rounded ${active ? 'bg-white/10' : 'hover:bg-white/5'} select-none`;
  return (
    <>
      {open && <div className="absolute inset-0 lg:hidden" style={{ background: themeMode==='dark' ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0.15)' }} onClick={onClose} />}
      <div
        className={`absolute top-0 bottom-0 left-0 w-64 transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full'} shadow-2xl`}
        style={{ background: panelBG, color: text, borderRight: border, backdropFilter: transparency ? 'blur(10px)' : 'none' }}
        aria-hidden={!open}
      >
        <div className="p-3 text-sm overflow-auto h-full">
          <div className="opacity-80 text-xs px-1 mb-1">Calculator</div>
          <div className="space-y-1">
            {[
              { id:'standard', label:'Standard' },
              { id:'scientific', label:'Scientific' },
              { id:'graphing', label:'Graphing' },
              { id:'programmer', label:'Programmer' },
              { id:'date', label:'Date calculation' },
            ].map(it => (
              <button key={it.id} className={itemCls(section===it.id)} onClick={()=>{ setSection(it.id as CalcSection); onClose(); }}>{it.label}</button>
            ))}
          </div>

          <div className="opacity-80 text-xs px-1 mt-4 mb-1">Converter</div>
          <div className="space-y-1">
            <button className={itemCls(section==='converter')} onClick={()=>{ setSection('converter'); onClose(); }}>All converters</button>
            <button className={itemCls(section==='currency')} onClick={()=>{ setSection('currency'); onClose(); }}>Currency</button>
            {[
              { id: 'conv:length', label: 'Length' },
              { id: 'conv:volume', label: 'Volume' },
              { id: 'conv:weight', label: 'Weight and mass' },
              { id: 'conv:temperature', label: 'Temperature' },
              { id: 'conv:energy', label: 'Energy' },
              { id: 'conv:area', label: 'Area' },
              { id: 'conv:speed', label: 'Speed' },
              { id: 'conv:time', label: 'Time' },
              { id: 'conv:power', label: 'Power' },
              { id: 'conv:data', label: 'Data' },
              { id: 'conv:pressure', label: 'Pressure' },
              { id: 'conv:angle', label: 'Angle' },
            ].map(it => (
              <button key={it.id} className={itemCls(section===it.id as any)} onClick={()=>{ setSection(it.id as CalcSection); onClose(); }}>{it.label}</button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;


