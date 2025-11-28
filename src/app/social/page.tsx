'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import CursorEffect from '@/components/CursorEffect';
import { personalInfo, socials, games } from './data';
import { searchUtils } from './utils';
import DiffusionBackground from './components/diffusion/DiffusionBackground';
import AIPromptInput from './components/diffusion/AIPromptInput';
import GenerativeCard from './components/diffusion/GenerativeCard';

export default function SocialPage() {
  const [query, setQuery] = useState('');

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
             <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
               Connect
             </span>

             <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">
               Social Links
             </h1>

             <p className="max-w-xl text-muted-foreground text-sm md:text-base leading-relaxed">
               A curated collection of my digital identities and platforms where you can connect with me.
             </p>
          </motion.div>

          {/* Prompt / Search */}
          <AIPromptInput 
            value={query} 
            onChange={setQuery} 
          />

          {/* Divider */}
          <div className="border-b border-card-border mb-12 max-w-4xl mx-auto" />

          {/* Section: Socials */}
          <div className="mb-20">
            <div className="flex items-center gap-4 mb-8">
               <h2 className="text-lg font-semibold text-foreground">
                 Social Platforms
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
              <div className="text-center py-12 text-muted-foreground text-sm">
                No social platforms found matching your search.
              </div>
            )}
          </div>

          {/* Section: Games */}
          <div>
            <div className="flex items-center gap-4 mb-8">
               <h2 className="text-lg font-semibold text-foreground">
                 Gaming Profiles
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
               <div className="text-center py-12 text-muted-foreground text-sm">
                 No gaming profiles found matching your search.
               </div>
            )}
          </div>

        </div>
        
      </main>
    </>
  );
}
