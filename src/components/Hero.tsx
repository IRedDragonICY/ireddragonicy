'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring } from 'framer-motion';
import { FaFileAlt, FaRobot, FaBook, FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { BsArrowDown, BsStars } from 'react-icons/bs';
import TypewriterTextMod from './hero/TypewriterText';
import StableDiffusionCard from './hero/stable/StableDiffusionInterface';

// --- Visual Components ---

// A subtle noise texture that shifts, simulating the "latent space" of diffusion models
const LatentSpaceBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      time += 0.005;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Create a "diffusion" noise effect
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      // Optimization: Draw noise on a smaller offscreen canvas and scale up?
      // For now, we'll do a simpler procedural pattern to save CPU.
      // Instead of per-pixel noise, we'll draw shifting gradients/shapes.
      
      // Clear with very low opacity for trails
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    // Better approach: Use canvas for moving "fog"
    const particles: {x: number, y: number, vx: number, vy: number, size: number, alpha: number}[] = [];
    const particleCount = 50;
    
    for(let i=0; i<particleCount; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        size: Math.random() * 200 + 100,
        alpha: Math.random() * 0.1
      });
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 1)'; // Hard clear for cleaner look, or use fade
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw "latent clouds"
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        
        if(p.x < -p.size) p.x = canvas.width + p.size;
        if(p.x > canvas.width + p.size) p.x = -p.size;
        if(p.y < -p.size) p.y = canvas.height + p.size;
        if(p.y > canvas.height + p.size) p.y = -p.size;

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        gradient.addColorStop(0, `rgba(34, 211, 238, ${p.alpha * 0.5})`); // Cyan
        gradient.addColorStop(0.5, `rgba(139, 92, 246, ${p.alpha * 0.3})`); // Violet
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        
          ctx.fillStyle = gradient;
        ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-60"
    />
  );
};

const TechBadge = ({ text, glowColor = "cyan" }: { text: string, glowColor?: "cyan" | "purple" | "green" }) => {
  const colors = {
    cyan: "from-cyan-500/20 to-cyan-500/0 border-cyan-500/30 text-cyan-400",
    purple: "from-purple-500/20 to-purple-500/0 border-purple-500/30 text-purple-400",
    green: "from-green-500/20 to-green-500/0 border-green-500/30 text-green-400"
  };

  return (
    <div className={`
      inline-flex items-center gap-2 px-3 py-1 rounded-full 
      border backdrop-blur-md bg-gradient-to-r ${colors[glowColor]}
    `}>
      <div className={`w-1.5 h-1.5 rounded-full ${glowColor === 'cyan' ? 'bg-cyan-400' : glowColor === 'purple' ? 'bg-purple-400' : 'bg-green-400'} animate-pulse`} />
      <span className="text-[10px] font-mono uppercase tracking-wider font-semibold">{text}</span>
      </div>
  );
};

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(heroRef, { margin: "-100px", once: false });
  const { scrollY } = useScroll();

  // Parallax & transforms
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  // Mouse tilt effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <section
      ref={heroRef}
      id="home"
      className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden bg-[#030305] pt-16"
    >
      {/* 1. Background Layer */}
      <div className="absolute inset-0 z-0">
        {!isMobile && <LatentSpaceBackground />}
        {/* Vignette */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#030305]/50 to-[#030305] pointer-events-none" />
      </div>

      {/* 2. Main Content Container */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center h-full">
        
        {/* Left Column: Text & CTA */}
      <motion.div
          style={{ y: y1, opacity }}
          className="flex flex-col items-start justify-center space-y-6 lg:space-y-8"
        >
          {/* Status Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
          >
            <TechBadge text="System Online • v2.4.0" glowColor="green" />
              </motion.div>

          {/* Headline */}
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tighter text-white leading-[1.1]">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                Mohammad
              </span>
              <span className="block relative">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
                  Farid
                </span>
                {/* Decorative line */}
                <motion.div 
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1, duration: 1 }}
                  className="absolute -bottom-2 left-0 h-1 w-24 bg-cyan-500 rounded-full" 
                />
              </span>
              <span className="block text-white/90">
                Hendianto
              </span>
            </h1>
          </div>

          {/* Subheadline / Typewriter */}
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-sm mb-2">
              <span className="inline-block w-2 h-2 bg-cyan-400 rounded-sm" />
              <span>CURRENT_OBJECTIVE:</span>
            </div>
            <div className="h-24 sm:h-20">
                    <TypewriterTextMod
                text="Architecting the future of Generative AI through research in Diffusion Models and Transformer Architectures."
                      isInView={isInView}
                      delay={500}
                      showTokens={true}
                className="text-lg sm:text-xl text-gray-300 font-light leading-relaxed"
                    />
                  </div>
                  </div>

          {/* CTAs */}
              <motion.div
            initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-wrap gap-4"
          >
            <button className="group relative px-8 py-4 bg-white text-black font-bold text-sm uppercase tracking-widest overflow-hidden rounded-sm transition-all hover:scale-105 active:scale-95">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-darken" />
              <span className="relative flex items-center gap-2">
                    Explore Research
                <BsStars className="text-lg group-hover:rotate-180 transition-transform duration-500" />
                  </span>
            </button>
            
            <button className="group px-8 py-4 bg-transparent border border-white/20 text-white font-bold text-sm uppercase tracking-widest hover:bg-white/5 transition-all hover:border-white/40 rounded-sm backdrop-blur-sm">
              <span className="flex items-center gap-2">
                    View Publications
                <FaBook className="text-gray-400 group-hover:text-white transition-colors" />
                  </span>
            </button>
              </motion.div>

          {/* Tech Stack Chips */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="pt-8 border-t border-white/10 w-full max-w-md"
            // Layout optimized: static content
          >
            <p className="text-xs text-gray-500 font-mono mb-4 uppercase tracking-widest">Core Technologies</p>
            <div className="flex flex-wrap gap-3">
              {['PyTorch', 'JAX', 'Diffusers', 'CUDA', 'LLMs'].map((tech, i) => (
                <span 
                  key={tech}
                  className="px-3 py-1 text-[10px] font-mono text-cyan-300 bg-cyan-950/30 border border-cyan-900/50 rounded-sm hover:border-cyan-500/50 transition-colors cursor-default"
                    >
                      {tech}
                </span>
                  ))}
                </div>
          </motion.div>
              </motion.div>

        {/* Right Column: Interactive Interface */}
              <motion.div
          style={{ 
            y: y2,
            rotateX: useTransform(smoothMouseY, [-0.5, 0.5], [5, -5]),
            rotateY: useTransform(smoothMouseX, [-0.5, 0.5], [-5, 5]),
          }}
          className="relative h-full w-full flex items-center justify-center perspective-1000"
        >
           {/* Decorative background elements behind the card */}
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[120%] h-[120%] bg-gradient-to-tr from-cyan-500/10 via-purple-500/10 to-transparent blur-3xl rounded-full" />
              <div className="absolute top-1/4 right-0 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full mix-blend-screen animate-pulse" />
           </div>

           {/* The Card */}
           <div className="relative w-full max-w-md lg:max-w-full z-10 transform transition-all duration-500 hover:scale-[1.02]">
             <StableDiffusionCard isInView={isInView} isMobile={isMobile} />
             
             {/* Floating stats around the card */}
             <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.5 }}
                className="absolute -right-4 top-10 hidden xl:block"
             >
               <div className="bg-black/80 backdrop-blur-md border border-cyan-500/30 p-3 rounded-lg shadow-lg">
                 <div className="flex items-center gap-3 mb-1">
                   <FaRobot className="text-cyan-400" />
                   <span className="text-xs font-mono text-gray-400">MODELS_DEPLOYED</span>
                 </div>
                 <div className="text-2xl font-bold text-white">12</div>
               </div>
              </motion.div>

             <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.7 }}
                className="absolute -left-8 bottom-20 hidden xl:block"
             >
               <div className="bg-black/80 backdrop-blur-md border border-purple-500/30 p-3 rounded-lg shadow-lg">
                 <div className="flex items-center gap-3 mb-1">
                   <FaFileAlt className="text-purple-400" />
                   <span className="text-xs font-mono text-gray-400">PAPERS_PUBLISHED</span>
                 </div>
                 <div className="text-2xl font-bold text-white">24+</div>
               </div>
            </motion.div>

            </div>
        </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] font-mono text-gray-500 tracking-[0.2em] uppercase">Scroll to Explore</span>
        <BsArrowDown className="text-cyan-500 animate-bounce" />
      </motion.div>

    </section>
  );
};

export default Hero;
