'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import NeuralNetworkVisualization from '../NeuralNetworkVisualization';
import { MODELS, SAMPLERS, type ControlNetType, type ModelName, type Sampler } from '../constants';
import { createDepthMapDataURL, createSobelEdgeDataURL, createScribbleDataURL, generateTransparencyAwareNoise } from '../utils';

type ControlNetState = {
  enabled: boolean;
  preprocessor?: string;
  weight: number; // 0..2
};

type OverlayDataMap = {
  depth?: string | null;
  canny?: string | null;
  scribble?: string | null;
};

type Props = {
  isInView: boolean;
  isMobile?: boolean;
};

const StableDiffusionInterface: React.FC<Props> = ({ isInView, isMobile: isMobileView }) => {
  const [seed, setSeed] = useState(2743589621);
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [noiseStrength] = useState(1.0);
  const [positivePrompt] = useState(
    'AI Research Scientist, professional portrait, modern laboratory, quantum computing background, cinematic lighting, hyperrealistic, 8k resolution, sharp focus, detailed',
  );
  const [negativePrompt] = useState('blurry, low quality, distorted, amateur, oversaturated');
  const [showLatent, setShowLatent] = useState(false);
  const [imageAlpha, setImageAlpha] = useState<ImageData | null>(null);
  const [currentSampler, setCurrentSampler] = useState<Sampler>('DPM++ 2S a Karras');
  const [cfgScale, setCfgScale] = useState(7.5);
  const [noiseDataUrl, setNoiseDataUrl] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelName>('SDXL 1.0');
  const [overlayData, setOverlayData] = useState<OverlayDataMap>({});
  const [autoCycle] = useState(true);
  const [controlNet, setControlNet] = useState<Record<Exclude<ControlNetType, 'none'>, ControlNetState>>({
    depth: { enabled: true, preprocessor: 'MiDaS', weight: 1.0 },
    canny: { enabled: true, preprocessor: 'Canny (Medium)', weight: 1.0 },
    scribble: { enabled: false, preprocessor: 'Scribble (Medium)', weight: 1.0 },
  });
  const [showControlNet, setShowControlNet] = useState(true);
  const imageRef = useRef<HTMLImageElement>(null);

  const totalSteps = 50;
  const samplingSteps = 30;
  const models = MODELS;

  const { scrollY } = useScroll();
  const interfaceY = useTransform(scrollY, [0, 500], [0, -20]);
  const interfaceScale = useTransform(scrollY, [0, 300], [1, 0.98]);

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

  // Prepare image alpha for noise strength mapping
  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const isMobile = isMobileView ?? window.innerWidth < 768;
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
  }, [isMobileView]);

  // Noise layer
  useEffect(() => {
    if (imageAlpha) {
      const isMobile = isMobileView ?? window.innerWidth < 768;
      const size = isMobile ? 300 : 400;
      const dataUrl = generateTransparencyAwareNoise(size, size, imageAlpha, noiseStrength, seed);
      setNoiseDataUrl(dataUrl);
    }
  }, [imageAlpha, noiseStrength, seed, isMobileView]);

  // Generate overlays from base image (depth + canny + scribble)
  useEffect(() => {
    const isMobile = isMobileView ?? (typeof window !== 'undefined' ? window.innerWidth < 768 : false);
    const size = isMobile ? 300 : 400;
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const thr = controlNet.canny.preprocessor?.includes('Low') ? 60 : controlNet.canny.preprocessor?.includes('High') ? 140 : 100;
        const cannyUrl = createSobelEdgeDataURL(img, size, thr) || null;
        const depthUrl = createDepthMapDataURL(img, size) || null;
        const scribbleThickness = controlNet.scribble.preprocessor?.includes('Thin')
          ? 'thin'
          : controlNet.scribble.preprocessor?.includes('Thick')
          ? 'thick'
          : 'medium';
        const scribbleUrl = createScribbleDataURL(img, size, scribbleThickness as 'thin' | 'medium' | 'thick') || null;
        setOverlayData({ canny: cannyUrl, depth: depthUrl, scribble: scribbleUrl });
      } catch {
        // ignore
      }
    };
    img.src = '/hero-image.png';
  }, [seed, isMobileView, controlNet.canny.preprocessor, controlNet.scribble.preprocessor]);

  const randomizeControlNetScenario = useCallback(() => {
    const r = Math.random();
    const enabled = { depth: false, canny: false, scribble: false } as Record<Exclude<ControlNetType, 'none'>, boolean>;
    const keys: Array<Exclude<ControlNetType, 'none'>> = ['depth', 'canny', 'scribble'];
    if (r < 0.4) {
      // none
    } else if (r < 0.8) {
      const k = keys[Math.floor(Math.random() * keys.length)];
      enabled[k] = true;
    } else {
      keys.forEach((k) => (enabled[k] = true));
    }
    setControlNet((prev) => ({
      depth: { ...prev.depth, enabled: enabled.depth },
      canny: { ...prev.canny, enabled: enabled.canny },
      scribble: { ...prev.scribble, enabled: enabled.scribble },
    }));
  }, []);

  const randomizeGeneration = useCallback(() => {
    setSeed(Math.floor(Math.random() * 4294967295));
    setCurrentSampler(SAMPLERS[Math.floor(Math.random() * SAMPLERS.length)] as Sampler);
    setCfgScale(Math.round((Math.random() * 10 + 5) * 10) / 10);
    setSelectedModel(models[Math.floor(Math.random() * models.length)] as ModelName);
    randomizeControlNetScenario();
    setCurrentStep(0);
    setIsGenerating(true);
    setShowLatent(true);
  }, [models, randomizeControlNetScenario]);

  useEffect(() => {
    if (!isGenerating || !isInView) return;
    if (currentStep >= totalSteps) {
      const timeout = setTimeout(() => {
        if (autoCycle) randomizeGeneration();
      }, 2000);
      return () => clearTimeout(timeout);
    }
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next === 8) setShowLatent(false);
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isGenerating, currentStep, randomizeGeneration, isInView, autoCycle]);

  const denoisingProgress = useMemo(() => Math.max(0, Math.min(1, (currentStep - 10) / samplingSteps)), [currentStep]);
  const sigmaValue = useMemo(() => {
    const sigmaMax = 14.6;
    const sigmaMin = 0.0291;
    const rho = 7;
    const t = 1 - denoisingProgress;
    return (sigmaMax ** (1 / rho) * t + sigmaMin ** (1 / rho) * (1 - t)) ** rho;
  }, [denoisingProgress]);

  const isMobile = isMobileView ?? (typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  const maxInitialBlurPx = isMobile ? 8 : 20;

  return (
    <motion.div style={{ y: interfaceY, scale: interfaceScale }} className="relative w-full flex flex-col items-center justify-center px-4 md:px-0 perspective-1000">
      {/* Main Interface Container - Floating & Glassy - REDUCED WIDTH to 340px */}
      <div className="relative w-full max-w-[340px] bg-card/80 backdrop-blur-xl border border-card-border rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.1)] overflow-hidden ring-1 ring-card-border group">
        
        {/* Glowing decorative elements - Adjusted size */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header: System Status Bar - Compact */}
        <div className="relative z-10 flex items-center justify-between px-3 py-2 border-b border-card-border bg-foreground/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="flex gap-1 opacity-60">
              <div className="w-2 h-2 rounded-full bg-red-500/20 border border-red-500/50" />
              <div className="w-2 h-2 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
              <div className="w-2 h-2 rounded-full bg-green-500/20 border border-green-500/50" />
            </div>
            <div className="h-3 w-px bg-card-border" />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-foreground tracking-wider leading-none">DIFFUSION_ENGINE</span>
              <span className="text-[7px] text-muted-foreground font-mono leading-none mt-0.5">V2.4.0 // RUNNING</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-950/30 border border-cyan-500/20">
                <div className={`w-1 h-1 rounded-full ${isGenerating ? 'bg-cyan-400 animate-pulse' : 'bg-cyan-900'}`} />
                <span className="text-[8px] font-mono text-cyan-300">{isGenerating ? 'BUSY' : 'IDLE'}</span>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="relative z-10 p-1">
            
            {/* Viewport: The Image Area */}
            <div className="relative aspect-square rounded-lg overflow-hidden bg-black border border-card-border shadow-inner group-hover:border-cyan-500/30 transition-colors duration-500">
                
                {/* Technical Grid Overlay */}
                <div className="absolute inset-0 z-20 pointer-events-none bg-[url('/grid-pattern.svg')] opacity-10 bg-[length:20px_20px]" />
                <div className="absolute inset-0 z-20 pointer-events-none border-[0.5px] border-white/5 m-1.5 rounded-sm" />
                
                {/* Corner Markers - Smaller */}
                <div className="absolute top-2.5 left-2.5 w-1.5 h-1.5 border-t border-l border-cyan-500/50 z-20" />
                <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 border-t border-r border-cyan-500/50 z-20" />
                <div className="absolute bottom-2.5 left-2.5 w-1.5 h-1.5 border-b border-l border-cyan-500/50 z-20" />
                <div className="absolute bottom-2.5 right-2.5 w-1.5 h-1.5 border-b border-r border-cyan-500/50 z-20" />

                {/* Model Badge Overlay - More Compact */}
                <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 bg-black/60 backdrop-blur-md border border-white/10 px-1.5 py-0.5 rounded text-[8px] text-gray-300 font-mono">
                    <span className="w-1.5 h-1.5 rounded bg-gradient-to-br from-cyan-400 to-blue-600 animate-spin-slow" />
                    {selectedModel}
                </div>

                <AnimatePresence>
                  {showLatent && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-10 bg-[#050507] flex items-center justify-center">
                        <div className="relative w-full h-full flex items-center justify-center">
                             <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/40 via-transparent to-transparent" />
                             <NeuralNetworkVisualization isActive={showLatent} progress={1} />
                        </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Noise & Image Layers */}
                {!isMobile && noiseDataUrl && currentStep >= 8 && (
                    <motion.div className="absolute inset-0 z-10" animate={{ opacity: Math.max(0, 1 - denoisingProgress * 1.5), filter: `contrast(${1 + denoisingProgress * 0.5})` }}>
                        <Image src={noiseDataUrl} alt="Noise" fill className="object-cover" style={{ mixBlendMode: denoisingProgress > 0.5 ? 'overlay' : 'normal', imageRendering: 'pixelated' }} unoptimized />
                    </motion.div>
                )}

                <motion.div className="absolute inset-0" animate={{ opacity: Math.min(1, denoisingProgress * 1.2), filter: `blur(${Math.max(0, (1 - denoisingProgress) * maxInitialBlurPx)}px) saturate(${0.5 + denoisingProgress * 0.5})`, scale: 1 + (1 - denoisingProgress) * 0.05 }}>
                    <Image ref={imageRef} src="/hero-image.png" alt="Generated" fill className="object-cover" quality={100} priority />
                </motion.div>

                {/* Analysis Layers (Canny/Depth) - Holo Effect */}
                {controlNet.canny.enabled && overlayData.canny && (
                    <motion.div className="absolute inset-0 z-15 pointer-events-none mix-blend-screen" style={{ opacity: 0.5 * (1 - denoisingProgress) * controlNet.canny.weight }}>
                        <Image src={overlayData.canny} alt="Canny" fill className="object-cover" unoptimized />
                        <div className="absolute bottom-3 left-3 text-[7px] font-mono text-green-400/80 bg-black/80 px-1 rounded border border-green-500/20">CANNY_DETECT</div>
                    </motion.div>
                )}
                
                {/* Progress Overlay (Cyberpunk style) - Compact */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3 z-30">
                     <div className="flex justify-between items-end mb-1">
                        <div className="flex flex-col">
                            <span className="text-[7px] text-cyan-500/60 font-mono uppercase mb-0.5">Denoising Loop</span>
                            <div className="flex items-baseline gap-0.5">
                                <span className="text-xl font-light text-white tracking-tighter">{Math.floor(denoisingProgress * 100)}</span>
                                <span className="text-[8px] text-cyan-400 font-mono">%</span>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[7px] text-gray-500 font-mono">STEP {currentStep}/{totalSteps}</span>
                            <span className="text-[7px] text-cyan-500 font-mono">SIGMA: {sigmaValue.toFixed(2)}</span>
                        </div>
                     </div>
                     {/* Progress Bar */}
                     <div className="relative w-full h-0.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                            className="absolute top-0 left-0 bottom-0 bg-cyan-500 shadow-[0_0_10px_#06b6d4]"
                            style={{ width: `${denoisingProgress * 100}%` }}
                        />
                     </div>
                </div>

                {/* Scanner Beam */}
                <motion.div 
                    className="absolute left-0 right-0 h-[1px] bg-cyan-400/50 shadow-[0_0_15px_rgba(34,211,238,0.8)] z-20 pointer-events-none"
                    animate={{ top: ["0%", "100%"], opacity: [0, 1, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                />
            </div>
        </div>

        {/* Control Dashboard - Compact Padding */}
        <div className="p-3 bg-card border-t border-card-border space-y-3">
            
            {/* Parameter Stats */}
            <div className="grid grid-cols-4 gap-1.5">
                {[
                    { label: 'SAMPLER', value: currentSampler, color: 'text-cyan-600 dark:text-cyan-200' },
                    { label: 'STEPS', value: totalSteps, color: 'text-foreground' },
                    { label: 'CFG', value: cfgScale, color: 'text-emerald-600 dark:text-emerald-200' },
                    { label: 'SEED', value: seed.toString().slice(0, 5), color: 'text-purple-600 dark:text-purple-200' }
                ].map((stat, i) => (
                    <div key={i} className="flex flex-col bg-foreground/[0.03] border border-card-border p-1.5 rounded-md hover:bg-foreground/[0.05] transition-colors">
                        <span className="text-[6px] font-mono text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                        <span className={`text-[8px] font-mono ${stat.color} mt-0.5 truncate`}>{stat.value}</span>
                    </div>
                ))}
            </div>

            {/* Terminal Prompt - More Compact */}
            <div className="bg-muted/50 border border-card-border rounded-md p-2 font-mono text-[9px] relative overflow-hidden group/terminal">
                <div className="absolute top-0 left-0 w-0.5 h-full bg-gradient-to-b from-cyan-500 to-purple-600 opacity-50" />
                <div className="flex flex-col gap-1.5">
                    <div className="flex gap-2 text-muted-foreground items-start">
                        <span className="text-green-500 font-bold mt-[1px]">$</span>
                        <div className="text-foreground leading-tight flex-1">
                            <span className="opacity-50 mr-1.5">prompt --pos</span>
                            {positivePrompt}
                            <span className="inline-block w-1 h-2.5 bg-cyan-500 ml-0.5 animate-pulse align-middle" />
                        </div>
                    </div>
                    <div className="flex gap-2 text-muted-foreground items-start border-t border-card-border pt-1.5">
                        <span className="text-red-500 font-bold mt-[1px]">$</span>
                        <div className="text-muted-foreground leading-tight flex-1 line-clamp-1">
                            <span className="opacity-50 mr-1.5">prompt --neg</span>
                            {negativePrompt}
                        </div>
                    </div>
                </div>
            </div>

            {/* ControlNet Panel - Accordion */}
            <div className="border border-card-border rounded-md bg-foreground/[0.02] overflow-hidden">
                <button 
                    onClick={() => setShowControlNet(!showControlNet)}
                    className="w-full flex items-center justify-between p-1.5 text-[8px] text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors uppercase font-mono tracking-wider"
                >
                    <div className="flex items-center gap-1.5">
                        <div className="w-1 h-1 bg-cyan-500 rounded-full" />
                        ControlNet Pipeline
                    </div>
                    <span>{showControlNet ? '[-]' : '[+]'}</span>
                </button>
                
                <AnimatePresence>
                    {showControlNet && (
                        <motion.div 
                            initial={{ height: 0 }} 
                            animate={{ height: "auto" }} 
                            exit={{ height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="p-1.5 pt-0 space-y-1.5">
                                {(['depth', 'canny', 'scribble'] as const).map((type) => (
                                    <div key={type} className="flex items-center gap-2 p-1 bg-muted/20 rounded border border-card-border">
                                        <div 
                                            className={`w-2.5 h-2.5 rounded-sm flex items-center justify-center border cursor-pointer transition-colors ${controlNet[type].enabled ? 'border-cyan-500 bg-cyan-500/20' : 'border-muted-foreground/30 bg-transparent'}`}
                                            onClick={() => setControlNet(prev => ({...prev, [type]: {...prev[type], enabled: !prev[type].enabled}}))}
                                        >
                                            {controlNet[type].enabled && <div className="w-1 h-1 bg-cyan-400 rounded-[0.5px]" />}
                                        </div>
                                        <span className="text-[8px] font-mono text-muted-foreground uppercase w-12">{type}</span>
                                        
                                        {/* Custom Slider Visualization */}
                                        <div className="flex-1 h-1 bg-muted/40 rounded-full overflow-hidden relative">
                                            <div className="absolute inset-0 opacity-20" 
                                                 style={{ backgroundImage: 'linear-gradient(90deg, transparent 95%, rgba(255,255,255,0.1) 95%)', backgroundSize: '10% 100%' }} 
                                            />
                                            <motion.div 
                                                className="h-full bg-cyan-500" 
                                                initial={false}
                                                animate={{ width: `${controlNet[type].weight * 50}%` }} 
                                            />
                                        </div>
                                        <span className="text-[7px] font-mono text-cyan-500 w-5 text-right">{controlNet[type].weight.toFixed(1)}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer Metrics - Very Compact */}
            <div className="flex items-center justify-between pt-1 border-t border-card-border text-[7px] font-mono text-muted-foreground uppercase tracking-widest">
                <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                        <span className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                        A100
                    </span>
                    <span>VRAM: {isGenerating ? '92%' : '14%'}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-muted-foreground/50">74°C</span>
                    <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(i => (
                            <div key={i} className={`w-0.5 h-1.5 ${i < 3 ? 'bg-cyan-500/30' : 'bg-muted'}`} />
                        ))}
                    </div>
                </div>
            </div>

        </div>
      </div>
    </motion.div>
  );
};

export default StableDiffusionInterface;
