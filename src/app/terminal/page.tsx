'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Terminal from '@/components/terminal/Terminal';

export default function TerminalPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  // Ensure auto-redirect is enabled for this dedicated terminal route
  useEffect(() => {
    try { window.localStorage.removeItem('terminalAutoRedirectHandled'); } catch {}
    setReady(true);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden">
      {ready && (
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
          variant="fast"
          autoRedirectOnIdle={true}
        />
      )}
    </div>
  );
}


