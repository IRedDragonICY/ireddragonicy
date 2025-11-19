'use client';

import React from 'react';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { SiHuggingface } from 'react-icons/si';

const AgencyFooter = () => {
  return (
    <footer className="relative py-16 bg-[#050505] border-t border-white/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <div className="flex flex-col">
               <h3 className="text-2xl font-bold text-white uppercase tracking-tighter">IRedDragonICY</h3>
               <span className="text-[10px] font-mono text-gray-600 tracking-[0.2em] uppercase">Research Unit [01]</span>
            </div>
            <p className="text-gray-500 text-xs font-mono max-w-md leading-relaxed uppercase tracking-wide">
              Advancing the frontier of generative models and neural architectures. 
              Dedicated to open-source contribution and scientific discovery.
            </p>
          </div>

          <div className="flex flex-col md:items-end space-y-6">
            <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">Connect_Protocol</span>
            <div className="flex gap-4">
              <a href="https://github.com" className="w-10 h-10 flex items-center justify-center border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 text-gray-400 hover:text-white transition-all">
                <FaGithub size={16} />
              </a>
              <a href="https://linkedin.com" className="w-10 h-10 flex items-center justify-center border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 text-gray-400 hover:text-white transition-all">
                <FaLinkedin size={16} />
              </a>
              <a href="https://huggingface.co" className="w-10 h-10 flex items-center justify-center border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 text-gray-400 hover:text-white transition-all">
                <SiHuggingface size={16} />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-600 font-mono uppercase tracking-wider">
           <div className="flex items-center gap-4">
              <span>© {new Date().getFullYear()} System_Core</span>
              <span className="w-px h-3 bg-white/10" />
              <span>All Rights Reserved</span>
           </div>
           <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Systems Operational
           </span>
        </div>
      </div>
      
      {/* Decorative huge text */}
      <div className="absolute -bottom-8 -right-8 text-[150px] font-bold text-white/[0.01] pointer-events-none select-none leading-none tracking-tighter">
         RESEARCH
      </div>
    </footer>
  );
};

export default AgencyFooter;
