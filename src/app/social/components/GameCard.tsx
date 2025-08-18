import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiCopy, FiCheck } from 'react-icons/fi';
import type { GameItem } from '../types';
import { clipboardUtils } from '../utils';

interface GameCardProps {
  game: GameItem;
  index: number;
}

export const GameCard: React.FC<GameCardProps> = ({ game, index }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = async (label: string, value: string) => {
    const success = await clipboardUtils.copyToClipboard(value);
    if (success) {
      setCopiedKey(`${label}:${value}`);
      setTimeout(() => setCopiedKey(null), 1400);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className="relative p-6 rounded-2xl bg-black/40 backdrop-blur-xl border border-cyan-400/20 shadow-lg shadow-cyan-500/10 overflow-hidden group"
      style={{ boxShadow: `0 10px 30px -12px ${game.accent}33` }}
    >
      <div
        className="absolute -inset-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(135deg, ${game.gradientFrom}22, ${game.gradientTo}22)` }}
      />

      <div className="relative flex items-start gap-4">
        <div
          className={`shrink-0 rounded-xl border ${game.videoSrc ? 'p-0 w-12 h-12 overflow-hidden' : 'p-3'}`}
          style={{ 
            background: `linear-gradient(145deg, ${game.gradientFrom}26, ${game.gradientTo}26)`, 
            borderColor: `${game.accent}33` 
          }}
        >
          {game.videoSrc ? (
            <video
              src={game.videoSrc}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="w-full h-full object-cover"
            />
          ) : game.icon ? (
            <game.icon className="text-2xl" color={game.accent} />
          ) : null}
        </div>

        <div className="min-w-0">
          <h3 className="text-lg md:text-xl font-semibold text-white">
            {game.name}
          </h3>
          
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            <span className="px-3 py-1 rounded-full bg-white/5 text-gray-200 border border-white/10">
              Server: {game.server}
            </span>
            
            {game.uid && (
              <span className="px-3 py-1 rounded-full bg-white/5 text-gray-200 border border-white/10 inline-flex items-center gap-2">
                <span>UID: {game.uid}</span>
                <button
                  type="button"
                  onClick={() => handleCopy('uid', game.uid!)}
                  className="p-1 rounded-md hover:bg-white/10 transition-colors"
                  aria-label="Copy UID"
                >
                  {copiedKey === `uid:${game.uid}` ? (
                    <FiCheck className="text-emerald-400" />
                  ) : (
                    <FiCopy />
                  )}
                </button>
              </span>
            )}
            
            {game.ign && (
              <span className="px-3 py-1 rounded-full bg-white/5 text-gray-200 border border-white/10 inline-flex items-center gap-2">
                <span>IGN: {game.ign}</span>
                <button
                  type="button"
                  onClick={() => handleCopy('ign', game.ign!)}
                  className="p-1 rounded-md hover:bg-white/10 transition-colors"
                  aria-label="Copy IGN"
                >
                  {copiedKey === `ign:${game.ign}` ? (
                    <FiCheck className="text-emerald-400" />
                  ) : (
                    <FiCopy />
                  )}
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};