'use client';

import React, { useState, useEffect } from 'react';
import { FaMagic, FaTerminal } from 'react-icons/fa';
import { motion } from 'framer-motion';

interface AIPromptInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const AIPromptInput: React.FC<AIPromptInputProps> = ({ value, onChange, placeholder = "Enter prompt to generate social connections..." }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [dots, setDots] = useState('.');
  const [seed, setSeed] = useState(0);

  useEffect(() => {
    setSeed(Math.floor(Math.random() * 999999));
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '.' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto mb-12 relative z-10">
      {/* Label / Status */}
      <div className="flex justify-between items-end mb-2 px-1">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-cyan-500/80 font-mono">
           <FaTerminal size={10} />
           <span>Input_Stream_Active</span>
        </div>
        <div className="text-[10px] font-mono text-gray-500">
           Processing_Nodes{dots}
        </div>
      </div>

      {/* Input Container */}
      <motion.div 
        initial={false}
        animate={{
          borderColor: isFocused ? 'rgba(34, 211, 238, 0.5)' : 'rgba(255, 255, 255, 0.1)',
          boxShadow: isFocused ? '0 0 20px rgba(34, 211, 238, 0.1)' : 'none'
        }}
        className="relative group bg-black/40 backdrop-blur-xl border border-white/10 rounded-lg overflow-hidden"
      >
        {/* Scanning line effect */}
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-20" />
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-20" />

        <div className="flex items-center px-4 py-4">
          <span className="text-cyan-500 mr-3 text-lg animate-pulse">{'>'}</span>
          
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="w-full bg-transparent border-none outline-none text-white font-mono text-sm placeholder-gray-600"
            autoComplete="off"
            spellCheck="false"
          />

          <div className="ml-2 flex items-center gap-2">
             {value && (
               <motion.button
                 initial={{ scale: 0, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 exit={{ scale: 0, opacity: 0 }}
                 onClick={() => onChange('')}
                 className="p-1 hover:text-red-400 text-gray-500 transition-colors text-xs font-mono uppercase"
               >
                 [CLR]
               </motion.button>
             )}
             <div className="h-4 w-[1px] bg-gray-700 mx-1" />
             <FaMagic className={`text-sm ${value ? 'text-cyan-400' : 'text-gray-600'}`} />
          </div>
        </div>

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-2 h-2 border-l border-t border-cyan-500/50" />
        <div className="absolute top-0 right-0 w-2 h-2 border-r border-t border-cyan-500/50" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-l border-b border-purple-500/50" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-purple-500/50" />
      </motion.div>
      
      {/* Helper Text */}
      <div className="mt-2 flex gap-4 justify-start px-1 text-[10px] font-mono text-gray-600">
        <span>MODE: DIFFUSION</span>
        <span>SEED: {seed}</span>
        <span>CFG_SCALE: 7.0</span>
      </div>
    </div>
  );
};

export default AIPromptInput;

