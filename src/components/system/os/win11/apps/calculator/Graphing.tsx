'use client';

import React, { useEffect, useRef, useState } from 'react';
import { evaluate, preprocessExpression } from '../calcEngine';
import { useWin11Theme } from '../..';

interface GraphingProps {
  angleMode: 'DEG' | 'RAD';
}

const Graphing: React.FC<GraphingProps> = ({ angleMode }) => {
  const { themeMode } = useWin11Theme();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [expr, setExpr] = useState<string>('sin(x)');
  const [xMin, setXMin] = useState(-10);
  const [xMax, setXMax] = useState(10);
  const [samples, setSamples] = useState(800);

  const plot = () => {
    const c = canvasRef.current; if (!c) return; const ctx = c.getContext('2d'); if (!ctx) return;
    const width = c.width, height = c.height;
    ctx.clearRect(0, 0, width, height);
    const bg = themeMode==='dark' ? '#0b1220' : '#ffffff';
    const grid = themeMode==='dark' ? '#ffffff22' : '#00000012';
    const axes = themeMode==='dark' ? '#93c5fd' : '#2563eb';
    const fg = themeMode==='dark' ? '#34d399' : '#059669';
    ctx.fillStyle = bg; ctx.fillRect(0,0,width,height);

    // coordinate transforms
    const xToPx = (x:number) => (x - xMin) / (xMax - xMin) * width;
    const pxToX = (px:number) => xMin + (px/width) * (xMax - xMin);
    // y range: try to auto-fit by sampling
    const xs = new Array(samples).fill(0).map((_,i)=> xMin + (i/(samples-1))*(xMax-xMin));
    const ys: number[] = [];
    for (const x of xs) {
      try { const y = evaluate(preprocessExpression(expr), { angleMode, constants: { x } }); ys.push(y); }
      catch { ys.push(NaN); }
    }
    const finite = ys.filter(Number.isFinite) as number[];
    let yMin = -10, yMax = 10;
    if (finite.length) {
      yMin = Math.min(...finite); yMax = Math.max(...finite);
      if (yMin === yMax) { yMin -= 1; yMax += 1; }
    }
    const yToPx = (y:number) => height - (y - yMin) / (yMax - yMin) * height;

    // draw grid
    ctx.strokeStyle = grid; ctx.lineWidth = 1;
    const stepX = Math.pow(10, Math.floor(Math.log10((xMax-xMin)/8)));
    const stepY = Math.pow(10, Math.floor(Math.log10((yMax-yMin)/6)));
    for (let x = Math.ceil(xMin/stepX)*stepX; x <= xMax; x += stepX) {
      const px = Math.round(xToPx(x)) + 0.5; ctx.beginPath(); ctx.moveTo(px,0); ctx.lineTo(px,height); ctx.stroke();
    }
    for (let y = Math.ceil(yMin/stepY)*stepY; y <= yMax; y += stepY) {
      const py = Math.round(yToPx(y)) + 0.5; ctx.beginPath(); ctx.moveTo(0,py); ctx.lineTo(width,py); ctx.stroke();
    }
    // axes
    ctx.strokeStyle = axes; ctx.lineWidth = 1.5;
    const y0 = yToPx(0); ctx.beginPath(); ctx.moveTo(0,y0); ctx.lineTo(width,y0); ctx.stroke();
    const x0 = xToPx(0); ctx.beginPath(); ctx.moveTo(x0,0); ctx.lineTo(x0,height); ctx.stroke();
    // function
    ctx.strokeStyle = fg; ctx.lineWidth = 2; ctx.beginPath();
    let started = false;
    xs.forEach((x,i)=>{
      const y = ys[i]; if (!Number.isFinite(y)) { started=false; return; }
      const px = xToPx(x), py = yToPx(y);
      if (!started) { ctx.moveTo(px,py); started=true; } else { ctx.lineTo(px,py); }
    });
    ctx.stroke();
  };

  useEffect(()=>{ plot(); }, [expr, xMin, xMax, samples, themeMode]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-2 grid grid-cols-2 gap-2 sm:grid-cols-6 text-sm">
        <input className="px-2 py-1 rounded border col-span-2 sm:col-span-3" value={expr} onChange={(e)=>setExpr(e.target.value)} placeholder="f(x) = sin(x)" />
        <label className="flex items-center gap-2"><span>x min</span><input className="px-2 py-1 rounded border w-24" type="number" value={xMin} onChange={e=>setXMin(parseFloat(e.target.value))}/></label>
        <label className="flex items-center gap-2"><span>x max</span><input className="px-2 py-1 rounded border w-24" type="number" value={xMax} onChange={e=>setXMax(parseFloat(e.target.value))}/></label>
        <label className="flex items-center gap-2"><span>samples</span><input className="px-2 py-1 rounded border w-24" type="number" value={samples} onChange={e=>setSamples(parseInt(e.target.value)||400)}/></label>
      </div>
      <div className="flex-1 border rounded bg-white dark:bg-black/60" style={{ minHeight: 260 }}>
        <canvas ref={canvasRef} width={900} height={520} className="w-full h-full"/>
      </div>
    </div>
  );
};

export default Graphing;


