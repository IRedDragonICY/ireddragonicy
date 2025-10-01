'use client';

import React, { useEffect, useRef } from 'react';
import IconGlyph from './IconGlyph';
import { APP_META } from './constants';
import type { DesktopIconItem } from './types';

export interface DesktopIconGridProps {
  icons: DesktopIconItem[];
  selectedIds: string[];
  renameId: string | null;
  iconSize: 'small' | 'medium' | 'large';
  onRenameSubmit: (id: string, nextLabel: string) => void;
  onRenameCancel: () => void;
  onDoubleClick: (icon: DesktopIconItem) => void;
  onSelect: (id: string, event: React.MouseEvent) => void;
  onStartDrag: (index: number, event: React.MouseEvent) => void;
  onContextMenu: (event: React.MouseEvent, icon: DesktopIconItem) => void;
}

const DesktopIconGrid: React.FC<DesktopIconGridProps> = ({
  icons,
  selectedIds,
  renameId,
  iconSize,
  onRenameSubmit,
  onRenameCancel,
  onDoubleClick,
  onSelect,
  onStartDrag,
  onContextMenu,
}) => {
  const renameInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!renameId) return;
    const icon = icons.find((item) => item.id === renameId);
    if (!icon) return;
    const timer = requestAnimationFrame(() => {
      if (renameInputRef.current) {
        renameInputRef.current.select();
      }
    });
    return () => cancelAnimationFrame(timer);
  }, [renameId, icons]);

  const isSelected = (id: string) => selectedIds.includes(id);

  const sizeConfig = {
    small: {
      wrapper: 'w-16',
      avatar: 'w-14 h-14',
      icon: 'w-8 h-8',
      labelClass: 'text-[10px]',
    },
    medium: {
      wrapper: 'w-20',
      avatar: 'w-16 h-16',
      icon: 'w-10 h-10',
      labelClass: 'text-[11px]',
    },
    large: {
      wrapper: 'w-24',
      avatar: 'w-20 h-20',
      icon: 'w-12 h-12',
      labelClass: 'text-xs',
    },
  } as const;

  const cfg = sizeConfig[iconSize];

  return (
    <div className="absolute inset-0 text-white select-none">
      {icons.map((icon, idx) => {
        const selected = isSelected(icon.id);
        const renameActive = renameId === icon.id;
        return (
          <div
            key={icon.id}
            data-icon-node="true"
            className={`absolute flex flex-col items-center ${cfg.wrapper} cursor-default`}
            style={{ left: icon.x, top: icon.y }}
            onDoubleClick={() => onDoubleClick(icon)}
            onMouseDown={(event) => {
              if (event.button === 2) return; // context menu
              onSelect(icon.id, event);
              onStartDrag(idx, event);
            }}
            onContextMenu={(event) => onContextMenu(event, icon)}
          >
            <div
              className={`${cfg.avatar} flex items-center justify-center rounded-2xl transition ${
                selected ? 'bg-white/20 backdrop-blur-lg shadow-[0_8px_20px_rgba(15,23,42,0.45)]' : ''
              }`}
            >
              <IconGlyph
                name={icon.app === 'explorer' ? 'pc' : APP_META[icon.app].icon}
                className={`${cfg.icon} drop-shadow ${selected ? 'text-white' : 'text-white/90'}`}
              />
            </div>
            <div className={`text-center ${cfg.labelClass} mt-1 drop-shadow max-w-[88px]`}>
              {renameActive ? (
                <input
                  ref={renameInputRef}
                  defaultValue={icon.label}
                  onBlur={(event) => {
                    const next = event.target.value.trim() || icon.label;
                    onRenameSubmit(icon.id, next);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      const next = (event.currentTarget.value || icon.label).trim() || icon.label;
                      onRenameSubmit(icon.id, next);
                    } else if (event.key === 'Escape') {
                      event.preventDefault();
                      onRenameCancel();
                    }
                  }}
                  className="w-full rounded bg-black/70 border border-white/30 text-[11px] px-1 py-0.5 outline-none"
                  autoFocus
                />
              ) : (
                <div className={`px-1 py-0.5 rounded ${selected ? 'bg-blue-500/70' : 'bg-black/50'}`}>
                  {icon.label}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DesktopIconGrid;
