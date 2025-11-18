'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

const CursorEffect = () => {
  const [isPointer, setIsPointer] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [hoverText, setHoverText] = useState('');
  const [enabled, setEnabled] = useState(false); // Default false to avoid hydration mismatch

  // Mouse positions
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Smooth springs for the follower
  const springConfig = { damping: 20, stiffness: 300, mass: 0.5 };
  const followerX = useSpring(mouseX, springConfig);
  const followerY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Enable only on non-touch devices
    const checkDevice = () => {
       const isCoarse = window.matchMedia('(pointer: coarse)').matches;
       setEnabled(!isCoarse);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const moveCursor = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      // Check target for interactivity
      const target = e.target as HTMLElement;
      const clickable = target.closest('a, button, [role="button"], input, textarea');
      
      const isInteractive = !!clickable;
      setIsPointer(isInteractive);

      // Determine label text based on element type
      if (clickable) {
         const tagName = clickable.tagName.toLowerCase();
         if (tagName === 'a') setHoverText('LINK');
         else if (tagName === 'button') setHoverText('ACTION');
         else if (tagName === 'input') setHoverText('INPUT');
         else setHoverText('CLICK');
      } else {
         setHoverText('');
      }
    };

    const mouseDown = () => setIsClicking(true);
    const mouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mousedown', mouseDown);
    window.addEventListener('mouseup', mouseUp);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mousedown', mouseDown);
      window.removeEventListener('mouseup', mouseUp);
    };
  }, [enabled, mouseX, mouseY]);

  if (!enabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {/* 1. The Main Follower (Diffusion Halo) */}
      <motion.div
        className="absolute top-0 left-0 w-8 h-8 rounded-full border border-cyan-500/30 bg-cyan-500/5 backdrop-blur-[1px]"
        style={{
          x: followerX,
          y: followerY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isClicking ? 0.8 : isPointer ? 2.5 : 1,
          borderColor: isPointer ? 'rgba(34, 211, 238, 0.5)' : 'rgba(34, 211, 238, 0.2)',
          backgroundColor: isPointer ? 'rgba(34, 211, 238, 0.1)' : 'rgba(34, 211, 238, 0.05)',
        }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {/* Latent Noise Texture inside the cursor (Diffusion theme) */}
        <div className="absolute inset-0 opacity-20 bg-[url('/noise.png')] bg-repeat rounded-full" />
        
        {/* Rotating Ring for "Processing" feel */}
        <motion.div 
           className="absolute -inset-1 border-t border-r border-cyan-400/40 rounded-full"
           animate={{ rotate: 360 }}
           transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>

      {/* 2. The Precise Dot (Pointer) */}
      <motion.div
        className="absolute top-0 left-0 w-1.5 h-1.5 bg-white rounded-full mix-blend-difference"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isClicking ? 0.5 : isPointer ? 0 : 1, // Hide dot when expanding halo
        }}
        transition={{ duration: 0.1 }}
      />

      {/* 3. Context Label (Cyberpunk / Agency Style) */}
      <motion.div
        className="absolute top-0 left-0 flex items-center ml-6 mt-4"
        style={{
          x: followerX,
          y: followerY,
        }}
      >
        <AnimatePresence>
          {hoverText && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -5 }}
              className="flex items-center gap-2"
            >
              <div className="h-[1px] w-4 bg-cyan-500/50" />
              <span className="bg-black/80 border border-cyan-500/20 text-cyan-400 text-[8px] font-mono px-1.5 py-0.5 rounded uppercase tracking-widest backdrop-blur-md">
                {hoverText}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default CursorEffect;
