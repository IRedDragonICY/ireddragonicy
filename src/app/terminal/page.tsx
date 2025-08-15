"use client";

import React from 'react';
import BootOrchestrator from '@/components/system/BootOrchestrator';

export default function TerminalPage() {
  // Use the unified boot orchestrator so shutdown transitions back to BIOS POST/logo
  return (
    <div className="fixed inset-0 overflow-hidden">
      <BootOrchestrator />
    </div>
  );
}


