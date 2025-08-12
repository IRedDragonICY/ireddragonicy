// components/CursorEffect.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const CursorEffect = () => {
  const [isPointer, setIsPointer] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 25, stiffness: 700 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    // Disable on touch/coarse pointer devices (mobile/tablet)
    const isCoarse = typeof window !== 'undefined' && matchMedia('(pointer: coarse)').matches;
    if (isCoarse) {
      setEnabled(false);
      return;
    }

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 150);
      cursorY.set(e.clientY - 150);

      // Check if hovering over interactive elements
      const target = e.target as HTMLElement;
      const isInteractive =
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.onclick !== null ||
        target.closest('a') !== null ||
        target.closest('button') !== null;

      setIsPointer(isInteractive);
    };

    window.addEventListener('mousemove', moveCursor);
    return () => window.removeEventListener('mousemove', moveCursor);
  }, [cursorX, cursorY]);

  if (!enabled) return null;

  return (
    <>
      {/* Flashlight effect */}
      <motion.div
        className="fixed pointer-events-none z-[60] mix-blend-screen"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
        }}
      >
        <div
          className={`
            w-[300px] h-[300px] transition-all duration-300
            ${isPointer ? 'scale-150' : 'scale-100'}
          `}
          style={{
            background: `radial-gradient(circle, rgba(34, 211, 238, 0.15) 0%, transparent 40%)`,
            filter: 'blur(20px)',
          }}
        />
      </motion.div>

      {/* Neural network particles around cursor */}
      <motion.div
        className="fixed pointer-events-none z-[59]"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
        }}
      >
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            animate={{
              x: [0, Math.sin(i * 60 * Math.PI / 180) * 30, 0],
              y: [0, Math.cos(i * 60 * Math.PI / 180) * 30, 0],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
            style={{
              left: '150px',
              top: '150px',
            }}
          >
            <div className="w-1 h-1 bg-cyan-400 rounded-full" />
          </motion.div>
        ))}
      </motion.div>

      {/* Custom cursor dot */}
      <motion.div
        className="fixed w-4 h-4 pointer-events-none z-[61] mix-blend-difference"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '142px',
          translateY: '142px',
        }}
      >
        <div className={`
          w-full h-full bg-cyan-400 rounded-full transition-all duration-300
          ${isPointer ? 'scale-150 bg-white' : 'scale-100'}
        `} />
      </motion.div>
    </>
  );
};

export default CursorEffect;