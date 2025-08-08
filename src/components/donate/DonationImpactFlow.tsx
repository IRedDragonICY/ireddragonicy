'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import HolographicCard from '@/components/hero/HolographicCard';
import { FaHandHoldingHeart, FaFlask, FaChartLine, FaCodeBranch } from 'react-icons/fa';
import { IoHardwareChipOutline } from 'react-icons/io5';

type Step = {
  id: string;
  title: string;
  subtitle: string;
  colorFrom: string;
  colorTo: string;
  Icon: React.ComponentType<{ className?: string }>;
};

const STEPS: Step[] = [
  {
    id: 'support',
    title: 'Your Support',
    subtitle: 'donations',
    colorFrom: 'from-cyan-400',
    colorTo: 'to-blue-500',
    Icon: FaHandHoldingHeart,
  },
  {
    id: 'compute',
    title: 'Compute',
    subtitle: 'GPUs & storage',
    colorFrom: 'from-emerald-400',
    colorTo: 'to-teal-500',
    Icon: IoHardwareChipOutline,
  },
  {
    id: 'experiments',
    title: 'Experiments',
    subtitle: 'transformers/diffusion',
    colorFrom: 'from-violet-400',
    colorTo: 'to-fuchsia-500',
    Icon: FaFlask,
  },
  {
    id: 'results',
    title: 'Results',
    subtitle: 'benchmarks & eval',
    colorFrom: 'from-amber-400',
    colorTo: 'to-orange-500',
    Icon: FaChartLine,
  },
  {
    id: 'open',
    title: 'Open Releases',
    subtitle: 'demos & notes',
    colorFrom: 'from-cyan-400',
    colorTo: 'to-purple-500',
    Icon: FaCodeBranch,
  },
];

type Point = { x: number; y: number };

const DonationImpactFlow: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [paths, setPaths] = useState<string[]>([]);
  const [active, setActive] = useState<number>(0);
  const isIn = useInView(containerRef, { once: false, amount: 0.3 });

  // Animate active step cycling
  useEffect(() => {
    if (!isIn) return;
    const interval = setInterval(() => setActive((p) => (p + 1) % STEPS.length), 1800);
    return () => clearInterval(interval);
  }, [isIn]);

  // Build connector paths on resize
  useEffect(() => {
    const build = () => {
      const p: string[] = [];
      const nodes = stepRefs.current.filter(Boolean) as HTMLDivElement[];
      if (nodes.length < 2 || !containerRef.current) {
        setPaths([]);
        return;
      }
      const containerRect = containerRef.current.getBoundingClientRect();
      for (let i = 0; i < nodes.length - 1; i++) {
        const a = nodes[i].getBoundingClientRect();
        const b = nodes[i + 1].getBoundingClientRect();
        const start: Point = { x: a.right - containerRect.left, y: a.top + a.height / 2 - containerRect.top };
        const end: Point = { x: b.left - containerRect.left, y: b.top + b.height / 2 - containerRect.top };
        const dx = (end.x - start.x) * 0.4;
        const c1: Point = { x: start.x + dx, y: start.y };
        const c2: Point = { x: end.x - dx, y: end.y };
        p.push(`M ${start.x},${start.y} C ${c1.x},${c1.y} ${c2.x},${c2.y} ${end.x},${end.y}`);
      }
      setPaths(p);
    };
    build();
    const ro = new ResizeObserver(build);
    stepRefs.current.forEach((el) => el && ro.observe(el));
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', build);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', build);
    };
  }, []);

  const activeCopy = useMemo(() => {
    const step = STEPS[active];
    switch (step.id) {
      case 'support':
        return 'Your support unlocks every subsequent step. Without it, experiments stall.';
      case 'compute':
        return 'Funds are prioritized for GPUs, storage, and licensed datasets — the foundation of serious experimentation.';
      case 'experiments':
        return 'We run Transformer/Diffusion experiments with rigorous evaluation to produce trustworthy results.';
      case 'results':
        return 'Outcomes show up as metrics, charts, and ablation studies to understand what truly works.';
      default:
        return 'All findings are shared back: demos, technical notes, and source code for the community.';
    }
  }, [active]);

  return (
    <section className="relative py-12 sm:py-16 lg:py-24" ref={containerRef}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent" />
      <div className="relative w-full max-w-6xl mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-2xl sm:text-3xl font-extrabold text-center"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
            Donation impact flow
          </span>
        </motion.h2>

        {/* Desktop: nodes with animated connectors */}
        <div className="relative mt-8 hidden md:block">
          <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
            <defs>
              <linearGradient id="flow-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(34,211,238,0.4)" />
                <stop offset="50%" stopColor="rgba(139,92,246,0.6)" />
                <stop offset="100%" stopColor="rgba(34,211,238,0.4)" />
              </linearGradient>
            </defs>
            {paths.map((d, i) => (
              <motion.path
                key={i}
                d={d}
                fill="none"
                stroke="url(#flow-grad)"
                strokeWidth={2}
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, delay: i * 0.15 }}
                style={{
                  strokeDasharray: '6 10',
                  strokeDashoffset: (active % STEPS.length) > i ? 0 : 8,
                }}
              />
            ))}
          </svg>

          <div className="grid grid-cols-5 gap-4">
            {STEPS.map((step, i) => (
              <HolographicCard key={step.id}>
                <div
                  ref={(el) => (stepRefs.current[i] = el)}
                  onMouseEnter={() => setActive(i)}
                  className="relative p-5 flex flex-col items-center gap-3 text-center"
                >
                  <div className="relative">
                    <motion.div
                      className={`w-12 h-12 rounded-xl grid place-items-center bg-gradient-to-br ${step.colorFrom} ${step.colorTo}`}
                      animate={i === active ? { scale: [1, 1.08, 1] } : {}}
                      transition={{ duration: 1.2, repeat: i === active ? Infinity : 0 }}
                    >
                      <step.Icon className="text-white text-xl" />
                    </motion.div>
                    <motion.span
                      className="absolute -inset-2 rounded-2xl border border-white/10"
                      animate={{ opacity: i === active ? [0.3, 0.8, 0.3] : 0.2 }}
                      transition={{ duration: 1.6, repeat: i === active ? Infinity : 0 }}
                    />
                  </div>
                  <div>
                    <div className={`font-bold text-transparent bg-clip-text bg-gradient-to-r ${step.colorFrom} ${step.colorTo}`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-400">{step.subtitle}</div>
                  </div>
                </div>
              </HolographicCard>
            ))}
          </div>
        </div>

        {/* Mobile: vertical flow */}
        <div className="mt-8 md:hidden space-y-4">
          {STEPS.map((step, i) => (
            <div key={step.id} className="relative">
              {i > 0 && (
                <div className="absolute -top-3 left-6 w-0.5 h-3 bg-gradient-to-b from-cyan-500 to-purple-500" />
              )}
              <HolographicCard>
                <div className="p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 shrink-0 rounded-xl grid place-items-center bg-gradient-to-br ${step.colorFrom} ${step.colorTo}`}>
                    <step.Icon className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className={`font-semibold text-transparent bg-clip-text bg-gradient-to-r ${step.colorFrom} ${step.colorTo}`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-400">{step.subtitle}</div>
                    <div className="mt-2 h-1 rounded-full overflow-hidden bg-black/40">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-400 to-purple-500"
                        animate={{ width: i <= active ? '100%' : '20%' }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                  </div>
                </div>
              </HolographicCard>
            </div>
          ))}
        </div>

        {/* Active copy */}
        <div className="mt-8">
          <HolographicCard>
            <div className="p-5 sm:p-6 flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse mt-1.5" />
              <p className="text-sm text-gray-300">{activeCopy}</p>
            </div>
          </HolographicCard>
        </div>
      </div>
    </section>
  );
};

export default DonationImpactFlow;


