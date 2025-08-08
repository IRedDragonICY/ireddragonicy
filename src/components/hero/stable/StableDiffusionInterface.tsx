'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import NeuralNetworkVisualization from '../NeuralNetworkVisualization';
import { CONTROLNET_PREPROCESSORS, CONTROLNET_TYPES, MODELS, SAMPLERS, type ControlNetType, type ModelName, type Sampler } from '../constants';
import { createDepthMapDataURL, createSobelEdgeDataURL, generateTransparencyAwareNoise } from '../utils';

type ControlNetState = {
  enabled: boolean;
  preprocessor?: string;
  weight: number; // 0..2
};

type OverlayDataMap = {
  depth?: string | null;
  canny?: string | null;
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
  });
  const [showControlNet, setShowControlNet] = useState(false);
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

  // Generate overlays from base image (depth + canny only)
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
        setOverlayData({ canny: cannyUrl, depth: depthUrl });
      } catch (_e) {
        // ignore
      }
    };
    img.src = '/hero-image.png';
  }, [seed, isMobileView, controlNet.canny.preprocessor]);

  const randomizeControlNetScenario = useCallback(() => {
    // 40% none, 30% single, 20% double, 10% all
    const r = Math.random();
    const enabled = { depth: false, canny: false } as Record<Exclude<ControlNetType, 'none'>, boolean>;
    const keys: Array<Exclude<ControlNetType, 'none'>> = ['depth', 'canny'];
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
      <div className="h-full w-full max-w-[320px] sm:max-w-md lg:max-w-[440px] mx-auto bg-black/80 backdrop-blur-xl border border-cyan-500/20 rounded-xl overflow-hidden shadow-2xl flex flex-col">
        <div className="p-2 sm:p-2 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-900/20 to-blue-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-[10px] sm:text-sm font-mono text-cyan-400">txt2img • {selectedModel}</span>
            </div>
            <span className="text-[10px] sm:text-xs font-mono text-gray-500">Step {currentStep}/{totalSteps}</span>
          </div>
        </div>
        <div className="relative flex-1 min-h-0 bg-gray-900">
          <AnimatePresence>
            {showLatent && (
              <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0 }} className="absolute inset-0 flex items-center justify-center z-20">
                <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-lg overflow-hidden bg-black/50 border border-cyan-500/50 shadow-xl">
                  <NeuralNetworkVisualization isActive={showLatent} progress={1} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!isMobile && noiseDataUrl && currentStep >= 8 && (
            <motion.div className="absolute inset-0 z-10" animate={{ opacity: Math.max(0, 1 - denoisingProgress * 1.5), filter: `contrast(${1 + denoisingProgress * 0.5})` }}>
              <div className="relative w-full h-full">
                <Image src={noiseDataUrl} alt="Noise" fill className="object-contain" style={{ mixBlendMode: denoisingProgress > 0.5 ? 'overlay' : 'normal', imageRendering: 'pixelated' }} unoptimized />
              </div>
            </motion.div>
          )}

          <motion.div className="absolute inset-0" animate={{ opacity: Math.min(1, denoisingProgress * 1.2), filter: `blur(${Math.max(0, (1 - denoisingProgress) * maxInitialBlurPx)}px) saturate(${0.5 + denoisingProgress * 0.5})`, scale: 1 + (1 - denoisingProgress) * 0.05 }}>
            <Image ref={imageRef} src="/hero-image.png" alt="Generated" fill className="object-contain" quality={100} priority />
          </motion.div>

          {/* ControlNet overlays (depth + canny) */}
          {controlNet.canny.enabled && overlayData.canny && (
            <motion.div className="absolute inset-0 z-20" style={{ opacity: 0.7 * (1 - denoisingProgress) * controlNet.canny.weight }}>
              <Image src={overlayData.canny} alt="Canny" fill className="object-contain mix-blend-screen" unoptimized />
            </motion.div>
          )}
          {controlNet.depth.enabled && overlayData.depth && (
            <motion.div className="absolute inset-0 z-20" style={{ opacity: 0.5 * (1 - denoisingProgress) * controlNet.depth.weight }}>
              <Image src={overlayData.depth} alt="Depth" fill className="object-contain mix-blend-multiply" unoptimized />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-transparent pointer-events-none" />
            </motion.div>
          )}

          {currentStep >= 10 && currentStep < 40 && (
            <>
              <motion.div className="absolute inset-0 pointer-events-none z-30" animate={{ background: `radial-gradient(circle at 50% ${50 + Math.sin(currentStep * 0.2) * 10}%, transparent 0%, rgba(34, 211, 238, ${0.1 * (1 - denoisingProgress)}) 50%, transparent 100%)` }} />
              <div className="absolute inset-0 pointer-events-none z-30 opacity-20">
                <motion.div className="h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" animate={{ y: `${denoisingProgress * 100}%` }} transition={{ duration: 0.1 }} />
              </div>
            </>
          )}

          <div className="absolute bottom-0 left-0 right-0 p-1 bg-gradient-to-t from-black/80 to-transparent">
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-cyan-400">σ={sigmaValue.toFixed(3)}</span>
                <span className="text-green-400">{(denoisingProgress * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full h-1 bg-black/50 rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-cyan-400 to-green-400" style={{ width: `${denoisingProgress * 100}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Parameter cards */}
         <div className="p-2 sm:p-2 space-y-2 bg-gray-900/50 overflow-y-auto">
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

          <div className="space-y-2">
            <div className="bg-black/50 rounded-lg p-2 border border-green-500/20">
              <div className="text-[10px] font-mono text-green-400 mb-1">Positive prompt:</div>
              <p className="text-[10px] font-mono text-gray-300 leading-relaxed line-clamp-2">{positivePrompt}</p>
            </div>
            <div className="bg-black/50 rounded-lg p-2 border border-red-500/20">
              <div className="text-[10px] font-mono text-red-400 mb-1">Negative prompt:</div>
              <p className="text-[10px] font-mono text-gray-300 leading-relaxed line-clamp-1">{negativePrompt}</p>
            </div>
          </div>

          {/* ControlNet Panel (collapsible) */}
          <div className="space-y-2">
            <button onClick={() => setShowControlNet((s) => !s)} className="w-full flex items-center justify-between px-2 py-2 bg-black/50 rounded-md border border-gray-800">
              <span className="text-[10px] font-mono text-cyan-400">ControlNet</span>
              <span className="text-[10px] text-gray-400">{showControlNet ? 'Hide' : 'Show'}</span>
            </button>
            <AnimatePresence initial={false}>
              {showControlNet && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="grid grid-cols-1 gap-2">
                  {(CONTROLNET_TYPES.filter((t) => t !== 'none') as Array<Exclude<ControlNetType, 'none'>>).map((type) => (
                    <div key={type} className="bg-black/50 rounded-lg p-2 border border-gray-800">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" checked={controlNet[type].enabled} onChange={(e) => setControlNet((prev) => ({ ...prev, [type]: { ...prev[type], enabled: e.target.checked } }))} />
                          <span className="text-xs font-mono capitalize">{type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-500">w</span>
                          <input type="range" min={0} max={2} step={0.1} value={controlNet[type].weight} onChange={(e) => setControlNet((prev) => ({ ...prev, [type]: { ...prev[type], weight: Number(e.target.value) } }))} />
                          <span className="text-[10px] text-gray-400 w-8 text-right">{controlNet[type].weight.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-500">Pre</span>
                          <select className="bg-black/40 border border-gray-800 rounded px-2 py-1 text-[10px]" value={controlNet[type].preprocessor} onChange={(e) => setControlNet((prev) => ({ ...prev, [type]: { ...prev[type], preprocessor: e.target.value } }))}>
                            {CONTROLNET_PREPROCESSORS[type].map((p) => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                          {type === 'depth' && overlayData.depth && <span className="text-[10px] text-cyan-400">depth ready</span>}
                          {type === 'canny' && overlayData.canny && <span className="text-[10px] text-cyan-400">edges ready</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono">
            <div className="flex items-center gap-2">
              <motion.div animate={{ rotate: isGenerating ? 360 : 0 }} transition={{ duration: 2, repeat: isGenerating ? Infinity : 0, ease: 'linear' }} className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full" />
              <span className="text-cyan-400">{currentStep < totalSteps ? 'Generating...' : 'Complete'}</span>
            </div>
            <span className="text-gray-500">{currentStep < totalSteps ? `ETA: ${Math.ceil((totalSteps - currentStep) * 0.1)}s` : 'Next: 2s'}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StableDiffusionInterface;


