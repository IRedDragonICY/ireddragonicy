'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import CursorEffect from '@/components/CursorEffect';
import { personalInfo, socials, games } from './data';
import { searchUtils } from './utils';
import DiffusionBackground from './components/diffusion/DiffusionBackground';
import AIPromptInput from './components/diffusion/AIPromptInput';
import GenerativeCard from './components/diffusion/GenerativeCard';
import { BsCpu, BsActivity } from 'react-icons/bs';

export default function SocialPage() {
  const [query, setQuery] = useState('');
  const [booted, setBooted] = useState(false);

  // Simulate boot sequence
  useEffect(() => {
    const timer = setTimeout(() => setBooted(true), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredSocials = searchUtils.filterSocials(socials, query);
  const filteredGames = searchUtils.filterGames(games, query);

  return (
    <>
      <CursorEffect />
      <Navigation personalInfo={personalInfo} />
      
      <main className="relative min-h-screen bg-[#050505] text-white overflow-x-hidden selection:bg-white/20 selection:text-white">
        
        {/* 1. Dynamic Diffusion Background */}
        <div className="fixed inset-0 z-0 opacity-40 pointer-events-none">
           <DiffusionBackground />
        </div>

        {/* 2. Content Layer */}
        <div className="relative z-10 pt-32 pb-20 px-4 max-w-[1400px] mx-auto">
          
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center justify-center mb-16 space-y-6 text-center"
          >
             {/* Status Tag */}
             <div className="inline-flex items-center gap-2 px-3 py-1 border border-white/10 bg-[#0A0A0A]">
               <div className={`w-1.5 h-1.5 rounded-full ${booted ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
               <span className="text-[10px] font-mono uppercase tracking-widest text-gray-400">
                 System_Status: {booted ? 'ONLINE' : 'BOOTING'}
               </span>
             </div>

             <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase">
               <span className="text-white">
                 Social Nexus
               </span>
             </h1>

             <p className="max-w-xl text-gray-500 text-sm md:text-base font-mono leading-relaxed border-l border-white/10 pl-4">
               Exploring the latent space of connectivity. A curated collection of digital identities and communication protocols.
             </p>
          </motion.div>

          {/* Prompt / Search */}
          <AIPromptInput 
            value={query} 
            onChange={setQuery} 
          />

          {/* Stats Bar */}
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 1 }}
             className="flex justify-center gap-8 mb-12 text-[10px] font-mono text-gray-500 border-b border-white/5 pb-4 max-w-4xl mx-auto"
          >
             <div className="flex items-center gap-2">
               <BsCpu className="text-white" />
               <span>NODES_ACTIVE: {socials.length + games.length}</span>
             </div>
             <div className="flex items-center gap-2">
               <BsActivity className="text-white" />
               <span>LATENCY: 12ms</span>
             </div>
             <div className="hidden sm:flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full opacity-50" />
                <span>SYNC: 100%</span>
             </div>
          </motion.div>

          {/* Section: Socials */}
          <div className="mb-20">
            <div className="flex items-center gap-4 mb-8">
               <h2 className="text-xl font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                 <span className="w-1 h-6 bg-white rounded-sm" />
                 Communication Protocols
               </h2>
               <div className="h-px flex-grow bg-white/10" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-white/5 border border-white/5">
              {filteredSocials.map((item, idx) => (
                <GenerativeCard 
                  key={item.id} 
                  item={item} 
                  index={idx} 
                  type="social"
                />
              ))}
            </div>
            
            {filteredSocials.length === 0 && (
              <div className="text-center py-12 text-gray-600 font-mono text-sm">
                [WARN] No social protocols matching query pattern.
              </div>
            )}
          </div>

          {/* Section: Games */}
          <div>
            <div className="flex items-center gap-4 mb-8">
               <h2 className="text-xl font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                 <span className="w-1 h-6 bg-gray-500 rounded-sm" />
                 Gaming Identifiers
               </h2>
               <div className="h-px flex-grow bg-white/10" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-white/5 border border-white/5">
              {filteredGames.map((item, idx) => (
                <GenerativeCard 
                  key={item.id} 
                  item={item} 
                  index={idx + filteredSocials.length} 
                  type="game"
                />
              ))}
            </div>
            
            {filteredGames.length === 0 && (
               <div className="text-center py-12 text-gray-600 font-mono text-sm">
                 [WARN] No game identifiers matching query pattern.
               </div>
            )}
          </div>

        </div>
        
        {/* Footer Overlay - Removed Gradient */}
        <div className="fixed bottom-0 left-0 w-full h-20 bg-[#050505] mask-image:linear-gradient(to top, black, transparent) pointer-events-none z-20 opacity-80" />
        
      </main>
    </>
  );
}
