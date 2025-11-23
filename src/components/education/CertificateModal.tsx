'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaGoogle, FaShieldAlt, FaServer, FaExternalLinkAlt, FaCheckCircle, FaTimes } from 'react-icons/fa';

interface Certificate {
  id: string;
  title: string;
  date: string;
  image: string;
  link: string;
}

interface Props {
  certificate: Certificate;
  onClose: () => void;
}

const CertificateModal: React.FC<Props> = ({ certificate, onClose }) => {
  const [scanProgress, setScanProgress] = useState(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  // Simulate scanning process
  useEffect(() => {
    setTerminalLogs([]);
    setScanProgress(0);

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    // Log sequence
    const logs = [
        "Initiating handshake with Google Trust Services...",
        `Decrypting certificate bundle: ${certificate.id?.substring(0, 8) || 'UNKNOWN'}...`,
        "Verifying issuer signature... [VALID]",
        "Extracting skill embeddings...",
        "Mapping competency vectors...",
        "Verification complete."
    ];

    let logIndex = 0;
    const logInterval = setInterval(() => {
        if (logIndex >= logs.length) {
            clearInterval(logInterval);
            return;
        }
        const currentLog = logs[logIndex];
        if (currentLog) {
            setTerminalLogs(prev => [...prev, currentLog]);
        }
        logIndex++;
    }, 500);

    return () => {
        clearInterval(interval);
        clearInterval(logInterval);
    };
  }, [certificate]);

  // Extract keywords for "Skills"
  const getSkills = (title: string) => {
    const keywords = ['Cloud', 'API', 'Management', 'Security', 'Network', 'Compute', 'Data', 'Infrastructure', 'Development'];
    return keywords.filter(k => title.includes(k)).concat(['Google Cloud Platform']);
  };

  const skills = getSkills(certificate.title);

  return (
    <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
    >
        <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-4xl bg-[#0a0a0c] border border-cyan-500/30 rounded-xl overflow-hidden shadow-[0_0_50px_rgba(34,211,238,0.15)] flex flex-col md:flex-row"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Close Button */}
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 border border-white/10 text-gray-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/50 transition-all"
            >
                <FaTimes size={14} />
            </button>

            {/* Left: Visual/Image Section */}
            <div className="w-full md:w-2/5 bg-black relative overflow-hidden group border-b md:border-b-0 md:border-r border-white/10 p-8 flex items-center justify-center">
                
                {/* Background Grid */}
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20" />
                
                {/* Scanning Beam */}
                <motion.div 
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent h-[20%] w-full z-10 pointer-events-none"
                    animate={{ top: ['-20%', '120%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />

                {/* The Certificate Image */}
                <div className="relative w-full aspect-[4/3] max-w-[300px]">
                     <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full" />
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     <img 
                        src={certificate.image} 
                        alt={certificate.title} 
                        className="relative z-10 w-full h-full object-contain drop-shadow-2xl"
                     />
                     
                     {/* Holo Borders */}
                     <div className="absolute -inset-2 border border-cyan-500/30 rounded-lg opacity-50" />
                     <div className="absolute -inset-2 border-x border-cyan-500/60 rounded-lg opacity-20 scale-105" />
                </div>

                {/* Status Overlay */}
                <div className="absolute bottom-4 left-0 right-0 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950/50 border border-cyan-500/30 rounded-full backdrop-blur-md">
                        {scanProgress < 100 ? (
                            <>
                                <div className="w-2 h-2 bg-cyan-500 animate-ping rounded-full" />
                                <span className="text-[10px] font-mono text-cyan-400 tracking-widest">SCANNING... {scanProgress}%</span>
                            </>
                        ) : (
                            <>
                                <FaCheckCircle className="text-green-500 text-xs" />
                                <span className="text-[10px] font-mono text-green-400 tracking-widest">VERIFIED_ASSET</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Right: Data/Analysis Section */}
            <div className="flex-1 bg-[#050507] p-6 md:p-8 flex flex-col">
                
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <FaGoogle className="text-gray-400 text-xl" />
                        <div className="h-4 w-px bg-white/10" />
                        <span className="text-[10px] font-mono text-cyan-500 uppercase tracking-wider border border-cyan-500/20 px-2 py-0.5 rounded">
                            Google Cloud Certified
                        </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-2">
                        {certificate.title}
                    </h2>
                    <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
                         <span className="flex items-center gap-1.5">
                            <FaShieldAlt className="text-cyan-500/70" />
                            ID: {certificate.id.substring(0,12)}...
                         </span>
                         <span>•</span>
                         <span>ISSUED: {certificate.date}</span>
                    </div>
                </div>

                {/* Competency Matrix */}
                <div className="flex-1 space-y-6">
                    
                    {/* Skills Analysis */}
                    <div>
                        <h3 className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <span className="w-1 h-1 bg-cyan-500 rounded-full" />
                            Competency_Vectors
                        </h3>
                        <div className="grid grid-cols-1 gap-3">
                            {skills.map((skill, i) => (
                                <div key={i} className="group">
                                    <div className="flex justify-between text-xs font-mono text-gray-400 mb-1 group-hover:text-white transition-colors">
                                        <span>{skill}</span>
                                        <span className="text-cyan-500">{(90 + Math.random() * 9).toFixed(1)}%</span>
                                    </div>
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${90 + Math.random() * 9}%` }}
                                            transition={{ delay: 0.5 + i * 0.1, duration: 1 }}
                                            className="h-full bg-gradient-to-r from-cyan-600 to-blue-500"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Terminal Output */}
                    <div className="bg-black/50 rounded-lg border border-white/5 p-3 font-mono text-[10px] h-32 overflow-y-auto custom-scrollbar relative">
                        <div className="absolute top-2 right-2 text-gray-600 opacity-50">
                            <FaServer />
                        </div>
                        <div className="space-y-1">
                            {terminalLogs.map((log, i) => (
                                log ? (
                                    <div key={i} className="flex gap-2">
                                        <span className="text-gray-600">[{new Date().toLocaleTimeString()}]</span>
                                        <span className={log.includes('VALID') ? 'text-green-400' : 'text-gray-400'}>
                                            {log}
                                        </span>
                                    </div>
                                ) : null
                            ))}
                            {terminalLogs.length === 6 && (
                                <div className="flex gap-2 animate-pulse">
                                    <span className="text-cyan-500">$</span>
                                    <span className="text-cyan-500">_</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                         <span className="text-[9px] text-gray-500 font-mono uppercase">Verification_Hash</span>
                         <span className="text-xs font-mono text-white truncate max-w-[150px] opacity-50">
                            0x{Array.from({length: 16}, () => Math.floor(Math.random()*16).toString(16)).join('')}
                         </span>
                    </div>
                    
                    <a 
                        href={certificate.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase tracking-wider rounded transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.5)]"
                    >
                        Verify Credential
                        <FaExternalLinkAlt />
                    </a>
                </div>

            </div>
        </motion.div>
    </motion.div>
  );
};

export default CertificateModal;

