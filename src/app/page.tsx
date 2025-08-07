// app/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { FaPython, FaReact, FaNodeJs, FaDocker, FaGitAlt, FaGithub, FaLinkedin, FaBrain } from 'react-icons/fa';
import { SiTypescript, SiTailwindcss, SiNextdotjs, SiTensorflow, SiPytorch, SiScikitlearn, SiJupyter, SiPostgresql, SiOpenai, SiHuggingface } from 'react-icons/si';
import { FiExternalLink, FiCode } from 'react-icons/fi';
import { HiOutlineMail, HiSparkles } from 'react-icons/hi';
import { IoClose } from 'react-icons/io5';
import Hero from '@/components/Hero';
import LoadingScreen from '@/components/LoadingScreen';
import Navigation from '@/components/Navigation';
import CursorEffect from '@/components/CursorEffect';

const portfolioData = {
  personalInfo: {
    name: "Mohammad Farid Hendianto",
    alias: "IRedDragonICY",
    dreamJob: "AI Research Scientist",
    bio: "Pioneering the intersection of artificial intelligence and scientific discovery. Specializing in deep learning, neural architectures, and generative AI models to solve complex real-world problems.",
    email: "mohammad.farid@example.com",
  },
  socials: [
    { name: 'GitHub', url: 'https://github.com', icon: FaGithub },
    { name: 'LinkedIn', url: 'https://linkedin.com', icon: FaLinkedin },
    { name: 'HuggingFace', url: 'https://huggingface.co', icon: SiHuggingface },
  ],
  skills: [
    {
      category: 'AI & Machine Learning',
      items: [
        { name: 'TensorFlow', icon: SiTensorflow },
        { name: 'PyTorch', icon: SiPytorch },
        { name: 'Scikit-learn', icon: SiScikitlearn },
        { name: 'OpenAI', icon: SiOpenai },
        { name: 'HuggingFace', icon: SiHuggingface }
      ]
    },
    {
      category: 'Programming',
      items: [
        { name: 'Python', icon: FaPython },
        { name: 'TypeScript', icon: SiTypescript },
        { name: 'React', icon: FaReact },
        { name: 'Next.js', icon: SiNextdotjs },
        { name: 'Node.js', icon: FaNodeJs }
      ]
    },
    {
      category: 'Tools & Infrastructure',
      items: [
        { name: 'Docker', icon: FaDocker },
        { name: 'Git', icon: FaGitAlt },
        { name: 'Jupyter', icon: SiJupyter },
        { name: 'PostgreSQL', icon: SiPostgresql },
        { name: 'Tailwind', icon: SiTailwindcss }
      ]
    },
  ],
  projects: [
    {
      title: 'Neural Architecture Search System',
      description: 'Automated system for discovering optimal neural network architectures using evolutionary algorithms and reinforcement learning.',
      tech: ['PyTorch', 'AutoML', 'Ray', 'Optuna'],
      metrics: { accuracy: '97.8%', speedup: '3.2x' },
      live: '#',
      code: '#'
    },
    {
      title: 'Diffusion Model Framework',
      description: 'Custom implementation of stable diffusion with ControlNet for high-quality image generation and editing.',
      tech: ['Python', 'CUDA', 'Diffusers', 'Gradio'],
      metrics: { fid_score: '12.4', inference: '0.8s' },
      live: '#',
      code: '#'
    },
    {
      title: 'LLM Fine-tuning Pipeline',
      description: 'End-to-end pipeline for fine-tuning large language models with LoRA and QLoRA techniques.',
      tech: ['Transformers', 'PEFT', 'BitsAndBytes', 'Wandb'],
      metrics: { params: '7B', memory: '-75%' },
      live: '#',
      code: '#'
    },
    {
      title: 'Real-time Vision Transformer',
      description: 'Optimized Vision Transformer for real-time object detection and segmentation on edge devices.',
      tech: ['TensorRT', 'ONNX', 'OpenVINO', 'C++'],
      metrics: { fps: '60+', latency: '15ms' },
      live: '#',
      code: '#'
    },
  ],
  competencies: [
    { name: 'Deep Learning & Neural Networks', level: 95 },
    { name: 'Computer Vision & NLP', level: 92 },
    { name: 'Model Optimization & Deployment', level: 88 },
    { name: 'Research & Paper Implementation', level: 85 },
  ],
};

const Section = ({ children, id, title }: { children: React.ReactNode, id: string, title: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <motion.section
      id={id}
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="w-full max-w-6xl mx-auto py-16 md:py-24 px-4"
    >
      {/* AI-themed section header */}
      <div className="relative mb-12">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={isInView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent"
        />
        <h2 className="relative text-3xl md:text-4xl font-bold text-center">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
            &lt;{title}/&gt;
          </span>
          {/* Neural network decoration */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute -right-12 top-1/2 -translate-y-1/2 opacity-20"
          >
            <FaBrain className="text-4xl text-cyan-400" />
          </motion.div>
        </h2>
      </div>
      {children}
    </motion.section>
  );
};

const IntelProfile = () => {
    const competencyRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(competencyRef, { once: true, amount: 0.5 });

    return (
      <Section id="intel" title="AI_RESEARCHER_PROFILE">
        <div ref={competencyRef} className="grid md:grid-cols-2 gap-12 items-start">
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="relative p-6 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 rounded-xl border border-cyan-400/20">
              <HiSparkles className="absolute top-4 right-4 text-2xl text-yellow-400 animate-pulse" />
              <h3 className="text-xl font-semibold text-cyan-400 mb-4">AI SPECIALIST BRIEFING</h3>
              <p className="text-gray-300 leading-relaxed">
                Passionate about pushing the boundaries of artificial intelligence through innovative research and practical applications.
                Specializing in transformer architectures, diffusion models, and neural network optimization.
                My work focuses on making AI more efficient, accessible, and impactful for real-world applications.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {['Generative AI', 'Computer Vision', 'NLP', 'MLOps'].map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-cyan-400/10 text-cyan-400 text-xs rounded-full border border-cyan-400/20">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold text-cyan-400">CORE AI COMPETENCIES</h3>
            {portfolioData.competencies.map((comp, index) => (
              <motion.div
                key={comp.name}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-medium text-gray-200">{comp.name}</span>
                  <span className="text-xs font-mono text-cyan-400">{comp.level}%</span>
                </div>
                <div className="relative w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 rounded-full"
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${comp.level}%` } : {}}
                    transition={{ duration: 1, delay: 0.5 + index * 0.1, ease: 'easeOut' }}
                  />
                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{ x: ['0%', '300%'] }}
                    transition={{ duration: 2, delay: 1 + index * 0.1, repeat: Infinity, repeatDelay: 3 }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>
    );
};

const Projects = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { once: true, amount: 0.1 });

    return (
      <Section id="projects" title="AI_PROJECTS">
        <motion.div
          ref={containerRef}
          className="grid md:grid-cols-2 gap-8"
        >
          {portfolioData.projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.2 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="group relative p-6 rounded-xl bg-gradient-to-br from-gray-900 to-black border border-cyan-400/20 hover:border-cyan-400/40 transition-all duration-300"
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/0 to-purple-500/0 group-hover:from-cyan-500/10 group-hover:to-purple-500/10 transition-all duration-300" />

              <div className="relative">
                <h3 className="text-xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                  {project.title}
                </h3>
                <p className="text-gray-300 mb-4">{project.description}</p>

                {/* Metrics */}
                {project.metrics && (
                  <div className="flex gap-4 mb-4">
                    {Object.entries(project.metrics).map(([key, value]) => (
                      <div key={key} className="text-xs">
                        <span className="text-gray-500">{key}: </span>
                        <span className="text-cyan-400 font-mono font-bold">{value}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tech.map((t) => (
                    <span key={t} className="px-2.5 py-1 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-300 text-xs font-medium rounded-full border border-cyan-400/20">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-gray-800">
                  <a href={project.live} className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors">
                    <FiExternalLink /> Demo
                  </a>
                  <a href={project.code} className="flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors">
                    <FiCode /> Code
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Section>
    );
};

const Skills = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { once: true, amount: 0.2 });

    return (
      <Section id="skills" title="TECH_STACK">
        <div className="space-y-12">
          {portfolioData.skills.map((category, categoryIndex) => (
            <div key={category.category}>
              <motion.h3
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: categoryIndex * 0.2 }}
                className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 mb-6 text-center"
              >
                {category.category}
              </motion.h3>
              <motion.div
                ref={containerRef}
                className="flex flex-wrap justify-center gap-4"
              >
                {category.items.map((skill, index) => (
                  <motion.div
                    key={skill.name}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={isInView ? { scale: 1, rotate: 0 } : {}}
                    transition={{ delay: categoryIndex * 0.1 + index * 0.05, type: 'spring' }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="group relative"
                  >
                    <div className="relative p-4 w-32 h-32 flex flex-col items-center justify-center gap-3 rounded-xl bg-gradient-to-br from-gray-900 to-black border border-cyan-400/20 group-hover:border-cyan-400/40 transition-all duration-300">
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/0 to-purple-500/0 group-hover:from-cyan-500/10 group-hover:to-purple-500/10 transition-all duration-300" />
                      <skill.icon className="text-4xl text-gray-400 group-hover:text-cyan-400 transition-colors relative z-10" />
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors relative z-10">{skill.name}</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          ))}
        </div>
      </Section>
    );
};

const Contact = () => (
    <Section id="contact" title="CONNECT">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto"
        >
            <div className="p-8 rounded-2xl bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-pink-500/5 border border-cyan-400/20">
                <p className="text-lg mb-8 text-gray-300 leading-relaxed">
                    Ready to collaborate on cutting-edge AI research and innovative machine learning projects.
                    Let's push the boundaries of artificial intelligence together.
                </p>

                <motion.a
                    href={`mailto:${portfolioData.personalInfo.email}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl shadow-2xl shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-300"
                >
                    <HiOutlineMail className="text-2xl" />
                    <span>{portfolioData.personalInfo.email}</span>
                </motion.a>

                <div className="flex justify-center gap-6 mt-12">
                    {portfolioData.socials.map((social) => (
                        <motion.a
                            key={social.name}
                            href={social.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            whileHover={{ scale: 1.2, rotate: 5 }}
                            whileTap={{ scale: 0.9 }}
                            className="p-3 bg-gray-900 rounded-xl border border-gray-800 hover:border-cyan-400/40 hover:bg-gradient-to-br hover:from-cyan-500/10 hover:to-purple-500/10 transition-all duration-300"
                        >
                            <social.icon className="text-2xl text-gray-400 hover:text-cyan-400" />
                        </motion.a>
                    ))}
                </div>
            </div>
        </motion.div>
    </Section>
);

const Footer = () => (
    <footer className="relative w-full py-8 border-t border-cyan-400/10">
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 to-transparent" />
        <div className="relative text-center">
            <p className="text-sm text-gray-500 font-mono">
                &copy; {new Date().getFullYear()} | {portfolioData.personalInfo.alias}
            </p>
            <p className="text-xs text-gray-600 mt-2">
                Powered by AI • Built with Next.js
            </p>
        </div>
    </footer>
);

const StatusNotification = () => {
    const [isVisible, setIsVisible] = useState(true);
    if (!isVisible) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ delay: 2.5, duration: 0.5 }}
                className="fixed bottom-4 left-4 z-50"
            >
                <button
                    onClick={() => setIsVisible(false)}
                    className="flex items-center gap-2 bg-gradient-to-r from-green-600/80 to-emerald-600/80 text-white text-sm font-semibold pl-2 pr-3 py-1.5 rounded-full backdrop-blur-sm border border-green-500/50 shadow-lg hover:from-green-500/80 hover:to-emerald-500/80 transition-all"
                >
                    <span className="flex items-center justify-center w-5 h-5 bg-green-800 rounded-full">
                        <HiSparkles className="w-3 h-3" />
                    </span>
                    <span>AI Mode Active</span>
                    <IoClose className="w-4 h-4 opacity-70"/>
                </button>
            </motion.div>
        </AnimatePresence>
    );
}

export default function Home() {
    const [hasBooted, setHasBooted] = useState<boolean | null>(null);
    const [showLoader, setShowLoader] = useState(true);
    const [showTerminal, setShowTerminal] = useState(false);

    useEffect(() => {
        const booted = typeof window !== 'undefined' && window.localStorage.getItem('hasBooted') === '1';
        setHasBooted(booted);
    }, []);

    const handleInitialBootComplete = () => {
        try {
            window.localStorage.setItem('hasBooted', '1');
        } catch {}
        setShowLoader(false);
    };

    // Terminal overlay completion returns to portfolio without touching boot flag
    const handleTerminalOverlayClose = () => {
        setShowTerminal(false);
    };

    if (hasBooted === null || showLoader) {
        return (
            <LoadingScreen
                onLoadComplete={handleInitialBootComplete}
                startMode={hasBooted ? 'boot' : 'boot'}
                variant={hasBooted ? 'fast' : 'full'}
                autoRedirectOnIdle={true}
            />
        );
    }

    return (
        <>
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
                
                * {
                    cursor: none !important;
                }
                
                body {
                    font-family: 'Inter', sans-serif;
                    background: #0A0A0A;
                    color: white;
                    overflow-x: hidden;
                }
                
                /* Hide default cursor */
                body {
                    cursor: none !important;
                }
                
                /* Neural network background pattern */
                body::before {
                    content: '';
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-image: 
                        radial-gradient(circle at 20% 80%, rgba(34, 211, 238, 0.05) 0%, transparent 50%),
                        radial-gradient(circle at 80% 20%, rgba(168, 85, 247, 0.05) 0%, transparent 50%);
                    pointer-events: none;
                    z-index: 1;
                }
            `}</style>

            <CursorEffect />
            <Navigation personalInfo={portfolioData.personalInfo} />
            <StatusNotification />

            {/* Floating terminal button */}
            <button
                onClick={() => setShowTerminal(true)}
                className="fixed bottom-4 right-4 z-50 inline-flex items-center gap-2 px-4 py-2 bg-gray-900/90 border border-cyan-400/40 rounded-lg text-cyan-300 hover:text-white hover:bg-gradient-to-br hover:from-cyan-500/10 hover:to-purple-500/10 hover:border-cyan-400/60 transition-all"
            >
                <FiCode />
                <span className="font-medium">Terminal</span>
            </button>

            <main className="relative bg-[#0A0A0A] z-10">
                <Hero />
                <IntelProfile />
                <Projects />
                <Skills />
                <Contact />
            </main>

            <Footer />

            {/* Terminal overlay: interactive mode without idle auto-redirect */}
            {showTerminal && (
                <LoadingScreen
                    onLoadComplete={handleTerminalOverlayClose}
                    startMode="interactive"
                    variant="full"
                    autoRedirectOnIdle={false}
                />
            )}
        </>
    );
}