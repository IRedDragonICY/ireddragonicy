'use client';

import type { ReactNode } from 'react';

export type AppId =
  | 'explorer'
  | 'notepad'
  | 'paint'
  | 'calc'
  | 'edge'
  | 'settings'
  | 'taskmgr'
  | 'portfolio';

export type IconName =
  | 'start'
  | 'explorer'
  | 'edge'
  | 'notepad'
  | 'paint'
  | 'calc'
  | 'settings'
  | 'pc'
  | 'portfolio';

export interface AppMeta {
  label: string;
  icon: IconName;
  path: string;
}

export interface DesktopIconItem {
  id: string;
  app: AppId;
  x: number;
  y: number;
  label: string;
}

export interface WindowSpec {
  id: string;
  app: AppId;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
  restore?: { x: number; y: number; w: number; h: number };
}

export type ResizeDir = 'n' | 'e' | 's' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export interface ContextMenuItem {
  id: string;
  label?: string;
  icon?: ReactNode;
  shortcut?: string;
  accessory?: ReactNode;
  danger?: boolean;
  disabled?: boolean;
  divider?: boolean;
  description?: string;
  onSelect?: () => void;
  children?: ContextMenuItem[];
}

export interface ContextMenuState {
  open: boolean;
  x: number;
  y: number;
  targetType: 'desktop' | 'icon';
  targetId?: string;
  items: ContextMenuItem[];
}
