'use client';

import React from 'react';
import type { ResizeDir, WindowSpec } from './types';

interface WindowFrameProps {
  win: WindowSpec;
  themeMode: 'light' | 'dark';
  onFocus: (id: string) => void;
  onClose: (id: string) => void;
  onToggleMinimize: (id: string) => void;
  onToggleMaximize: (id: string) => void;
  onStartDrag: (id: string, event: React.MouseEvent<HTMLDivElement>) => void;
  onBeginResize: (id: string, dir: ResizeDir, event: React.MouseEvent<HTMLDivElement>) => void;
  renderContent: (win: WindowSpec) => React.ReactNode;
}

const WindowFrame: React.FC<WindowFrameProps> = ({
  win,
  themeMode,
  onFocus,
  onClose,
  onToggleMinimize,
  onToggleMaximize,
  onStartDrag,
  onBeginResize,
  renderContent,
}) => {
  if (win.minimized) return null;

  const frameStyle = win.maximized
    ? { zIndex: win.z }
    : { left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z };

  const chromeBackground =
    themeMode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(243,244,246,0.9)';
  const chromeBorder = themeMode === 'dark' ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.08)';

  const beginResize = (dir: ResizeDir) => (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    onBeginResize(win.id, dir, event);
  };

  return (
    <div
      key={win.id}
      data-window-frame="true"
      className={`absolute rounded-2xl shadow-[0_30px_60px_rgba(15,23,42,0.35)] border border-black/10 overflow-hidden bg-white/95 dark:bg-[#0f172a]/95 ${
        win.maximized ? 'inset-0' : ''
      }`}
      style={frameStyle as React.CSSProperties}
      onMouseDown={() => onFocus(win.id)}
    >
      <div
        className="h-11 flex items-center justify-between px-4 select-none"
        style={{ background: chromeBackground, borderBottom: chromeBorder }}
        onMouseDown={(event) => {
          const target = event.target as HTMLElement;
          if (target.closest('button')) return;
          onStartDrag(win.id, event);
        }}
        onDoubleClick={() => onToggleMaximize(win.id)}
      >
        <div className="text-sm font-semibold tracking-tight text-black/80 dark:text-white/80">
          {win.title}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            aria-label="Minimize"
            className="w-11 h-9 rounded-xl hover:bg-black/10 text-black/80 dark:text-white/80"
            onClick={(event) => {
              event.stopPropagation();
              onToggleMinimize(win.id);
            }}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4">
              <rect x="5" y="12" width="14" height="1.8" fill="currentColor" />
            </svg>
          </button>
          <button
            aria-label="Maximize"
            className="w-11 h-9 rounded-xl hover:bg-black/10 text-black/80 dark:text-white/80"
            onClick={(event) => {
              event.stopPropagation();
              onToggleMaximize(win.id);
            }}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4">
              <rect x="6" y="6" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </button>
          <button
            aria-label="Close"
            className="w-11 h-9 rounded-xl hover:bg-red-500 hover:text-white text-black/80 dark:text-white/80"
            onClick={(event) => {
              event.stopPropagation();
              onClose(win.id);
            }}
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4">
              <path d="M6 6 18 18M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div id={`window-content-${win.id}`} className="w-full h-[calc(100%-44px)] relative">
        {renderContent(win)}
        {!win.maximized && (
          <>
            <div className="absolute inset-x-0 top-0 h-2 cursor-n-resize" onMouseDown={beginResize('n')} />
            <div className="absolute inset-x-0 bottom-0 h-2 cursor-s-resize" onMouseDown={beginResize('s')} />
            <div className="absolute inset-y-0 left-0 w-2 cursor-w-resize" onMouseDown={beginResize('w')} />
            <div className="absolute inset-y-0 right-0 w-2 cursor-e-resize" onMouseDown={beginResize('e')} />
            <div className="absolute left-0 top-0 w-3 h-3 cursor-nw-resize" onMouseDown={beginResize('nw')} />
            <div className="absolute right-0 top-0 w-3 h-3 cursor-ne-resize" onMouseDown={beginResize('ne')} />
            <div className="absolute left-0 bottom-0 w-3 h-3 cursor-sw-resize" onMouseDown={beginResize('sw')} />
            <div className="absolute right-0 bottom-0 w-3 h-3 cursor-se-resize" onMouseDown={beginResize('se')} />
          </>
        )}
      </div>
    </div>
  );
};

export default WindowFrame;
