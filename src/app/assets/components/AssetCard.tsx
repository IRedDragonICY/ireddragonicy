import React, { useState, useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { FaExternalLinkAlt, FaExpand, FaImage } from 'react-icons/fa';

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
  const [isHovered, setIsHovered] = useState(false);
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
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      className="group relative break-inside-avoid rounded-xl bg-black/40 border border-white/10 overflow-hidden cursor-pointer transition-colors duration-500 hover:border-cyan-500/30"
    >
      {/* Hover Glow */}
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
        style={{ background }}
      />

      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-900/50">
        <img
          src={imgSrc}
          alt={item.title || 'Asset'}
          onError={handleError}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
        
        {/* Technical Overlay Grid (Decoration) */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none bg-[linear-gradient(to_right,transparent_1px,rgba(34,211,238,0.1)_1px),linear-gradient(to_bottom,transparent_1px,rgba(34,211,238,0.1)_1px)] bg-[size:20px_20px]" />

        {/* Top Right Action */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
            <div className="p-2 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-cyan-400">
                <FaExpand size={12} />
            </div>
        </div>
      </div>

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 p-4">
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 rounded bg-cyan-500/10 border border-cyan-500/20">
                    <FaImage size={10} className="text-cyan-400" />
                </div>
                <span className="text-[10px] font-mono text-cyan-300 tracking-wider uppercase">IMG_ASSET</span>
            </div>
            <span className="text-[10px] font-mono text-gray-500">#{item.id}</span>
        </div>
        
        <h3 className="text-sm font-medium text-white truncate group-hover:text-cyan-400 transition-colors duration-300">
            {item.title || 'Untitled Asset'}
        </h3>
        
        <div className="mt-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
            <div className="flex gap-1">
                <div className="h-1 w-8 bg-cyan-500/50 rounded-full" />
                <div className="h-1 w-2 bg-gray-600 rounded-full" />
            </div>
            <a 
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-white transition-colors"
                onClick={(e) => e.stopPropagation()}
            >
                <span>SOURCE</span>
                <FaExternalLinkAlt size={8} />
            </a>
        </div>
      </div>
    </motion.div>
  );
};

