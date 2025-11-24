import React, { useState } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { FaExternalLinkAlt, FaExpand, FaImage, FaInfoCircle } from 'react-icons/fa';

interface AssetCardProps {
  item: {
    id: string;
    href: string;
    thumb: string | null;
    title: string | null;
    alt: string | null;
  };
  onClick: () => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({ item, onClick }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const background = useMotionTemplate`radial-gradient(
    400px circle at ${mouseX}px ${mouseY}px,
    rgba(34, 211, 238, 0.15),
    transparent 80%
  )`;

  const [imgSrc, setImgSrc] = useState<string>(`/api/pixiv-img?src=${encodeURIComponent(item.thumb || '')}`);
  const [retryCount, setRetryCount] = useState(0);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (retryCount > 2) return; // Prevent infinite loops

    const target = e.currentTarget;
    try {
      const u = new URL(target.src, window.location.href);
      const srcParam = u.searchParams.get('src');
      if (srcParam) {
        const real = new URL(srcParam.replace(/&amp;/g, '&'));
        if (real.hostname === 'i.pximg.net') {
          real.hostname = 'i-cf.pximg.net';
          setImgSrc(`/api/pixiv-img?src=${encodeURIComponent(real.toString())}`);
          setRetryCount(prev => prev + 1);
        } else if (real.hostname === 'i-cf.pximg.net') {
          real.hostname = 'i.pximg.net';
          setImgSrc(`/api/pixiv-img?src=${encodeURIComponent(real.toString())}`);
          setRetryCount(prev => prev + 1);
        }
      }
    } catch {}
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      onMouseMove={handleMouseMove}
      onClick={onClick}
      className="group relative break-inside-avoid rounded-xl bg-card border border-card-border overflow-hidden cursor-pointer transition-all duration-500 hover:border-cyan-500/40 hover:shadow-[0_0_30px_-10px_rgba(34,211,238,0.2)]"
    >
      {/* Hover Glow */}
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{ background }}
      />

      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted/50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={item.title || 'Asset'}
          onError={handleError}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-300" />
        <div className="absolute inset-0 bg-cyan-900/20 opacity-0 group-hover:opacity-100 mix-blend-overlay transition-opacity duration-500" />
        
        {/* Technical Overlay Grid (Decoration) */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300 pointer-events-none bg-[linear-gradient(to_right,transparent_1px,rgba(34,211,238,0.2)_1px),linear-gradient(to_bottom,transparent_1px,rgba(34,211,238,0.2)_1px)] bg-[size:24px_24px]" />

        {/* Top Right Action Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
            <div className="p-2 rounded-lg bg-card/80 backdrop-blur-md border border-card-border text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-colors" title="Expand">
                <FaExpand size={12} />
            </div>
            <div className="p-2 rounded-lg bg-card/80 backdrop-blur-md border border-card-border text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-colors" title="Details">
                <FaInfoCircle size={12} />
            </div>
        </div>

        {/* Status Indicator */}
        <div className="absolute top-3 left-3">
           <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-card/80 backdrop-blur-md border border-card-border">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[8px] font-mono text-muted-foreground tracking-wider">LIVE</span>
           </div>
        </div>
      </div>

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 p-4 transform transition-transform duration-300 translate-y-2 group-hover:translate-y-0">
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 rounded bg-cyan-500/10 border border-cyan-500/20">
                    <FaImage size={10} className="text-cyan-400" />
                </div>
                <span className="text-[10px] font-mono text-cyan-300 tracking-wider uppercase">IMG_ASSET</span>
            </div>
            <span className="text-[10px] font-mono text-muted-foreground group-hover:text-foreground transition-colors">#{item.id}</span>
        </div>
        
        <h3 className="text-sm font-medium text-foreground truncate group-hover:text-cyan-400 transition-colors duration-300 mb-3">
            {item.title || 'Untitled Asset'}
        </h3>
        
        {/* Hidden Actions that slide up */}
        <div className="grid grid-cols-2 gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 pb-1">
            <button 
                className="flex items-center justify-center gap-2 py-1.5 rounded bg-muted/20 hover:bg-muted/40 border border-card-border hover:border-foreground/20 text-[10px] text-muted-foreground hover:text-foreground transition-colors font-mono"
                onClick={(e) => { e.stopPropagation(); onClick(); }}
            >
                VIEW
            </button>
            <a 
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-1.5 rounded bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/40 text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors font-mono"
                onClick={(e) => e.stopPropagation()}
            >
                SOURCE <FaExternalLinkAlt size={8} />
            </a>
        </div>
      </div>
    </motion.div>
  );
};
