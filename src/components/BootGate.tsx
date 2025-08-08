'use client';

import React, { useEffect, useState } from 'react';
import Terminal from '@/components/terminal/Terminal';

export default function BootGate({ children }: { children: React.ReactNode }) {
  const [bootChecked, setBootChecked] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const booted = window.localStorage.getItem('hasBooted') === '1';
    if (!booted) {
      setShowLoader(true);
    }
    setBootChecked(true);
  }, []);

  const handleBootComplete = () => {
    try {
      window.localStorage.setItem('hasBooted', '1');
    } catch {}
    setShowLoader(false);
  };

  if (!bootChecked) return null;
  if (showLoader) {
    return (
      <Terminal
        onLoadComplete={handleBootComplete}
        startMode="boot"
        variant="full"
        autoRedirectOnIdle={true}
      />
    );
  }

  return <>{children}</>; 
}



