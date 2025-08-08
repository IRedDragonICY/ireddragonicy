'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Terminal from '@/components/terminal/Terminal';

export default function TerminalPage() {
  const router = useRouter();

  return (
    <div className="fixed inset-0">
      <Terminal
        onLoadComplete={() => router.push('/')}
        startMode="interactive"
        variant="full"
        autoRedirectOnIdle={false}
      />
    </div>
  );
}


