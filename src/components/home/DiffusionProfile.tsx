'use client';

import React, { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { FaBrain, FaMicrochip, FaNetworkWired, FaFingerprint } from 'react-icons/fa';

const DiffusionProfile = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: false, amount: 0.2 });
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);

  return (
    <section className="relative py-32 px-4 overflow-hidden border-t border-white/5 bg-[#050505]" ref={containerRef}>
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header - Technical Style */}
        <div className="mb-24 flex flex-col items-start border-l-2 border-white/10 pl-8">
          <motion.span 
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            className="text-[10px] font-mono uppercase tracking-[0.4em] text-gray-500 mb-2"
          >
            // Entity_Configuration
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold text-white tracking-tighter uppercase"
          >
            Researcher <span className="text-gray-500">Profile</span>
          </motion.h2>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          
          {/* Left Column: "Model Card" Stats */}
          <motion.div 
            style={{ y }}
            className="lg:col-span-4 space-y-6"
          >
            <div className="p-px bg-white/10">
              <div className="bg-[#080808] p-6">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
                  <div className="w-12 h-12 bg-white/5 flex items-center justify-center border border-white/10">
                    <FaFingerprint className="text-xl text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white font-mono uppercase tracking-wider">Identity_Core</h3>
                    <p className="text-[10px] text-gray-500 font-mono">ID: IRedDragonICY</p>
                  </div>
                </div>

                <div className="space-y-4 font-mono text-[10px] tracking-widest uppercase">
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-gray-600">ROLE</span>
                    <span className="text-white">AI Research Scientist</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-gray-600">VERSION</span>
                    <span className="text-white">v2.4.0 (Stable)</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-white/5 pb-2">
                    <span className="text-gray-600">ARCH</span>
                    <span className="text-white">Transformer</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">STATUS</span>
                    <span className="text-green-500 flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                      Online
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Competency Radar (Stylized) */}
            <div className="bg-[#080808] p-6 border border-white/10 relative overflow-hidden group">
              <h4 className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-6">Parametric_Optimization</h4>
              <div className="space-y-4">
                {[
                  { label: "Deep Learning", val: 95 },
                  { label: "Computer Vision", val: 92 },
                  { label: "NLP / LLMs", val: 88 },
                  { label: "System Arch", val: 85 }
                ].map((stat, i) => (
                  <div key={i} className="group/bar">
                    <div className="flex justify-between text-[10px] mb-1 text-gray-400 font-mono">
                      <span>{stat.label}</span>
                      <span>{stat.val}%</span>
                    </div>
                    <div className="h-0.5 bg-white/10 w-full">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${stat.val}%` }}
                        transition={{ duration: 1.5, delay: 0.5 + i * 0.1, ease: "circOut" }}
                        className="h-full bg-white" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column: Bio & Vision */}
          <div className="lg:col-span-8 space-y-12">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <h3 className="text-2xl md:text-4xl font-light text-white mb-8 leading-tight">
                Architecting the <span className="font-bold border-b border-white/20 pb-1">Latent Space</span> of Future Intelligence.
              </h3>
              <p className="text-gray-400 text-lg leading-relaxed font-light max-w-3xl border-l border-white/10 pl-6">
                Specializing in the intersection of generative AI and practical application. My research focuses on optimizing diffusion models for real-time inference and designing transformer architectures that bridge the gap between theoretical capability and deployed utility.
              </p>
            </motion.div>

            {/* 3-Column Features - Minimalist Cards */}
            <div className="grid md:grid-cols-3 gap-px bg-white/10 border border-white/10">
              {[
                {
                  icon: FaBrain,
                  title: "Neural Arch",
                  desc: "Custom attention mechanisms."
                },
                {
                  icon: FaNetworkWired,
                  title: "Distributed Ops",
                  desc: "Multi-node cluster orchestration."
                },
                {
                  icon: FaMicrochip,
                  title: "Edge Inference",
                  desc: "Quantization & mobile deployment."
                }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  className="bg-[#050505] p-8 hover:bg-[#0A0A0A] transition-colors duration-300 group relative"
                >
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-gray-600">
                    0{idx + 1}
                  </div>
                  <feature.icon className="text-2xl text-gray-600 group-hover:text-white transition-colors mb-6" />
                  <h4 className="text-white font-bold uppercase text-sm tracking-wider mb-3">{feature.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed font-mono">
                    {feature.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default DiffusionProfile;
