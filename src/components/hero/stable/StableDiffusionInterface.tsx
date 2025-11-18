'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import NeuralNetworkVisualization from '../NeuralNetworkVisualization';
import { CONTROLNET_PREPROCESSORS, CONTROLNET_TYPES, MODELS, SAMPLERS, type ControlNetType, type ModelName, type Sampler } from '../constants';
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
  const [showControlNet, setShowControlNet] = useState(true); // Default to true for "complex" look
  const imageRef = useRef<HTMLImageElement>(null);

  const totalSteps = 50;
  const samplingSteps = 30;
  const models = MODELS;

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
      } catch (_e) {
        // ignore
      }
    };
    img.src = '/hero-image.png';
  }, [seed, isMobileView, controlNet.canny.preprocessor, controlNet.scribble.preprocessor]);

  const randomizeControlNetScenario = useCallback(() => {
    // 40% none, 30% single, 20% double, 10% all
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
    <motion.div style={{ y: interfaceY, scale: interfaceScale }} className="relative w-full h-full flex flex-col justify-center px-2 md:px-0">
      <div className="h-full w-full max-w-[300px] sm:max-w-sm lg:max-w-[380px] mx-auto bg-[#0A0A0C]/90 backdrop-blur-2xl border border-cyan-500/30 rounded-xl overflow-hidden shadow-2xl flex flex-col relative group">
        
        {/* Professional Header with Status */}
        <div className="p-2 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
             </div>
             <div className="h-4 w-px bg-cyan-500/20 mx-1" />
             <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-mono font-bold text-cyan-400 tracking-wide">STABLE_DIFFUSION_WEBUI</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono">{selectedModel}</span>
             </div>
          </div>
          <span className="text-[10px] font-mono text-gray-400 tabular-nums">
            Step {currentStep.toString().padStart(2, '0')}/{totalSteps}
          </span>
        </div>

        {/* Main Generation Area - FIXED ASPECT RATIO to prevent collapse */}
        <div className="relative w-full aspect-square bg-[#050507] overflow-hidden group-hover:shadow-[inset_0_0_40px_rgba(34,211,238,0.05)] transition-all duration-500">
          
          {/* Grid Overlay for "Technical" feel */}
          <div className="absolute inset-0 pointer-events-none z-10 opacity-20" 
               style={{ backgroundImage: 'linear-gradient(rgba(34, 211, 238, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34, 211, 238, 0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
          />

          <AnimatePresence>
            {showLatent && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center z-20 bg-black/80 backdrop-blur-sm">
                <div className="relative">
                  <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full animate-pulse" />
                  <div className="w-32 h-32 rounded-lg overflow-hidden border border-cyan-500/50 shadow-[0_0_30px_rgba(34,211,238,0.2)] relative bg-black">
                    <NeuralNetworkVisualization isActive={showLatent} progress={1} />
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[8px] text-cyan-400 font-mono text-center py-1">
                        LATENT_SPACE_TRAVERSAL
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!isMobile && noiseDataUrl && currentStep >= 8 && (
            <motion.div className="absolute inset-0 z-10" animate={{ opacity: Math.max(0, 1 - denoisingProgress * 1.5), filter: `contrast(${1 + denoisingProgress * 0.5})` }}>
              <div className="relative w-full h-full">
                <Image src={noiseDataUrl} alt="Noise" fill className="object-cover" style={{ mixBlendMode: denoisingProgress > 0.5 ? 'overlay' : 'normal', imageRendering: 'pixelated' }} unoptimized />
              </div>
            </motion.div>
          )}

          <motion.div className="absolute inset-0" animate={{ opacity: Math.min(1, denoisingProgress * 1.2), filter: `blur(${Math.max(0, (1 - denoisingProgress) * maxInitialBlurPx)}px) saturate(${0.5 + denoisingProgress * 0.5})`, scale: 1 + (1 - denoisingProgress) * 0.05 }}>
            <Image ref={imageRef} src="/hero-image.png" alt="Generated" fill className="object-cover" quality={100} priority />
          </motion.div>

          {/* ControlNet overlays (depth + canny + scribble) - Visualized as scanning layers */}
          {controlNet.canny.enabled && overlayData.canny && (
            <motion.div className="absolute inset-0 z-20 pointer-events-none" style={{ opacity: 0.6 * (1 - denoisingProgress) * controlNet.canny.weight }}>
              <Image src={overlayData.canny} alt="Canny" fill className="object-cover mix-blend-screen" unoptimized />
              <div className="absolute top-2 left-2 text-[8px] bg-black/50 text-green-400 px-1 font-mono border border-green-500/30">CANNY_EDGE_DETECT</div>
            </motion.div>
          )}
          {controlNet.depth.enabled && overlayData.depth && (
            <motion.div className="absolute inset-0 z-20 pointer-events-none" style={{ opacity: 0.4 * (1 - denoisingProgress) * controlNet.depth.weight }}>
              <Image src={overlayData.depth} alt="Depth" fill className="object-cover mix-blend-overlay" unoptimized />
               <div className="absolute top-6 left-2 text-[8px] bg-black/50 text-blue-400 px-1 font-mono border border-blue-500/30">DEPTH_MAP_ESTIMATION</div>
            </motion.div>
          )}

          {/* Scanning Effect */}
          {currentStep >= 10 && currentStep < 40 && (
            <>
              <motion.div className="absolute inset-0 pointer-events-none z-30" animate={{ background: `radial-gradient(circle at 50% ${50 + Math.sin(currentStep * 0.2) * 10}%, transparent 0%, rgba(34, 211, 238, ${0.1 * (1 - denoisingProgress)}) 50%, transparent 100%)` }} />
              <div className="absolute inset-0 pointer-events-none z-30 opacity-30">
                <motion.div className="h-0.5 w-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" animate={{ top: [`0%`, `100%`] }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
              </div>
            </>
          )}

          {/* Overlay UI inside Image */}
          <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-30">
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-mono items-end">
                <div className="flex flex-col">
                    <span className="text-gray-500 text-[8px] uppercase">Denoising Strength</span>
                    <span className="text-cyan-400 font-bold">σ={(sigmaValue).toFixed(3)}</span>
                </div>
                <span className="text-green-400 font-bold text-lg">{(denoisingProgress * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-cyan-500 to-green-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]" style={{ width: `${denoisingProgress * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Controls & Parameters - Collapsible/Scrollable */}
         <div className="flex-1 overflow-y-auto min-h-[120px] max-h-[250px] bg-[#08080A] p-2 space-y-2 border-t border-cyan-500/10 no-scrollbar">
          {/* Tech Parameters Grid */}
          <div className="grid grid-cols-4 gap-1.5">
            {[
                { label: 'SAMPLER', value: 'DPM++ 2M', color: 'text-cyan-300' },
                { label: 'STEPS', value: totalSteps, color: 'text-green-300' },
                { label: 'CFG', value: cfgScale, color: 'text-yellow-300' },
                { label: 'SEED', value: seed.toString().slice(0,4)+'...', color: 'text-purple-300' }
            ].map((item, i) => (
                <div key={i} className="bg-[#111]/80 rounded border border-white/5 p-1 flex flex-col gap-0.5 hover:border-cyan-500/30 transition-colors group/item">
                    <span className="text-[7px] text-gray-500 font-mono">{item.label}</span>
                    <span className={`text-[9px] font-mono font-medium ${item.color} truncate group-hover/item:text-white transition-colors`}>{item.value}</span>
                </div>
            ))}
          </div>

          {/* Prompt Box - Terminal Style */}
          <div className="space-y-1.5 font-mono text-[9px]">
            <div className="relative group/prompt">
                <div className="absolute -left-1.5 top-0 bottom-0 w-0.5 bg-green-500/30 group-hover/prompt:bg-green-500 transition-colors" />
                <div className="bg-black/40 p-1.5 rounded border border-white/5 text-gray-300 leading-relaxed line-clamp-2">
                    <span className="text-green-500 mr-2">$ prompt --positive</span>
                    {positivePrompt}
                </div>
            </div>
            <div className="relative group/prompt">
                <div className="absolute -left-1.5 top-0 bottom-0 w-0.5 bg-red-500/30 group-hover/prompt:bg-red-500 transition-colors" />
                <div className="bg-black/40 p-1.5 rounded border border-white/5 text-gray-400 leading-relaxed line-clamp-1">
                    <span className="text-red-500 mr-2">$ prompt --negative</span>
                    {negativePrompt}
                </div>
            </div>
          </div>

          {/* Advanced Settings Toggle */}
          <div className="pt-1.5 border-t border-white/5">
            <button onClick={() => setShowControlNet((s) => !s)} className="w-full flex items-center justify-between text-[9px] text-cyan-400 hover:text-cyan-300 transition-colors group">
              <span className="flex items-center gap-2 font-mono uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-cyan-500 rounded-sm group-hover:animate-pulse" />
                ControlNet Pipeline
              </span>
              <span className="opacity-50 group-hover:opacity-100">{showControlNet ? '[-]' : '[+]'}</span>
            </button>
            
            <AnimatePresence>
              {showControlNet && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="pt-1.5 space-y-1.5">
                    {(CONTROLNET_TYPES.filter((t) => t !== 'none') as Array<Exclude<ControlNetType, 'none'>>).map((type) => (
                        <div key={type} className="flex items-center gap-2 bg-[#151515] p-1 rounded border border-white/5">
                            <input 
                                type="checkbox" 
                                checked={controlNet[type].enabled} 
                                onChange={(e) => setControlNet((prev) => ({ ...prev, [type]: { ...prev[type], enabled: e.target.checked } }))}
                                className="accent-cyan-500 bg-transparent border-gray-700 rounded h-2.5 w-2.5"
                            />
                            <span className="text-[9px] text-gray-300 font-mono uppercase w-14">{type}</span>
                            <div className="flex-1 h-1 bg-gray-800 rounded-full overflow-hidden relative">
                                <div className="absolute inset-y-0 left-0 bg-cyan-500/50" style={{ width: `${controlNet[type].weight * 50}%` }} />
                            </div>
                            <span className="text-[8px] text-gray-500 font-mono">{controlNet[type].weight.toFixed(1)}</span>
                        </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Status Footer */}
          <div className="flex items-center justify-between pt-0.5 text-[8px] font-mono text-gray-500 uppercase tracking-widest">
            <span>GPU: NVIDIA A100 [80GB]</span>
            <span className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isGenerating ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                {isGenerating ? 'PROCESSING' : 'IDLE'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StableDiffusionInterface;