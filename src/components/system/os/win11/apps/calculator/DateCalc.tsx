'use client';

import React, { useMemo, useState } from 'react';
import { useWin11Theme } from '../..';

function parseDate(s: string): Date | null {
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function diffDays(a: Date, b: Date): number {
  const ms = Math.abs(a.getTime() - b.getTime());
  return Math.floor(ms / (24 * 3600 * 1000));
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d); r.setDate(r.getDate() + n); return r;
}

const DateCalc: React.FC = () => {
  const { themeMode } = useWin11Theme();
  const [a, setA] = useState<string>(new Date().toISOString().slice(0,10));
  const [b, setB] = useState<string>(new Date().toISOString().slice(0,10));
  const [offset, setOffset] = useState<number>(10);

  const aDate = useMemo(()=>parseDate(a), [a]);
  const bDate = useMemo(()=>parseDate(b), [b]);
  const days = aDate && bDate ? diffDays(aDate, bDate) : 0;
  const added = aDate ? addDays(aDate, offset) : null;

  return (
    <div className="grid md:grid-cols-2 gap-4 p-2 text-sm">
      <div className="rounded p-3 border" style={{ background: themeMode==='dark'?'#0b1220':'#fff' }}>
        <div className="font-medium mb-2">Difference between dates</div>
        <div className="space-y-2">
          <label className="flex items-center gap-2">From <input className="px-2 py-1 rounded border" type="date" value={a} onChange={e=>setA(e.target.value)} /></label>
          <label className="flex items-center gap-2">To <input className="px-2 py-1 rounded border" type="date" value={b} onChange={e=>setB(e.target.value)} /></label>
        </div>
        <div className="mt-3">Days between: <span className="font-semibold">{days}</span></div>
      </div>
      <div className="rounded p-3 border" style={{ background: themeMode==='dark'?'#0b1220':'#fff' }}>
        <div className="font-medium mb-2">Add or subtract days</div>
        <div className="space-y-2">
          <label className="flex items-center gap-2">Start <input className="px-2 py-1 rounded border" type="date" value={a} onChange={e=>setA(e.target.value)} /></label>
          <label className="flex items-center gap-2">Days <input className="px-2 py-1 rounded border w-24" type="number" value={offset} onChange={e=>setOffset(parseInt(e.target.value)||0)} /></label>
        </div>
        <div className="mt-3">Result: <span className="font-semibold">{added ? added.toDateString() : '-'}</span></div>
      </div>
    </div>
  );
};

export default DateCalc;


