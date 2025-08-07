// components/LoadingScreen.tsx
'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';

interface SystemModule {
  id: string;
  name: string;
  status: 'pending' | 'loading' | 'complete' | 'error';
  progress: number;
  submodules?: string[];
  memoryUsage?: number;
  threads?: number;
}

interface NetworkNode {
  id: number;
  x: number;
  y: number;
  connected: number[];
  active: boolean;
}

interface SystemMetric {
  label: string;
  value: number;
  max: number;
  unit: string;
  color: string;
}

const LoadingScreen = ({ onLoadComplete }: { onLoadComplete: () => void }) => {
  const [modules, setModules] = useState<SystemModule[]>([
    { id: 'core', name: 'Core System', status: 'pending', progress: 0, memoryUsage: 0, threads: 0, submodules: ['Kernel', 'Memory Manager', 'Process Handler', 'Thread Pool'] },
    { id: 'neural', name: 'Neural Engine', status: 'pending', progress: 0, memoryUsage: 0, threads: 0, submodules: ['Tensor Core', 'CUDA Driver', 'Model Loader', 'Optimizer'] },
    { id: 'diffusion', name: 'Diffusion Pipeline', status: 'pending', progress: 0, memoryUsage: 0, threads: 0, submodules: ['VAE', 'U-Net', 'CLIP Encoder', 'Scheduler'] },
    { id: 'interface', name: 'User Interface', status: 'pending', progress: 0, memoryUsage: 0, threads: 0, submodules: ['React Runtime', 'WebGL Context', 'Animation Engine', 'Event System'] },
    { id: 'network', name: 'Network Protocol', status: 'pending', progress: 0, memoryUsage: 0, threads: 0, submodules: ['WebSocket', 'REST API', 'GraphQL', 'P2P Engine'] },
    { id: 'security', name: 'Security Layer', status: 'pending', progress: 0, memoryUsage: 0, threads: 0, submodules: ['Encryption', 'Auth Token', 'Firewall', 'Anti-Malware'] },
    { id: 'database', name: 'Data Systems', status: 'pending', progress: 0, memoryUsage: 0, threads: 0, submodules: ['Cache', 'Storage', 'Index', 'Query Engine'] },
    { id: 'profile', name: 'User Profile', status: 'pending', progress: 0, memoryUsage: 0, threads: 0, submodules: ['Preferences', 'History', 'Analytics', 'Sync Engine'] },
  ]);

  const [currentPhase, setCurrentPhase] = useState(0);
  const [consoleLines, setConsoleLines] = useState<{ id: string; text: string; type: string }[]>([]);
  const [systemStatus, setSystemStatus] = useState('INITIALIZING');
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [sessionId, setSessionId] = useState('LOADING...');
  const [currentTime, setCurrentTime] = useState('--:--:--');
  const [matrixRain, setMatrixRain] = useState<string[]>([]);
  const [glitchActive, setGlitchActive] = useState(false);
  const [cpuUsage, setCpuUsage] = useState(0);
  const [gpuUsage, setGpuUsage] = useState(0);
  const [memoryUsage, setMemoryUsage] = useState(0);
  const [networkNodes, setNetworkNodes] = useState<NetworkNode[]>([]);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [hexPatterns, setHexPatterns] = useState<{ x: number; y: number; delay: number }[]>([]);

  const consoleRef = useRef<HTMLDivElement>(null);
  const lineIdCounter = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleControls = useAnimation();

  // System metrics
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([
    { label: 'CPU', value: 0, max: 100, unit: '%', color: '#06b6d4' },
    { label: 'GPU', value: 0, max: 100, unit: '%', color: '#10b981' },
    { label: 'RAM', value: 0, max: 32768, unit: 'MB', color: '#8b5cf6' },
    { label: 'VRAM', value: 0, max: 24576, unit: 'MB', color: '#f59e0b' },
    { label: 'Network', value: 0, max: 1000, unit: 'Mbps', color: '#ef4444' },
    { label: 'Disk I/O', value: 0, max: 500, unit: 'MB/s', color: '#ec4899' },
  ]);

  // Generate complex patterns
  useEffect(() => {
    // Generate hexagonal pattern positions
    const hexes = [];
    for (let i = 0; i < 20; i++) {
      hexes.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 2
      });
    }
    setHexPatterns(hexes);

    // Generate network nodes
    const nodes: NetworkNode[] = [];
    for (let i = 0; i < 15; i++) {
      nodes.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        connected: [],
        active: false
      });
    }
    // Connect nodes randomly
    nodes.forEach((node, i) => {
      const connections = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < connections; j++) {
        const target = Math.floor(Math.random() * nodes.length);
        if (target !== i && !node.connected.includes(target)) {
          node.connected.push(target);
        }
      }
    });
    setNetworkNodes(nodes);
  }, []);

  // Generate session ID and matrix rain
  useEffect(() => {
    setSessionId('SES-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase());

    // Generate matrix rain characters
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const rain = [];
    for (let i = 0; i < 50; i++) {
      rain.push(chars[Math.floor(Math.random() * chars.length)]);
    }
    setMatrixRain(rain);
  }, []);

  // Update time and system metrics
  useEffect(() => {
    const updateMetrics = () => {
      setCurrentTime(new Date().toLocaleTimeString());

      // Simulate system metrics
      setSystemMetrics(prev => prev.map(metric => ({
        ...metric,
        value: metric.value + (Math.random() - 0.5) * metric.max * 0.1
      })));

      // Update waveform data
      const newWaveform = [];
      for (let i = 0; i < 50; i++) {
        newWaveform.push(Math.sin(Date.now() * 0.001 + i * 0.2) * 50 + Math.random() * 20);
      }
      setWaveformData(newWaveform);

      // Random glitch effect
      if (Math.random() < 0.02) {
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 100);
      }
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 100);
    return () => clearInterval(interval);
  }, []);

  // Particle animation on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; size: number; color: string }[] = [];

    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 0.5,
        color: `hsla(${180 + Math.random() * 60}, 100%, 50%, ${Math.random() * 0.5})`
      });
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();

        // Connect nearby particles
        particles.forEach(other => {
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100 && distance > 0) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(6, 182, 212, ${(100 - distance) / 1000})`;
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  // Console messages with types
  const initMessages = [
    { text: '> System boot sequence initiated...', type: 'info' },
    { text: '> BIOS Version: v4.2.0 Phoenix', type: 'system' },
    { text: '> Checking hardware compatibility...', type: 'info' },
    { text: '> CPU: AMD Ryzen 9 7950X @ 5.7GHz', type: 'hardware' },
    { text: '> GPU: NVIDIA RTX 4090 24GB', type: 'hardware' },
    { text: '> RAM: 64GB DDR5 @ 6000MHz', type: 'hardware' },
    { text: '> Loading kernel modules...', type: 'info' },
    { text: '> [KERNEL] Linux 6.5.0-quantum', type: 'kernel' },
    { text: '> Establishing secure connection...', type: 'network' },
    { text: '> [SECURITY] Quantum encryption enabled', type: 'security' },
    { text: '> Mounting virtual filesystems...', type: 'info' },
    { text: '> Initializing graphics pipeline...', type: 'info' },
    { text: '> [VULKAN] API v1.3.268 loaded', type: 'graphics' },
    { text: '> Configuring neural processors...', type: 'info' },
    { text: '> [NEURAL] TPU acceleration active', type: 'neural' },
    { text: '> Calibrating diffusion models...', type: 'info' },
  ];

  // Add console line with type
  const addConsoleLine = (text: string, type: string = 'info') => {
    const id = `line-${lineIdCounter.current++}`;
    setConsoleLines(prev => [...prev, { id, text, type }]);
  };

  // Initialize modules with complex sequence
  useEffect(() => {
    const initializeModules = async () => {
      // Phase 1: Boot sequence
      for (let i = 0; i < initMessages.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 150 + Math.random() * 100));
        addConsoleLine(initMessages[i].text, initMessages[i].type);
        setProgressPercentage((i + 1) / initMessages.length * 15);

        // Update random network node
        setNetworkNodes(prev => prev.map((node, index) => ({
          ...node,
          active: Math.random() < 0.3
        })));
      }

      // Phase 2: Module initialization
      setCurrentPhase(1);
      setSystemStatus('LOADING MODULES');

      for (let i = 0; i < modules.length; i++) {
        const currentModule = modules[i];

        // Start loading module
        setModules(prev => prev.map(m =>
          m.id === currentModule.id ? { ...m, status: 'loading' } : m
        ));

        addConsoleLine(`> [${currentModule.id.toUpperCase()}] Initializing ${currentModule.name}...`, 'module');
        addConsoleLine(`  │ Allocating memory...`, 'detail');

        // Simulate memory allocation
        const targetMemory = 256 + Math.random() * 768;
        const targetThreads = 4 + Math.floor(Math.random() * 12);

        // Load submodules with detailed output
        if (currentModule.submodules) {
          for (let j = 0; j < currentModule.submodules.length; j++) {
            await new Promise(resolve => setTimeout(resolve, 80 + Math.random() * 40));
            const progress = ((j + 1) / currentModule.submodules.length) * 100;

            setModules(prev => prev.map(m =>
              m.id === currentModule.id ? {
                ...m,
                progress,
                memoryUsage: (progress / 100) * targetMemory,
                threads: Math.floor((progress / 100) * targetThreads)
              } : m
            ));

            addConsoleLine(`  ├─ Loading ${currentModule.submodules[j]}...`, 'detail');
            await new Promise(resolve => setTimeout(resolve, 30));
            addConsoleLine(`  │  └─ Checksum verified [OK]`, 'success');

            // Update CPU/GPU usage
            setCpuUsage(prev => Math.min(95, prev + Math.random() * 10));
            setGpuUsage(prev => Math.min(90, prev + Math.random() * 8));
            setMemoryUsage(prev => Math.min(85, prev + targetMemory / 100));
          }
        }

        // Complete module
        await new Promise(resolve => setTimeout(resolve, 200));
        setModules(prev => prev.map(m =>
          m.id === currentModule.id ? {
            ...m,
            status: 'complete',
            progress: 100,
            memoryUsage: targetMemory,
            threads: targetThreads
          } : m
        ));

        addConsoleLine(`  └─ Module initialized successfully`, 'success');
        addConsoleLine(`> [${currentModule.id.toUpperCase()}] Ready • Memory: ${targetMemory.toFixed(0)}MB • Threads: ${targetThreads} ✓`, 'complete');
        setProgressPercentage(15 + ((i + 1) / modules.length * 70));
      }

      // Phase 3: System optimization
      setCurrentPhase(2);
      setSystemStatus('OPTIMIZING');

      const optimizationMessages = [
        { text: '> Running system diagnostics...', type: 'info' },
        { text: '  ├─ Memory defragmentation...', type: 'detail' },
        { text: '  ├─ Cache optimization...', type: 'detail' },
        { text: '  └─ Performance metrics analyzed', type: 'success' },
        { text: '> Optimizing neural pathways...', type: 'neural' },
        { text: '  └─ Quantum entanglement stable', type: 'quantum' },
        { text: '> Loading user profile: IREDDRAGONICY', type: 'user' },
        { text: '  ├─ Preferences loaded', type: 'detail' },
        { text: '  ├─ Neural signature recognized', type: 'detail' },
        { text: '  └─ Biometric authentication complete', type: 'success' },
        { text: '> Establishing neural link...', type: 'neural' },
        { text: '  └─ Synchronization complete', type: 'success' },
        { text: '> Running final checks...', type: 'info' },
        { text: '  ├─ All systems nominal', type: 'success' },
        { text: '  └─ Ready for operation', type: 'success' },
        { text: '>', type: 'info' },
        { text: '> System initialization complete.', type: 'complete' },
        { text: '> Welcome back, Operator.', type: 'welcome' },
      ];

      for (let i = 0; i < optimizationMessages.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 100));
        addConsoleLine(optimizationMessages[i].text, optimizationMessages[i].type);
        setProgressPercentage(85 + ((i + 1) / optimizationMessages.length * 15));

        // Gradually reduce system load
        if (i > optimizationMessages.length / 2) {
          setCpuUsage(prev => Math.max(10, prev - Math.random() * 15));
          setGpuUsage(prev => Math.max(5, prev - Math.random() * 12));
        }
      }

      setSystemStatus('ONLINE');

      // Final animation
      await new Promise(resolve => setTimeout(resolve, 1000));
      onLoadComplete();
    };

    initializeModules();
  }, []);

  // Auto-scroll console
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleLines]);

  // Generate circuit pattern
  const circuitPattern = useMemo(() => {
    const paths = [];
    for (let i = 0; i < 10; i++) {
      const startX = Math.random() * 100;
      const startY = Math.random() * 100;
      const endX = Math.random() * 100;
      const endY = Math.random() * 100;
      const midX = (startX + endX) / 2 + (Math.random() - 0.5) * 20;
      const midY = (startY + endY) / 2 + (Math.random() - 0.5) * 20;

      paths.push(`M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`);
    }
    return paths;
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed inset-0 bg-black z-[100] flex items-center justify-center overflow-hidden ${glitchActive ? 'glitch-effect' : ''}`}
      >
        {/* Particle canvas background */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 opacity-30"
        />

        {/* Matrix rain effect */}
        <div className="absolute inset-0 overflow-hidden opacity-10">
          {matrixRain.map((char, i) => (
            <motion.div
              key={i}
              className="absolute text-green-400 font-mono text-xs"
              style={{ left: `${(i * 2) % 100}%` }}
              animate={{
                y: [-20, window.innerHeight + 20],
              }}
              transition={{
                duration: 10 + Math.random() * 10,
                repeat: Infinity,
                ease: 'linear',
                delay: Math.random() * 10,
              }}
            >
              {char}
            </motion.div>
          ))}
        </div>

        {/* Circuit pattern SVG */}
        <svg className="absolute inset-0 opacity-5" viewBox="0 0 100 100" preserveAspectRatio="none">
          {circuitPattern.map((path, i) => (
            <motion.path
              key={i}
              d={path}
              fill="none"
              stroke="cyan"
              strokeWidth="0.1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
            />
          ))}
        </svg>

        {/* Hexagonal patterns */}
        <div className="absolute inset-0 opacity-20">
          {hexPatterns.map((hex, i) => (
            <motion.div
              key={i}
              className="absolute w-12 h-12"
              style={{ left: `${hex.x}%`, top: `${hex.y}%` }}
              animate={{
                rotate: 360,
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 10,
                delay: hex.delay,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <polygon
                  points="50,5 90,25 90,75 50,95 10,75 10,25"
                  fill="none"
                  stroke="cyan"
                  strokeWidth="1"
                  opacity="0.5"
                />
              </svg>
            </motion.div>
          ))}
        </div>

        {/* Scanning lines */}
        <motion.div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent"
            animate={{
              y: ['0vh', '100vh'],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
          <motion.div
            className="w-px h-full bg-gradient-to-b from-transparent via-cyan-500 to-transparent absolute"
            animate={{
              x: ['0vw', '100vw'],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'linear',
              delay: 0.5
            }}
          />
        </motion.div>

        {/* Main container */}
        <div className="relative w-full max-w-7xl mx-auto px-4 lg:px-8">
          {/* Top metrics bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 bg-black/80 backdrop-blur-xl border border-cyan-500/30 rounded-lg p-3"
          >
            <div className="grid grid-cols-6 gap-4">
              {systemMetrics.map((metric, i) => (
                <div key={i} className="text-center">
                  <div className="text-xs font-mono text-gray-400 mb-1">{metric.label}</div>
                  <div className="relative h-1 bg-gray-800 rounded-full overflow-hidden mb-1">
                    <motion.div
                      className="absolute h-full"
                      style={{ backgroundColor: metric.color }}
                      animate={{ width: `${(Math.abs(metric.value) / metric.max) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <div className="text-xs font-mono" style={{ color: metric.color }}>
                    {Math.abs(metric.value).toFixed(0)}{metric.unit}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left side - Console */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 bg-black/80 backdrop-blur-xl border border-cyan-500/30 rounded-lg p-4 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-3 border-b border-cyan-500/20 pb-2">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-xs font-mono text-cyan-400 ml-2">system.console</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <span className="text-gray-500">PID: 1337</span>
                  <span className="text-gray-500">TTY: /dev/quantum0</span>
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-green-400"
                  >
                    ● LIVE
                  </motion.span>
                </div>
              </div>

              <div
                ref={consoleRef}
                className="h-[500px] overflow-y-auto font-mono text-xs lg:text-sm space-y-1 custom-scrollbar"
              >
                {consoleLines.map((line) => (
                  <motion.div
                    key={line.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`
                      ${line.type === 'info' ? 'text-cyan-400' : ''}
                      ${line.type === 'detail' ? 'text-gray-500 ml-2' : ''}
                      ${line.type === 'success' ? 'text-green-400' : ''}
                      ${line.type === 'error' ? 'text-red-400' : ''}
                      ${line.type === 'warning' ? 'text-yellow-400' : ''}
                      ${line.type === 'module' ? 'text-purple-400 font-bold' : ''}
                      ${line.type === 'hardware' ? 'text-orange-400' : ''}
                      ${line.type === 'kernel' ? 'text-blue-400' : ''}
                      ${line.type === 'network' ? 'text-pink-400' : ''}
                      ${line.type === 'security' ? 'text-red-300' : ''}
                      ${line.type === 'graphics' ? 'text-green-300' : ''}
                      ${line.type === 'neural' ? 'text-purple-300' : ''}
                      ${line.type === 'quantum' ? 'text-indigo-300' : ''}
                      ${line.type === 'user' ? 'text-yellow-300' : ''}
                      ${line.type === 'welcome' ? 'text-cyan-300 font-bold text-base animate-pulse' : ''}
                      ${line.type === 'complete' ? 'text-green-300 font-bold' : ''}
                    `}
                  >
                    {line.text}
                  </motion.div>
                ))}
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="inline-block w-2 h-4 bg-cyan-400 ml-1"
                />
              </div>

              {/* Waveform visualization */}
              <div className="mt-3 border-t border-cyan-500/20 pt-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono text-gray-400">SYSTEM AUDIO</span>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-2 h-2 rounded-full bg-green-500"
                  />
                </div>
                <div className="flex items-center justify-center h-12 gap-1">
                  {waveformData.map((value, i) => (
                    <motion.div
                      key={i}
                      className="w-1 bg-cyan-400"
                      animate={{ height: Math.abs(value) }}
                      transition={{ duration: 0.1 }}
                      style={{ minHeight: '2px' }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Right side - System Status */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              {/* System Status Card */}
              <div className="bg-black/80 backdrop-blur-xl border border-cyan-500/30 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-mono text-gray-400">SYSTEM STATUS</span>
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                        boxShadow: [
                          '0 0 0 0 rgba(34, 197, 94, 0)',
                          '0 0 0 8px rgba(34, 197, 94, 0.3)',
                          '0 0 0 0 rgba(34, 197, 94, 0)'
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className={`w-3 h-3 rounded-full ${
                        systemStatus === 'ONLINE' ? 'bg-green-500' : 
                        systemStatus === 'INITIALIZING' ? 'bg-yellow-500' : 
                        systemStatus === 'OPTIMIZING' ? 'bg-purple-500' :
                        'bg-cyan-500'
                      }`}
                    />
                    <span className={`text-sm font-mono font-bold ${
                      systemStatus === 'ONLINE' ? 'text-green-400' : 
                      systemStatus === 'INITIALIZING' ? 'text-yellow-400' : 
                      systemStatus === 'OPTIMIZING' ? 'text-purple-400' :
                      'text-cyan-400'
                    }`}>
                      {systemStatus}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-gray-500">Total Progress</span>
                    <span className="text-cyan-400">{Math.round(progressPercentage)}%</span>
                  </div>
                  <div className="relative w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div
                      className="absolute h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercentage}%` }}
                      transition={{ duration: 0.3 }}
                    />
                    <motion.div
                      className="absolute h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                </div>

                {/* System Resources */}
                <div className="grid grid-cols-3 gap-2 mt-4">
                  <div className="text-center">
                    <div className="text-xs font-mono text-gray-500">CPU</div>
                    <div className="text-lg font-mono text-cyan-400">{cpuUsage.toFixed(0)}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-mono text-gray-500">GPU</div>
                    <div className="text-lg font-mono text-green-400">{gpuUsage.toFixed(0)}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-mono text-gray-500">RAM</div>
                    <div className="text-lg font-mono text-purple-400">{memoryUsage.toFixed(0)}%</div>
                  </div>
                </div>
              </div>

              {/* Network Visualization */}
              <div className="bg-black/80 backdrop-blur-xl border border-cyan-500/30 rounded-lg p-4">
                <div className="text-sm font-mono text-gray-400 mb-3">NETWORK TOPOLOGY</div>
                <div className="relative h-32">
                  <svg className="absolute inset-0 w-full h-full">
                    {networkNodes.map((node, i) => (
                      <g key={i}>
                        {node.connected.map(targetId => {
                          const target = networkNodes[targetId];
                          if (!target) return null;
                          return (
                            <motion.line
                              key={`${i}-${targetId}`}
                              x1={`${node.x}%`}
                              y1={`${node.y}%`}
                              x2={`${target.x}%`}
                              y2={`${target.y}%`}
                              stroke="rgba(6, 182, 212, 0.3)"
                              strokeWidth="1"
                              animate={{
                                opacity: node.active && target.active ? [0.3, 0.7, 0.3] : 0.1
                              }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                          );
                        })}
                        <motion.circle
                          cx={`${node.x}%`}
                          cy={`${node.y}%`}
                          r="4"
                          fill={node.active ? '#06b6d4' : '#374151'}
                          animate={{
                            scale: node.active ? [1, 1.5, 1] : 1,
                          }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      </g>
                    ))}
                  </svg>
                </div>
              </div>

              {/* Module Status Grid */}
              <div className="bg-black/80 backdrop-blur-xl border border-cyan-500/30 rounded-lg p-4">
                <div className="text-sm font-mono text-gray-400 mb-3">MODULE STATUS</div>
                <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                  {modules.map((module) => (
                    <motion.div
                      key={module.id}
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`p-2 rounded border text-xs ${
                        module.status === 'complete' ? 'border-green-500/50 bg-green-500/5' :
                        module.status === 'loading' ? 'border-cyan-500/50 bg-cyan-500/5' :
                        module.status === 'error' ? 'border-red-500/50 bg-red-500/5' :
                        'border-gray-700 bg-gray-900/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-gray-300">{module.name}</span>
                        <div className="flex items-center gap-2">
                          {module.status === 'complete' && (
                            <motion.span
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              className="text-green-400"
                            >
                              ✓
                            </motion.span>
                          )}
                          {module.status === 'loading' && (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                              className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full"
                            />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-gray-500">
                        <span>MEM: {module.memoryUsage?.toFixed(0) || 0}MB</span>
                        <span>•</span>
                        <span>THR: {module.threads || 0}</span>
                      </div>
                      <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mt-1">
                        <motion.div
                          className={`h-full ${
                            module.status === 'complete' ? 'bg-green-500' :
                            module.status === 'loading' ? 'bg-gradient-to-r from-cyan-500 to-blue-500' :
                            'bg-gray-700'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${module.progress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom status bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 bg-black/80 backdrop-blur-xl border border-cyan-500/30 rounded-lg p-3"
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">OPERATOR:</span>
                  <span className="text-cyan-400 font-bold">IREDDRAGONICY</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">CLEARANCE:</span>
                  <span className="text-green-400">LEVEL 9</span>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">SESSION:</span>
                  <span className="text-yellow-400" suppressHydrationWarning>{sessionId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">UPTIME:</span>
                  <span className="text-purple-400">{Math.floor(progressPercentage)}s</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">TIME:</span>
                  <span className="text-cyan-400" suppressHydrationWarning>{currentTime}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <style jsx>{`
        @keyframes grid-move {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(50px, 50px);
          }
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.5);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.5);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(6, 182, 212, 0.7);
        }

        .glitch-effect {
          animation: glitch 0.1s infinite;
        }

        @keyframes glitch {
          0% {
            transform: translate(0);
            filter: hue-rotate(0deg);
          }
          20% {
            transform: translate(-1px, 1px);
            filter: hue-rotate(90deg);
          }
          40% {
            transform: translate(-1px, -1px);
            filter: hue-rotate(180deg);
          }
          60% {
            transform: translate(1px, 1px);
            filter: hue-rotate(270deg);
          }
          80% {
            transform: translate(1px, -1px);
            filter: hue-rotate(360deg);
          }
          100% {
            transform: translate(0);
            filter: hue-rotate(0deg);
          }
        }
      `}</style>
    </AnimatePresence>
  );
};

export default LoadingScreen;