'use client';

import React, { useEffect } from 'react';
import BootOrchestrator from '@/components/system/BootOrchestrator';

export default function WindowsStandalonePage() {
  useEffect(() => {
    try {
      window.localStorage.setItem('os.current', 'windows');
      window.localStorage.setItem('os.power', 'on');
    } catch {}
  }, []);
  return (
    <div className="fixed inset-0 overflow-hidden">
      <BootOrchestrator />
    </div>
  );
}


