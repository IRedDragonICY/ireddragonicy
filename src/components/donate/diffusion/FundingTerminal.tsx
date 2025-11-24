'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPaypal, FaPatreon, FaChevronRight, FaBolt } from 'react-icons/fa';
import { SiKofi } from 'react-icons/si';

const protocols = [
  {
    id: 'paypal',
    name: 'PayPal',
    icon: FaPaypal,
    color: 'text-blue-400',
    bg: 'bg-blue-500',
    desc: 'Direct funding injection via secure gateway.',
    link: 'https://paypal.com/paypalme/IRedDragonICY'
  },
  {
    id: 'patreon',
    name: 'Patreon',
    icon: FaPatreon,
    color: 'text-red-400',
    bg: 'bg-red-500',
    desc: 'Recurring monthly resource allocation.',
    link: 'https://patreon.com/c/ireddragonicy/membership'
  },
  {
    id: 'ko-fi',
    name: 'Ko-fi',
    icon: SiKofi,
    color: 'text-pink-400',
    bg: 'bg-pink-500',
    desc: 'Fuel the research with a coffee.',
    link: 'https://ko-fi.com/ireddragonicy'
  },
  {
    id: 'saweria',
    name: 'Saweria',
    icon: FaBolt,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500',
    desc: 'Local currency support protocol (IDR).',
    link: 'https://saweria.co/IRedDragonICY'
  }
];

export default function FundingTerminal() {
  const [, setHovered] = useState<string | null>(null);

  return (
    <div className="w-full max-w-4xl mx-auto mt-12">
      <div className="border border-white/10 bg-[#0a0a0a] rounded-xl overflow-hidden shadow-2xl shadow-cyan-900/10">
        {/* Terminal Header */}
        <div className="bg-[#151515] px-4 py-2 flex items-center gap-2 border-b border-white/5">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
          </div>
          <div className="ml-4 text-xs font-mono text-gray-500 flex-grow text-center">
            user@agency:~/funding-protocols
          </div>
        </div>

        {/* Terminal Body */}
        <div className="p-6 md:p-10">
          <div className="font-mono text-sm md:text-base mb-8 text-gray-300">
            <p className="mb-2">
              <span className="text-green-400">user@agency:~$</span> ./init_donation_sequence.sh
            </p>
            <p className="mb-4 text-cyan-300">
              [INFO] Loading payment gateways...<br/>
              [INFO] Please select a protocol to proceed:
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {protocols.map((p) => (
              <motion.a
                key={p.id}
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`relative group p-5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all cursor-pointer overflow-hidden`}
                onMouseEnter={() => setHovered(p.id)}
                onMouseLeave={() => setHovered(null)}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${p.bg}`} />
                
                <div className="relative z-10 flex flex-col items-center text-center gap-3">
                  <div className={`p-3 rounded-full bg-black/50 border border-white/10 ${p.color}`}>
                    <p.icon className="text-2xl" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{p.name}</h3>
                  <p className="text-xs text-gray-400 font-mono h-8">{p.desc}</p>
                  
                  <div className="mt-2 flex items-center gap-2 text-[10px] uppercase tracking-widest text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                    <span>Execute</span>
                    <FaChevronRight />
                  </div>
                </div>

                {/* Corner accents */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20" />
              </motion.a>
            ))}
          </div>

          <div className="mt-8 border-t border-white/5 pt-4 font-mono text-xs text-gray-500 flex justify-between items-center">
            <div className="animate-pulse">_awaiting_input</div>
            <div>SECURE_CONNECTION_ESTABLISHED</div>
          </div>
        </div>
      </div>
    </div>
  );
}

