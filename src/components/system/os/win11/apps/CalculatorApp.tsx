'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useWin11Theme } from '..';
import { AngleMode, evaluate, formatNumberForDisplay, preprocessExpression } from './calcEngine';
import Sidebar, { CalcSection } from './calculator/Sidebar';
import Graphing from './calculator/Graphing';
import Programmer from './calculator/Programmer';
import DateCalc from './calculator/DateCalc';
import Converter from './calculator/Converter';
import Currency from './calculator/Currency';
import SettingsPane from './calculator/SettingsPane';
import HistoryPanel from './calculator/HistoryPanel';

type CalcMode = 'standard' | 'scientific';

interface HistoryEntry {
  expression: string;
  result: number;
  timestamp: number;
}

const STORAGE_KEYS = {
  history: 'win11_calc_history',
  memory: 'win11_calc_memory',
  angle: 'win11_calc_angle',
  mode: 'win11_calc_mode',
};

const groupButton = (
  label: string,
  onClick: () => void,
  opts?: { aria?: string; className?: string; disabled?: boolean }
) => (
  <button
    key={label}
    className={`rounded text-sm border whitespace-nowrap ${opts?.className || ''}`}
    onClick={onClick}
    aria-label={opts?.aria || label}
    disabled={opts?.disabled}
    style={{ height: 'var(--btn-h, 48px)' }}
  >
    <span className="select-none">{label}</span>
  </button>
);

function useLocalStorageNumber(key: string, initial: number) {
  const [value, setValue] = useState<number>(() => {
    try { const raw = window.localStorage.getItem(key); return raw == null ? initial : parseFloat(raw); } catch { return initial; }
  });
  useEffect(() => { try { window.localStorage.setItem(key, String(value)); } catch {} }, [key, value]);
  return [value, setValue] as const;
}

function useLocalStorageString<T extends string>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try { const raw = window.localStorage.getItem(key); return (raw as T) ?? initial; } catch { return initial; }
  });
  useEffect(() => { try { window.localStorage.setItem(key, value); } catch {} }, [key, value]);
  return [value, setValue] as const;
}

const Display: React.FC<{ expression: string; display: string; surfaceBG: string; surfaceText: string }>
  = ({ expression, display, surfaceBG, surfaceText }) => {
  return (
    <div className="rounded p-3 mb-3 border" style={{ background: surfaceBG, color: surfaceText, borderColor: 'rgba(0,0,0,0.15)' }}>
      <div className="text-xs opacity-70 text-right break-all min-h-[18px]">{expression || '\u00A0'}</div>
      <div className="text-4xl leading-tight text-right break-all select-text" aria-live="polite">{display || '0'}</div>
    </div>
  );
};

const MemoryBar: React.FC<{
  memory: number | null;
  setMemory: (n: number | null) => void;
  currentValue: number | null;
  onRecall: (n: number) => void;
}> = ({ memory, setMemory, currentValue, onRecall }) => {
  const memIndicator = memory != null ? 'opacity-100' : 'opacity-40';
  return (
    <div className="flex items-center gap-2 text-xs mb-2" aria-label="Memory controls">
      <span className={`px-2 py-1 rounded border ${memIndicator}`}>M</span>
      <button className="px-2 py-1 rounded border" onClick={() => setMemory(null)} aria-label="MC">MC</button>
      <button className="px-2 py-1 rounded border" onClick={() => memory != null && onRecall(memory)} aria-label="MR" disabled={memory==null}>MR</button>
      <button className="px-2 py-1 rounded border" onClick={() => setMemory((memory ?? 0) + (currentValue ?? 0))} aria-label="M+" disabled={currentValue==null}>M+</button>
      <button className="px-2 py-1 rounded border" onClick={() => setMemory((memory ?? 0) - (currentValue ?? 0))} aria-label="M-" disabled={currentValue==null}>M-</button>
      <button className="px-2 py-1 rounded border" onClick={() => currentValue!=null && setMemory(currentValue)} aria-label="MS" disabled={currentValue==null}>MS</button>
    </div>
  );
};

const ScientificPad: React.FC<{
  append: (s: string) => void;
  inputOperator: (op: string) => void;
  backspace: () => void;
  clearAll: () => void;
  equals: () => void;
  setExpression: (s: string) => void;
  insertFunction: (name: string) => void;
  insertPower: (power: number | 'y') => void;
  insertFactorial: () => void;
  insertConstant: (name: 'pi' | 'e') => void;
  insertReciprocal: () => void;
}> = ({ append, inputOperator, backspace, clearAll, equals, insertFunction, insertPower, insertFactorial, insertConstant, insertReciprocal }) => {
  return (
    <div className="space-y-3">
      {/* Scientific functions grid (5 columns; 4 rows) */}
      <div className="grid grid-cols-5 gap-2" data-calc-rows="4" data-calc-cols="5">
        {groupButton('π', () => insertConstant('pi'))}
        {groupButton('e', () => insertConstant('e'))}
        {groupButton('C', clearAll)}
        {groupButton('⌫', backspace, { aria: 'Backspace' })}
        {groupButton('mod', () => inputOperator(' mod '))}

        {groupButton('1/x', insertReciprocal)}
        {groupButton('|x|', () => insertFunction('abs'))}
        {groupButton('exp', () => insertFunction('exp'))}
        {groupButton('(', () => append('('))}
        {groupButton(')', () => append(')'))}

        {groupButton('x²', () => insertPower(2))}
        {groupButton('x³', () => insertPower(3))}
        {groupButton('xʸ', () => insertPower('y'))}
        {groupButton('n!', insertFactorial)}
        {groupButton('√', () => insertFunction('sqrt'))}

        {groupButton('sin', () => insertFunction('sin'))}
        {groupButton('cos', () => insertFunction('cos'))}
        {groupButton('tan', () => insertFunction('tan'))}
        {groupButton('÷', () => inputOperator(' / '))}
        {groupButton('×', () => inputOperator(' * '))}
      </div>

      {/* Numeric & basic operators grid (4 columns; 4 rows, with = spanning 2) */}
      <div className="grid grid-cols-4 gap-2" data-calc-rows="4" data-calc-cols="4">
        {groupButton('7', () => append('7'))}
        {groupButton('8', () => append('8'))}
        {groupButton('9', () => append('9'))}
        {groupButton('−', () => inputOperator(' - '))}

        {groupButton('4', () => append('4'))}
        {groupButton('5', () => append('5'))}
        {groupButton('6', () => append('6'))}
        {groupButton('+', () => inputOperator(' + '))}

        {groupButton('1', () => append('1'))}
        {groupButton('2', () => append('2'))}
        {groupButton('3', () => append('3'))}
        {groupButton('=', equals, { className: 'row-span-2 bg-sky-600 text-white border-sky-700' })}

        {groupButton('0', () => append('0'), { className: 'col-span-2' })}
        {groupButton('.', () => append('.'))}
      </div>
    </div>
  );
};

const StandardPad: React.FC<{
  append: (s: string) => void;
  inputOperator: (op: string) => void;
  backspace: () => void;
  clearAll: () => void;
  equals: () => void;
}> = ({ append, inputOperator, backspace, clearAll, equals }) => {
  return (
    <div className="grid grid-cols-4 gap-2" data-calc-rows="5" data-calc-cols="4">
      {groupButton('C', clearAll)}
      {groupButton('⌫', backspace, { aria: 'Backspace' })}
      {groupButton('÷', () => inputOperator(' / '))}
      {groupButton('×', () => inputOperator(' * '))}

      {groupButton('7', () => append('7'))}
      {groupButton('8', () => append('8'))}
      {groupButton('9', () => append('9'))}
      {groupButton('−', () => inputOperator(' - '))}

      {groupButton('4', () => append('4'))}
      {groupButton('5', () => append('5'))}
      {groupButton('6', () => append('6'))}
      {groupButton('+', () => inputOperator(' + '))}

      {groupButton('1', () => append('1'))}
      {groupButton('2', () => append('2'))}
      {groupButton('3', () => append('3'))}
      {groupButton('=', equals, { className: 'row-span-2 bg-sky-600 text-white border-sky-700' })}

      {groupButton('0', () => append('0'), { className: 'col-span-2' })}
      {groupButton('.', () => append('.'))}
    </div>
  );
};

const CalculatorApp: React.FC = () => {
  const { themeMode } = useWin11Theme();
  const surfaceBG = themeMode === 'dark' ? 'rgba(17,24,39,1)' : '#ffffff';
  const surfaceText = themeMode === 'dark' ? 'white' : 'black';
  const softBG = themeMode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)';
  const [section, setSection] = useState<CalcSection>('scientific');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const [isCompact, setIsCompact] = useState<boolean>(true);

  useEffect(() => {
    const compute = () => { try { setIsCompact(window.innerWidth < 1100); } catch {} };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  const [mode, setMode] = useLocalStorageString<CalcMode>(STORAGE_KEYS.mode, 'scientific');
  const [angleMode, setAngleMode] = useLocalStorageString<AngleMode>(STORAGE_KEYS.angle, 'DEG');
  const [memoryValue, setMemoryValueRaw] = useLocalStorageNumber(STORAGE_KEYS.memory, NaN);
  const memory: number | null = Number.isNaN(memoryValue) ? null : memoryValue;
  const setMemory = (n: number | null) => setMemoryValueRaw(n == null ? NaN : n);

  const [expression, setExpression] = useState<string>('');
  const [displayValue, setDisplayValue] = useState<string>('0');
  const [lastResult, setLastResult] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try { const raw = window.localStorage.getItem(STORAGE_KEYS.history); return raw ? JSON.parse(raw) as HistoryEntry[] : []; } catch { return []; }
  });
  useEffect(() => { try { window.localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history.slice(-50))); } catch {} }, [history]);

  const evaluateNow = (expr: string) => {
    try {
      const pre = preprocessExpression(expr).replace(/Ans/g, (lastResult ?? 0).toString());
      const result = evaluate(pre, { angleMode });
      setDisplayValue(formatNumberForDisplay(result));
      setLastResult(result);
      return result;
    } catch (e) {
      setDisplayValue('Error');
      return null;
    }
  };

  const append = (s: string) => {
    setExpression((prev) => prev + s);
  };
  const inputOperator = (op: string) => setExpression((prev) => prev.replace(/\s+$/, '') + op);
  const clearAll = () => { setExpression(''); setDisplayValue('0'); };
  const backspace = () => setExpression((prev) => prev.slice(0, -1));
  const equals = () => {
    const res = evaluateNow(expression);
    if (res != null) {
      setHistory((h) => [...h, { expression, result: res, timestamp: Date.now() }]);
    }
  };
  const insertFunction = (name: string) => append(`${name}(`);
  const insertPower = (power: number | 'y') => {
    if (power === 'y') append('^'); else append(`^${power}`);
  };
  const insertFactorial = () => append('!');
  const insertConstant = (name: 'pi' | 'e') => append(name);
  const insertReciprocal = () => append('^(-1)');

  // Evaluate live preview
  useEffect(() => {
    if (!expression) { setDisplayValue('0'); return; }
    try {
      const pre = preprocessExpression(expression).replace(/Ans/g, (lastResult ?? 0).toString());
      const result = evaluate(pre, { angleMode });
      if (Number.isFinite(result)) setDisplayValue(formatNumberForDisplay(result));
    } catch {
      // ignore while typing
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expression, angleMode]);

  // Keyboard support
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const key = e.key;
      if (/[0-9]/.test(key)) { append(key); return; }
      if (key === '.') { append('.'); return; }
      if (key === '+') { inputOperator(' + '); return; }
      if (key === '-') { inputOperator(' - '); return; }
      if (key === '*') { inputOperator(' * '); return; }
      if (key === '/') { inputOperator(' / '); return; }
      if (key === '(' || key === ')') { append(key); return; }
      if (key === '^') { append('^'); return; }
      if (key === 'Enter' || key === '=') { e.preventDefault(); equals(); return; }
      if (key === 'Backspace') { backspace(); return; }
      if (key.toLowerCase() === 's') { insertFunction('sin'); return; }
      if (key.toLowerCase() === 'c') { insertFunction('cos'); return; }
      if (key.toLowerCase() === 't') { insertFunction('tan'); return; }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Auto-fit keypad: compute button height from available height and width
  const containerRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<HTMLDivElement | null>(null);
  const padRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const compute = () => {
      const root = containerRef.current; if (!root) return;
      const headerH = headerRef.current?.offsetHeight || 0;
      const controlsH = controlsRef.current?.offsetHeight || 0;
      const groups = padRef.current ? Array.from(padRef.current.querySelectorAll('[data-calc-rows]')) as HTMLElement[] : [];
      const totalRows = groups.reduce((s,g)=> s + parseInt(g.getAttribute('data-calc-rows')||'0',10), 0);
      const maxCols = groups.reduce((m,g)=> Math.max(m, parseInt(g.getAttribute('data-calc-cols')||'4',10)), 4);
      const gapX = 8 * (maxCols - 1);
      const usableW = root.clientWidth - 24; // padding left+right
      const btnW = Math.max(44, Math.floor((usableW - gapX) / maxCols));
      // Height budget
      const groupGapY = (groups.length > 0 ? (groups.length - 1) * 12 : 0); // space-y-3
      const rowGapY = groups.reduce((s,g)=> s + (parseInt(g.getAttribute('data-calc-rows')||'0',10) - 1) * 8, 0);
      const availH = root.clientHeight - headerH - controlsH - groupGapY - rowGapY - 16;
      const fromH = totalRows > 0 ? Math.max(44, Math.floor(availH / totalRows)) : 48;
      // Allow vertical stretching independent of width (closer to Windows behavior)
      const btnH = Math.min(160, fromH);
      root.style.setProperty('--btn-h', `${btnH}px`);
    };
    const ro = new ResizeObserver(compute);
    if (containerRef.current) ro.observe(containerRef.current);
    if (padRef.current) ro.observe(padRef.current);
    return () => ro.disconnect();
  }, [section]);

  return (
    <div className="w-full h-full relative flex select-none" style={{ color: surfaceText }}>
      <Sidebar section={section} setSection={setSection} open={sidebarOpen} onClose={()=>setSidebarOpen(false)} />
      <div ref={containerRef} className="flex-1 p-3 text-sm overflow-hidden" style={{ background: surfaceBG }}>
        <div ref={headerRef} className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <button className="w-9 h-9 rounded border flex items-center justify-center" onClick={()=>setSidebarOpen(v=>!v)} aria-label="Toggle menu">
              <svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2"/></svg>
            </button>
            <button className={`px-3 py-1 rounded border ${mode==='standard' ? 'bg-white/10' : ''}`} onClick={() => setMode('standard')}>Standard</button>
            <button className={`px-3 py-1 rounded border ${mode==='scientific' ? 'bg-white/10' : ''}`} onClick={() => setMode('scientific')}>Scientific</button>
          </div>
          <div className="flex items-center gap-2">
            <button className={`px-2 py-1 rounded border ${angleMode==='DEG' ? 'bg-white/10' : ''}`} onClick={() => setAngleMode('DEG')}>DEG</button>
            <button className={`px-2 py-1 rounded border ${angleMode==='RAD' ? 'bg-white/10' : ''}`} onClick={() => setAngleMode('RAD')}>RAD</button>
            {(section==='standard' || section==='scientific') && (
              <button className="w-9 h-9 rounded border flex items-center justify-center" onClick={()=>setHistoryOpen(v=>!v)} aria-label="Toggle history">
                <svg viewBox="0 0 24 24" className="w-5 h-5"><path d="M4 5h16M4 12h16M4 19h16" stroke="currentColor" strokeWidth="2"/></svg>
              </button>
            )}
          </div>
        </div>

        {section === 'standard' || section === 'scientific' ? (
          <div>
            <div ref={controlsRef}>
              <Display expression={expression} display={displayValue} surfaceBG={softBG} surfaceText={surfaceText} />
              <MemoryBar
                memory={memory}
                setMemory={setMemory}
                currentValue={lastResult}
                onRecall={(n)=> setExpression(prev => prev + String(n))}
              />
            </div>
            <div ref={padRef}>
              {(section === 'scientific' ? (
                <ScientificPad
                  append={append}
                  inputOperator={inputOperator}
                  backspace={backspace}
                  clearAll={clearAll}
                  equals={equals}
                  setExpression={setExpression}
                  insertFunction={insertFunction}
                  insertPower={insertPower}
                  insertFactorial={insertFactorial}
                  insertConstant={insertConstant}
                  insertReciprocal={insertReciprocal}
                />
              ) : (
                <StandardPad
                  append={append}
                  inputOperator={inputOperator}
                  backspace={backspace}
                  clearAll={clearAll}
                  equals={equals}
                />
              ))}
            </div>
          </div>
        ) : null}

        {section === 'graphing' && (
          <div className="select-text">
            <Graphing angleMode={angleMode} />
          </div>
        )}
        {section === 'programmer' && (
          <Programmer />
        )}
        {section === 'date' && (
          <DateCalc />
        )}
        {section === 'converter' && (<Converter />)}
        {section === 'conv:length' && (<Converter initialGroup="length" mode="single" />)}
        {section === 'conv:volume' && (<Converter initialGroup="volume" mode="single" />)}
        {section === 'conv:weight' && (<Converter initialGroup="weight" mode="single" />)}
        {section === 'conv:temperature' && (<Converter initialGroup="temperature" mode="single" />)}
        {section === 'conv:energy' && (<Converter initialGroup="energy" mode="single" />)}
        {section === 'conv:area' && (<Converter initialGroup="area" mode="single" />)}
        {section === 'conv:speed' && (<Converter initialGroup="speed" mode="single" />)}
        {section === 'conv:time' && (<Converter initialGroup="time" mode="single" />)}
        {section === 'conv:power' && (<Converter initialGroup="power" mode="single" />)}
        {section === 'conv:data' && (<Converter initialGroup="data" mode="single" />)}
        {section === 'conv:pressure' && (<Converter initialGroup="pressure" mode="single" />)}
        {section === 'conv:angle' && (<Converter initialGroup="angle" mode="single" />)}
        {section === 'currency' && (
          <Currency />
        )}
      </div>
      {/* History panel */}
      {(section === 'standard' || section === 'scientific') && (
        <HistoryPanel
          open={historyOpen}
          compact={isCompact}
          onClose={()=>setHistoryOpen(false)}
          history={history}
          onSelect={(expr)=>setExpression(expr)}
          onClear={()=>setHistory([])}
        />
      )}
    </div>
  );
};

export default CalculatorApp;


