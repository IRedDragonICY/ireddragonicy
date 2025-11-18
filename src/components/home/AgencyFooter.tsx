'use client';

import React from 'react';
import { FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { SiHuggingface } from 'react-icons/si';

const AgencyFooter = () => {
  return (
    <footer className="relative py-12 bg-black border-t border-white/10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">IRedDragonICY</h3>
            <p className="text-gray-500 text-sm font-mono">
              Generative AI Research & Development
            </p>
          </div>

          <div className="flex gap-6 justify-start md:justify-end">
            <a href="https://github.com" className="text-gray-500 hover:text-white transition-colors">
              <FaGithub size={20} />
            </a>
            <a href="https://linkedin.com" className="text-gray-500 hover:text-white transition-colors">
              <FaLinkedin size={20} />
            </a>
            <a href="https://huggingface.co" className="text-gray-500 hover:text-white transition-colors">
              <SiHuggingface size={20} />
            </a>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-gray-600 font-mono uppercase tracking-wider">
           <span>
              © {new Date().getFullYear()} System_Core. All rights reserved.
           </span>
           <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500/50" />
              Systems Operational
           </span>
        </div>
      </div>
      
      {/* Decorative huge text */}
      <div className="absolute -bottom-4 -right-4 text-[120px] font-bold text-white/[0.02] pointer-events-none select-none leading-none">
         DIFFUSION
      </div>
    </footer>
  );
};

export default AgencyFooter;

