'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import CursorEffect from '@/components/CursorEffect';
import DiffusionBackground from '@/app/social/components/diffusion/DiffusionBackground';
import ComputeDashboard from '@/components/donate/diffusion/ComputeDashboard';
import FundingTerminal from '@/components/donate/diffusion/FundingTerminal';
import DonorNetwork from '@/components/donate/diffusion/DonorNetwork';

const personalInfo = {
  alias: 'IRedDragonICY',
  role: 'Research Scientist',
};

export default function DonatePage() {
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setBooted(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <CursorEffect />
      <Navigation personalInfo={personalInfo} />

      <main className="relative min-h-screen bg-[#030305] text-white overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-100">
        
        {/* Background Layer */}
        <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
           <DiffusionBackground />
        </div>
        
        {/* Content Layer */}
        <div className="relative z-10 pt-32 pb-20">
          
          {/* Hero Header */}
          <div className="max-w-6xl mx-auto px-4 text-center mb-12">
            <motion.div
               initial={{ opacity: 0, y: -20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8 }}
            >
               <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-950/10 backdrop-blur-md mb-6">
                  <div className={`w-1.5 h-1.5 rounded-full ${booted ? 'bg-cyan-400 animate-pulse' : 'bg-red-500'}`} />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-300">
                    Funding_Drive: ACTIVE
                  </span>
               </div>

               <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                 <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-gray-200 to-gray-600">
                   Accelerate the <br className="hidden md:block" /> Diffusion
                 </span>
               </h1>

               <p className="max-w-2xl mx-auto text-gray-400 text-sm md:text-base font-light leading-relaxed">
                 Researching generative AI requires significant compute resources. 
                 Your support directly fuels GPU hours, dataset acquisition, and open-source experiments.
               </p>
            </motion.div>
          </div>

          {/* Main Dashboard */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <ComputeDashboard />
          </motion.div>

          {/* Interaction Terminal */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <FundingTerminal />
          </motion.div>

          {/* Social Proof */}
          <DonorNetwork />

        </div>

        {/* Footer Gradient */}
        <div className="fixed bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[#030305] to-transparent pointer-events-none z-20" />
      </main>
    </>
  );
}
