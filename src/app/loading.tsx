'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const logs = [
  "INITIALIZING_KERNEL...",
  "LOADING_MODULES [NEURAL_ENGINE_V2]...",
  "VERIFYING_INTEGRITY...",
  "ESTABLISHING_SECURE_LINK...",
  "MOUNTING_FILE_SYSTEM...",
  "ALLOCATING_MEMORY_PAGES...",
  "STARTING_DIFFUSION_PROCESS...",
  "SYSTEM_READY"
];

export default function Loading() {
  const [progress, setProgress] = useState(0);
  const [bootLogs, setBootLogs] = useState<string[]>([]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let logIndex = 0;

    const updateProgress = () => {
      setProgress(prev => {
        const next = prev + Math.random() * 10;
        return next > 100 ? 100 : next;
      });
    };

    const addLog = () => {
      if (logIndex < logs.length) {
        setBootLogs(prev => [...prev, logs[logIndex]]);
        logIndex++;
        // Randomize log speed
        timer = setTimeout(addLog, Math.random() * 300 + 100);
      }
    };

    const progressInterval = setInterval(updateProgress, 200);
    addLog();

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#050505] flex items-center justify-center font-mono text-xs overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />

      <div className="relative z-10 w-full max-w-md p-8">
        {/* Header */}
        <div className="flex justify-between items-end mb-2 text-gray-500 uppercase tracking-widest">
           <span>System_Boot</span>
           <span>{Math.round(progress)}%</span>
        </div>

        {/* Progress Bar */}
        <div className="h-1 w-full bg-white/10 mb-8 relative overflow-hidden">
           <motion.div 
             className="h-full bg-white"
             style={{ width: `${progress}%` }}
           />
        </div>

        {/* Terminal Logs */}
        <div className="h-32 flex flex-col justify-end gap-1">
           {bootLogs.map((log, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, x: -10 }}
               animate={{ opacity: 1, x: 0 }}
               className={`
                 ${i === bootLogs.length - 1 ? 'text-white' : 'text-gray-600'}
                 ${log === 'SYSTEM_READY' ? 'text-green-500 font-bold' : ''}
               `}
             >
               <span className="mr-2 opacity-50">[{new Date().toISOString().split('T')[1].slice(0,8)}]</span>
               {log}
             </motion.div>
           ))}
        </div>
      </div>
      
      {/* Decorative Corner Elements */}
      <div className="absolute top-8 left-8 w-4 h-4 border-t border-l border-white/20" />
      <div className="absolute top-8 right-8 w-4 h-4 border-t border-r border-white/20" />
      <div className="absolute bottom-8 left-8 w-4 h-4 border-b border-l border-white/20" />
      <div className="absolute bottom-8 right-8 w-4 h-4 border-b border-r border-white/20" />
    </div>
  );
}
