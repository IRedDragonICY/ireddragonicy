'use client';

import type { IconName } from './types';

const IconGlyph: React.FC<{ name: IconName; className?: string; ariaHidden?: boolean }> = ({ name, className, ariaHidden = true }) => {
  if (name === 'start') {
    return (
      <svg viewBox="0 0 48 48" className={className} aria-hidden={ariaHidden}>
        <g fill="currentColor">
          <rect x="4" y="4" width="18" height="18" rx="2" />
          <rect x="26" y="4" width="18" height="18" rx="2" />
          <rect x="4" y="26" width="18" height="18" rx="2" />
          <rect x="26" y="26" width="18" height="18" rx="2" />
        </g>
      </svg>
    );
  }
  if (name === 'explorer') {
    return (
      <svg viewBox="0 0 48 48" className={className} aria-hidden={ariaHidden}>
        <path fill="currentColor" d="M6 14h12l3-4h10a5 5 0 0 1 5 5v21a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V19a5 5 0 0 1 5-5Zm0 6h36v3H6v-3Z"/>
      </svg>
    );
  }
  if (name === 'edge') {
    return (
      <svg viewBox="0 0 48 48" className={className} aria-hidden={ariaHidden}>
        <path fill="currentColor" d="M24 6c9.94 0 18 8.06 18 18 0 1.6-.2 3.16-.57 4.65C39.1 24.7 33.87 21 27.83 21c-6.74 0-12.2 5.46-12.2 12.2 0 2.63.85 5.06 2.3 7.04A18.01 18.01 0 0 1 6 24C6 14.06 14.06 6 24 6Z"/>
      </svg>
    );
  }
  if (name === 'notepad') {
    return (
      <svg viewBox="0 0 48 48" className={className} aria-hidden={ariaHidden}>
        <path fill="currentColor" d="M10 6h24a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V10a4 4 0 0 1 4-4Zm4 10h16v3H14v-3Zm0 8h16v3H14v-3Z"/>
      </svg>
    );
  }
  if (name === 'paint') {
    return (
      <svg viewBox="0 0 48 48" className={className} aria-hidden={ariaHidden}>
        <path fill="currentColor" d="M30 6c6.63 0 12 5.37 12 12 0 6.08-3.42 8-7 8h-5c-2.76 0-5 2.24-5 5 0 2.2-1.8 4-4 4-3.31 0-6-2.69-6-6 0-12.15 6.37-23 15-23Zm-9 29a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/>
      </svg>
    );
  }
  if (name === 'calc') {
    return (
      <svg viewBox="0 0 48 48" className={className} aria-hidden={ariaHidden}>
        <path fill="currentColor" d="M10 6h28a4 4 0 0 1 4 4v28a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V10a4 4 0 0 1 4-4Zm5 7h18v6H15v-6Zm0 12h6v6h-6v-6Zm8 0h6v6h-6v-6Zm8 0h6v6h-6v-6Zm-16 8h6v6h-6v-6Zm8 0h6v6h-6v-6Zm8 0h6v6h-6v-6Z"/>
      </svg>
    );
  }
  if (name === 'settings') {
    return (
      <svg viewBox="0 0 48 48" className={className} aria-hidden={ariaHidden}>
        <path fill="currentColor" d="M26.6 6.5 28 10a15.9 15.9 0 0 1 4.05 2.35l3.54-1.44 3 5.2-3 2.59c.14.99.14 2.02 0 3l3 2.59-3 5.2L32.05 28A15.9 15.9 0 0 1 28 30.05L26.6 33.5h-6.2L19 30.05A15.9 15.9 0 0 1 14.95 28l-3.54 1.44-3-5.2 3-2.59a12.9 12.9 0 0 1 0-3l-3-2.59 3-5.2 3.54 1.44A15.9 15.9 0 0 1 19 10l1.4-3.5h6.2ZM24 18a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z"/>
      </svg>
    );
  }
  if (name === 'portfolio') {
    return (
      <svg viewBox="0 0 48 48" className={className} aria-hidden={ariaHidden}>
        <rect x="6" y="10" width="30" height="22" rx="3" fill="currentColor" opacity="0.25"/>
        <rect x="10" y="14" width="22" height="14" rx="2" fill="currentColor"/>
        <path d="M38 24l6-4v8l-6-4Z" fill="currentColor"/>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden={ariaHidden}>
      <path fill="currentColor" d="M6 10h36a2 2 0 0 1 2 2v20a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2Zm10 28h16v4H16v-4Z"/>
    </svg>
  );
};

export default IconGlyph;
