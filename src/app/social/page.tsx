'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import CursorEffect from '@/components/CursorEffect';
import { SectionHeader, SearchBar, SocialCard, GameCard } from './components';
import { personalInfo, socials, games } from './data';
import { searchUtils } from './utils';
import { GRID_LAYOUT, SEARCH_CONFIG } from './constants';

export default function SocialPage() {
  const [query, setQuery] = useState('');

  const filteredSocials = useMemo(() => 
    searchUtils.filterSocials(socials, query), 
    [query]
  );

  const filteredGames = useMemo(() => 
    searchUtils.filterGames(games, query), 
    [query]
  );

  return (
    <>
      {/* Ambient visuals and navigation */}
      <CursorEffect />
      <Navigation personalInfo={personalInfo} />

      <main className="relative min-h-screen pt-24 pb-20">
        {/* Layered ambient background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle at 30% 30%, rgba(34,211,238,0.35), transparent 60%)' }}
            animate={{ x: [-20, 20, -20], y: [0, 10, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-40 -right-24 w-[600px] h-[600px] rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle at 70% 70%, rgba(168,85,247,0.35), transparent 60%)' }}
            animate={{ x: [10, -10, 10], y: [0, -12, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{ 
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1px)', 
              backgroundSize: '3px 3px', 
              mixBlendMode: 'overlay' 
            }}
          />
        </div>

        {/* Social Links Section */}
        <section className="relative w-full max-w-6xl mx-auto px-4">
          <SectionHeader title="SOCIAL_LINKS" />
          
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder={SEARCH_CONFIG.PLACEHOLDER}
          />

          <div className={`grid ${GRID_LAYOUT.SOCIAL_GRID} ${GRID_LAYOUT.GAP}`}>
            {filteredSocials.map((item, idx) => (
              <SocialCard key={item.id} item={item} index={idx} />
            ))}
          </div>
        </section>

        {/* Game IDs Section */}
        <section className="relative w-full max-w-6xl mx-auto px-4 mt-14">
          <SectionHeader title="GAME_IDS" />

          <div className={`grid ${GRID_LAYOUT.GAME_GRID} ${GRID_LAYOUT.GAP}`}>
            {filteredGames.map((game, idx) => (
              <GameCard key={game.id} game={game} index={idx} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}


