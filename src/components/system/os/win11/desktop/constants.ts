'use client';

import { AppId, AppMeta, DesktopIconItem, IconName } from './types';

export const APP_META: Record<AppId, AppMeta> = {
  explorer: {
    label: 'File Explorer',
    icon: 'explorer',
    path: 'C:\\Windows\\explorer.exe',
  },
  edge: {
    label: 'Microsoft Edge',
    icon: 'edge',
    path: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  },
  notepad: {
    label: 'Notepad',
    icon: 'notepad',
    path: 'C:\\Windows\\System32\\notepad.exe',
  },
  paint: {
    label: 'Paint',
    icon: 'paint',
    path: 'C:\\Windows\\System32\\mspaint.exe',
  },
  calc: {
    label: 'Calculator',
    icon: 'calc',
    path: 'C:\\Windows\\System32\\calc.exe',
  },
  settings: {
    label: 'Settings',
    icon: 'settings',
    path: 'ms-settings:',
  },
  taskmgr: {
    label: 'Task Manager',
    icon: 'settings',
    path: 'C:\\Windows\\System32\\Taskmgr.exe',
  },
  portfolio: {
    label: 'Portfolio',
    icon: 'portfolio',
    path: 'https://ireddragonicy.com',
  },
};

export const DEFAULT_TASKBAR_PINNED: AppId[] = [
  'explorer',
  'edge',
  'notepad',
  'paint',
  'calc',
  'settings',
  'taskmgr',
];

export const DEFAULT_START_PINNED: AppId[] = [
  ...DEFAULT_TASKBAR_PINNED,
  'portfolio',
];

export const DEFAULT_DESKTOP_ICONS: DesktopIconItem[] = [
  { id: 'explorer', app: 'explorer', x: 20, y: 20, label: 'This PC' },
  { id: 'notepad', app: 'notepad', x: 20, y: 120, label: 'Notepad' },
  { id: 'paint', app: 'paint', x: 20, y: 220, label: 'Paint' },
  { id: 'calc', app: 'calc', x: 20, y: 320, label: 'Calculator' },
  { id: 'settings', app: 'settings', x: 20, y: 420, label: 'Settings' },
  { id: 'portfolio', app: 'portfolio', x: 20, y: 520, label: 'Portfolio' },
];

export type TaskbarPinned = typeof DEFAULT_TASKBAR_PINNED[number];
export const DESKTOP_GRID_SIZE = 20;

export const DESKTOP_STORAGE_KEY = 'win11_desktop_icons';
