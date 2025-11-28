'use client';

import React, { useState, useMemo, memo, useRef, useEffect } from 'react';
import { motion, useMotionTemplate, useMotionValue, useInView, Variants } from 'framer-motion';
import { SocialItem, GameItem, SocialStats, GitHubUser } from '../../types';
import { FaExternalLinkAlt, FaCopy, FaCheck } from 'react-icons/fa';
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
  'github': { service: 'github', identifier: 'IRedDragonICY', endpoint: '/api/github-stats?username=IRedDragonICY' },
};

const GenerativeCard: React.FC<GenerativeCardProps> = memo(({ item, index, type }) => {
  const ref = useRef<HTMLDivElement>(null);
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

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('a') || (e.target as HTMLElement).closest('button')) {
      return;
    }
    if ('href' in item && item.href) {
      window.open(item.href, '_blank', 'noopener,noreferrer');
    }
  };

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
    } else if (item.id === 'github') {
        push('Repos', 'totalRepositories');
        push('Stars', 'totalStars');
        push('Commits', 'totalCommits');
        push('PRs', 'totalPRs');
        push('Contribs', 'totalContributed');
        push('Followers', 'totalFollowers');
        push('Following', 'totalFollowing');
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
    <motion.div
      ref={ref}
      custom={index}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={cardVariants}
      layoutId={`card-${item.id}`} 
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      className="group relative flex flex-col h-full bg-card border border-card-border overflow-hidden transition-colors duration-300 hover:border-foreground/30 cursor-pointer"
    >
      {/* Technical Corners */}
      <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-card-border transition-colors group-hover:border-foreground/50" />
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-card-border transition-colors group-hover:border-foreground/50" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-card-border transition-colors group-hover:border-foreground/50" />
      <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-card-border transition-colors group-hover:border-foreground/50" />

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
            <div className="relative flex items-center justify-center w-10 h-10 bg-muted/50 border border-card-border group-hover:bg-muted transition-colors">
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
                item.icon && <item.icon className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              )}
            </div>
            
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold text-foreground group-hover:text-foreground/80 transition-colors">
                {item.name}
              </h3>
              {isGame && (
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  {(item as GameItem).server}
                </span>
              )}
            </div>
          </div>

          {'href' in item && (
            <FaExternalLinkAlt className="text-[10px] text-muted-foreground group-hover:text-foreground transition-colors" />
          )}
        </div>

        {/* Content Body */}
        <div className="flex-grow space-y-4">
          {isSocial && (
            <div className="relative pl-3 border-l border-card-border">
               <p className="text-xs text-muted-foreground font-mono leading-relaxed">
                 {(item as SocialItem).description}
               </p>
            </div>
          )}

          {/* Stats Grid - Technical Layout */}
          {displayStats && displayStats.length > 0 && (
            <div className="grid grid-cols-2 gap-px bg-card-border border border-card-border">
              {displayStats.map((stat, i) => (
                <div key={i} className="bg-card p-2 flex flex-col">
                  <span className="text-[8px] text-muted-foreground uppercase tracking-wider font-mono mb-1">{stat.label}</span>
                  <span className="text-xs font-mono text-foreground">{stat.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* GitHub User Lists */}
          {item.id === 'github' && !stats.loading && (
            <div className="mt-4 space-y-4 border-t border-card-border pt-4">
              {stats.followersList && stats.followersList.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] text-green-400 uppercase tracking-wider font-mono">Recent Followers</span>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                    {stats.followersList.map((user: GitHubUser, i: number) => (
                      <a key={i} href={user.url} target="_blank" rel="noopener noreferrer" title={user.name} className="block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={user.avatar} alt={user.username} className="w-6 h-6 rounded-full border border-green-500/30 hover:border-green-500 transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {stats.followingList && stats.followingList.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] text-blue-400 uppercase tracking-wider font-mono">Following</span>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                    {stats.followingList.map((user: GitHubUser, i: number) => (
                      <a key={i} href={user.url} target="_blank" rel="noopener noreferrer" title={user.name} className="block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={user.avatar} alt={user.username} className="w-6 h-6 rounded-full border border-blue-500/30 hover:border-blue-500 transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {stats.notFollowingBack && stats.notFollowingBack.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] text-red-400 uppercase tracking-wider font-mono">Not Following Back ({stats.notFollowingBack.length})</span>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                    {stats.notFollowingBack.map((user: GitHubUser, i: number) => (
                      <a key={i} href={user.url} target="_blank" rel="noopener noreferrer" title={user.name} className="block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={user.avatar} alt={user.username} className="w-6 h-6 rounded-full border border-red-500/30 hover:border-red-500 transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {statsConfig && stats.loading && isInView && (
            <div className="grid grid-cols-2 gap-2">
               <div className="h-8 bg-muted/50 animate-pulse" />
               <div className="h-8 bg-muted/50 animate-pulse" />
            </div>
          )}
          
          {isGame && (
            <div className="mt-2 bg-muted/30 border border-card-border p-2 flex items-center justify-between group-hover:border-foreground/20 transition-colors">
                <div className="flex flex-col">
                   <span className="text-[9px] text-muted-foreground mb-0.5">ID</span>
                   <span className="text-xs font-mono text-foreground">
                     {(item as GameItem).uid || (item as GameItem).ign}
                   </span>
                </div>
                <button 
                  onClick={handleCopy}
                  className="p-1.5 hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  title="Copy ID"
                >
                  {copied ? <FaCheck size={10} className="text-green-500" /> : <FaCopy size={10} />}
                </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-3 border-t border-card-border" />
      </div>
    </motion.div>
  );
});

GenerativeCard.displayName = 'GenerativeCard';

export default GenerativeCard;
