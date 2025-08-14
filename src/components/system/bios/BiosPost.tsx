'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

interface BiosPostProps {
  onComplete: () => void;
}

interface PostLine {
  id: string;
  text: string;
  status?: 'ok' | 'warn' | 'fail' | 'info';
}

const BiosPost: React.FC<BiosPostProps> = ({ onComplete }) => {
  const [lines, setLines] = useState<PostLine[]>([]);
  const [footerHint, setFooterHint] = useState('Press F2 to enter Setup  •  Press F12 for Boot Menu');

  useEffect(() => {
    let cancelled = false;

    const add = (text: string, status?: PostLine['status'], delay = 300) =>
      new Promise<void>((resolve) => {
        setTimeout(() => {
          if (cancelled) return resolve();
          setLines((prev) => [...prev, { id: `${Date.now()}-${prev.length}`, text, status }]);
          resolve();
        }, delay);
      });

    (async () => {
      await add('PhoenixBIOS v6.00PG, An Energy Star Ally', 'info', 200);
      await add('Copyright (C) 1985-2025 Phoenix Technologies Ltd.', 'info', 100);
      await add('CPU: AMD Ryzen 9 7950X3D 16-Core Processor @ 4.2GHz', 'ok', 250);
      await add('Memory Testing: 65536K OK (64 GB Total)', 'ok', 650);
      await add('Initializing USB Controllers .. Done.', 'ok', 220);
      await add('Detecting IDE Primary Master .. NVMe WDC SN850X 2TB', 'ok', 380);
      await add('Detecting IDE Primary Slave .. None', 'warn', 140);
      await add('Detecting IDE Secondary Master .. BD-RE HL-DT-ST', 'ok', 220);
      await add('AHCI Controller .. Enabled', 'ok', 120);
      await add('S.M.A.R.T. Capable but Disabled', 'warn', 120);
      await add('USB Legacy Support .. Enabled', 'ok', 120);
      await add('Virtualization (SVM) .. Enabled', 'ok', 120);
      await add('TPM 2.0 Module .. Present', 'ok', 180);
      await add('PCI Devices Listing ...', 'info', 200);
      await add('  00:00.0 Host bridge: Advanced Micro Devices, Inc. [AMD]', 'info', 40);
      await add('  01:00.0 VGA compatible controller: NVIDIA RTX 4090', 'info', 40);
      await add('  02:00.0 Ethernet controller: Intel I225-V', 'info', 40);
      await add('  03:00.0 USB controller: ASMedia ASM3242', 'info', 40);
      await add('Boot From: NVMe WDC SN850X 2TB', 'ok', 300);
      setFooterHint('Press F12 for Boot Menu');
      setTimeout(() => !cancelled && onComplete(), 1500);
    })();

    return () => {
      cancelled = true;
    };
  }, [onComplete]);

  return (
    <div className="w-full h-full p-6 text-[13px] font-mono text-gray-200">
      <div className="max-w-5xl mx-auto">
        {lines.map((l) => (
          <div key={l.id} className="flex gap-2">
            <span className="text-gray-500 select-none">{'>'}</span>
            <span className={
              l.status === 'ok' ? 'text-emerald-400' :
              l.status === 'warn' ? 'text-amber-400' :
              l.status === 'fail' ? 'text-red-400' : 'text-gray-200'
            }>{l.text}</span>
          </div>
        ))}
      </div>
      <div className="absolute left-0 right-0 bottom-4 text-center text-[12px] text-gray-500">
        {footerHint}
      </div>
    </div>
  );
};

export default BiosPost;


