'use client';

import React, { useMemo, useState } from 'react';
import { useWin11Theme } from '../..';

type Base = 'HEX' | 'DEC' | 'OCT' | 'BIN';

const digitsByBase: Record<Base, string> = {
  HEX: '0123456789ABCDEF',
  DEC: '0123456789',
  OCT: '01234567',
  BIN: '01',
};

function clampToBase(value: string, base: Base): string {
  const allowed = new Set(digitsByBase[base].split(''));
  return value.toUpperCase().split('').filter(c => allowed.has(c)).join('') || '0';
}

function parseToBigInt(text: string, base: Base): bigint {
  const radix = base === 'HEX' ? 16 : base === 'DEC' ? 10 : base === 'OCT' ? 8 : 2;
  return BigInt(parseInt(text, radix));
}

function bigintToBase(n: bigint, base: Base): string {
  const radix = base === 'HEX' ? 16 : base === 'DEC' ? 10 : base === 'OCT' ? 8 : 2;
  return n.toString(radix).toUpperCase();
}

const Programmer: React.FC = () => {
  const { themeMode } = useWin11Theme();
  const [base, setBase] = useState<Base>('HEX');
  const [text, setText] = useState<string>('0');
  const [a, setA] = useState<bigint | null>(null);
  const [op, setOp] = useState<'AND' | 'OR' | 'XOR' | 'NOT' | 'LSH' | 'RSH' | null>(null);

  const value = useMemo(()=> parseToBigInt(text, base), [text, base]);

  const keyClick = (k: string) => {
    setText(prev => clampToBase((prev === '0' ? '' : prev) + k, base));
  };
  const clearAll = () => { setText('0'); setA(null); setOp(null); };
  const backspace = () => setText(prev => (prev.length <= 1 ? '0' : prev.slice(0, -1)));
  const setBinaryOp = (o: typeof op) => { setA(value); setOp(o); setText('0'); };
  const equals = () => {
    if (op == null) return;
    const b = value; const left = a ?? 0n; let r: bigint = 0n;
    switch (op) {
      case 'AND': r = left & b; break;
      case 'OR': r = left | b; break;
      case 'XOR': r = left ^ b; break;
      case 'LSH': r = left << b; break;
      case 'RSH': r = left >> b; break;
      case 'NOT': r = ~b; break;
    }
    setText(bigintToBase(r, base)); setA(null); setOp(null);
  };

  const bases: Base[] = ['HEX','DEC','OCT','BIN'];
  const digits = digitsByBase[base].split('');

  return (
    <div className="w-full h-full grid grid-cols-1 md:grid-cols-[260px_1fr] gap-3 p-2">
      <div>
        <div className="flex gap-2 mb-2 text-sm">
          {bases.map(b => (
            <button key={b} className={`px-2 py-1 rounded border ${b===base?'bg-white/10':''}`} onClick={()=>{setBase(b); setText(clampToBase(text, b));}}>{b}</button>
          ))}
        </div>
        <div className="rounded p-2 border text-right text-3xl" style={{ background: themeMode==='dark'?'#0b1220':'#fff' }}>{text}</div>
        <div className="grid grid-cols-4 gap-2 mt-3">
          {digits.map(d => (<button key={d} className="h-10 rounded border" onClick={()=>keyClick(d)}>{d}</button>))}
          <button className="h-10 rounded border" onClick={backspace}>⌫</button>
          <button className="h-10 rounded border" onClick={clearAll}>C</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 content-start text-sm">
        <button className="h-10 rounded border" onClick={()=>setBinaryOp('AND')}>AND</button>
        <button className="h-10 rounded border" onClick={()=>setBinaryOp('OR')}>OR</button>
        <button className="h-10 rounded border" onClick={()=>setBinaryOp('XOR')}>XOR</button>
        <button className="h-10 rounded border" onClick={()=>setBinaryOp('LSH')}>LSH</button>
        <button className="h-10 rounded border" onClick={()=>setBinaryOp('RSH')}>RSH</button>
        <button className="h-10 rounded border" onClick={()=>{ setOp('NOT'); equals(); }}>NOT</button>
        <button className="h-10 rounded border col-span-2 md:col-span-3 bg-sky-600 text-white border-sky-700" onClick={equals}>=</button>
      </div>
    </div>
  );
};

export default Programmer;


