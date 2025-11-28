import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaExternalLinkAlt } from 'react-icons/fa';

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
  const [imgSrc, setImgSrc] = useState<string>(`/api/pixiv-img?src=${encodeURIComponent(item.thumb || '')}`);
  const [retryCount, setRetryCount] = useState(0);

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (retryCount > 2) return;

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
      onClick={onClick}
      className="group relative break-inside-avoid rounded-lg bg-card border border-card-border overflow-hidden cursor-pointer transition-all duration-300 hover:border-foreground/20"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted/30">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={item.title || 'Asset'}
          onError={handleError}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content - Shows on hover */}
      <div className="absolute inset-x-0 bottom-0 p-4 transform transition-all duration-300 translate-y-full group-hover:translate-y-0 bg-gradient-to-t from-card to-transparent pt-12">
        <h3 className="text-sm font-medium text-foreground truncate mb-3">
          {item.title || 'Untitled'}
        </h3>
        
        <div className="flex gap-2">
          <button 
            className="flex-1 py-2 rounded-md bg-foreground text-background text-xs font-medium hover:bg-foreground/90 transition-colors"
            onClick={(e) => { e.stopPropagation(); onClick(); }}
          >
            View
          </button>
          <a 
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-md bg-muted/30 border border-card-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <FaExternalLinkAlt size={12} />
          </a>
        </div>
      </div>
    </motion.div>
  );
};
