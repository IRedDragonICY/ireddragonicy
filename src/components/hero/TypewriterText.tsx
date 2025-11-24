'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BsLightningChargeFill } from 'react-icons/bs';
import { IoMdPulse } from 'react-icons/io';

type TypewriterTextProps = {
  text: string;
  delay?: number;
  isInView: boolean;
  showTokens?: boolean;
  gradientAfter?: boolean;
  className?: string;
};

const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  delay = 0,
  isInView,
  showTokens = false,
  gradientAfter = true,
  className = '',
}) => {
  const [out, setOut] = useState('');
  const [idx, setIdx] = useState(0);
  const [cursor, setCursor] = useState(true);
  const [typing, setTyping] = useState(false);
  const [tok, setTok] = useState(0);
  const [tps, setTps] = useState(0);
  const [glitchChars, setGlitchChars] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    if (!isInView) {
      setOut('');
      setIdx(0);
      setTyping(false);
      setTok(0);
      return;
    }
    const id = setTimeout(() => setTyping(true), delay);
    return () => clearTimeout(id);
  }, [isInView, delay]);

  useEffect(() => {
    if (!typing || idx >= text.length) return;

    if (Math.random() < 0.1) {
      const glitchChar = String.fromCharCode(33 + Math.floor(Math.random() * 94));
      setGlitchChars((prev) => ({ ...prev, [idx]: glitchChar }));
      setTimeout(() => {
        setGlitchChars((prev) => {
          const next = { ...prev };
          delete next[idx];
          return next;
        });
      }, 50);
    }

    const id = setTimeout(() => {
      setOut(text.slice(0, idx + 1));
      setIdx((i) => i + 1);

      if (showTokens) {
        setTok((p) => p + Math.floor(Math.random() * 3 + 2));
        setTps(Math.floor(Math.random() * 15 + 25));
      }
    }, 50 + Math.random() * 50);
    return () => clearTimeout(id);
  }, [typing, idx, text, showTokens]);

  useEffect(() => {
    const id = setInterval(() => setCursor((c) => !c), 500);
    return () => clearInterval(id);
  }, []);

  const done = useMemo(() => idx === text.length, [idx, text.length]);

  return (
    <span className={`${className} inline-block relative`}>
      <span
        className={
          gradientAfter && done
            ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient-x'
            : ''
        }
      >
        {out.split('').map((char, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={glitchChars[i] ? 'text-red-400' : ''}
          >
            {glitchChars[i] || char}
          </motion.span>
        ))}
      </span>
      {cursor && typing && !done && (
        <motion.span
          className="inline-block w-0.5 sm:w-1 h-6 sm:h-8 lg:h-10 bg-white ml-[2px] align-middle"
          animate={{ opacity: [1, 0], scaleY: [1, 0.8, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}

      {showTokens && typing && !done && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 6 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          className="absolute left-1/2 top-full mt-2 -translate-x-1/2 text-[10px] font-mono pointer-events-none"
        >
          <div className="px-3 py-1.5 bg-black/70 backdrop-blur-md border border-white/10 rounded-full shadow-xl">
            <div className="flex items-center gap-2">
              <BsLightningChargeFill className="text-yellow-400 animate-pulse" />
              <span className="text-cyan-300 font-bold">{tok} tokens</span>
              <span className="text-gray-500">•</span>
              <span className="text-green-400">{tps} tok/s</span>
              <IoMdPulse className="text-green-400 animate-pulse" />
            </div>
          </div>
        </motion.div>
      )}
    </span>
  );
};

export default TypewriterText;


