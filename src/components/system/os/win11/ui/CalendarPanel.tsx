'use client';

import React, { useMemo, useState } from 'react';
import { useWin11Theme } from '../Win11ThemeContext';

const WEEKDAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function buildMonth(year: number, month: number) {
  const first = new Date(year, month, 1);
  const start = new Date(first);
  start.setDate(1 - first.getDay());
  const days: Date[] = [];
  for (let i=0;i<42;i++) { const d = new Date(start); d.setDate(start.getDate()+i); days.push(d); }
  return days;
}

const CalendarPanel: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { themeMode, transparency } = useWin11Theme();
  const [current, setCurrent] = useState<Date>(new Date());
  const [selected, setSelected] = useState<Date>(new Date());
  const year = current.getFullYear();
  const month = current.getMonth();
  const days = useMemo(()=>buildMonth(year, month), [year, month]);
  const isSameDay = (a: Date, b: Date) => a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
  const isCurrentMonth = (d: Date) => d.getMonth() === month;

  const panelBG = themeMode==='dark' ? (transparency ? 'rgba(0,0,0,0.85)' : '#0b0f19') : (transparency ? 'rgba(255,255,255,0.85)' : '#f3f4f6');
  const border = themeMode==='dark' ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.1)';

  return (
    <div className="w-[360px] rounded-xl shadow-2xl p-3" style={{ background: panelBG, border }}>
      <div className="flex items-center justify-between mb-2 text-sm">
        <button className="w-8 h-8 rounded hover:bg-white/10" onClick={()=>setCurrent(new Date(year, month-1, 1))}>{'<'}</button>
        <div className="font-medium">{current.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</div>
        <button className="w-8 h-8 rounded hover:bg-white/10" onClick={()=>setCurrent(new Date(year, month+1, 1))}>{'>'}</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-xs opacity-80 mb-1">
        {WEEKDAYS.map(d => (<div key={d} className="h-6 flex items-center justify-center">{d}</div>))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-sm">
        {days.map((d, i) => {
          const isSel = isSameDay(d, selected);
          const muted = !isCurrentMonth(d);
          return (
            <button key={i} className={`h-9 rounded border ${muted ? 'opacity-50' : ''} ${isSel ? 'bg-[var(--accent)] text-white' : 'hover:bg-white/10'}`} style={{ border }} onClick={()=>setSelected(new Date(d))}>
              {d.getDate()}
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs">
        <button className="px-2 py-1 rounded border" onClick={()=>{ const t=new Date(); setCurrent(new Date(t.getFullYear(), t.getMonth(), 1)); setSelected(t); }}>Today</button>
        {onClose && <button className="px-2 py-1 rounded border" onClick={onClose}>Close</button>}
      </div>
    </div>
  );
};

export default CalendarPanel;


