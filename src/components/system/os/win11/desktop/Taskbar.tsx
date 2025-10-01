'use client';

import React from 'react';
import IconGlyph from './IconGlyph';
import { APP_META } from './constants';
import type { AppId, WindowSpec } from './types';

interface TaskbarTrayProps {
  clock: string;
  date: string;
  wifiOn: boolean;
  muted: boolean;
  batteryLevel: number;
  onQuickSettings: () => void;
  onClock: () => void;
}

interface TaskbarProps {
  pinnedApps: AppId[];
  windows: WindowSpec[];
  startOpen: boolean;
  themeMode: 'light' | 'dark';
  transparency: boolean;
  onToggleStart: () => void;
  onLaunchApp: (appId: AppId) => void;
  onHoverApp: (appId: AppId, target: HTMLElement) => void;
  onLeaveHover: () => void;
  tray: TaskbarTrayProps;
}

interface WifiIconProps {
  on: boolean;
  className?: string;
}

const WifiIcon: React.FC<WifiIconProps> = ({ on, className }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2.5 9.5c4.8-4.7 14.2-4.7 19 0" opacity={on ? 1 : 0.3} />
    <path d="M5.5 12.5c3.3-3.3 9.7-3.3 13 0" opacity={on ? 1 : 0.4} />
    <path d="M8.5 15.5c1.9-1.9 5.1-1.9 7 0" opacity={on ? 1 : 0.6} />
    <circle cx="12" cy="18" r="1.3" fill="currentColor" opacity={on ? 1 : 0.3} />
  </svg>
);

interface VolumeIconProps {
  muted: boolean;
  className?: string;
}

const VolumeIcon: React.FC<VolumeIconProps> = ({ muted, className }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 9v6h4l5 4V5l-5 4H5z" fill="currentColor" stroke="none" />
    {muted ? (
      <>
        <line x1="16" y1="9" x2="20" y2="13" />
        <line x1="20" y1="9" x2="16" y2="13" />
      </>
    ) : (
      <>
        <path d="M16 9.5a3.5 3.5 0 010 5" />
        <path d="M18.5 7a6 6 0 010 10" />
      </>
    )}
  </svg>
);

interface BatteryIconProps {
  level: number;
  className?: string;
}

const BatteryIcon: React.FC<BatteryIconProps> = ({ level, className }) => {
  const clampedLevel = Math.max(0, Math.min(1, level));
  const batteryFillWidth = 24 * clampedLevel;

  return (
    <svg
      viewBox="0 0 32 18"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="1" y="4" width="28" height="10" rx="2" />
      <rect x="30" y="7" width="2" height="4" rx="1" fill="currentColor" stroke="none" />
      <rect x="3" y="6" width={batteryFillWidth} height="6" rx="1" fill="currentColor" stroke="none" />
    </svg>
  );
};

const Taskbar: React.FC<TaskbarProps> = ({
  pinnedApps,
  windows,
  startOpen,
  themeMode,
  transparency,
  onToggleStart,
  onLaunchApp,
  onHoverApp,
  onLeaveHover,
  tray,
}) => {
  const runningApps = new Set(windows.filter((w) => !w.minimized).map((w) => w.app));

  return (
    <div
      data-taskbar="true"
      className="absolute left-0 right-0 bottom-0 h-12 flex items-center justify-center gap-3"
      style={{
        background: transparency ? 'rgba(248,250,252,0.55)' : 'var(--panelBG)',
        backdropFilter: 'blur(18px)',
        borderTop: themeMode === 'dark' ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(0,0,0,0.18)',
      }}
    >
      <button
        aria-label="Start"
        className={`w-10 h-10 rounded-xl hover:bg-white/70 flex items-center justify-center transition ${startOpen ? 'bg-white/70' : ''}`}
        onClick={onToggleStart}
      >
        <IconGlyph name="start" className="w-7 h-7 text-black/70" />
      </button>

      {pinnedApps.map((appId: AppId) => {
        const running = runningApps.has(appId);
        return (
          <button
            key={appId}
            className="relative w-10 h-10 rounded-xl hover:bg-white/65 flex items-center justify-center transition"
            onClick={() => onLaunchApp(appId)}
            onMouseEnter={(event) => onHoverApp(appId, event.currentTarget)}
            onMouseLeave={onLeaveHover}
            aria-label={APP_META[appId].label}
          >
            <IconGlyph name={APP_META[appId].icon} className="w-6 h-6 text-black/75" />
            {running && <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-black/70" />}
          </button>
        );
      })}

      <div className="absolute right-3 flex items-center gap-2 text-black/70">
        <button
          className="w-8 h-8 rounded-xl hover:bg-white/65 flex items-center justify-center"
          onClick={tray.onQuickSettings}
          aria-label="Quick Settings"
        >
          <WifiIcon on={tray.wifiOn} className="w-5 h-5" />
        </button>
        <button
          className="w-8 h-8 rounded-xl hover:bg-white/65 flex items-center justify-center"
          onClick={tray.onQuickSettings}
          aria-label="Volume"
        >
          <VolumeIcon muted={tray.muted} className="w-5 h-5" />
        </button>
        <button
          className="w-8 h-8 rounded-xl hover:bg-white/65 flex items-center justify-center"
          onClick={tray.onQuickSettings}
          aria-label="Battery"
        >
          <BatteryIcon level={tray.batteryLevel / 100} className="w-7 h-4" />
        </button>
        <button
          className="px-3 h-10 rounded-xl hover:bg-white/65 text-xs leading-4 text-right"
          onClick={tray.onClock}
          aria-label="Clock"
        >
          <div>{tray.clock}</div>
          <div>{tray.date}</div>
        </button>
      </div>
    </div>
  );
};

export default Taskbar;
