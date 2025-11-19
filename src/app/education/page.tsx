'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '@/components/Navigation';
import CursorEffect from '@/components/CursorEffect';
import DiffusionScene, { Certificate } from '@/components/education/DiffusionScene';
import CertificateModal from '@/components/education/CertificateModal';
import { FaNetworkWired, FaServer, FaMicrochip, FaCodeBranch, FaMapMarkerAlt, FaExpand } from 'react-icons/fa';
import { BsGpuCard } from 'react-icons/bs';
import { IconType } from 'react-icons';

// --- Types ---

type EducationItem = {
  id: string;
  institution: string;
  program?: string;
  period: string;
  status: string;
  highlight?: string;
  icon: IconType;
  stats: { label: string; value: string }[];
  description?: string;
  logs: string[];
  locationUrl?: string;
  coordinates?: [number, number]; // [Lat, Lng]
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
    ],
    locationUrl: "https://www.google.com/maps/place/Universitas+Ahmad+Dahlan+Kampus+4/@-7.816685,110.364854,14z/data=!4m10!1m2!2m1!1suad!3m6!1s0x2e7a5701a2ae1c23:0x173dbeeddc56d9e!8m2!3d-7.834653!4d110.383265",
    coordinates: [-7.834653, 110.383265]
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
    ],
    locationUrl: "https://www.google.com/maps/place/Universiti+Malaysia+Pahang+Al-Sultan+Abdullah/@3.5394047,103.4247824,16z/data=!4m10!1m2!2m1!1sumpsa+pekan!3m6!1s0x31cf513f26ae4061:0x1932c42255a897a0!8m2!3d3.5436412!4d103.4288926",
    coordinates: [3.5436412, 103.4288926]
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
    ],
    locationUrl: "https://www.google.com/maps/place/SMAN+CMBBS/@-6.3163042,106.0765858,17z/data=!3m1!4b1!4m6!3m5!1s0x2e42232df0bc2da3:0x1a2fb7318af034be!8m2!3d-6.3163042!4d106.0791607",
    coordinates: [-6.3163042, 106.0791607]
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
    ],
    locationUrl: "https://www.google.com/maps/place/SMPN+8+South+Tangerang/@-6.3442805,106.6653493,16.09z/data=!4m6!3m5!1s0x2e69e5b2a46c03f9:0x7a18672b42b8c1da!8m2!3d-6.3444022!4d106.672669",
    coordinates: [-6.3444022, 106.672669]
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
            <div className="h-full bg-[#050507]/95 backdrop-blur-2xl border border-cyan-500/30 rounded-2xl overflow-hidden flex flex-col shadow-2xl relative group">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-10 flex items-center gap-1 bg-black/20 px-2 py-1 rounded border border-white/10 hover:bg-red-500/20 hover:border-red-500/50"
                >
                    <span className="text-[10px] font-mono">CLOSE</span>
                    <span className="text-xs">✕</span>
                </button>

                {/* Header */}
                <div className="p-6 border-b border-white/10 bg-gradient-to-r from-cyan-900/20 to-transparent relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
                    
                    <div className="flex items-center gap-3 mb-2 relative z-10">
                        <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20 text-cyan-400">
                            <item.icon size={20} />
                        </div>
                        <span className="text-xs font-mono text-cyan-400 tracking-widest uppercase">{item.status}</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white leading-tight relative z-10">{item.institution}</h2>
                    {item.program && <p className="text-sm text-purple-300 mt-1 font-mono relative z-10">{item.program}</p>}
                </div>

                {/* Content Scroll */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                    {/* Stats */}
                    {item.stats.length > 0 && (
                        <div className="grid grid-cols-3 gap-3">
                            {item.stats.map((stat, i) => (
                                <div key={i} className="bg-black/40 rounded p-3 border border-white/5 text-center hover:border-cyan-500/30 transition-colors group/stat">
                                    <div className="text-[10px] text-gray-500 font-mono uppercase tracking-wider mb-1 group-hover/stat:text-cyan-400 transition-colors">{stat.label}</div>
                                    <div className="text-lg font-bold text-white">{stat.value}</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Description */}
                    <div className="space-y-2">
                        <h3 className="text-xs font-mono text-gray-500 uppercase flex items-center gap-2">
                            <span className="w-1 h-1 bg-cyan-500 rounded-full" />
                            /Description
                        </h3>
                        <p className="text-sm text-gray-300 leading-relaxed border-l-2 border-cyan-500/30 pl-4">
                            {item.description}
                        </p>
                    </div>

                    {/* Interactive Map Embed */}
                    {item.coordinates && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-mono text-gray-500 uppercase flex items-center gap-2">
                                    <span className="w-1 h-1 bg-cyan-500 rounded-full" />
                                    /Geolocation_Lock
                                </h3>
                                <a 
                                    href={item.locationUrl}
                                    target="_blank"
                                    rel="noopener noreferrer" 
                                    className="text-[10px] text-cyan-500 hover:underline flex items-center gap-1"
                                >
                                    OPEN_SATELLITE <FaExpand size={10} />
                                </a>
                            </div>
                            
                            <div className="relative w-full h-48 rounded-lg overflow-hidden border border-white/10 group/map">
                                {/* Scanning Overlay */}
                                <div className="absolute inset-0 z-10 pointer-events-none bg-[linear-gradient(rgba(0,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] opacity-50" />
                                <div className="absolute top-0 left-0 right-0 h-1 bg-cyan-500/50 z-10 animate-scan-line" />
                                
                                {/* Map Iframe */}
                                <iframe
                                    width="100%"
                                    height="100%"
                                    frameBorder="0"
                                    scrolling="no"
                                    marginHeight={0}
                                    marginWidth={0}
                                    src={`https://maps.google.com/maps?q=${item.coordinates[0]},${item.coordinates[1]}&hl=en&z=16&output=embed`}
                                    className="filter grayscale contrast-125 brightness-75 invert-[.9] hue-rotate-180"
                                    style={{ pointerEvents: 'none' }} // Prevent interaction hijacking scroll
                                />
                                
                                {/* Map UI Overlay (Fake UI) */}
                                <div className="absolute bottom-2 left-2 z-20 flex items-center gap-2">
                                    <div className="px-2 py-1 bg-black/80 border border-cyan-500/30 rounded text-[8px] font-mono text-cyan-400">
                                        LAT: {item.coordinates[0].toFixed(4)}
                                    </div>
                                    <div className="px-2 py-1 bg-black/80 border border-cyan-500/30 rounded text-[8px] font-mono text-cyan-400">
                                        LNG: {item.coordinates[1].toFixed(4)}
                                    </div>
                                </div>
                                
                                {/* Interaction Blocker/Enabler */}
                                <a 
                                    href={item.locationUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute inset-0 z-30 bg-transparent hover:bg-cyan-500/5 transition-colors cursor-crosshair"
                                    title="Click to open in Google Maps"
                                />
                            </div>
                        </div>
                    )}

                    {/* System Logs */}
                    <div className="space-y-2">
                        <h3 className="text-xs font-mono text-gray-500 uppercase flex items-center gap-2">
                            <span className="w-1 h-1 bg-green-500 rounded-full" />
                            /System_Logs
                        </h3>
                        <div className="bg-black rounded p-4 font-mono text-xs text-green-500/80 space-y-2 border border-white/10 shadow-inner">
                            {item.logs.map((log, i) => (
                                <div key={i} className="truncate flex gap-2">
                                    <span className="opacity-30">{(i + 1).toString().padStart(2, '0')}</span>
                                    <span>{log}</span>
                                </div>
                            ))}
                            <div className="flex items-center gap-2 opacity-50">
                                <span className="opacity-30">0{item.logs.length + 1}</span>
                                <div className="w-2 h-4 bg-green-500/50 animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 bg-black/20 text-[10px] font-mono text-gray-500 flex justify-between">
                    <span>ID: {item.id.toUpperCase()}</span>
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span>SYNCED</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default function EducationPage() {
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [certLoading, setCertLoading] = useState(true);
  
  const selectedItem = educationData.find(e => e.id === selectedSchoolId);

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
            background-color: #030305;
            overflow: hidden;
        }
        .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(0,0,0,0.2);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(34,211,238,0.2);
            border-radius: 2px;
        }
        @keyframes scan-line {
            0% { top: 0%; opacity: 0; }
            50% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
        .animate-scan-line {
            animation: scan-line 3s linear infinite;
        }
      `}</style>

      <CursorEffect />
      <Navigation personalInfo={personalInfo} />
      
      <main className="relative w-full h-screen">
        
        {/* 3D Scene Fullscreen */}
        <div className="absolute inset-0 z-0">
            <DiffusionScene 
                onSchoolSelect={(data: any) => setSelectedSchoolId(data?.id)}
                onCertificateSelect={setSelectedCertificate}
                certificates={certificates}
            />
        </div>

        {/* HUD / Title */}
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
                
                {/* Certificate Stats */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-6 p-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-lg inline-flex items-center gap-4 pointer-events-auto"
                >
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-mono uppercase">Certificates</span>
                        <span className="text-xl font-bold text-white">
                            {certLoading ? '...' : certificates.length}
                        </span>
                    </div>
                    <div className="h-8 w-px bg-white/10" />
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-400 font-mono uppercase">Source</span>
                        <span className="text-xs text-green-400 font-mono flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            GOOGLE.SKILLS
                        </span>
                    </div>
                </motion.div>
            </motion.div>
        </div>

        {/* Detail Card Overlay (School) */}
        <AnimatePresence>
            {selectedItem && (
                <DetailCard item={selectedItem} onClose={() => setSelectedSchoolId(null)} />
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
             <div className="text-[10px] font-mono text-cyan-500/50 tracking-widest mb-1">NAVIGATION CONTROL</div>
             <div className="flex items-center gap-4 text-xs text-gray-500 font-mono">
                <span>LMB: ROTATE</span>
                <span>RMB: PAN</span>
                <span>SCROLL: ZOOM</span>
             </div>
        </motion.div>

      </main>
    </>
  );
}
