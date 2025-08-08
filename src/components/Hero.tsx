// components/Hero.tsx
'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView, useMotionValue, useSpring, MotionValue } from 'framer-motion';
import Image from 'next/image';
import { FaFileAlt, FaRobot, FaBook, FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';
import { BsLightningChargeFill, BsArrowDown } from 'react-icons/bs';
import { IoMdPulse } from 'react-icons/io';

// Interface for Particle type
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  connections: number;
}

// Available samplers from Stable Diffusion
const SAMPLERS = [
  'Euler a',
  'Euler',
  'LMS',
  'Heun',
  'DPM2',
  'DPM2 a',
  'DPM++ 2S a',
  'DPM++ 2M',
  'DPM++ SDE',
  'DPM++ 2M SDE',
  'DPM++ 2M Karras',
  'DPM++ 2S a Karras',
  'DPM++ SDE Karras',
  'DPM fast',
  'DPM adaptive',
  'LMS Karras',
  'DDIM',
  'PLMS',
  'UniPC'
];

// Enhanced Typewriter with better effects
const TypewriterText = ({
  text,
  delay = 0,
  isInView,
  showTokens = false,
  gradientAfter = true,
  className = "",
}: {
  text: string
  delay?: number
  isInView: boolean
  showTokens?: boolean
  gradientAfter?: boolean
  className?: string
}) => {
  const [out, setOut] = useState('');
  const [idx, setIdx] = useState(0);
  const [cursor, setCursor] = useState(true);
  const [typing, setTyping] = useState(false);
  const [tok, setTok] = useState(0);
  const [tps, setTps] = useState(0);
  const [glitchChars, setGlitchChars] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    if (!isInView) {
      setOut(''); setIdx(0); setTyping(false); setTok(0);
      return;
    }
    const id = setTimeout(() => setTyping(true), delay);
    return () => clearTimeout(id);
  }, [isInView, delay]);

  useEffect(() => {
    if (!typing || idx >= text.length) return;

    // Add glitch effect occasionally
    if (Math.random() < 0.1) {
      const glitchChar = String.fromCharCode(33 + Math.floor(Math.random() * 94));
      setGlitchChars(prev => ({ ...prev, [idx]: glitchChar }));
      setTimeout(() => {
        setGlitchChars(prev => {
          const next = { ...prev };
          delete next[idx];
          return next;
        });
      }, 50);
    }

    const id = setTimeout(() => {
      setOut(text.slice(0, idx + 1));
      setIdx(i => i + 1);

      if (showTokens) {
        setTok(p => p + Math.floor(Math.random() * 3 + 2));
        setTps(Math.floor(Math.random() * 15 + 25));
      }
    }, 50 + Math.random() * 50);
    return () => clearTimeout(id);
  }, [typing, idx, text, showTokens]);

  useEffect(() => {
    const id = setInterval(() => setCursor(c => !c), 500);
    return () => clearInterval(id);
  }, []);

  const done = idx === text.length;

  return (
    <span className={`${className} inline-block relative`}>
      <span
        className={
          gradientAfter && done
            ? 'text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient-x'
            : 'text-white'
        }
      >
        {out.split('').map((char, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={glitchChars[i] ? 'text-red-400' : ''}
          >
            {glitchChars[i] || char}
          </motion.span>
        ))}
      </span>
      {cursor && typing && !done && (
        <motion.span
          className="inline-block w-0.5 sm:w-1 h-6 sm:h-8 lg:h-10 bg-gradient-to-b from-cyan-400 to-blue-600 ml-[2px] align-middle"
          animate={{ opacity: [1, 0], scaleY: [1, 0.8, 1] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        />
      )}

      {showTokens && typing && !done && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 6 }}
          transition={{ type: 'spring', stiffness: 300, damping: 22 }}
          className="absolute left-1/2 top-full mt-2 -translate-x-1/2 text-[10px] font-mono pointer-events-none"
        >
          <div className="px-3 py-1.5 bg-black/70 backdrop-blur-md border border-white/10 rounded-full shadow-xl">
            <div className="flex items-center gap-2">
              <BsLightningChargeFill className="text-yellow-400 animate-pulse" />
              <span className="text-cyan-300 font-bold">{tok} tokens</span>
              <span className="text-gray-500">•</span>
              <span className="text-green-400">{tps} tok/s</span>
              <IoMdPulse className="text-green-400 animate-pulse" />
            </div>
          </div>
        </motion.div>
      )}
    </span>
  );
};

// Optimized Gaussian noise generator with proper transparency handling (FROM OLD CODE)
const generateTransparencyAwareNoise = (
  width: number,
  height: number,
  imageData: ImageData | null,
  strength: number = 1.0
) => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;

  const noiseData = ctx.createImageData(width, height);
  const data = noiseData.data;

  // Box-Muller transform for Gaussian distribution
  const gaussian = () => {
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  };

  for (let i = 0; i < data.length; i += 4) {
    // Get alpha value from original image if provided
    const alpha = imageData ? imageData.data[i + 3] / 255 : 1;

    // Generate noise proportional to alpha (more noise where there's content)
    const noise = gaussian() * strength * 128 + 128;
    const finalNoise = noise * alpha;

    data[i] = finalNoise;
    data[i + 1] = finalNoise;
    data[i + 2] = finalNoise;
    data[i + 3] = alpha * 255; // Preserve transparency
  }

  ctx.putImageData(noiseData, 0, 0);
  return canvas.toDataURL();
};

// Interactive Particle System
const ParticleField = ({ mouseX, mouseY }: { mouseX: MotionValue<number>, mouseY: MotionValue<number> }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]); // Fixed: Using Particle[] instead of any[]
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles
    const particleCount = window.innerWidth < 768 ? 50 : 100;
    particlesRef.current = Array.from({ length: particleCount }, (): Particle => ({ // Fixed: Added return type
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      size: Math.random() * 2 + 0.5,
      color: `hsla(${180 + Math.random() * 60}, 100%, 50%, ${Math.random() * 0.5})`,
      connections: 0
    }));

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.02)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      const mx = mouseX.get();
      const my = mouseY.get();

      particles.forEach((particle, i) => {
        // Mouse interaction
        const dx = mx - particle.x;
        const dy = my - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
          const force = (100 - distance) / 100;
          particle.vx += (dx / distance) * force * 0.5;
          particle.vy += (dy / distance) * force * 0.5;
        }

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.99;
        particle.vy *= 0.99;

        // Boundaries
        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();

        // Connect nearby particles
        particle.connections = 0;
        particles.forEach((other, j) => {
          if (i === j) return;
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            particle.connections++;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(6, 182, 212, ${(150 - distance) / 500})`;
            ctx.stroke();
          }
        });

        // Glow effect for connected particles
        if (particle.connections > 3) {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 2, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size * 2);
          gradient.addColorStop(0, 'rgba(6, 182, 212, 0.3)');
          gradient.addColorStop(1, 'rgba(6, 182, 212, 0)');
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [mouseX, mouseY]);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
};

// Holographic Card Component
const HolographicCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setRotateX((y - 0.5) * 20);
    setRotateY((x - 0.5) * -20);
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={cardRef}
      className={`relative ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
        transformStyle: 'preserve-3d',
      }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-xl blur-xl" />
      <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        {children}
      </div>
    </motion.div>
  );
};

// Neural Network Visualization Component (FROM OLD CODE)
const NeuralNetworkVisualization = React.memo(({ isActive, progress }: { isActive: boolean; progress: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef(0);

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Responsive canvas size
    const isMobile = window.innerWidth < 768;
    canvas.width = isMobile ? 150 : 200;
    canvas.height = isMobile ? 150 : 200;

    const drawNetwork = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const layers = isMobile ? 3 : 4;
      const nodesPerLayer = isMobile ? [2, 3, 2] : [3, 5, 5, 3];
      const time = timeRef.current;

      // Draw connections
      for (let l = 0; l < layers - 1; l++) {
        for (let i = 0; i < nodesPerLayer[l]; i++) {
          for (let j = 0; j < nodesPerLayer[l + 1]; j++) {
            const x1 = (l + 1) * (canvas.width / (layers + 1));
            const y1 = (i + 1) * (canvas.height / (nodesPerLayer[l] + 1));
            const x2 = (l + 2) * (canvas.width / (layers + 1));
            const y2 = (j + 1) * (canvas.height / (nodesPerLayer[l + 1] + 1));

            const activation = (Math.sin(time * 0.002 + i + j + l * 2) + 1) / 2;

            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.strokeStyle = `rgba(34, 211, 238, ${activation * 0.3 * progress})`;
            ctx.lineWidth = activation * 1.5;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (let l = 0; l < layers; l++) {
        for (let i = 0; i < nodesPerLayer[l]; i++) {
          const x = (l + 1) * (canvas.width / (layers + 1));
          const y = (i + 1) * (canvas.height / (nodesPerLayer[l] + 1));

          const activation = (Math.sin(time * 0.003 + i + l * 3) + 1) / 2;

          ctx.beginPath();
          ctx.arc(x, y, 3 + activation * 3, 0, Math.PI * 2);

          const gradient = ctx.createRadialGradient(x, y, 0, x, y, 6);
          gradient.addColorStop(0, `rgba(34, 211, 238, ${0.8 * progress})`);
          gradient.addColorStop(1, `rgba(59, 130, 246, ${0.3 * progress})`);

          ctx.fillStyle = gradient;
          ctx.fill();

          ctx.strokeStyle = `rgba(34, 211, 238, ${0.5 * progress})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      timeRef.current += 16;
      animationRef.current = requestAnimationFrame(drawNetwork);
    };

    drawNetwork();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, progress]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ imageRendering: 'auto' }}
    />
  );
});

NeuralNetworkVisualization.displayName = 'NeuralNetworkVisualization';

// Main Stable Diffusion Interface - Using Old Noise/Denoise Method with New UI
const StableDiffusionInterface = ({ isInView, isMobile: isMobileView }: { isInView: boolean; mouseX: MotionValue<number>; mouseY: MotionValue<number>; isMobile?: boolean }) => {
  const [seed, setSeed] = useState(2743589621);
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [noiseStrength] = useState(1.0);
  const [positivePrompt] = useState("AI Research Scientist, professional portrait, modern laboratory, quantum computing background, cinematic lighting, hyperrealistic, 8k resolution, sharp focus, detailed");
  const [negativePrompt] = useState("blurry, low quality, distorted, amateur, oversaturated");
  const [showLatent, setShowLatent] = useState(false);
  const [imageAlpha, setImageAlpha] = useState<ImageData | null>(null);
  const [currentSampler, setCurrentSampler] = useState('DPM++ 2S a Karras');
  const [cfgScale, setCfgScale] = useState(7.5);
  const [noiseDataUrl, setNoiseDataUrl] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState("SDXL 1.0");
  const imageRef = useRef<HTMLImageElement>(null);

  const totalSteps = 50;
  const samplingSteps = 30;
  const models = ["SDXL 1.0", "SD 1.5", "SD 2.1", "SDXL Turbo"];

  // Enhanced parallax
  const { scrollY } = useScroll();
  const interfaceY = useTransform(scrollY, [0, 500], [0, -20]);
  const interfaceScale = useTransform(scrollY, [0, 300], [1, 0.95]);

  // Reset animation when in view changes
  useEffect(() => {
    if (isInView) {
      setCurrentStep(0);
      setIsGenerating(true);
      setShowLatent(true);
    } else {
      setIsGenerating(false);
      setCurrentStep(0);
    }
  }, [isInView]);

  // Get image alpha channel for proper noise generation (FROM OLD CODE)
  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const isMobile = isMobileView ?? (window.innerWidth < 768);
      const size = isMobile ? 300 : 400;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(img, 0, 0, size, size);
        setImageAlpha(ctx.getImageData(0, 0, size, size));
      }
    };
    img.src = '/hero-image.png';
  }, []);

  // Generate noise with proper transparency handling (FROM OLD CODE)
  useEffect(() => {
    if (imageAlpha) {
      const isMobile = isMobileView ?? (window.innerWidth < 768);
      const size = isMobile ? 300 : 400;
      const dataUrl = generateTransparencyAwareNoise(size, size, imageAlpha, noiseStrength);
      setNoiseDataUrl(dataUrl);
    }
  }, [imageAlpha, noiseStrength, seed]);

  const randomizeGeneration = useCallback(() => {
    setSeed(Math.floor(Math.random() * 4294967295));
    setCurrentSampler(SAMPLERS[Math.floor(Math.random() * SAMPLERS.length)]);
    setCfgScale(Math.round((Math.random() * 10 + 5) * 10) / 10);
    setSelectedModel(models[Math.floor(Math.random() * models.length)]);
    setCurrentStep(0);
    setIsGenerating(true);
    setShowLatent(true);
  }, []);

  useEffect(() => {
    if (!isGenerating || !isInView) return;

    if (currentStep >= totalSteps) {
      const timeout = setTimeout(() => {
        randomizeGeneration();
      }, 2000);
      return () => clearTimeout(timeout);
    }

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        const next = prev + 1;
        if (next === 8) setShowLatent(false);
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isGenerating, currentStep, randomizeGeneration, isInView]);
  useMemo(() => {
    if (currentStep < 5) return { stage: "Text Encoding", progress: currentStep * 20, info: "CLIP" };
    if (currentStep < 8) return { stage: "VAE Encoding", progress: (currentStep - 5) * 33, info: "Latent" };
    if (currentStep < 10) return { stage: "Noise Injection", progress: (currentStep - 8) * 50, info: `σ=${noiseStrength.toFixed(1)}` };
    if (currentStep < 40) return {
      stage: "U-Net Denoising",
      progress: ((currentStep - 10) / samplingSteps) * 100,
      info: `${Math.min(currentStep - 10, samplingSteps)}/${samplingSteps}`
    };
    if (currentStep < 45) return { stage: "VAE Decoding", progress: (currentStep - 40) * 20, info: "RGB" };
    if (currentStep < 50) return { stage: "Post-Process", progress: (currentStep - 45) * 20, info: "Final" };
    return { stage: "Complete", progress: 100, info: "Done" };
  }, [currentStep, noiseStrength]);
  const denoisingProgress = useMemo(() =>
    Math.max(0, Math.min(1, (currentStep - 10) / samplingSteps)),
    [currentStep]
  );

  const sigmaValue = useMemo(() => {
    // Karras sigma schedule
    const sigmaMax = 14.6;
    const sigmaMin = 0.0291;
    const rho = 7;
    const t = 1 - denoisingProgress;
    return (sigmaMax ** (1 / rho) * t + sigmaMin ** (1 / rho) * (1 - t)) ** rho;
  }, [denoisingProgress]);

  const isMobile = isMobileView ?? (typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const maxInitialBlurPx = isMobile ? 8 : 20;

  return (
    <motion.div
      style={{ y: interfaceY, scale: interfaceScale }}
      className="relative w-full h-full flex flex-col justify-center px-4 lg:px-0"
    >
      <div className="w-full max-w-[320px] sm:max-w-md lg:max-w-lg mx-auto bg-black/80 backdrop-blur-xl border border-cyan-500/20 rounded-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-900/20 to-blue-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs sm:text-sm font-mono text-cyan-400">txt2img • {selectedModel}</span>
            </div>
            <span className="text-[10px] sm:text-xs font-mono text-gray-500">
              Step {currentStep}/{totalSteps}
            </span>
          </div>
        </div>

        {/* Main Generation Canvas */}
        <div className="relative aspect-square bg-gray-900">
          {/* Latent Space Visualization */}
          <AnimatePresence>
            {showLatent && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="absolute inset-0 flex items-center justify-center z-20"
              >
                <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-lg overflow-hidden bg-black/50 border border-cyan-500/50 shadow-xl">
                  <NeuralNetworkVisualization isActive={showLatent} progress={1} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Noise Layer with Proper Transparency (hidden on mobile to avoid double/noisy stacking) */}
          {!isMobile && noiseDataUrl && currentStep >= 8 && (
            <motion.div
              className="absolute inset-0 z-10"
              animate={{
                opacity: Math.max(0, 1 - denoisingProgress * 1.5),
                filter: `contrast(${1 + denoisingProgress * 0.5})`
              }}
            >
              <div className="relative w-full h-full">
                <Image
                  src={noiseDataUrl}
                  alt="Noise"
                  fill
                  className="object-cover"
                  style={{
                    mixBlendMode: denoisingProgress > 0.5 ? 'overlay' : 'normal',
                    imageRendering: 'pixelated'
                  }}
                  unoptimized
                />
              </div>
            </motion.div>
          )}

          {/* Generated Image (FROM OLD CODE) */}
          <motion.div
            className="absolute inset-0"
            animate={{
              opacity: Math.min(1, denoisingProgress * 1.2),
              filter: `blur(${Math.max(0, (1 - denoisingProgress) * maxInitialBlurPx)}px) saturate(${0.5 + denoisingProgress * 0.5})`,
              scale: 1 + (1 - denoisingProgress) * 0.05
            }}
          >
            <Image
              ref={imageRef}
              src="/hero-image.png"
              alt="Generated"
              fill
              className="object-cover"
              quality={100}
              priority
            />
          </motion.div>

          {/* Denoising Progress Visualization (FROM OLD CODE) */}
          {currentStep >= 10 && currentStep < 40 && (
            <>
              <motion.div
                className="absolute inset-0 pointer-events-none z-30"
                animate={{
                  background: `radial-gradient(circle at 50% ${50 + Math.sin(currentStep * 0.2) * 10}%, transparent 0%, rgba(34, 211, 238, ${0.1 * (1 - denoisingProgress)}) 50%, transparent 100%)`
                }}
              />

              {/* Scan Lines */}
              <div className="absolute inset-0 pointer-events-none z-30 opacity-20">
                <motion.div
                  className="h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                  animate={{
                    y: `${(denoisingProgress * 100)}%`
                  }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </>
          )}

          {/* Progress Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-cyan-400">σ={sigmaValue.toFixed(3)}</span>
                <span className="text-green-400">{(denoisingProgress * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full h-1 bg-black/50 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-400 to-green-400"
                  style={{ width: `${denoisingProgress * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Parameters - Always Visible */}
        <div className="p-3 sm:p-4 space-y-3 bg-gray-900/50">
          {/* Sampling Parameters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="bg-black/50 rounded-lg p-2 border border-gray-800">
              <div className="text-[10px] text-gray-500 uppercase">Sampler</div>
              <div className="font-mono text-cyan-400 truncate">{currentSampler}</div>
            </div>
            <div className="bg-black/50 rounded-lg p-2 border border-gray-800">
              <div className="text-[10px] text-gray-500 uppercase">Steps</div>
              <div className="font-mono text-green-400">{totalSteps}</div>
            </div>
            <div className="bg-black/50 rounded-lg p-2 border border-gray-800">
              <div className="text-[10px] text-gray-500 uppercase">CFG Scale</div>
              <div className="font-mono text-yellow-400">{cfgScale}</div>
            </div>
            <div className="bg-black/50 rounded-lg p-2 border border-gray-800">
              <div className="text-[10px] text-gray-500 uppercase">Seed</div>
              <div className="font-mono text-purple-400">{seed}</div>
            </div>
          </div>

          {/* Size and Model Info */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-black/50 rounded-lg p-2 border border-gray-800">
              <div className="text-[10px] text-gray-500 uppercase">Size</div>
              <div className="font-mono text-blue-400">512×512</div>
            </div>
            <div className="bg-black/50 rounded-lg p-2 border border-gray-800">
              <div className="text-[10px] text-gray-500 uppercase">Model</div>
              <div className="font-mono text-pink-400 truncate">{selectedModel}</div>
            </div>
            <div className="bg-black/50 rounded-lg p-2 border border-gray-800">
              <div className="text-[10px] text-gray-500 uppercase">VAE</div>
              <div className="font-mono text-orange-400">Auto</div>
            </div>
          </div>

          {/* Prompts */}
          <div className="space-y-2">
            <div className="bg-black/50 rounded-lg p-2 border border-green-500/20">
              <div className="text-[10px] font-mono text-green-400 mb-1">Positive prompt:</div>
              <p className="text-[10px] font-mono text-gray-300 leading-relaxed line-clamp-2">
                {positivePrompt}
              </p>
            </div>
            <div className="bg-black/50 rounded-lg p-2 border border-red-500/20">
              <div className="text-[10px] font-mono text-red-400 mb-1">Negative prompt:</div>
              <p className="text-[10px] font-mono text-gray-300 leading-relaxed line-clamp-1">
                {negativePrompt}
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between text-[10px] font-mono">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ rotate: isGenerating ? 360 : 0 }}
                transition={{ duration: 2, repeat: isGenerating ? Infinity : 0, ease: 'linear' }}
                className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full"
              />
              <span className="text-cyan-400">
                {currentStep < totalSteps ? 'Generating...' : 'Complete'}
              </span>
            </div>
            <span className="text-gray-500">
              {currentStep < totalSteps
                ? `ETA: ${Math.ceil((totalSteps - currentStep) * 0.1)}s`
                : 'Next: 2s'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main Hero Component with All Enhanced Features
const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(heroRef, { margin: "-100px" });
  const { scrollY } = useScroll();

  // Mouse tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 150, damping: 15 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 150, damping: 15 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Enhanced parallax layers
  const backgroundY = useTransform(scrollY, [0, 1000], [0, 200]);
  const blob1Y = useTransform(scrollY, [0, 1000], [0, -150]);
  const blob2Y = useTransform(scrollY, [0, 1000], [0, 120]);
  const blob3Y = useTransform(scrollY, [0, 1000], [0, -80]);
  const textY = useTransform(scrollY, [0, 400], [0, -50]);
  const badgeY = useTransform(scrollY, [0, 400], [0, -30]);
  const statsY = useTransform(scrollY, [0, 400], [0, -40]);
  const opacityEffect = useTransform(scrollY, [0, 300], [1, 0.8]);
  const blurEffect = useTransform(scrollY, [0, 400], [0, 5]);

  // 3D tilt effect based on mouse (avoid direct window usage during render)
  const [viewportHeight, setViewportHeight] = useState(1000);
  const [viewportWidth, setViewportWidth] = useState(1000);
  useEffect(() => {
    const update = () => {
      setViewportHeight(window.innerHeight || 1000);
      setViewportWidth(window.innerWidth || 1000);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  const rotateX = useTransform(smoothMouseY, [0, viewportHeight], [5, -5]);
  const rotateY = useTransform(smoothMouseX, [0, viewportWidth], [-5, 5]);
  const isMobile = viewportWidth < 768;
  const blurFilterMotion = useTransform(blurEffect, (value) => `blur(${value}px)`);

  return (
    <section ref={heroRef} id="home" className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Interactive Particle System (disabled on mobile for clarity/perf) */}
      {!isMobile && (
        <ParticleField mouseX={smoothMouseX} mouseY={smoothMouseY} />
      )}

      {/* Animated gradient mesh background */}
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-blue-900/20">
          <div className="absolute inset-0">
            <svg width="100%" height="100%" className="absolute inset-0">
              <defs>
                <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Enhanced animated blobs */}
      <div className="absolute inset-0">
        <motion.div
          style={{ y: blob1Y, rotate: rotateY }}
          className="absolute top-0 -left-20 w-[40vw] h-[40vw] max-w-[600px] max-h-[600px]"
        >
          <div className="w-full h-full bg-gradient-to-br from-purple-600/30 to-pink-600/30 rounded-full blur-[100px] animate-pulse-slow" />
        </motion.div>
        <motion.div
          style={{ y: blob2Y, rotate: rotateX }}
          className="absolute top-20 -right-20 w-[35vw] h-[35vw] max-w-[500px] max-h-[500px]"
        >
          <div className="w-full h-full bg-gradient-to-br from-cyan-600/30 to-blue-600/30 rounded-full blur-[100px] animate-pulse-slower" />
        </motion.div>
        <motion.div
          style={{ y: blob3Y }}
          className="absolute bottom-0 left-1/3 w-[30vw] h-[30vw] max-w-[400px] max-h-[400px]"
        >
          <div className="w-full h-full bg-gradient-to-br from-green-600/20 to-yellow-600/20 rounded-full blur-[100px] animate-pulse-slowest" />
        </motion.div>
      </div>

      {/* Main content */}
      <motion.div
        className="relative z-10 h-full w-full"
        style={{
          filter: isMobile ? 'none' : blurFilterMotion,
          transform: useTransform(
            [rotateX, rotateY],
            (latest) => {
              const x = latest[0] as number;
              const y = latest[1] as number;
              return `perspective(1000px) rotateX(${x * 0.1}deg) rotateY(${y * 0.1}deg)`;
            }
          )
        }}
      >
        <div className="h-full w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-0">
          <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-center justify-center">
            {/* Left Content - Enhanced */}
            <motion.div
              style={{ opacity: opacityEffect }}
              initial={{ opacity: 0, x: -100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, type: "spring", damping: 20 }}
              className="space-y-4 sm:space-y-6 w-full"
            >
              {/* Animated Badge */}
              <motion.div
                style={{ y: badgeY }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-block"
              >
                <HolographicCard className="inline-flex">
                  <div className="flex items-center gap-2 px-4 py-2">
                    <motion.span
                      className="relative flex h-2 w-2"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-gradient-to-r from-cyan-400 to-blue-500" />
                    </motion.span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 text-xs sm:text-sm font-bold tracking-wide uppercase">
                      AI Pioneer • Research Lead
                    </span>
                  </div>
                </HolographicCard>
              </motion.div>

              {/* Enhanced Title */}
              <motion.div style={{ y: textY }}>
                <motion.h1
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, type: "spring", damping: 15 }}
                  className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-black leading-tight relative"
                >
                  <div className="block mb-2 relative">
                    <TypewriterText
                      text="Mohammad Farid"
                      isInView={isInView}
                      delay={500}
                      showTokens={true}
                      className="relative z-10"
                    />
                    {/* Glow effect */}
                    <motion.div
                      className="absolute inset-0 blur-2xl opacity-50"
                      animate={{
                        background: [
                          'linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.5), transparent)',
                          'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.5), transparent)',
                          'linear-gradient(90deg, transparent, rgba(34, 211, 238, 0.5), transparent)',
                        ]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                  </div>
                  <div className="block relative">
                    <TypewriterText
                      text="Hendianto"
                      isInView={isInView}
                      delay={1700}
                       showTokens={true}
                      className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600"
                    />
                  </div>
                </motion.h1>
              </motion.div>

              {/* Enhanced Description */}
              <motion.div
                style={{ y: textY }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-base sm:text-lg lg:text-xl text-gray-300 leading-relaxed max-w-xl">
                  Architecting the future of <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 font-bold">artificial intelligence</span> through
                  groundbreaking research in <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 font-bold">diffusion models</span> and
                  next-generation <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-yellow-500 font-bold">transformer architectures</span>.
                </p>
              </motion.div>

              {/* Enhanced CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative px-6 sm:px-8 py-3 sm:py-4 overflow-hidden rounded-xl font-bold text-sm sm:text-base"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 transition-transform group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
                  <span className="relative z-10 text-white flex items-center gap-2">
                    Explore Research
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-sm sm:text-base overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl" />
                  <div className="absolute inset-0 border-2 border-transparent bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-padding rounded-xl"
                       style={{ padding: '2px', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor' }} />
                  <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
                    View Publications
                  </span>
                </motion.button>
              </motion.div>

              {/* Enhanced Stats with 3D Cards */}
              <motion.div
                style={{ y: statsY }}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="grid grid-cols-3 gap-3 max-w-md pt-4"
              >
                {[
                  { label: 'Papers', value: '24+', icon: FaFileAlt, color: 'cyan', detail: 'Published' },
                  { label: 'Models', value: '12', icon: FaRobot, color: 'purple', detail: 'Deployed' },
                  { label: 'Citations', value: '1.2K+', icon: FaBook, color: 'pink', detail: 'Global' }
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.1, z: 50 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <HolographicCard className="h-full">
                        <div className="p-4 text-center space-y-2">
                          <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                          >
                            <Icon className="text-2xl text-cyan-400 mx-auto mb-2" />
                          </motion.div>
                          <div className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-cyan-600">
                            {stat.value}
                          </div>
                          <div className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider">
                            {stat.label}
                          </div>
                          <div className="text-[9px] text-cyan-400/60">
                            {stat.detail}
                          </div>
                        </div>
                      </HolographicCard>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Tech Stack with animations */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="space-y-3 pt-4"
              >
                <p className="text-xs text-gray-500 uppercase tracking-wider">Technologies</p>
                <div className="flex flex-wrap gap-2">
                  {['PyTorch', 'Stable Diffusion', 'Transformers', 'CUDA', 'JAX', 'TensorFlow'].map((tech, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1 + i * 0.1, type: "spring" }}
                      whileHover={{ scale: 1.1, y: -2 }}
                      className="px-3 py-1.5 text-xs font-mono bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-full border border-cyan-500/20 backdrop-blur-xl hover:border-cyan-400/50 transition-all cursor-default"
                    >
                      {tech}
                    </motion.span>
                  ))}
                </div>
              </motion.div>

              {/* Social Links */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="flex gap-4 pt-4"
              >
                {[
                  { icon: FaGithub, href: '#', label: 'GitHub' },
                  { icon: FaLinkedin, href: '#', label: 'LinkedIn' },
                  { icon: FaTwitter, href: '#', label: 'Twitter' }
                ].map((social, i) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={i}
                      href={social.href}
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                      className="text-gray-400 hover:text-cyan-400 transition-colors"
                      aria-label={social.label}
                    >
                      <Icon className="text-xl" />
                    </motion.a>
                  );
                })}
              </motion.div>
            </motion.div>

            {/* Right Side - Enhanced Stable Diffusion Interface */}
            <div className="relative w-full h-[600px] lg:h-full flex items-center">
              <StableDiffusionInterface
                isInView={isInView}
                mouseX={smoothMouseX}
                mouseY={smoothMouseY}
                isMobile={isMobile}
              />
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-gray-400 text-sm flex flex-col items-center gap-2 cursor-pointer"
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          >
            <span className="text-xs uppercase tracking-wider">Scroll</span>
            <BsArrowDown className="text-xl" />
          </motion.div>
        </motion.div>
      </motion.div>

      <style jsx>{`
        @keyframes animate-gradient-x {
          0%, 100% {
            background-position: 0 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

      `}</style>
    </section>
  );
};

export default Hero;