'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { IconType } from 'react-icons';
import { FaServer, FaMemory, FaMicrochip, FaHdd } from 'react-icons/fa';
import { BsGpuCard } from 'react-icons/bs';

const RandomGraph = ({ color = '#22d3ee' }: { color?: string }) => {
  const [path, setPath] = useState('');

  useEffect(() => {
    // Generate a random path for a "graph"
    const points = 20;
    let d = `M 0 50`;
    let y = 50;
    for (let i = 1; i <= points; i++) {
      y = 50 + (Math.random() - 0.5) * 40;
      d += ` L ${i * (100 / points)} ${y}`;
    }
    setPath(d);
    
    const interval = setInterval(() => {
       let newD = `M 0 50`;
       let currentY = 50;
       for (let i = 1; i <= points; i++) {
          currentY = 50 + (Math.random() - 0.5) * 40;
          newD += ` L ${i * (100 / points)} ${currentY}`;
       }
       setPath(newD);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible preserve-3d">
      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
        animate={{ d: path }}
        transition={{ duration: 2, ease: "linear" }}
      />
      <motion.path
        d={`${path} L 100 100 L 0 100 Z`}
        fill={color}
        fillOpacity="0.1"
        stroke="none"
        animate={{ d: `${path} L 100 100 L 0 100 Z` }}
        transition={{ duration: 2, ease: "linear" }}
      />
    </svg>
  );
};

interface StatModuleProps {
  label: string;
  value: string;
  icon: IconType;
  color?: string;
}

const StatModule = ({ label, value, icon: Icon, color = "cyan" }: StatModuleProps) => (
  <div className="p-4 border border-white/5 bg-black/40 backdrop-blur-md rounded-lg relative overflow-hidden group">
    <div className={`absolute inset-0 bg-${color}-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
    <div className="flex justify-between items-start mb-2 relative z-10">
      <span className="text-[10px] font-mono uppercase tracking-wider text-gray-500">{label}</span>
      <Icon className={`text-${color}-400 text-lg`} />
    </div>
    <div className="text-2xl font-bold font-mono text-white relative z-10 tracking-tighter">
      {value}
    </div>
    <div className="h-1 w-full bg-white/10 mt-3 rounded-full overflow-hidden relative z-10">
       <motion.div 
         initial={{ width: 0 }}
         animate={{ width: "100%" }}
         transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
         className={`h-full bg-${color}-500/50 w-2/3`} 
       />
    </div>
  </div>
);

export default function ComputeDashboard() {
  const [terminalLines, setTerminalLines] = useState<string[]>([]);

  useEffect(() => {
    const logs = [
      "[SYSTEM] Initializing compute cluster...",
      "[GPU:0] RTX 4090 detected. VRAM: 24GB",
      "[GPU:1] Allocating tensor cores...",
      "[NET] Establishing connection to donor nodes...",
      "[WARN] Resource limited. Require additional funding units.",
      "[INFO] Training loss converging...",
    ];
    let i = 0;
    const timer = setInterval(() => {
      if (i < logs.length) {
        setTerminalLines(prev => [...prev.slice(-4), logs[i]]);
        i++;
      } else {
        // Add random log
        const randomLogs = [
           `[METRIC] Batch size: ${Math.floor(Math.random() * 64) + 1} | Loss: ${(Math.random()).toFixed(4)}`,
           `[NET] Incoming packet from ${Math.floor(Math.random() * 255)}.x.x.x`,
           `[SYS] Thermal throttle check: PASS`,
           `[ALLOC] Garbage collection running...`
        ];
        setTerminalLines(prev => [...prev.slice(-4), randomLogs[Math.floor(Math.random() * randomLogs.length)]]);
      }
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto p-1">
       {/* Top Bar */}
       <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
             <span className="text-xs font-mono text-green-400">SYSTEM_ONLINE</span>
             <span className="text-xs font-mono text-gray-600">|</span>
             <span className="text-xs font-mono text-gray-500">CLUSTER_ID: DIFF-09X</span>
          </div>
          <div className="text-xs font-mono text-gray-500">
             UPTIME: 402d 12h 32m
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Graph Area */}
          <div className="lg:col-span-2 space-y-6">
             <div className="h-64 border border-white/10 bg-black/60 backdrop-blur-xl rounded-xl p-6 relative overflow-hidden">
                <div className="absolute top-4 left-4 z-10 flex gap-4">
                   <div>
                      <div className="text-[10px] text-gray-500 uppercase">Training Loss</div>
                      <div className="text-xl font-mono text-cyan-400 font-bold">0.0421</div>
                   </div>
                   <div>
                      <div className="text-[10px] text-gray-500 uppercase">Epoch</div>
                      <div className="text-xl font-mono text-purple-400 font-bold">1,337</div>
                   </div>
                </div>
                <RandomGraph color="#22d3ee" />
                
                {/* Grid lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
             </div>

             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatModule label="GPU Load" value="98%" icon={BsGpuCard} color="red" />
                <StatModule label="VRAM Use" value="23.8GB" icon={FaMicrochip} color="purple" />
                <StatModule label="Storage" value="84TB" icon={FaHdd} color="blue" />
                <StatModule label="Nodes" value="12/16" icon={FaServer} color="green" />
             </div>
          </div>

          {/* Sidebar Console */}
          <div className="space-y-6">
             <div className="h-full min-h-[300px] border border-white/10 bg-[#050505] rounded-xl p-4 font-mono text-xs flex flex-col">
                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2">
                   <span className="text-gray-400">/var/log/syslog</span>
                   <span className="text-gray-600">--tail -f</span>
                </div>
                <div className="flex-grow space-y-2 overflow-hidden">
                   {terminalLines.map((line, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-gray-300 break-words"
                      >
                         <span className="text-cyan-500 mr-2">{">"}</span>
                         {line}
                      </motion.div>
                   ))}
                </div>
                <div className="mt-4 pt-2 border-t border-white/5">
                   <div className="flex gap-2 text-gray-500">
                      <span>MEM:</span>
                      <div className="flex-grow bg-gray-800 h-3 rounded-sm overflow-hidden">
                         <div className="bg-cyan-500 h-full w-[85%]" />
                      </div>
                   </div>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}
