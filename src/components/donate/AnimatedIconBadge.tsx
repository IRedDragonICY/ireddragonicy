'use client';

import React, { useId } from 'react';
import { motion } from 'framer-motion';
import type { IconType } from 'react-icons';

type AnimatedIconBadgeProps = {
  Icon: IconType;
  accent: 'cyan' | 'violet' | 'amber';
  size?: number; // px
  className?: string;
};

const gradientMap: Record<AnimatedIconBadgeProps['accent'], { from: string; to: string; ring: string }> = {
  cyan: { from: 'from-cyan-500', to: 'to-blue-600', ring: 'ring-cyan-400/30' },
  violet: { from: 'from-violet-500', to: 'to-fuchsia-600', ring: 'ring-violet-400/30' },
  amber: { from: 'from-amber-500', to: 'to-orange-600', ring: 'ring-amber-400/30' },
};

const AnimatedIconBadge: React.FC<AnimatedIconBadgeProps> = ({ Icon, accent, size = 48, className = '' }) => {
  const id = useId().replace(/:/g, '');
  const filterId = `goo-${id}`;
  const colors = gradientMap[accent];

  return (
    <div
      className={`relative rounded-xl bg-gradient-to-br ${colors.from} ${colors.to} shadow-xl ring-2 ${colors.ring} overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      {/* SVG defs for gooey effect */}
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id={filterId}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"
              result="goo"
            />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* Orbiting blobs behind the icon */}
      <div className="absolute inset-0 z-0 pointer-events-none mix-blend-screen" style={{ filter: `url(#${filterId})` }}>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 -ml-1.5 -mt-1.5 w-3 h-3 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.1) 70%, transparent 100%)',
            }}
            animate={{
              rotate: [0, 360],
              translateX: [0, size / 2 - 10, 0],
              translateY: [0, i % 2 === 0 ? -6 : 6, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      {/* Icon */}
      <motion.div
        className="relative z-10 w-full h-full flex items-center justify-center"
        whileHover={{ y: -1.5, x: 1.5 }}
        transition={{ type: 'spring', stiffness: 200, damping: 14 }}
      >
        <Icon className="text-white" style={{ fontSize: Math.floor(size * 0.55), lineHeight: 1 }} />
        <span aria-hidden className="pointer-events-none absolute -inset-1 glint opacity-70" />
      </motion.div>

      {/* Subtle hover ripple */}
      <motion.span
        aria-hidden
        className="absolute inset-0 z-20 rounded-xl pointer-events-none"
        style={{
          background:
            'radial-gradient(120px 120px at var(--x,50%) var(--y,50%), rgba(255,255,255,0.3), transparent 60%)',
        }}
        initial={{ opacity: 0 }}
        whileHover={{ opacity: [0, 0.45, 0] }}
        transition={{ duration: 0.8 }}
      />
    </div>
  );
};

export default AnimatedIconBadge;


