'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import BiosPost from '@/components/system/bios/BiosPost';
import BiosSetup from '@/components/system/bios/BiosSetup';
import BootMenu from '@/components/system/bios/BootMenu';
import LinuxTerminal from '@/components/system/os/LinuxTerminal';
import Win11Desktop from '@/components/system/os/Win11Desktop';

type BootState = 'splash' | 'post' | 'bios' | 'bootmenu' | 'linux' | 'windows';

const BootOrchestrator: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [bootState, setBootState] = useState<BootState>('splash');
  const [bootInterrupted, setBootInterrupted] = useState(false);
  const [lastSelection, setLastSelection] = useState<'linux' | 'windows'>('linux');

  // Global key handling to allow F2 (Setup) and F12 (Boot Menu) during splash/post
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (bootState === 'splash' || bootState === 'post') {
        if (e.key.toLowerCase() === 'f2') {
          e.preventDefault();
          setBootInterrupted(true);
          setBootState('bios');
        } else if (e.key.toLowerCase() === 'f12') {
          e.preventDefault();
          setBootInterrupted(true);
          setBootState('bootmenu');
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [bootState]);

  // Load persisted OS choice; if power is not off, resume OS directly
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('os.current');
      const power = window.localStorage.getItem('os.power');
      if (saved === 'windows' || saved === 'linux') {
        setLastSelection(saved);
        if (power !== 'off') {
          setBootState(saved as BootState);
          return;
        }
      }
    } catch {}
  }, []);

  // Splash → POST automatically
  useEffect(() => {
    if (bootState !== 'splash') return;
    const t = setTimeout(() => setBootState('post'), 3000);
    return () => clearTimeout(t);
  }, [bootState]);

  // POST → Boot menu unless Setup intercepted; honor BIOS boot timeout if set
  useEffect(() => {
    if (bootState !== 'post') return;
    let timeoutSec = 3.5;
    try {
      const raw = window.localStorage.getItem('bios.settings');
      if (raw) {
        const s = JSON.parse(raw);
        if (typeof s.bootTimeout === 'number') timeoutSec = Math.max(0, Math.min(30, s.bootTimeout));
      }
    } catch {}
    const t = setTimeout(() => {
      if (!bootInterrupted) setBootState('bootmenu');
    }, Math.round(timeoutSec * 1000));
    return () => clearTimeout(t);
  }, [bootState, bootInterrupted]);

  const handleBootChoice = (choice: 'linux' | 'windows') => {
    setLastSelection(choice);
    try {
      window.localStorage.setItem('os.current', choice);
      window.localStorage.setItem('os.power', 'on');
      // Mark that the system has powered on at least once
      if (!window.localStorage.getItem('os.bootedOnce')) {
        window.localStorage.setItem('os.bootedOnce', '1');
      }
    } catch {}
    setBootState(choice === 'linux' ? 'linux' : 'windows');
  };

  const handleReboot = (reason: 'restart' | 'shutdown' = 'restart') => {
    setBootInterrupted(false);
    if (reason === 'shutdown') {
      try {
        window.localStorage.setItem('os.power', 'off');
        window.localStorage.removeItem('os.current');
      } catch {}
      setBootState('splash');
      return;
    }
    // restart: keep OS selection and quickly bounce splash then resume
    try { window.localStorage.setItem('os.power', 'on'); } catch {}
    const saved = (typeof window !== 'undefined' ? window.localStorage.getItem('os.current') : null) as 'linux' | 'windows' | null;
    if (saved === 'linux' || saved === 'windows') {
      setBootState('splash');
      setTimeout(() => setBootState(saved), 800);
    } else {
      setBootState('splash');
    }
  };

  // Keep URL in sync with active OS route for clean navigation
  useEffect(() => {
    if (bootState === 'windows' && pathname !== '/windows') {
      router.replace('/windows');
    } else if (bootState === 'linux' && pathname !== '/terminal') {
      router.replace('/terminal');
    }
  }, [bootState, pathname, router]);

  return (
    <div className="fixed inset-0 bg-black text-gray-200">
      {bootState === 'splash' && (
        <div className="w-full h-full flex flex-col items-center justify-center select-none">
          <div className="text-center">
            <div className="text-[32px] font-semibold tracking-widest">Phoenix-like BIOS</div>
            <div className="text-sm text-gray-400 mt-2">v6.00PG Compatible • Copyright (C) 2025</div>
            <div className="text-xs text-gray-500 mt-6">Press F2 to enter Setup  •  Press F12 for Boot Menu</div>
          </div>
        </div>
      )}

      {bootState === 'post' && (
        <BiosPost onComplete={() => setBootState('bootmenu')} />
      )}

      {bootState === 'bios' && (
        <BiosSetup onExit={(action: 'save-exit' | 'discard-exit') => {
          if (action === 'save-exit') {
            setBootInterrupted(false);
            setBootState('bootmenu');
          } else {
            setBootState('post');
          }
        }} />
      )}

      {bootState === 'bootmenu' && (
        <BootMenu
          defaultSelection={lastSelection}
          timeoutMs={(function(){
            try {
              const raw = window.localStorage.getItem('bios.settings');
              if (raw) {
                const s = JSON.parse(raw);
                if (typeof s.bootTimeout === 'number') return Math.max(0, Math.min(30, s.bootTimeout)) * 1000;
              }
            } catch {}
            return 5000;
          })()}
          onTimeout={() => handleBootChoice('linux')}
          onSelect={(sel: 'linux' | 'windows' | 'bios') => {
            if (sel === 'bios') setBootState('bios');
            else if (sel === 'linux' || sel === 'windows') handleBootChoice(sel);
          }}
        />
      )}

      {bootState === 'linux' && (
        <LinuxTerminal onReboot={handleReboot} distroName="Ubuntu 22.04 LTS" bootVariant={
          // If first power on (no os.power set), do full boot; otherwise fast
          (typeof window !== 'undefined' && window.localStorage.getItem('os.power') == null) ? 'full' : 'fast'
        } />
      )}

      {bootState === 'windows' && (
        <Win11Desktop onReboot={handleReboot} />
      )}
    </div>
  );
};

export default BootOrchestrator;


