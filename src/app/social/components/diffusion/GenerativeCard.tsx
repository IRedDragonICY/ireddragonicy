'use client';

import React, { useState, useMemo, memo } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { SocialItem, GameItem, SocialStats } from '../../types';
import { FaExternalLinkAlt, FaCopy, FaCheck } from 'react-icons/fa';
import { useSocialStats, ApiHookConfig } from '../../hooks';
import { formatUtils } from '../../utils';

interface GenerativeCardProps {
  item: SocialItem | GameItem;
  index: number;
  type: 'social' | 'game';
}

// Configuration helper
const getStatsConfig = (id: string): ApiHookConfig | null => {
  const map: Record<string, ApiHookConfig> = {
    'x': { service: 'x', identifier: 'ireddragonicy', endpoint: '/api/x-stats?u=ireddragonicy' },
    'threads': { service: 'threads', identifier: 'ireddragonicy', endpoint: '/api/threads-stats?u=ireddragonicy' },
    'pinterest': { service: 'pinterest', identifier: 'IRedDragonICY', endpoint: '/api/pinterest-stats?u=IRedDragonICY' },
    'instagram': { service: 'instagram', identifier: 'ireddragonicy', endpoint: '/api/instagram-stats?u=ireddragonicy' },
    'instagram-dev': { service: 'instagram', identifier: 'ireddragonicy.code', endpoint: '/api/instagram-stats?u=ireddragonicy.code' },
    'youtube': { service: 'youtube', identifier: '@Ndik', endpoint: '/api/youtube-stats?c=@Ndik' },
    'bluesky': { service: 'bluesky', identifier: 'ireddragonicy.bsky.social', endpoint: '/api/bluesky-stats?u=ireddragonicy.bsky.social' },
    'tiktok': { service: 'tiktok', identifier: 'ireddragonicy', endpoint: '/api/tiktok-stats?u=ireddragonicy' },
    'hoyolab': { service: 'hoyolab', identifier: '10849915', endpoint: '/api/hoyolab-stats?id=10849915' },
    'strava': { service: 'strava', identifier: '164295314', endpoint: '/api/strava-stats?id=164295314' },
  };
  return map[id] || null;
};

// Use React.memo to prevent unnecessary re-renders of cards when parent state changes (e.g. search query filtering other items)
const GenerativeCard: React.FC<GenerativeCardProps> = memo(({ item, index, type }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Mouse follower effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const background = useMotionTemplate`radial-gradient(
    600px circle at ${mouseX}px ${mouseY}px,
    rgba(34, 211, 238, 0.1),
    transparent 80%
  )`;

  // Fetch stats if config exists
  const statsConfig = useMemo(() => getStatsConfig(item.id), [item.id]);
  const stats = useSocialStats(statsConfig || { service: '', identifier: '', endpoint: '' });
  
  // Format stats for display
  const displayStats = useMemo(() => {
    if (!statsConfig || stats.loading) return null;

    const items = [];
    const push = (label: string, key: keyof SocialStats, suffix = '') => {
      const val = stats[key];
      if (val !== undefined && val !== null) {
        items.push({ label, value: formatUtils.formatNumber(val as number) + suffix });
      }
    };

    if (item.id === 'strava') {
        push('Followers', 'followers');
        push('Distance', 'distanceKm', ' km');
        push('Time', 'movingTime');
    } else if (item.id === 'youtube') {
        push('Subs', 'subscribers');
        push('Views', 'views');
    } else {
        push('Followers', 'followers');
        push('Following', 'following');
        push('Posts', 'posts');
        push('Likes', 'likes');
    }

    return items;
  }, [item.id, stats, statsConfig]);

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    const textToCopy = 'uid' in item ? (item.uid || item.ign || '') : item.href;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isGame = 'server' in item;
  const isSocial = 'description' in item;

  // Reduced complexity variants for smoother entering
  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      // Removed heavy blur filter from initial state for performance
      scale: 0.95
    },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: Math.min(i * 0.05, 0.5), // Cap delay to avoid long waits
        duration: 0.4,
        ease: "easeOut"
      }
    })
  };

  return (
    <motion.a
      href={'href' in item ? item.href : '#'}
      target="_blank"
      rel="noopener noreferrer"
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      // Optimize layout thrashing
      layoutId={`card-${item.id}`} 
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col h-full overflow-hidden rounded-lg bg-black/40 border border-white/5 transition-colors duration-500"
      // Removed backdrop-blur-sm from main container, added will-change via style
      style={{ willChange: 'transform, opacity' }}
    >
       {/* 
          Optimization: Backdrop blur is expensive. 
          Only apply it if really needed or use a static png fallback.
          Here we keep it but maybe reduce intensity or area.
          Actually, applying it to a small absolute div is better than the whole container if possible,
          but Tailwind puts it on the element.
          Let's try without blur on the container to see if it fixes 'lag', 
          or use a very lightweight one. 
          Re-adding backdrop-blur-sm but knowing it's a cost.
       */}
      <div className="absolute inset-0 backdrop-blur-[2px] pointer-events-none" />

      {/* Hover Gradient Effect */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-lg opacity-0 transition duration-300 group-hover:opacity-100"
        style={{ background }}
      />

      {/* Content Container */}
      <div className="relative z-10 flex flex-col h-full p-5">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Icon Container */}
            <div className="relative flex items-center justify-center w-10 h-10 rounded-md bg-white/5 border border-white/10 overflow-hidden group-hover:scale-110 transition-transform duration-500">
              {isGame && (item as GameItem).videoSrc ? (
                <video 
                  src={(item as GameItem).videoSrc} 
                  autoPlay 
                  muted 
                  loop 
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
              ) : (
                item.icon && <item.icon className="w-5 h-5 text-gray-300 group-hover:text-white transition-colors" style={{ color: isHovered ? item.accent : undefined }} />
              )}
              
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-500"
                style={{ backgroundColor: item.accent }} 
              />
            </div>
            
            <div>
              <h3 className="font-bold text-white text-sm tracking-wide group-hover:text-cyan-400 transition-colors">
                {item.name}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-mono">
                  {isGame ? (item as GameItem).server : type.toUpperCase()}
                </span>
                {isGame && (
                   <span className="text-[10px] px-1 rounded bg-white/5 text-gray-400 border border-white/5">
                     v1.0
                   </span>
                )}
              </div>
            </div>
          </div>

          {'href' in item && (
            <FaExternalLinkAlt className="text-[10px] text-gray-600 group-hover:text-white transition-colors" />
          )}
        </div>

        {/* Body */}
        <div className="flex-grow">
          {isSocial && (
            <p className="text-xs text-gray-400 leading-relaxed font-light border-l-2 border-white/5 pl-3 py-1 group-hover:border-cyan-500/50 transition-colors">
              {(item as SocialItem).description}
            </p>
          )}

          {displayStats && displayStats.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              {displayStats.map((stat, i) => (
                <div key={i} className="flex flex-col p-2 rounded bg-white/5 border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-[2px] h-full bg-cyan-500/20" />
                  <span className="text-[9px] text-gray-500 uppercase tracking-wider font-mono mb-0.5">{stat.label}</span>
                  <span className="text-xs font-mono text-cyan-100 font-semibold">{stat.value}</span>
                </div>
              ))}
            </div>
          )}
          
          {statsConfig && stats.loading && (
             <div className="mt-4 flex gap-2">
                <div className="h-8 flex-1 rounded bg-white/5 animate-pulse" />
                <div className="h-8 flex-1 rounded bg-white/5 animate-pulse" />
             </div>
          )}
          
          {isGame && (
            <div className="space-y-2 mt-2">
              <div className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5 group-hover:border-white/10 transition-colors">
                <div className="flex flex-col">
                   <span className="text-[9px] uppercase text-gray-500 font-mono mb-0.5">USER_ID</span>
                   <span className="text-xs font-mono text-cyan-300/90">
                     {(item as GameItem).uid || (item as GameItem).ign}
                   </span>
                </div>
                <button 
                  onClick={handleCopy}
                  className="p-1.5 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white"
                  title="Copy ID"
                >
                  {copied ? <FaCheck size={10} className="text-green-400" /> : <FaCopy size={10} />}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center opacity-50 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-1">
             <div className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-cyan-500 transition-colors" />
             <div className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-purple-500 transition-colors delay-75" />
             <div className="w-1 h-1 rounded-full bg-gray-600 group-hover:bg-pink-500 transition-colors delay-150" />
          </div>
          <span className="text-[9px] font-mono text-gray-600 group-hover:text-cyan-500/70">
             #{item.id.toUpperCase()}
          </span>
        </div>
      </div>
    </motion.a>
  );
});

export default GenerativeCard;
