'use client';

import React from 'react';

// Lightweight Next.js route-level loader to avoid double-running heavy boot logic.
// Shows a minimal branded splash during route transitions.

export default function RouteLoading() {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black">
      <div className="text-cyan-400 font-mono animate-pulse">Loading…</div>
    </div>
  );
}


