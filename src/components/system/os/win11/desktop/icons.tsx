'use client';

import React from 'react';

export const WifiIcon: React.FC<{ on?: boolean; className?: string }> = ({ on = true, className }) => (
  <svg viewBox="0 0 48 48" className={className}>
    <path
      fill="currentColor"
      d="M24 36a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm0-8c4.97 0 9.48 2.03 12.73 5.27l-2.83 2.83A15.96 15.96 0 0 0 24 32c-4.28 0-8.17 1.66-11.1 4.37l-2.82-2.83A19.97 19.97 0 0 1 24 28Zm0-8c7.5 0 14.29 3.05 19.2 7.96l-2.83 2.83A23.93 23.93 0 0 0 24 24c-6.61 0-12.59 2.69-16.97 7.04l-2.83-2.83C9.61 19.91 16.41 16 24 16Z"
      opacity={on ? 1 : 0.35}
    />
  </svg>
);

export const VolumeIcon: React.FC<{ muted?: boolean; className?: string }> = ({ muted = false, className }) => (
  <svg viewBox="0 0 48 48" className={className}>
    <path fill="currentColor" d="M6 20h8l10-8v24l-10-8H6z" />
    <path fill="currentColor" d="M32 18c2.2 2.2 2.2 9.8 0 12" opacity={muted ? 0.2 : 1} />
    <path fill="currentColor" d="M36 14c4.4 4.4 4.4 16.6 0 21" opacity={muted ? 0.2 : 1} />
    {muted && <path d="M30 14 42 34" stroke="currentColor" strokeWidth="3" />}
  </svg>
);

export const BatteryIcon: React.FC<{ level?: number; charging?: boolean; className?: string }> = ({
  level = 0.98,
  charging = false,
  className,
}) => (
  <svg viewBox="0 0 64 32" className={className}>
    <rect x="2" y="6" width="54" height="20" rx="4" fill="none" stroke="currentColor" strokeWidth="2" />
    <rect x="58" y="12" width="4" height="8" rx="1" fill="currentColor" />
    <rect x="4" y="8" width={50 * Math.max(0, Math.min(1, level))} height="16" rx="3" fill="currentColor" opacity={0.6} />
    {charging && <path d="M30 9 24 18h6l-4 8 12-12h-8z" fill="currentColor" />}
  </svg>
);
