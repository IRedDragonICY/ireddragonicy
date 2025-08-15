'use client';

import React from 'react';
import { formatNumberForDisplay } from '../calcEngine';
import { useWin11Theme } from '../..';

export interface HistoryEntry { expression: string; result: number; timestamp: number }

interface HistoryPanelProps {
  open: boolean;
  compact: boolean; // kept for parity if parent wants different widths
  onClose: () => void;
  history: HistoryEntry[];
  onSelect: (expr: string) => void;
  onClear: () => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({ open, compact, onClose, history, onSelect, onClear }) => {
  const { themeMode, transparency } = useWin11Theme();
  const panelBG = themeMode==='dark' ? (transparency ? 'rgba(17,24,39,0.95)' : '#111827') : (transparency ? 'rgba(255,255,255,0.9)' : '#ffffff');
  const border = themeMode==='dark' ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(0,0,0,0.12)';

  const content = (
    <div className="w-64 p-3 h-full overflow-auto text-white" style={{ background: panelBG, borderLeft: border }}>
      <div className="text-xs font-medium mb-2">History</div>
      {history.length === 0 && <div className="text-xs opacity-60">There's no history yet.</div>}
      <div className="space-y-3">
        {history.slice().reverse().map((h, idx) => (
          <button key={idx} className="w-full text-left p-2 rounded hover:bg-white/10 border" onClick={() => onSelect(h.expression)}>
            <div className="text-[11px] opacity-70 break-all">{h.expression}</div>
            <div className="text-base">{formatNumberForDisplay(h.result)}</div>
          </button>
        ))}
      </div>
      <div className="mt-3 pt-3 border-t">
        <button className="px-2 py-1 rounded border" onClick={onClear}>Clear history</button>
      </div>
    </div>
  );

  // Always behave as a slide-in overlay panel (consistent across sizes)
  return (
    <>
      {open && <div className="absolute inset-0" style={{ background: themeMode==='dark'? 'rgba(0,0,0,0.45)':'rgba(0,0,0,0.25)' }} onClick={onClose} />}
      <div className={`absolute top-0 bottom-0 right-0 transition-transform duration-200 ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        {content}
      </div>
    </>
  );
};

export default HistoryPanel;


