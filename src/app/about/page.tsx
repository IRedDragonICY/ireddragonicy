'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CursorEffect from '@/components/CursorEffect';
import MindScene, { Certificate } from '@/components/about/DiffusionScene';
import CertificateModal from '@/components/about/CertificateModal';
import { 
  FaGraduationCap, 
  FaExpand,
  FaPaintBrush,
  FaBook,
  FaCode,
  FaBed
} from 'react-icons/fa';
import { SiCrunchyroll } from 'react-icons/si';
import { GiSushis, GiNoodles, GiCoffeeCup } from 'react-icons/gi';
import { BiLeaf } from 'react-icons/bi';
import { IconType } from 'react-icons';

// --- Types ---

export type NodeCategory = 'education' | 'hobby' | 'favorite';

export type AboutNode = {
  id: string;
  category: NodeCategory;
  title: string;
  subtitle?: string;
  period?: string;
  icon: IconType;
  emoji?: string;
  description: string;
  details?: { label: string; value: string }[];
  funFact?: string;
  locationUrl?: string;
  coordinates?: [number, number];
};

// --- Data ---

export const ABOUT_DATA: AboutNode[] = [
  // === EDUCATION ===
  {
    id: 'uad',
    category: 'education',
    title: 'Universitas Ahmad Dahlan',
    subtitle: 'Informatics (S1)',
    period: '2022 – 2028',
    icon: FaGraduationCap,
    description: "Currently pursuing a degree in Informatics with a focus on Artificial Intelligence. Specializing in deep learning, computer vision, and generative models.",
    details: [
      { label: 'Year', value: '3 of 4' },
      { label: 'GPA', value: '3.92' },
    ],
    locationUrl: "https://www.google.com/maps/place/Universitas+Ahmad+Dahlan+Kampus+4/@-7.816685,110.364854,14z",
    coordinates: [-7.834653, 110.383265]
  },
  {
    id: 'ump',
    category: 'education',
    title: 'Universiti Malaysia Pahang',
    subtitle: 'Software Engineering (Exchange)',
    period: 'Oct 2024 – Feb 2025',
    icon: FaGraduationCap,
    description: "International exchange program as an AIMS Scholar, focusing on large-scale software systems and cross-cultural engineering practices.",
    details: [
      { label: 'Duration', value: '1 Semester' },
      { label: 'Program', value: 'AIMS' },
    ],
    locationUrl: "https://www.google.com/maps/place/Universiti+Malaysia+Pahang+Al-Sultan+Abdullah/@3.5394047,103.4247824,16z",
    coordinates: [3.5436412, 103.4288926]
  },
  {
    id: 'cmb',
    category: 'education',
    title: 'SMA Cahaya Madani Banten',
    subtitle: 'Science (IPA)',
    period: '2019 – 2022',
    icon: FaGraduationCap,
    description: "Boarding school with rigorous STEM foundation. Built discipline and academic excellence in an intensive learning environment.",
    details: [
      { label: 'Focus', value: 'STEM' },
      { label: 'Rank', value: 'Top 5%' },
    ],
    locationUrl: "https://www.google.com/maps/place/SMAN+CMBBS/@-6.3163042,106.0765858,17z",
    coordinates: [-6.3163042, 106.0791607]
  },

  // === HOBBIES ===
  {
    id: 'drawing',
    category: 'hobby',
    title: 'Drawing',
    icon: FaPaintBrush,
    emoji: '🎨',
    description: "Love sketching characters and creating digital art. It's my way of bringing imagination to life on canvas.",
    funFact: "Started doodling in math class... now it's a legit hobby!"
  },
  {
    id: 'reading',
    category: 'hobby',
    title: 'Reading',
    icon: FaBook,
    emoji: '📚',
    description: "From tech articles to light novels, reading keeps my mind sharp and imagination running wild.",
    funFact: "Can finish a light novel in one sitting if it's good enough"
  },
  {
    id: 'anime',
    category: 'hobby',
    title: 'Watching Anime',
    icon: SiCrunchyroll,
    emoji: '🍿',
    description: "A certified weeb. Always up to date with seasonal anime and has a MAL list longer than my assignment deadlines.",
    funFact: "My watch list is longer than my to-do list... and I'm okay with that"
  },
  {
    id: 'coding',
    category: 'hobby',
    title: 'Recreational Coding',
    icon: FaCode,
    emoji: '💻',
    description: "When I'm not coding for work, I'm coding for fun. Building random side projects at 2 AM is my idea of a good time.",
    funFact: "Yes, I code for work AND for fun. No, I don't need help."
  },
  {
    id: 'sleeping',
    category: 'hobby',
    title: 'Sleeping',
    icon: FaBed,
    emoji: '😴',
    description: "A highly underrated skill that I've mastered over years of practice. Can nap anywhere, anytime.",
    funFact: "Professional power-napper. My personal best: falling asleep in 47 seconds."
  },

  // === FAVORITES (Food & Drinks) ===
  {
    id: 'sushi',
    category: 'favorite',
    title: 'Sushi',
    icon: GiSushis,
    emoji: '🍣',
    description: "Fresh, elegant, and always satisfying. Salmon sashimi is the ultimate comfort food.",
    funFact: "I judge a city by the quality of its sushi restaurants"
  },
  {
    id: 'sashimi',
    category: 'favorite',
    title: 'Sashimi',
    icon: GiSushis,
    emoji: '🐟',
    description: "Pure, unadulterated fish. No rice, no distractions—just premium slices of ocean goodness.",
    funFact: "Salmon > Tuna. Fight me."
  },
  {
    id: 'indomie',
    category: 'favorite',
    title: 'Indomie Goreng',
    icon: GiNoodles,
    emoji: '🍜',
    description: "The national treasure of Indonesia. Simple, affordable, and impossibly delicious at any hour.",
    funFact: "Best served at 2 AM after a coding session. It's a ritual."
  },
  {
    id: 'matcha',
    category: 'favorite',
    title: 'Matcha',
    icon: BiLeaf,
    emoji: '🍵',
    description: "Earthy, smooth, and the perfect balance of caffeine and calm. My go-to for focused work sessions.",
    funFact: "Matcha latte with oat milk = productivity potion"
  },
  {
    id: 'cappuccino',
    category: 'favorite',
    title: 'Cappuccino',
    icon: GiCoffeeCup,
    emoji: '☕',
    description: "The classic morning ritual. Perfectly balanced espresso with velvety microfoam.",
    funFact: "One cup to wake up, second cup to feel alive"
  },
];

// --- Helper Functions ---

const getCategoryLabel = (category: NodeCategory): string => {
  switch (category) {
    case 'education': return 'Education';
    case 'hobby': return 'Hobby';
    case 'favorite': return 'Favorite';
    default: return category;
  }
};

// --- Components ---

const DetailCard = ({ item, onClose }: { item: AboutNode; onClose: () => void }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="fixed right-4 md:right-10 top-32 md:top-40 w-full max-w-md z-50 pointer-events-auto"
        >
            <div className="bg-card border border-card-border overflow-hidden flex flex-col shadow-lg relative rounded-lg">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted"
                >
                    <span className="text-lg">×</span>
                </button>

                {/* Header */}
                <div className="p-6 border-b border-card-border">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 border border-card-border text-muted-foreground bg-background rounded">
                            {item.emoji ? (
                                <span className="text-base">{item.emoji}</span>
                            ) : (
                                <item.icon size={16} />
                            )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                            {getCategoryLabel(item.category)}
                        </span>
                    </div>
                    <h2 className="text-xl font-semibold text-foreground leading-tight">{item.title}</h2>
                    {item.subtitle && <p className="text-sm text-muted-foreground mt-1">{item.subtitle}</p>}
                    {item.period && <p className="text-xs text-muted-foreground mt-1">{item.period}</p>}
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    {/* Stats/Details */}
                    {item.details && item.details.length > 0 && (
                        <div className="grid grid-cols-2 gap-3">
                            {item.details.map((detail, i) => (
                                <div key={i} className="bg-background border border-card-border p-3 rounded text-center">
                                    <div className="text-xs text-muted-foreground mb-1">{detail.label}</div>
                                    <div className="text-lg font-semibold text-foreground">{detail.value}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Description */}
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {item.description}
                        </p>
                    </div>

                    {/* Fun Fact */}
                    {item.funFact && (
                        <div className="border-l-2 border-card-border pl-4">
                            <p className="text-sm text-muted-foreground italic">"{item.funFact}"</p>
                        </div>
                    )}

                    {/* Map (for education) */}
                    {item.coordinates && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-foreground">Location</h3>
                                <a 
                                    href={item.locationUrl}
                                    target="_blank"
                                    rel="noopener noreferrer" 
                                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                                >
                                    Open in Maps <FaExpand size={10} />
                                </a>
                            </div>
                            
                            <div className="relative w-full h-32 border border-card-border overflow-hidden rounded [filter:var(--map-filter)]">
                                <iframe
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                    scrolling="no"
                                    marginHeight={0}
                                    marginWidth={0}
                                    src={`https://maps.google.com/maps?q=${item.coordinates[0]},${item.coordinates[1]}&hl=en&z=16&output=embed`}
                                    style={{ pointerEvents: 'none' }} 
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default function AboutPage() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [certLoading, setCertLoading] = useState(true);
  const [theme, setTheme] = useState('dark');
  
  const selectedItem = ABOUT_DATA.find(e => e.id === selectedNodeId);

  // Theme Detection
  useEffect(() => {
    const updateTheme = () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      setTheme(currentTheme);
    };

    updateTheme();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          updateTheme();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    return () => observer.disconnect();
  }, []);

  // Fetch Certificates
  useEffect(() => {
    async function fetchCerts() {
        try {
            const res = await fetch('/api/certificates');
            if (!res.ok) throw new Error('Network response was not ok');
            const data = await res.json();
            if (data.certificates) {
                setCertificates(data.certificates);
            }
        } catch (e) {
            console.error("Failed to fetch certificates", e);
        } finally {
            setCertLoading(false);
        }
    }
    fetchCerts();
  }, []);

  return (
    <>
      <style jsx global>{`
        body {
            background-color: var(--background);
            overflow: hidden;
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: var(--muted);
            border-radius: 2px;
        }
      `}</style>

      <CursorEffect />
      
      <main className="relative w-full h-screen bg-background transition-colors duration-500">
        
        {/* 3D Scene Fullscreen */}
        <div className="absolute inset-0 z-0">
            <MindScene 
                aboutData={ABOUT_DATA}
                onNodeSelect={(data) => setSelectedNodeId(data?.id || null)}
                onCertificateSelect={setSelectedCertificate}
                certificates={certificates}
                theme={theme}
            />
        </div>

        {/* HUD / Title */}
        <div className="absolute top-32 left-8 md:left-16 z-20 pointer-events-none">
            <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1 }}
            >
                <p className="text-xs text-muted-foreground mb-4 tracking-wide">Get to know me</p>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[0.9]">
                    Inside <br />
                    <span className="text-muted-foreground">
                        My Mind
                    </span>
                </h1>
                
                {/* Stats Panel */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-8 p-4 bg-card/80 border border-card-border inline-flex flex-col gap-3 pointer-events-auto backdrop-blur-md rounded-lg"
                >
                    <div className="flex items-center justify-between w-48">
                        <span className="text-sm text-muted-foreground">Certificates</span>
                        <span className="text-2xl font-semibold text-foreground">
                            {certLoading ? '...' : certificates.length}
                        </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                        Click on nodes to explore
                    </div>
                </motion.div>
            </motion.div>
        </div>

        {/* Detail Card Overlay */}
        <AnimatePresence>
            {selectedItem && (
                <DetailCard item={selectedItem} onClose={() => setSelectedNodeId(null)} />
            )}
        </AnimatePresence>

        {/* Certificate Modal Overlay */}
        <AnimatePresence>
            {selectedCertificate && (
                <CertificateModal 
                    certificate={selectedCertificate} 
                    onClose={() => setSelectedCertificate(null)} 
                />
            )}
        </AnimatePresence>

        {/* Instruction Overlay */}
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 pointer-events-none text-center z-30"
        >
             <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Drag to rotate</span>
                <span className="w-1 h-1 bg-muted-foreground/50 rounded-full" />
                <span>Right-click to pan</span>
                <span className="w-1 h-1 bg-muted-foreground/50 rounded-full" />
                <span>Scroll to zoom</span>
             </div>
        </motion.div>

      </main>
    </>
  );
}
