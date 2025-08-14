'use client';

import React, { useEffect, useState } from 'react';

interface BootMenuProps {
  defaultSelection?: 'linux' | 'windows';
  timeoutMs?: number;
  onTimeout: () => void;
  onSelect: (sel: 'linux' | 'windows' | 'bios') => void;
}

const BootMenu: React.FC<BootMenuProps> = ({ defaultSelection = 'linux', timeoutMs = 5000, onTimeout, onSelect }) => {
  const [cursor, setCursor] = useState<number>(defaultSelection === 'linux' ? 0 : 1);
  const [remaining, setRemaining] = useState<number>(Math.floor(timeoutMs / 1000));
  const items: { id: 'linux' | 'windows' | 'bios'; label: string }[] = [
    { id: 'linux', label: 'Ubuntu 22.04 LTS' },
    { id: 'windows', label: 'Windows 11' },
    { id: 'bios', label: 'Enter Setup (F2)' },
  ];

  useEffect(() => {
    const timer = setInterval(() => setRemaining((s) => Math.max(0, s - 1)), 1000);
    const to = setTimeout(() => onTimeout(), timeoutMs);
    return () => { clearInterval(timer); clearTimeout(to); };
  }, [timeoutMs, onTimeout]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => (c + 1) % items.length); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setCursor((c) => (c + items.length - 1) % items.length); }
      if (e.key === 'Enter') { e.preventDefault(); onSelect(items[cursor].id); }
      if (e.key.toLowerCase() === 'f2') { e.preventDefault(); onSelect('bios'); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [cursor, items, onSelect]);

  return (
    <div className="w-full h-full bg-[#0a0a0a] text-gray-200 font-mono select-none">
      <div className="h-24 border-b border-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl tracking-wide">Boot Menu</div>
          <div className="text-xs text-gray-400">Use ↑/↓ to choose, Enter to boot. Default boots in {remaining}s.</div>
        </div>
      </div>
      <div className="max-w-xl mx-auto mt-8">
        {items.map((it, idx) => (
          <div key={it.id} className={
            'px-4 py-3 rounded border mb-3 ' + (idx === cursor ? 'border-cyan-500 bg-cyan-500/10' : 'border-gray-800')
          }>
            <div className="text-[15px]">{it.label}</div>
            <div className="text-xs text-gray-500">{it.id === 'linux' ? '/dev/nvme0n1p7' : (it.id === 'windows' ? 'Windows Boot Manager' : 'UEFI Firmware Settings')}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BootMenu;


