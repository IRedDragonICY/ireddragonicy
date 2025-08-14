'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import BootOrchestrator from '@/components/system/BootOrchestrator';

export default function BootGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [bootChecked, setBootChecked] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const os = window.localStorage.getItem('os.current');
    const power = window.localStorage.getItem('os.power');
    // Show BIOS/boot orchestrator whenever OS is not running
    const osRunning = !!os && power !== 'off';
    if (osRunning) {
      try { window.localStorage.setItem('hasBooted', '1'); } catch {}
    }
    setShowLoader(!osRunning);
    setBootChecked(true);
  }, []);

  // Re-evaluate loader when route changes or after external boot completion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const os = window.localStorage.getItem('os.current');
    const power = window.localStorage.getItem('os.power');
    const osRunning = !!os && power !== 'off';
    setShowLoader(!osRunning);
  }, [pathname]);

  const handleBootComplete = () => {
    try {
      window.localStorage.setItem('hasBooted', '1');
      // Reset terminal auto-redirect for a new session so first terminal visit will redirect if idle
      window.localStorage.removeItem('terminalAutoRedirectHandled');
    } catch {}
    setShowLoader(false);
  };

  if (!bootChecked) return null;
  // Only manage BIOS/boot flow on /terminal. Never overlay non-terminal pages.
  if (pathname?.startsWith('/terminal')) {
    if (showLoader) return <BootOrchestrator />;
    return <>{children}</>;
  }
  return <>{children}</>;
}



