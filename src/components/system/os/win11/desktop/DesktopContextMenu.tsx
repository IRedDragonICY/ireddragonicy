'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { JSX } from 'react';
import IconGlyph from './IconGlyph';
import { useWin11Theme } from '../Win11ThemeContext';
import type { ContextMenuItem, ContextMenuState, IconName } from './types';

interface DesktopContextMenuProps {
  state: ContextMenuState;
  onClose: () => void;
}

const cx = (...values: Array<string | null | undefined | false>) => values.filter(Boolean).join(' ');

const ItemIcon: React.FC<{ icon?: React.ReactNode | IconName; className?: string }> = ({ icon, className }) => {
  if (!icon) {
    return <span className={cx('w-5 h-5 shrink-0 inline-flex items-center justify-center text-slate-500 dark:text-slate-200 transition-colors duration-150', className)} />;
  }
  if (typeof icon === 'string') {
    return <IconGlyph name={icon as IconName} className={cx('w-5 h-5 text-slate-600 dark:text-slate-100 transition-colors duration-150', className)} />;
  }
  return <span className={cx('w-5 h-5 shrink-0 inline-flex items-center justify-center text-slate-600 dark:text-slate-100 transition-colors duration-150', className)}>{icon}</span>;
};

const DesktopContextMenu: React.FC<DesktopContextMenuProps> = ({ state, onClose }) => {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [submenuAnchor, setSubmenuAnchor] = useState<{ itemId: string; rect: DOMRect } | null>(null);
  const { themeMode } = useWin11Theme();

  const surfaceStyle = (level: 'root' | 'nested'): React.CSSProperties => {
    const darkGradient = level === 'root'
      ? 'linear-gradient(135deg, rgba(35,40,58,0.95), rgba(15,19,31,0.9))'
      : 'linear-gradient(135deg, rgba(42,48,66,0.95), rgba(21,26,38,0.9))';
    const lightGradient = level === 'root'
      ? 'linear-gradient(135deg, rgba(255,255,255,0.97), rgba(239,244,255,0.92))'
      : 'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(244,246,255,0.94))';
    const borderColor = themeMode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(216,225,255,0.76)';
    const shadow = themeMode === 'dark' ? '0 32px 60px rgba(0,0,0,0.58)' : '0 22px 48px rgba(15,23,42,0.18)';
    return {
      background: themeMode === 'dark' ? darkGradient : lightGradient,
      border: `1px solid ${borderColor}`,
      boxShadow: shadow,
    };
  };

  useEffect(() => {
    if (!state.open) return;

    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleContext = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        event.preventDefault();
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('contextmenu', handleContext);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('contextmenu', handleContext);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [state.open, onClose]);

  useEffect(() => {
    setSubmenuAnchor(null);
  }, [state.items, state.open]);

  if (!state.open) {
    return null;
  }

  const renderItems = (items: ContextMenuItem[], nested = false): JSX.Element => (
    <div
      className={cx(
        'min-w-[260px] rounded-2xl py-1 text-[13px] transition-[background,box-shadow,border-color] duration-200 border',
        nested
          ? 'backdrop-blur-xl shadow-[0_18px_40px_rgba(10,12,18,0.24)] dark:shadow-[0_22px_48px_rgba(0,0,0,0.5)] border-white/40 dark:border-white/5'
          : 'backdrop-blur-2xl shadow-[0_24px_54px_rgba(10,12,18,0.22)] dark:shadow-[0_32px_60px_rgba(0,0,0,0.58)] border-white/60 dark:border-white/12',
        'text-slate-900 dark:text-slate-100'
      )}
      style={surfaceStyle(nested ? 'nested' : 'root')}
    >
      {items.map((item, index) => {
        if (item.divider) {
          return <div key={`divider-${index}`} className="my-1 mx-2 border-t border-slate-200/60 dark:border-white/15" />;
        }

        const disabled = item.disabled;
        const hasChildren = !!item.children?.length;
        const showSub = submenuAnchor?.itemId === item.id;

        return (
          <div
            key={item.id}
            className={cx(
              'group relative mx-1 rounded-xl px-2 py-[7px] flex items-center gap-3 cursor-default transition-all duration-150',
              'hover:bg-slate-50/90 dark:hover:bg-white/12 hover:shadow-sm dark:hover:shadow-[0_12px_32px_rgba(15,23,42,0.45)]',
              disabled && 'opacity-40 pointer-events-none'
            )}
            onMouseEnter={(event) => {
              if (!hasChildren) {
                setSubmenuAnchor(null);
                return;
              }
              const rect = (event.currentTarget as HTMLDivElement).getBoundingClientRect();
              setSubmenuAnchor({ itemId: item.id, rect });
            }}
            onMouseLeave={() => {
              if (!hasChildren) {
                setSubmenuAnchor((prev) => (prev?.itemId === item.id ? null : prev));
              }
            }}
            onClick={() => {
              if (disabled) return;
              if (item.onSelect) item.onSelect();
              if (!hasChildren) onClose();
            }}
          >
            <ItemIcon
              icon={item.icon}
              className={cx(
                item.danger ? 'text-red-500 dark:text-red-400' : 'text-slate-600 dark:text-slate-100',
                'group-hover:text-slate-900 group-hover:dark:text-white'
              )}
            />
            <div className="flex-1 min-w-0">
              <div
                className={cx(
                  'font-medium tracking-tight text-slate-900 dark:text-slate-100 transition-colors duration-150',
                  !item.danger && 'group-hover:text-slate-900 group-hover:dark:text-white',
                  item.danger && 'text-red-500 dark:text-red-400'
                )}
              >
                {item.label}
              </div>
              {item.description && (
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 transition-colors duration-150 group-hover:text-slate-600 group-hover:dark:text-slate-200">
                  {item.description}
                </div>
              )}
            </div>
            {item.shortcut && (
              <div className="text-[11px] text-slate-500 dark:text-slate-300 font-semibold transition-colors duration-150 group-hover:text-slate-700 group-hover:dark:text-slate-100">
                {item.shortcut}
              </div>
            )}
            {item.accessory && (
              <div className="ml-2 flex items-center text-slate-500 dark:text-slate-300 transition-colors duration-150 group-hover:text-slate-700 group-hover:dark:text-slate-100">
                {item.accessory}
              </div>
            )}
            {hasChildren && (
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-slate-500 dark:text-slate-300 transition-colors duration-150 group-hover:text-slate-700 group-hover:dark:text-slate-100">
                <path d="M9 6 15 12 9 18" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {showSub && hasChildren && submenuAnchor && (
              <div
                className="absolute top-0 left-full ml-2"
                style={{ minWidth: 240 }}
                onMouseEnter={() => setSubmenuAnchor(submenuAnchor)}
              >
                {renderItems(item.children!, true)}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const normalizedX = Math.min(state.x, window.innerWidth - 280);
  const normalizedY = Math.min(state.y, window.innerHeight - 360);

  return (
    <div
      ref={menuRef}
      role="menu"
      className="fixed z-[9999]"
      style={{ left: normalizedX, top: normalizedY }}
    >
      {renderItems(state.items)}
    </div>
  );
};

export default DesktopContextMenu;
