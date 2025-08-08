'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import CursorEffect from '@/components/CursorEffect';
import { FaBrain, FaGraduationCap } from 'react-icons/fa';

type EducationItem = {
  institution: string;
  program?: string;
  period: string;
  location?: string;
  highlight?: string;
};

const personalInfo = {
  alias: 'IRedDragonICY',
};

const educationData: EducationItem[] = [
  {
    institution: 'Universitas Ahmad Dahlan',
    program: 'Informatics',
    period: '2022 – 2028',
  },
  {
    institution: 'Universiti Malaysia Pahang Al-Sultan Abdullah',
    program:
      'Bachelor of Computer Science (Student Exchange – AIMS), Software Engineering (with Honours)',
    period: 'Oct 2024 – Feb 2025',
  },
  {
    institution: 'SMA Negeri Cahaya Madani Banten',
    program: 'Science (IPA)',
    period: '2019 – 2022',
  },
  {
    institution: 'SMP Negeri 08 Tangerang Selatan',
    period: '2016 – 2019',
  },
  {
    institution: 'SD Negeri Batan Indah',
    period: '2010 – 2016',
  },
  {
    institution: 'MTQ Dzarattul Mutmainnah',
    period: '2012 – 2016',
  },
  {
    institution: 'TK Bakti Atomita',
    period: '2009 – 2010',
  },
];

type Node = { id: number; x: number; y: number };

function useNeuralNodes(count = 22) {
  const [nodes, setNodes] = useState<Node[]>([]);

  useEffect(() => {
    const createNodes = () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
      }));
    setNodes(createNodes());

    const interval = setInterval(() => {
      setNodes((prev) =>
        prev.map((n) => ({
          ...n,
          x: Math.max(0, Math.min(100, n.x + (Math.random() - 0.5) * 3)),
          y: Math.max(0, Math.min(100, n.y + (Math.random() - 0.5) * 3)),
        }))
      );
    }, 1800);
    return () => clearInterval(interval);
  }, [count]);

  // Precompute edges between near neighbors
  const edges = useMemo(() => {
    const list: Array<[Node, Node]> = [];
    for (let i = 0; i < nodes.length; i += 1) {
      for (let j = i + 1; j < nodes.length; j += 1) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 9 * 9) list.push([nodes[i], nodes[j]]); // threshold ~9% of container
      }
    }
    return list;
  }, [nodes]);

  return { nodes, edges };
}

const SectionHeader = ({ title }: { title: string }) => (
  <div className="relative mb-12">
    <motion.div
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.8 }}
      className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent"
    />
    <h1 className="relative text-center text-3xl md:text-5xl font-extrabold tracking-tight">
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
        &lt;{title}/&gt;
      </span>
    </h1>
  </div>
);

export default function EducationPage() {
  const { nodes, edges } = useNeuralNodes(26);

  return (
    <>
      {/* Override global grid background on this page to avoid blue lines */}
      <style jsx global>{`
        body {
          background-image: none !important;
          animation: none !important;
        }
      `}</style>
      {/* Global ambient visuals */}
      <CursorEffect />
      <Navigation personalInfo={personalInfo} />

      <main className="relative min-h-screen pt-24 pb-16">
        {/* Layered sci‑fi background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Modern aurora blurs */}
          <motion.div
            className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full blur-3xl"
            style={{
              background: 'radial-gradient(circle at 30% 30%, rgba(34,211,238,0.35), transparent 60%)',
            }}
            animate={{ x: [-20, 20, -20], y: [0, 10, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-40 -right-24 w-[600px] h-[600px] rounded-full blur-3xl"
            style={{
              background: 'radial-gradient(circle at 70% 70%, rgba(168,85,247,0.35), transparent 60%)',
            }}
            animate={{ x: [10, -10, 10], y: [0, -12, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Rotating holographic ring */}
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
          >
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full opacity-20"
              style={{
                background:
                  'conic-gradient(from 90deg, rgba(34,211,238,0.15), transparent 25%, rgba(168,85,247,0.15), transparent 50%, rgba(34,211,238,0.15))',
                maskImage: 'radial-gradient(circle at center, black 40%, transparent 60%)',
                WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 60%)',
              }}
            />
          </motion.div>

          {/* hex grid */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage:
              "radial-gradient(rgba(34,211,238,0.18) 1px, transparent 1px), radial-gradient(rgba(168,85,247,0.14) 1px, transparent 1px)",
            backgroundSize: '20px 20px, 34px 34px',
            backgroundPosition: '0 0, 10px 17px',
          }} />

          {/* sweeping scanline removed per request */}

          {/* neural network svg */}
          <svg className="absolute inset-0 w-full h-full opacity-40" preserveAspectRatio="none">
            {edges.map(([a, b], idx) => (
              <motion.line
                key={`l-${idx}`}
                x1={`${a.x}%`} y1={`${a.y}%`} x2={`${b.x}%`} y2={`${b.y}%`}
                stroke="url(#edgeGrad)" strokeWidth="1"
                initial={{ opacity: 0.25 }}
                animate={{ opacity: [0.15, 0.35, 0.15] }}
                transition={{ duration: 3 + (idx % 5) * 0.4, repeat: Infinity }}
              />
            ))}
            {nodes.map((n) => (
              <motion.circle
                key={n.id}
                cx={`${n.x}%`} cy={`${n.y}%`} r="1.8"
                fill="url(#nodeGrad)"
                animate={{ r: [1.2, 2, 1.2] }}
                transition={{ duration: 2.4, repeat: Infinity, delay: (n.id % 7) * 0.2 }}
              />
            ))}
            <defs>
              <linearGradient id="edgeGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="rgba(34,211,238,0.45)" />
                <stop offset="100%" stopColor="rgba(168,85,247,0.45)" />
              </linearGradient>
              <radialGradient id="nodeGrad">
                <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
                <stop offset="60%" stopColor="rgba(34,211,238,0.85)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
          </svg>

          {/* subtle grain */}
          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage: 'radial-gradient(rgba(255,255,255,0.7) 1px, transparent 1px)',
              backgroundSize: '3px 3px',
              mixBlendMode: 'overlay',
            }}
          />
        </div>

        <section className="relative w-full max-w-6xl mx-auto px-4">
          <SectionHeader title="EDUCATION_HISTORY" />

          {/* Intro card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative mb-10 p-6 md:p-8 rounded-2xl bg-black/40 backdrop-blur-xl border border-cyan-400/20 shadow-lg shadow-cyan-500/10 overflow-hidden"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-purple-500/0 rounded-2xl" />
            <div className="relative flex items-start gap-4">
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-300">
                <FaBrain className="text-xl" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-semibold text-cyan-300">Neural Timeline</h2>
                <p className="mt-2 text-gray-300">
                  A professional, AI-inspired education timeline. Each node represents a learning phase, interconnected like a
                  neural network to form an evolving pattern of experiences — futuristic, dynamic, and modern.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Timeline */}
          <div className="relative">
            {/* central axis */}
            <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/40 via-cyan-500/10 to-transparent" />

            <ol className="space-y-6 md:space-y-10">
              {educationData.map((item, index) => {
                const isLeft = index % 2 === 0;
                return (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="relative"
                  >
                    <div className={`grid md:grid-cols-2 gap-6 items-stretch`}>
                      {/* Spacer for left/right alignment on desktop */}
                      <div className={`hidden md:block ${isLeft ? '' : 'order-2'}`} />

                      <div className={`${isLeft ? '' : 'md:order-1'}`}>
                        <div className="relative h-full p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 to-black/80 border border-cyan-400/20 hover:border-cyan-400/40 transition-all group overflow-hidden">
                          {/* Glow on hover */}
                          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-purple-500/0 group-hover:from-cyan-500/10 group-hover:to-purple-500/10 transition-colors" />

                          {/* Anchor dot for axis */}
                          <div className="hidden md:block absolute top-6 -left-[9px] w-4 h-4 rounded-full bg-cyan-400/90 shadow-[0_0_12px_rgba(34,211,238,0.8)] border border-white/20" />

                          <div className="relative flex items-start gap-4">
                            <div className="shrink-0 p-3 rounded-xl bg-cyan-500/10 border border-cyan-400/30 text-cyan-300">
                              <FaGraduationCap className="text-xl" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-lg md:text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 line-clamp-2">
                                {item.institution}
                              </h3>
                              {item.program && (
                                <p className="mt-1 text-sm md:text-base text-gray-300/90">{item.program}</p>
                              )}
                              <div className="mt-3 flex flex-wrap gap-3 items-center text-xs md:text-sm">
                                <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-400/20 font-mono">
                                  {item.period}
                                </span>
                                {item.highlight && (
                                  <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-400/20">
                                    {item.highlight}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </ol>
          </div>
        </section>
      </main>
    </>
  );
}


