'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion, useAnimationFrame, useMotionValue, useTransform, useSpring } from 'framer-motion';

// Premium Marquee Items - Research/AI Theme
const MARQUEE_ITEMS = [
  { text: 'DIFFUSION', highlight: true },
  { text: '◆', separator: true },
  { text: 'TRANSFORMER', highlight: false },
  { text: '◆', separator: true },
  { text: 'LATENT SPACE', highlight: true },
  { text: '◆', separator: true },
  { text: 'NEURAL ARCH', highlight: false },
  { text: '◆', separator: true },
  { text: 'GENERATIVE AI', highlight: true },
  { text: '◆', separator: true },
  { text: 'DEEP LEARNING', highlight: false },
  { text: '◆', separator: true },
  { text: 'STABLE DIFFUSION', highlight: true },
  { text: '◆', separator: true },
  { text: 'ATTENTION', highlight: false },
  { text: '◆', separator: true },
];

interface MarqueeTextProps {
  baseVelocity: number;
  children: React.ReactNode;
}

const MarqueeText = ({ baseVelocity, children }: MarqueeTextProps) => {
  const baseX = useMotionValue(0);
  const [repetitions, setRepetitions] = useState(4);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Smooth the motion
  const smoothVelocity = useSpring(baseVelocity, {
    stiffness: 50,
    damping: 20,
  });
  
  // Calculate wrap point based on content width
  useEffect(() => {
    const calculateRepetitions = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const minRepetitions = Math.ceil(window.innerWidth / containerWidth) + 2;
        setRepetitions(Math.max(4, minRepetitions));
      }
    };
    
    calculateRepetitions();
    window.addEventListener('resize', calculateRepetitions);
    return () => window.removeEventListener('resize', calculateRepetitions);
  }, []);

  useAnimationFrame((_, delta) => {
    const moveBy = smoothVelocity.get() * (delta / 1000);
    
    if (baseX.get() <= -100 / repetitions) {
      baseX.set(0);
    } else if (baseX.get() >= 0) {
      baseX.set(-100 / repetitions);
    }
    
    baseX.set(baseX.get() + moveBy);
  });

  const x = useTransform(baseX, (v) => `${v}%`);

  return (
    <div className="overflow-hidden whitespace-nowrap flex">
      <motion.div
        ref={containerRef}
        className="flex whitespace-nowrap"
        style={{ x }}
      >
        {[...Array(repetitions)].map((_, i) => (
          <div key={i} className="flex items-center">
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  );
};

const MarqueeItem = ({ text, highlight, separator }: { text: string; highlight?: boolean; separator?: boolean }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  if (separator) {
    return (
      <span className="mx-8 md:mx-12 text-foreground/10 text-2xl md:text-3xl select-none">
        {text}
      </span>
    );
  }
  
  return (
    <motion.span
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative mx-4 md:mx-6 text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl
        font-black tracking-tighter cursor-default select-none
        transition-all duration-500 ease-out
        ${highlight 
          ? 'text-foreground' 
          : 'text-foreground/20 hover:text-foreground/60'
        }
      `}
      style={{
        WebkitTextStroke: highlight ? 'none' : '1px currentColor',
        textShadow: isHovered && highlight ? '0 0 80px rgba(255,255,255,0.15)' : 'none',
      }}
    >
      {/* Glitch layers on hover */}
      {isHovered && highlight && (
        <>
          <span 
            className="absolute inset-0 text-cyan-500/30 animate-pulse"
            style={{ transform: 'translate(-2px, -2px)' }}
            aria-hidden
          >
            {text}
          </span>
          <span 
            className="absolute inset-0 text-red-500/20"
            style={{ transform: 'translate(2px, 2px)' }}
            aria-hidden
          >
            {text}
          </span>
        </>
      )}
      
      {/* Main text */}
      <span className="relative z-10">{text}</span>
      
      {/* Underline effect on hover */}
      <motion.span
        className="absolute bottom-2 left-0 h-1 bg-foreground/20"
        initial={{ width: 0 }}
        animate={{ width: isHovered ? '100%' : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.span>
  );
};

const MarqueeBanner = () => {
  const [mouseY, setMouseY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Track mouse position for parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setMouseY(y);
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative py-12 md:py-16 lg:py-20 overflow-hidden bg-background border-y border-foreground/[0.06]"
    >
      {/* Background noise texture */}
      <div 
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Gradient overlays for fade effect */}
      <div className="absolute left-0 top-0 bottom-0 w-32 md:w-64 bg-gradient-to-r from-background via-background/80 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-32 md:w-64 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none" />
      
      {/* Technical corner accents */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l border-t border-foreground/10" />
      <div className="absolute top-4 right-4 w-8 h-8 border-r border-t border-foreground/10" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l border-b border-foreground/10" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r border-b border-foreground/10" />
      
      {/* Main Marquee */}
      <motion.div
        style={{ y: mouseY * 10 }}
        transition={{ type: 'spring', stiffness: 150, damping: 30 }}
      >
        <MarqueeText baseVelocity={-3}>
          {MARQUEE_ITEMS.map((item, idx) => (
            <MarqueeItem 
              key={idx} 
              text={item.text} 
              highlight={item.highlight}
              separator={item.separator}
            />
          ))}
        </MarqueeText>
      </motion.div>
    </section>
  );
};

export default MarqueeBanner;
