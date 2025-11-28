'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring } from 'framer-motion';
import { FaFileAlt, FaRobot, FaBook, FaArrowRight } from 'react-icons/fa';
import { BsTerminal } from 'react-icons/bs';
import TypewriterTextMod from './hero/TypewriterText';
import StableDiffusionCard from './hero/stable/StableDiffusionInterface';

// --- Visual Components ---

// Technical Grid Background simulating latent space noise
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

    // Static Noise + Moving Grid Lines
    const animate = () => {
      time += 0.05;
      
      // Theme awareness
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      const bgColor = isDark ? '#050505' : '#f0f2f5';
      const gridColor = isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.05)';
      const dropColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw subtle grid
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = 1;
      const gridSize = 50;
      
      // Vertical lines
      for(let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      // Horizontal lines
      for(let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw "Digital Rain" / Data streams
      const drops = 20;
      for(let i=0; i<drops; i++) {
          const x = (Math.tan(i * 132.1 + time * 0.02) * canvas.width + canvas.width) % canvas.width;
          const h = Math.random() * 100 + 50;
          const y = (Math.sin(i * 45.3 + time * 0.5) * canvas.height + canvas.height) % canvas.height;
          
          const grad = ctx.createLinearGradient(x, y, x, y + h);
          grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
          grad.addColorStop(0.5, dropColor);
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          
          ctx.fillStyle = grad;
          ctx.fillRect(x, y, 1, h);
      }

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
      className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
    />
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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX / innerWidth) - 0.5;
      const y = (clientY / innerHeight) - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <section
      ref={heroRef}
      id="home"
      className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden bg-background pt-16 border-b border-card-border"
    >
      {/* 1. Background Layer */}
      <div className="absolute inset-0 z-0">
        {!isMobile && <LatentSpaceBackground />}
        {/* Vignette for focus */}
        <div className="absolute inset-0 bg-background/30 pointer-events-none" />
      </div>

      {/* 2. Main Content Container */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-8 lg:gap-12 items-center h-full">
        
        {/* Left Column: Text & CTA */}
        <motion.div
          style={{ y: y1, opacity }}
          className="flex flex-col items-start justify-center space-y-8"
        >
          {/* Headline */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tighter text-foreground leading-[1.1] uppercase">
              <span className="block text-gray-500">
                Mohammad
              </span>
              <span className="block text-foreground">
                Farid
              </span>
              <span className="block text-gray-400">
                Hendianto
              </span>
            </h1>
          </div>

          {/* Subheadline / Typewriter */}
          <div className="max-w-xl">
            <div className="h-24 sm:h-20">
              <TypewriterTextMod
                text="Architecting the future of Generative AI through research in Diffusion Models and Transformer Architectures."
                isInView={isInView}
                delay={500}
                showTokens={true}
                gradientAfter={false}
                className="text-xl sm:text-2xl text-foreground/80 font-light leading-relaxed tracking-wide"
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
            <a 
              href="https://github.com/ireddragonicy"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative px-8 py-4 bg-foreground text-background font-bold text-xs uppercase tracking-[0.2em] transition-all hover:bg-foreground/80"
            >
              <span className="relative flex items-center gap-3">
                Explore GitHub
                <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </span>
            </a>
          </motion.div>

          {/* Tech Stack Chips - Minimalist */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="pt-8 border-t border-card-border w-full max-w-md"
          >
            <p className="text-[10px] text-muted-foreground mb-4 uppercase tracking-widest">Technologies</p>
            <div className="flex flex-wrap gap-2">
              {['PyTorch', 'JAX', 'Diffusers', 'CUDA', 'LLMs'].map((tech) => (
                <span 
                  key={tech}
                  className="px-3 py-1 text-[10px] font-mono text-gray-400 bg-card border border-card-border hover:border-foreground/20 transition-colors cursor-default uppercase tracking-wider"
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
            rotateX: useTransform(smoothMouseY, [-0.5, 0.5], [2, -2]), // Subtle tilt
            rotateY: useTransform(smoothMouseX, [-0.5, 0.5], [-2, 2]),
          }}
          className="relative h-full w-full flex items-center justify-center perspective-1000"
        >
           {/* Technical Background behind card */}
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Subtle wireframe globe or circle instead of blob */}
              <div className="w-[80%] h-[80%] border border-card-border rounded-full opacity-20 animate-[spin_60s_linear_infinite]" />
              <div className="absolute w-[60%] h-[60%] border border-dashed border-card-border rounded-full opacity-20 animate-[spin_40s_linear_infinite_reverse]" />
           </div>

           {/* The Card */}
           <div className="relative w-full max-w-md lg:max-w-full z-10 transform transition-all duration-500">
             <StableDiffusionCard isInView={isInView} isMobile={isMobile} />
             
             {/* Floating stats - Technical Style */}
             <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.5 }}
                className="absolute -right-4 top-16 hidden xl:block pointer-events-none"
             >
               <div className="group flex items-center gap-2">
                  <div className="w-8 h-[1px] bg-foreground/20" />
                  
                  <div className="bg-card border border-card-border p-4 shadow-2xl">
                    <div className="flex items-center gap-3 mb-2 border-b border-card-border pb-2">
                      <FaRobot className="text-foreground text-xs" />
                      <span className="text-[9px] font-mono text-muted-foreground tracking-widest uppercase">Models</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                         <span className="text-3xl font-bold text-foreground tracking-tighter">12</span>
                         <span className="text-[8px] text-muted-foreground font-mono">deployed</span>
                    </div>
                  </div>
               </div>
              </motion.div>

             <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.7 }}
                className="absolute -left-8 bottom-28 hidden xl:block pointer-events-none"
             >
               <div className="group flex items-center gap-2 flex-row-reverse">
                  <div className="w-8 h-[1px] bg-foreground/20" />

                  <div className="bg-card border border-card-border p-4 shadow-2xl">
                    <div className="flex items-center gap-3 mb-2 border-b border-card-border pb-2">
                      <FaFileAlt className="text-foreground text-xs" />
                      <span className="text-[9px] font-mono text-gray-500 tracking-widest uppercase">Papers</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                         <span className="text-3xl font-bold text-foreground tracking-tighter">24+</span>
                         <span className="text-[8px] text-gray-400 font-mono">PUBLISHED</span>
                    </div>
                  </div>
               </div>
            </motion.div>

            </div>
        </motion.div>
      </div>

      {/* Scroll Indicator - Minimal */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3"
      >
        <div className="h-8 w-[1px] bg-foreground/20" />
        <span className="text-[9px] font-mono text-gray-500 tracking-[0.3em] uppercase">Scroll</span>
      </motion.div>

    </section>
  );
};

export default Hero;
