'use client';

import React, { useState, useMemo, memo, useRef, useEffect } from 'react';
import { motion, useMotionTemplate, useMotionValue, useInView, Variants } from 'framer-motion';
import { SocialItem, GameItem, SocialStats } from '../../types';
import { FaExternalLinkAlt, FaCopy, FaCheck, FaCodeBranch, FaCircle } from 'react-icons/fa';
import { useSocialStats, ApiHookConfig } from '../../hooks';
import { formatUtils } from '../../utils';

interface GenerativeCardProps {
  item: SocialItem | GameItem;
  index: number;
  type: 'social' | 'game';
}

const STATS_CONFIG_MAP: Record<string, ApiHookConfig> = {
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

const GenerativeCard: React.FC<GenerativeCardProps> = memo(({ item, index, type }) => {
  const ref = useRef<HTMLAnchorElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isInView = useInView(ref, { once: true, margin: "50px" });
  
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const background = useMotionTemplate`radial-gradient(
    400px circle at ${mouseX}px ${mouseY}px,
    rgba(255, 255, 255, 0.05),
    transparent 80%
  )`;

  const statsConfig = useMemo(() => {
    if (!isInView) return null;
    return STATS_CONFIG_MAP[item.id] || null;
  }, [item.id, isInView]);

  const stats = useSocialStats(statsConfig || { service: '', identifier: '', endpoint: '' });

  useEffect(() => {
    if (!videoRef.current) return;
    
    if (isHovered) {
      videoRef.current.play().catch(() => {}); 
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isHovered]);

  const displayStats = useMemo(() => {
    if (!statsConfig || stats.loading) return null;

    const items: { label: string, value: string }[] = [];
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
    let textToCopy = '';
    if ('uid' in item) {
        textToCopy = item.uid || item.ign || '';
    } else if ('href' in item) {
        textToCopy = item.href;
    }
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isGame = 'server' in item;
  const isSocial = 'description' in item;

  const cardVariants: Variants = {
    hidden: { 
      opacity: 0, 
      y: 20,
    },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: Math.min(i * 0.05, 0.5),
        duration: 0.4,
        ease: [0.4, 0.0, 0.2, 1]
      }
    })
  };

  return (
    <motion.a
      ref={ref}
      href={'href' in item ? item.href : '#'}
      target="_blank"
      rel="noopener noreferrer"
      custom={index}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={cardVariants}
      layoutId={`card-${item.id}`} 
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col h-full bg-[#080808] border border-white/10 overflow-hidden transition-colors duration-300 hover:border-white/30"
    >
      {/* Technical Corners */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20 transition-colors group-hover:border-white/50" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20 transition-colors group-hover:border-white/50" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20 transition-colors group-hover:border-white/50" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20 transition-colors group-hover:border-white/50" />

      {/* Hover Highlight */}
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{ background }}
      />

      <div className="relative z-10 flex flex-col h-full p-5">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Icon Box */}
            <div className="relative flex items-center justify-center w-10 h-10 bg-white/5 border border-white/10 group-hover:bg-white/10 transition-colors">
              {isGame && (item as GameItem).videoSrc ? (
                <video 
                  ref={videoRef}
                  src={(item as GameItem).videoSrc} 
                  muted 
                  loop 
                  playsInline
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0"
                />
              ) : (
                item.icon && <item.icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
              )}
            </div>
            
            <div className="flex flex-col">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider group-hover:text-cyan-400 transition-colors">
                {item.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">
                  {isGame ? (item as GameItem).server : type}
                </span>
                <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
              </div>
            </div>
          </div>

          {'href' in item && (
            <FaExternalLinkAlt className="text-[10px] text-gray-600 group-hover:text-white transition-colors" />
          )}
        </div>

        {/* Content Body */}
        <div className="flex-grow space-y-4">
          {isSocial && (
            <div className="relative pl-3 border-l border-white/10">
               <p className="text-xs text-gray-400 font-mono leading-relaxed">
                 {(item as SocialItem).description}
               </p>
            </div>
          )}

          {/* Stats Grid - Technical Layout */}
          {displayStats && displayStats.length > 0 && (
            <div className="grid grid-cols-2 gap-px bg-white/10 border border-white/10">
              {displayStats.map((stat, i) => (
                <div key={i} className="bg-[#0A0A0A] p-2 flex flex-col">
                  <span className="text-[8px] text-gray-600 uppercase tracking-wider font-mono mb-1">{stat.label}</span>
                  <span className="text-xs font-mono text-white">{stat.value}</span>
                </div>
              ))}
            </div>
          )}
          
          {statsConfig && stats.loading && isInView && (
            <div className="grid grid-cols-2 gap-2">
               <div className="h-8 bg-white/5 animate-pulse" />
               <div className="h-8 bg-white/5 animate-pulse" />
            </div>
          )}
          
          {isGame && (
            <div className="mt-2 bg-white/5 border border-white/10 p-2 flex items-center justify-between group-hover:border-white/20 transition-colors">
                <div className="flex flex-col">
                   <span className="text-[8px] uppercase text-gray-500 font-mono mb-0.5">USER_ID_HASH</span>
                   <span className="text-xs font-mono text-white">
                     {(item as GameItem).uid || (item as GameItem).ign}
                   </span>
                </div>
                <button 
                  onClick={handleCopy}
                  className="p-1.5 hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                  title="Copy ID"
                >
                  {copied ? <FaCheck size={10} className="text-green-500" /> : <FaCopy size={10} />}
                </button>
            </div>
          )}
        </div>

        {/* Footer Metadata */}
        <div className="mt-6 pt-3 border-t border-white/5 flex justify-between items-center">
          <div className="flex items-center gap-2 text-[9px] font-mono text-gray-600 uppercase">
             <FaCodeBranch size={8} />
             <span>Node_{index.toString().padStart(3, '0')}</span>
          </div>
          <FaCircle size={4} className="text-gray-800 group-hover:text-green-500 transition-colors" />
        </div>
      </div>
    </motion.a>
  );
});

export default GenerativeCard;
