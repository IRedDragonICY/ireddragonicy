'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
      
      <main className="relative min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-foreground/20 selection:text-foreground">
        
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
             <div className="inline-flex items-center gap-2 px-3 py-1 border border-card-border bg-card">
               <div className={`w-1.5 h-1.5 rounded-full ${booted ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
               <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                 System_Status: {booted ? 'ONLINE' : 'BOOTING'}
               </span>
             </div>

             <h1 className="text-5xl md:text-7xl font-bold tracking-tighter uppercase">
               <span className="text-foreground">
                 Social Nexus
               </span>
             </h1>

             <p className="max-w-xl text-muted-foreground text-sm md:text-base font-mono leading-relaxed border-l border-card-border pl-4">
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
             className="flex justify-center gap-8 mb-12 text-[10px] font-mono text-muted-foreground border-b border-card-border pb-4 max-w-4xl mx-auto"
          >
             <div className="flex items-center gap-2">
               <BsCpu className="text-foreground" />
               <span>NODES_ACTIVE: {socials.length + games.length}</span>
             </div>
             <div className="flex items-center gap-2">
               <BsActivity className="text-foreground" />
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
               <h2 className="text-xl font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
                 <span className="w-1 h-6 bg-foreground rounded-sm" />
                 Communication Protocols
               </h2>
               <div className="h-px flex-grow bg-card-border" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-card border border-card-border">
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
              <div className="text-center py-12 text-muted-foreground font-mono text-sm">
                [WARN] No social protocols matching query pattern.
              </div>
            )}
          </div>

          {/* Section: Games */}
          <div>
            <div className="flex items-center gap-4 mb-8">
               <h2 className="text-xl font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
                 <span className="w-1 h-6 bg-muted-foreground rounded-sm" />
                 Gaming Identifiers
               </h2>
               <div className="h-px flex-grow bg-card-border" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-card border border-card-border">
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
               <div className="text-center py-12 text-muted-foreground font-mono text-sm">
                 [WARN] No game identifiers matching query pattern.
               </div>
            )}
          </div>

        </div>
        
      </main>
    </>
  );
}
