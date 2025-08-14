'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Terminal from '@/components/terminal/Terminal';

interface LinuxTerminalProps {
  distroName: string;
  onReboot: (reason?: 'restart' | 'shutdown') => void;
  bootVariant?: 'full' | 'fast';
}

const LinuxTerminal: React.FC<LinuxTerminalProps> = ({ distroName, onReboot, bootVariant = 'fast' }) => {
  const router = useRouter();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.altKey && e.key.toLowerCase() === 'delete') || e.key === 'F9') {
        e.preventDefault();
        onReboot('restart');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onReboot]);
  // Ensure auto-redirect first time in terminal for this session
  useEffect(() => {
    try { window.localStorage.removeItem('terminalAutoRedirectHandled'); } catch {}
  }, []);
  return (
    <div className="fixed inset-0 bg-black">
      <div className="absolute left-4 top-3 z-10 px-2 py-1 text-xs font-mono rounded bg-black/60 text-gray-300 border border-gray-700">
        Booted: {distroName} • Press Ctrl+Alt+Del to Reboot
      </div>
      <Terminal
        onLoadComplete={() => {
          try {
            window.localStorage.setItem('hasBooted', '1');
            document.cookie = 'visited=1; path=/; max-age=31536000; samesite=lax';
            document.cookie = 'hasBooted=1; path=/; max-age=31536000; samesite=lax';
          } catch {}
          router.replace('/');
        }}
        startMode="boot"
        variant={bootVariant}
        autoRedirectOnIdle={true}
        onPowerOff={() => onReboot('shutdown')}
      />
    </div>
  );
};

export default LinuxTerminal;


