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
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section className="relative py-32 px-4 overflow-hidden" ref={containerRef}>
      {/* Decorative Background Gradients */}
      <div className="absolute top-1/2 left-0 w-1/3 h-1/2 bg-cyan-500/5 blur-[120px] rounded-full -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-1/3 h-1/2 bg-purple-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header - Agency Style */}
        <div className="mb-20 flex flex-col items-center">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="text-[10px] font-mono uppercase tracking-[0.4em] text-cyan-500 mb-4"
          >
            // Model Architecture
          </motion.span>
          <motion.h2 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="text-4xl md:text-6xl font-bold text-white text-center tracking-tight"
          >
            Researcher <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Profile</span>
          </motion.h2>
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent mt-8" />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          
          {/* Left Column: "Model Card" Stats */}
          <motion.div 
            style={{ y }}
            className="lg:col-span-4 space-y-6"
          >
            <div className="p-1 rounded-2xl bg-gradient-to-b from-white/10 to-white/0">
              <div className="bg-[#050505] rounded-xl p-6 border border-white/5 backdrop-blur-xl">
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/5">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center border border-cyan-500/30">
                    <FaFingerprint className="text-xl text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">System Identity</h3>
                    <p className="text-xs text-gray-500 font-mono">ID: IRedDragonICY</p>
                  </div>
                </div>

                <div className="space-y-4 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">ROLE</span>
                    <span className="text-cyan-300">AI Research Scientist</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">VERSION</span>
                    <span className="text-purple-300">v2.4.0 (Stable)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">ARCHITECTURE</span>
                    <span className="text-green-300">Transformer-based</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">STATUS</span>
                    <span className="text-white flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      Online
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Competency Radar (Stylized) */}
            <div className="bg-[#050505] rounded-xl p-6 border border-white/5 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <h4 className="text-xs font-mono uppercase tracking-widest text-gray-500 mb-4">Core_Parameters</h4>
              <div className="space-y-3">
                {[
                  { label: "Deep Learning", val: 95 },
                  { label: "Computer Vision", val: 92 },
                  { label: "NLP / LLMs", val: 88 },
                  { label: "System Arch", val: 85 }
                ].map((stat, i) => (
                  <div key={i} className="group/bar">
                    <div className="flex justify-between text-[10px] mb-1 text-gray-400 group-hover/bar:text-white transition-colors">
                      <span>{stat.label}</span>
                      <span>{stat.val}%</span>
                    </div>
                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${stat.val}%` }}
                        transition={{ duration: 1.5, delay: 0.5 + i * 0.1, ease: "circOut" }}
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-500" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column: Bio & Vision */}
          <div className="lg:col-span-8 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <h3 className="text-2xl md:text-3xl font-light text-white mb-6 leading-tight">
                Architecting the <span className="text-cyan-400 font-normal">Latent Space</span> of Future Intelligence.
              </h3>
              <p className="text-gray-400 text-lg leading-relaxed font-light max-w-2xl">
                Specializing in the intersection of generative AI and practical application. My research focuses on optimizing diffusion models for real-time inference and designing transformer architectures that bridge the gap between theoretical capability and deployed utility.
              </p>
            </motion.div>

            {/* 3-Column Features */}
            <div className="grid md:grid-cols-3 gap-6 pt-8">
              {[
                {
                  icon: FaBrain,
                  title: "Neural Arch",
                  desc: "Designing custom attention mechanisms for efficient scaling."
                },
                {
                  icon: FaNetworkWired,
                  title: "Distributed Ops",
                  desc: "Orchestrating large-scale training on multi-node clusters."
                },
                {
                  icon: FaMicrochip,
                  title: "Edge Inference",
                  desc: "Quantization & pruning for mobile deployment."
                }
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  className="p-6 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors duration-300 group"
                >
                  <feature.icon className="text-2xl text-gray-600 group-hover:text-cyan-400 transition-colors mb-4" />
                  <h4 className="text-white font-medium mb-2">{feature.title}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">
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

