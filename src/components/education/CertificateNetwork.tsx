'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaGoogle, FaExternalLinkAlt, FaShieldAlt, FaNetworkWired } from 'react-icons/fa';

interface Certificate {
  id: string;
  title: string;
  date: string;
  image: string;
  link: string;
}

export default function CertificateNetwork() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const res = await fetch('/api/certificates');
        const data = await res.json();
        if (data.certificates) {
            setCertificates(data.certificates);
        }
      } catch (error) {
        console.error('Failed to load certificates node', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  if (loading) {
    return (
        <div className="w-full min-h-[400px] flex flex-col items-center justify-center font-mono text-cyan-500/50">
            <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mb-4" />
            <span className="animate-pulse">ESTABLISHING SECURE CONNECTION...</span>
            <span className="text-xs mt-2 opacity-50">HANDSHAKE::GOOGLE_DATA_CLOUD</span>
        </div>
    );
  }

  return (
    <section className="relative w-full py-20 px-4 md:px-10 z-20">
        {/* Section Header */}
        <div className="max-w-7xl mx-auto mb-12 border-b border-white/10 pb-6">
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-4"
            >
                <div className="p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                    <FaGoogle className="text-cyan-400 text-xl" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">
                        CERTIFIED <span className="text-cyan-400">COMPETENCIES</span>
                    </h2>
                    <div className="flex items-center gap-2 text-sm font-mono text-gray-400 mt-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span>LIVE_SYNC: SKILLS.GOOGLE</span>
                        <span className="text-gray-600">|</span>
                        <span>NODES: {certificates.length}</span>
                    </div>
                </div>
            </motion.div>
        </div>

        {/* Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((cert, index) => (
                <CertificateNode key={cert.id} cert={cert} index={index} />
            ))}
        </div>
    </section>
  );
}

function CertificateNode({ cert, index }: { cert: Certificate; index: number }) {
    return (
        <motion.a
            href={cert.link}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className="group relative block h-full"
        >
            <div className="absolute inset-0 bg-cyan-500/5 rounded-xl blur-xl group-hover:bg-cyan-500/10 transition-all duration-500" />
            
            <div className="relative h-full bg-[#0a0a0c] border border-white/10 group-hover:border-cyan-500/50 rounded-xl overflow-hidden transition-all duration-300 flex flex-col">
                {/* Top Decoration */}
                <div className="h-1 w-full bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-50 group-hover:opacity-100" />
                
                <div className="p-6 flex flex-col h-full">
                    {/* Badge Image */}
                    <div className="relative w-24 h-24 mb-6 mx-auto">
                        <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <img 
                            src={cert.image} 
                            alt={cert.title}
                            className="relative w-full h-full object-contain drop-shadow-[0_0_10px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:scale-110"
                        />
                    </div>

                    {/* Content */}
                    <div className="flex-1 text-center">
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors leading-snug">
                            {cert.title}
                        </h3>
                        <div className="text-xs font-mono text-gray-500 flex items-center justify-center gap-2 mb-4">
                            <FaShieldAlt className="text-cyan-500/50" size={10} />
                            <span>VERIFIED: {cert.date}</span>
                        </div>
                    </div>

                    {/* Footer / Action */}
                    <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center text-xs font-mono text-gray-400 group-hover:text-cyan-300 transition-colors">
                        <span>ID: {cert.id.substring(0, 8)}</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                            <span>VIEW_NODE</span>
                            <FaExternalLinkAlt size={10} />
                        </div>
                    </div>
                </div>

                {/* Hover Corner Accents */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500 opacity-0 group-hover:opacity-100 transition-all" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500 opacity-0 group-hover:opacity-100 transition-all" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500 opacity-0 group-hover:opacity-100 transition-all" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500 opacity-0 group-hover:opacity-100 transition-all" />
            </div>
        </motion.a>
    );
}


