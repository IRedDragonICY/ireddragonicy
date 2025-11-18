'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import Navigation from '@/components/Navigation';
import CursorEffect from '@/components/CursorEffect';
import DiffusionScene from '@/components/education/DiffusionScene';
import { FaNetworkWired, FaServer, FaMicrochip, FaCodeBranch, FaGraduationCap } from 'react-icons/fa';
import { BsGpuCard } from 'react-icons/bs';

// --- Types ---

type EducationItem = {
  id: string;
  institution: string;
  program?: string;
  period: string;
  status: string;
  highlight?: string;
  icon: React.ElementType;
  stats: { label: string; value: string }[];
  description?: string;
  logs: string[];
};

const personalInfo = {
  alias: 'IRedDragonICY',
};

// --- Data ---

const educationData: EducationItem[] = [
  {
    id: 'uad',
    institution: 'Universitas Ahmad Dahlan',
    program: 'Informatics (S1)',
    period: '2022 – 2028',
    status: 'FINE_TUNING',
    icon: FaNetworkWired,
    highlight: 'AI Specialization',
    stats: [
      { label: 'EPOCH', value: '6/8' },
      { label: 'ACC', value: '98.5%' },
      { label: 'GPA', value: '3.92' },
    ],
    description: "Advanced research in Deep Learning architectures. Specializing in diffusion models, generative adversarial networks, and computer vision pipelines.",
    logs: [
        "> Initializing U-Net architecture...",
        "> Loading pre-trained weights...",
        "> Optimizing loss function: CrossEntropy"
    ]
  },
  {
    id: 'ump',
    institution: 'Universiti Malaysia Pahang',
    program: 'Software Engineering (Exchange)',
    period: 'Oct 2024 – Feb 2025',
    status: 'TRANSFER_LEARNING',
    icon: FaServer,
    highlight: 'AIMS Scholar',
    stats: [
      { label: 'DUR', value: '1 SEM' },
      { label: 'TYPE', value: 'INTL' },
      { label: 'RES', value: 'PASS' }
    ],
    description: "International exposure focusing on large-scale software systems and cross-cultural engineering practices. Adapting models to new domains.",
    logs: [
        "> Domain adaptation initiated...",
        "> Transferring feature vectors...",
        "> Cultural bias normalization complete"
    ]
  },
  {
    id: 'cmb',
    institution: 'SMA Cahaya Madani Banten',
    program: 'Science (IPA)',
    period: '2019 – 2022',
    status: 'PRE_TRAINING',
    icon: FaMicrochip,
    highlight: 'Boarding Excellence',
    stats: [
      { label: 'FOCUS', value: 'STEM' },
      { label: 'RANK', value: 'TOP 5%' }
    ],
    description: "Foundational embedding in mathematics, physics, and algorithmic thinking. Intensive boarding environment providing robust initial weights.",
    logs: [
        "> Setting random seeds...",
        "> Establishing baseline parameters...",
        "> Batch normalization active"
    ]
  },
  {
    id: 'smp',
    institution: 'SMP Negeri 08 Tangsel',
    program: 'Junior High',
    period: '2016 – 2019',
    status: 'INITIALIZATION',
    icon: FaCodeBranch,
    highlight: 'Junior High',
    stats: [
      { label: 'BASE', value: 'STD' }
    ],
    description: "Early development of logical reasoning and structural thinking.",
    logs: [
        "> Allocating memory...",
        "> System boot sequence..."
    ]
  }
];

// --- Components ---

const DetailCard = ({ item, onClose }: { item: EducationItem; onClose: () => void }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="fixed right-4 md:right-10 top-24 md:top-32 bottom-10 w-full max-w-md z-50 pointer-events-auto"
        >
            <div className="h-full bg-[#050507]/95 backdrop-blur-2xl border border-cyan-500/30 rounded-2xl overflow-hidden flex flex-col shadow-2xl relative">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10"
                >
                    ✕ ESC
                </button>

                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-gradient-to-r from-cyan-900/20 to-transparent">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20 text-cyan-400">
                            <item.icon size={20} />
                        </div>
                        <span className="text-xs font-mono text-cyan-400 tracking-widest uppercase">{item.status}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white leading-tight">{item.institution}</h2>
                    {item.program && <p className="text-sm text-purple-300 mt-1 font-mono">{item.program}</p>}
                </div>

                {/* Content Scroll */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Stats */}
                    {item.stats.length > 0 && (
                        <div className="grid grid-cols-3 gap-3">
                            {item.stats.map((stat, i) => (
                                <div key={i} className="bg-black/40 rounded p-3 border border-white/5 text-center">
                                    <div className="text-[10px] text-gray-500 font-mono uppercase tracking-wider mb-1">{stat.label}</div>
                                    <div className="text-lg font-bold text-white">{stat.value}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Description */}
                    <div className="space-y-2">
                        <h3 className="text-xs font-mono text-gray-500 uppercase">/Description</h3>
                        <p className="text-sm text-gray-300 leading-relaxed border-l-2 border-cyan-500/30 pl-4">
                            {item.description}
                        </p>
                    </div>

                    {/* System Logs */}
                    <div className="space-y-2">
                        <h3 className="text-xs font-mono text-gray-500 uppercase">/System_Logs</h3>
                        <div className="bg-black rounded p-4 font-mono text-xs text-green-500/80 space-y-2 border border-white/10">
                            {item.logs.map((log, i) => (
                                <div key={i} className="truncate">
                                    <span className="opacity-50 mr-2">{(i + 1).toString().padStart(2, '0')}</span>
                                    {log}
                                </div>
                            ))}
                            <div className="w-2 h-4 bg-green-500/50 animate-pulse inline-block" />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 bg-black/20 text-[10px] font-mono text-gray-500 flex justify-between">
                    <span>ID: {item.id.toUpperCase()}</span>
                    <span>SYNCED</span>
                </div>
            </div>
        </motion.div>
    );
};

const InstructionOverlay = () => (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="fixed bottom-10 left-1/2 -translate-x-1/2 pointer-events-none z-40 text-center space-y-2"
    >
        <div className="text-[10px] font-mono text-cyan-500 tracking-[0.3em] animate-pulse">
            INTERACTIVE NEURAL INTERFACE
        </div>
        <div className="text-xs text-gray-500">
            Drag to Rotate • Click Nodes to Explore
        </div>
    </motion.div>
);

export default function EducationPage() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const selectedItem = educationData.find(e => e.id === selectedSchoolId);

  return (
    <>
      <style jsx global>{`
        body {
            background-color: #030305;
            overflow: hidden; /* Lock scroll for 3D interaction focus */
        }
      `}</style>

      <CursorEffect />
      <Navigation personalInfo={personalInfo} />
      
      <main className="relative w-full h-screen overflow-hidden">
        
        {/* 3D Scene is now the main content */}
        <div className="absolute inset-0 z-10">
            <DiffusionScene onSchoolSelect={(data: any) => setSelectedSchoolId(data?.id)} />
        </div>

        {/* HUD / Title (Non-intrusive) */}
        <div className="absolute top-24 left-8 md:left-16 z-20 pointer-events-none">
            <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1 }}
            >
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white mb-2 mix-blend-difference">
                    NEURAL
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">
                        ARCHITECT
                    </span>
                </h1>
                <div className="flex items-center gap-3 text-cyan-400/80 font-mono text-xs">
                    <BsGpuCard />
                    <span>LEARNING_RATE: ADAPTIVE</span>
                    <span className="w-1 h-1 rounded-full bg-cyan-400" />
                    <span>EPOCHS: 4</span>
                </div>
            </motion.div>
        </div>

        {/* Detail Card Overlay */}
        <AnimatePresence>
            {selectedItem && (
                <DetailCard item={selectedItem} onClose={() => setSelectedSchoolId(null)} />
            )}
        </AnimatePresence>

        <InstructionOverlay />

      </main>
    </>
  );
}
