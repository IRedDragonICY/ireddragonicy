// components/LoadingScreen.tsx
'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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

interface FileSystemNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: { [key: string]: FileSystemNode };
  permissions?: string;
  owner?: string;
  size?: number;
  modified?: Date;
}

interface Process {
  pid: number;
  name: string;
  cpu: number;
  memory: number;
  time: string;
  user: string;
  status: 'running' | 'sleeping' | 'zombie';
}

interface CommandHistory {
  commands: string[];
  currentIndex: number;
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
  history: number[];
  details?: {
    cores?: number;
    threads?: number;
    frequency?: string;
    modules?: number;
    speed?: string;
    temperature?: number;
  };
}

interface CPUCore {
  id: number;
  usage: number;
  frequency: number;
  temperature: number;
}

interface RAMModule {
  id: number;
  size: number;
  speed: number;
  manufacturer: string;
  usage: number;
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
  const [sessionId, setSessionId] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [matrixRain, setMatrixRain] = useState<string[]>([]);
  const [glitchActive, setGlitchActive] = useState(false);
  const [networkNodes, setNetworkNodes] = useState<NetworkNode[]>([]);
  const [waveformData, setWaveformData] = useState<number[]>(new Array(50).fill(0));
  const [hexPatterns, setHexPatterns] = useState<{ x: number; y: number; delay: number }[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [showTerminatePrompt, setShowTerminatePrompt] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const [currentDirectory, setCurrentDirectory] = useState('/home/ireddragonicy');
  const [commandHistory, setCommandHistory] = useState<CommandHistory>({
    commands: [],
    currentIndex: -1
  });
  const [terminalMode, setTerminalMode] = useState<'boot' | 'interactive'>('boot');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [tabCompletions, setTabCompletions] = useState<string[]>([]);
  const [tabIndex, setTabIndex] = useState(0);
  const [showTabHint, setShowTabHint] = useState(false);
  const [autoRedirectCountdown, setAutoRedirectCountdown] = useState<number | null>(null);
  const [autoRedirectStarted, setAutoRedirectStarted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const consoleRef = useRef<HTMLDivElement>(null);
  const lineIdCounter = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleControls = useAnimation();
  const terminateTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const autoRedirectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Virtual File System
  const [fileSystem] = useState<FileSystemNode>({
    name: '/',
    type: 'directory',
    children: {
      'home': {
        name: 'home',
        type: 'directory',
        children: {
          'ireddragonicy': {
            name: 'ireddragonicy',
            type: 'directory',
            children: {
              '.bashrc': {
                name: '.bashrc',
                type: 'file',
                content: '# User bashrc\nexport PS1="\\u@quantum:\\w$ "\nalias ll="ls -la"\nalias matrix="cmatrix"',
                size: 256
              },
              '.secret': {
                name: '.secret',
                type: 'file',
                content: 'The cake is a lie. Try: secret --unlock',
                size: 42
              },
              'projects': {
                name: 'projects',
                type: 'directory',
                children: {
                  'neural-engine': {
                    name: 'neural-engine',
                    type: 'directory',
                    children: {
                      'README.md': {
                        name: 'README.md',
                        type: 'file',
                        content: '# Neural Engine v4.2\nQuantum-enhanced neural processing unit',
                        size: 1024
                      },
                      'config.json': {
                        name: 'config.json',
                        type: 'file',
                        content: '{"version": "4.2.0", "quantum": true, "cores": 16384}',
                        size: 512
                      }
                    }
                  },
                  'portfolio': {
                    name: 'portfolio',
                    type: 'directory',
                    children: {
                      'index.html': {
                        name: 'index.html',
                        type: 'file',
                        content: '<html><head><title>IREDDRAGONICY</title></head><body>Welcome</body></html>',
                        size: 2048
                      }
                    }
                  }
                }
              },
              'documents': {
                name: 'documents',
                type: 'directory',
                children: {
                  'notes.txt': {
                    name: 'notes.txt',
                    type: 'file',
                    content: 'Remember: With great power comes great responsibility\n- Uncle Ben',
                    size: 128
                  },
                  'todo.md': {
                    name: 'todo.md',
                    type: 'file',
                    content: '# TODO\n- [x] Build quantum computer\n- [x] Create AI\n- [ ] Take over the world\n- [ ] Just kidding',
                    size: 256
                  }
                }
              },
              'scripts': {
                name: 'scripts',
                type: 'directory',
                children: {
                  'hack.sh': {
                    name: 'hack.sh',
                    type: 'file',
                    content: '#!/bin/bash\necho "Accessing mainframe..."\nsleep 2\necho "Access granted!"\necho "Just kidding, this is a loading screen"',
                    size: 512
                  },
                  'matrix.py': {
                    name: 'matrix.py',
                    type: 'file',
                    content: 'import random\nprint("Wake up, Neo...")\nprint("The Matrix has you...")',
                    size: 256
                  }
                }
              }
            }
          }
        }
      },
      'usr': {
        name: 'usr',
        type: 'directory',
        children: {
          'bin': {
            name: 'bin',
            type: 'directory',
            children: {}
          },
          'lib': {
            name: 'lib',
            type: 'directory',
            children: {}
          }
        }
      },
      'etc': {
        name: 'etc',
        type: 'directory',
        children: {
          'hostname': {
            name: 'hostname',
            type: 'file',
            content: 'quantum-nexus',
            size: 64
          },
          'os-release': {
            name: 'os-release',
            type: 'file',
            content: 'NAME="QuantumOS"\nVERSION="42.0"\nCODENAME="Singularity"',
            size: 256
          }
        }
      },
      'var': {
        name: 'var',
        type: 'directory',
        children: {
          'log': {
            name: 'log',
            type: 'directory',
            children: {
              'system.log': {
                name: 'system.log',
                type: 'file',
                content: '[2024-01-01 00:00:00] System initialized\n[2024-01-01 00:00:01] Quantum core activated\n[2024-01-01 00:00:02] Neural engine online',
                size: 4096
              }
            }
          }
        }
      },
      'proc': {
        name: 'proc',
        type: 'directory',
        children: {
          'cpuinfo': {
            name: 'cpuinfo',
            type: 'file',
            content: 'processor: AMD Ryzen 9 7950X\ncores: 16\nthreads: 32\nfrequency: 5.7GHz',
            size: 512
          },
          'meminfo': {
            name: 'meminfo',
            type: 'file',
            content: 'MemTotal: 65536 MB\nMemFree: 32768 MB\nCached: 16384 MB',
            size: 256
          }
        }
      }
    }
  });

  // CPU Cores
  const [cpuCores, setCpuCores] = useState<CPUCore[]>(() =>
    Array.from({ length: 16 }, (_, i) => ({
      id: i,
      usage: 0,
      frequency: 4.5,
      temperature: 45
    }))
  );

  // RAM Modules
  const [ramModules, setRamModules] = useState<RAMModule[]>([
    { id: 0, size: 16384, speed: 6000, manufacturer: 'G.Skill', usage: 0 },
    { id: 1, size: 16384, speed: 6000, manufacturer: 'G.Skill', usage: 0 },
    { id: 2, size: 16384, speed: 6000, manufacturer: 'G.Skill', usage: 0 },
    { id: 3, size: 16384, speed: 6000, manufacturer: 'G.Skill', usage: 0 },
  ]);

  // System metrics with history
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([
    {
      label: 'CPU',
      value: 0,
      max: 100,
      unit: '%',
      color: '#06b6d4',
      history: new Array(50).fill(0),
      details: { cores: 16, threads: 32, frequency: '5.7 GHz', temperature: 45 }
    },
    {
      label: 'GPU',
      value: 0,
      max: 100,
      unit: '%',
      color: '#10b981',
      history: new Array(50).fill(0),
      details: { cores: 16384, frequency: '2.8 GHz', temperature: 65 }
    },
    {
      label: 'RAM',
      value: 0,
      max: 65536,
      unit: 'MB',
      color: '#8b5cf6',
      history: new Array(50).fill(0),
      details: { modules: 4, speed: '6000 MHz' }
    },
    {
      label: 'VRAM',
      value: 0,
      max: 24576,
      unit: 'MB',
      color: '#f59e0b',
      history: new Array(50).fill(0),
      details: { speed: '21 Gbps', temperature: 60 }
    },
    {
      label: 'Network',
      value: 0,
      max: 1000,
      unit: 'Mbps',
      color: '#ef4444',
      history: new Array(50).fill(0)
    },
    {
      label: 'Disk I/O',
      value: 0,
      max: 7000,
      unit: 'MB/s',
      color: '#ec4899',
      history: new Array(50).fill(0),
      details: { temperature: 38 }
    },
  ]);

  // Add console line with type
  const addConsoleLine = (text: string, type: string = 'info') => {
    const id = `line-${Date.now()}-${lineIdCounter.current++}`;
    setConsoleLines(prev => [...prev, { id, text, type }]);
  };

  // Start auto-redirect timer
  const startAutoRedirectTimer = useCallback(() => {
    if (terminalMode !== 'interactive' || autoRedirectStarted) return;
    
    setAutoRedirectStarted(true);
    let countdown = 10; // 10 seconds countdown
    setAutoRedirectCountdown(countdown);
    
    const countdownInterval = setInterval(() => {
      countdown--;
      setAutoRedirectCountdown(countdown);
      
      if (countdown <= 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);
    
    autoRedirectTimeoutRef.current = setTimeout(async () => {
      clearInterval(countdownInterval);
      setAutoRedirectCountdown(null);
      
      // Auto-redirect to portfolio with messages
      addConsoleLine('', 'info');
      addConsoleLine('⏰ No user interaction detected...', 'warning');
      await new Promise(resolve => setTimeout(resolve, 500));
      addConsoleLine('🤖 Initiating automatic portfolio access...', 'info');
      await new Promise(resolve => setTimeout(resolve, 500));
      addConsoleLine('🎯 Accessing portfolio interface...', 'info');
      await new Promise(resolve => setTimeout(resolve, 500));
      addConsoleLine('📊 Loading AI researcher profile...', 'detail');
      await new Promise(resolve => setTimeout(resolve, 300));
      addConsoleLine('🚀 Initializing project showcase...', 'detail');
      await new Promise(resolve => setTimeout(resolve, 300));
      addConsoleLine('✨ Portfolio interface ready!', 'success');
      await new Promise(resolve => setTimeout(resolve, 500));
      addConsoleLine('🔄 Redirecting to main portfolio...', 'warning');
      
      setTimeout(() => {
        setTerminalMode('boot');
        setProgressPercentage(100);
        onLoadComplete();
      }, 1000);
    }, 10000);
  }, [terminalMode, onLoadComplete, autoRedirectStarted]);

  // Cancel auto-redirect timer
  const cancelAutoRedirectTimer = useCallback(() => {
    if (autoRedirectTimeoutRef.current) {
      clearTimeout(autoRedirectTimeoutRef.current);
    }
    setAutoRedirectCountdown(null);
    setAutoRedirectStarted(false);
  }, []);

  // Navigate file system
  const navigateToPath = (path: string): FileSystemNode | null => {
    if (path === '/') {
      return fileSystem;
    }
    
    const parts = path.split('/').filter(p => p);
    let current = fileSystem;
    
    for (const part of parts) {
      if (current.type !== 'directory' || !current.children || !current.children[part]) {
        return null;
      }
      current = current.children[part];
    }
    
    return current;
  };

  // Get absolute path
  const getAbsolutePath = (path: string): string => {
    if (path.startsWith('/')) {
      return path;
    }
    
    if (path === '.') {
      return currentDirectory;
    }
    
    if (path === '..') {
      const parts = currentDirectory.split('/').filter(p => p);
      parts.pop();
      return '/' + parts.join('/');
    }
    
    if (path.startsWith('./')) {
      path = path.substring(2);
    }
    
    const base = currentDirectory === '/' ? '' : currentDirectory;
    return `${base}/${path}`.replace(/\/+/g, '/');
  };

  // Process command
  const processCommand = async (input: string) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    // Cancel auto-redirect timer when user interacts
    cancelAutoRedirectTimer();
    
    const parts = input.trim().split(' ');
    const command = parts[0];
    const args = parts.slice(1);
    
    // Add to history
    setCommandHistory(prev => ({
      commands: [...prev.commands, input],
      currentIndex: prev.commands.length + 1
    }));
    
    // Process commands
    switch (command) {
      case '':
        break;
        
      case 'help':
        addConsoleLine('Available commands:', 'info');
        addConsoleLine('  ═══ File System Commands ═══', 'success');
        addConsoleLine('  ls [path]         - List directory contents', 'detail');
        addConsoleLine('  cd <path>         - Change directory', 'detail');
        addConsoleLine('  pwd               - Print working directory', 'detail');
        addConsoleLine('  cat <file>        - Display file contents', 'detail');
        addConsoleLine('  tree              - Display directory tree', 'detail');
        addConsoleLine('  mkdir <dir>       - Create directory (simulated)', 'detail');
        addConsoleLine('  rm <file>         - Remove file (simulated)', 'detail');
        
        addConsoleLine('', 'info');
        addConsoleLine('  ═══ System Commands ═══', 'success');
        addConsoleLine('  echo <text>       - Display text', 'detail');
        addConsoleLine('  clear             - Clear terminal', 'detail');
        addConsoleLine('  whoami            - Display current user', 'detail');
        addConsoleLine('  date              - Display current date', 'detail');
        addConsoleLine('  uptime            - Show system uptime', 'detail');
        addConsoleLine('  history           - Show command history', 'detail');
        addConsoleLine('  uname [-a]        - Display system information', 'detail');
        
        addConsoleLine('', 'info');
        addConsoleLine('  ═══ Process & Network Commands ═══', 'success');
        addConsoleLine('  ps                - List running processes', 'detail');
        addConsoleLine('  top/htop/btop     - Display system resources', 'detail');
        addConsoleLine('  df                - Display disk usage', 'detail');
        addConsoleLine('  ifconfig          - Display network configuration', 'detail');
        addConsoleLine('  ping <host>       - Ping a host', 'detail');
        addConsoleLine('  wget/curl <url>   - Download file (simulated)', 'detail');
        
        addConsoleLine('', 'info');
        addConsoleLine('  ═══ Fun Commands ═══', 'success');
        addConsoleLine('  neofetch          - Display system information', 'detail');
        addConsoleLine('  matrix            - Enter the Matrix', 'detail');
        addConsoleLine('  hack              - "Hack" the system', 'detail');
        addConsoleLine('  cowsay <text>     - ASCII cow says something', 'detail');
        addConsoleLine('  fortune           - Display a random fortune', 'detail');
        addConsoleLine('  sl                - Steam locomotive', 'detail');
        addConsoleLine('  figlet <text>     - ASCII art text', 'detail');
        addConsoleLine('  yes               - Infinite yes', 'detail');
        
        addConsoleLine('', 'info');
        addConsoleLine('  ═══ Editors & Special ═══', 'success');
        addConsoleLine('  vim/vi/nano/emacs - Text editors (simulated)', 'detail');
        addConsoleLine('  sudo <command>    - Run as superuser (simulated)', 'detail');
        addConsoleLine('  secret [--unlock] - 🔒 Mystery command', 'detail');
        addConsoleLine('  portfolio         - 🎯 Access main portfolio page', 'detail');
        addConsoleLine('  exit              - Complete initialization', 'detail');
        
        addConsoleLine('', 'info');
        addConsoleLine('  ═══ Keyboard Shortcuts ═══', 'success');
        addConsoleLine('  Tab               - Auto-complete commands/paths', 'detail');
        addConsoleLine('  ↑/↓               - Navigate command history', 'detail');
        addConsoleLine('  Ctrl+C            - Cancel current input', 'detail');
        addConsoleLine('  Ctrl+L            - Clear screen', 'detail');
        break;
        
      case 'ls':
        const lsPath = args[0] ? getAbsolutePath(args[0]) : currentDirectory;
        const lsNode = navigateToPath(lsPath);
        
        if (!lsNode) {
          addConsoleLine(`ls: cannot access '${args[0]}': No such file or directory`, 'error');
        } else if (lsNode.type === 'file') {
          addConsoleLine(lsNode.name, 'info');
        } else if (lsNode.children) {
          const items = Object.keys(lsNode.children).sort();
          if (items.length === 0) {
            addConsoleLine('(empty directory)', 'detail');
          } else {
            items.forEach(item => {
              const node = lsNode.children![item];
              const prefix = node.type === 'directory' ? '📁' : '📄';
              const color = node.type === 'directory' ? 'info' : 'detail';
              const size = node.size ? ` (${node.size} bytes)` : '';
              addConsoleLine(`${prefix} ${item}${size}`, color);
            });
          }
        }
        break;
        
      case 'cd':
        if (!args[0]) {
          setCurrentDirectory('/home/ireddragonicy');
        } else {
          const newPath = getAbsolutePath(args[0]);
          const node = navigateToPath(newPath);
          
          if (!node) {
            addConsoleLine(`cd: ${args[0]}: No such file or directory`, 'error');
          } else if (node.type !== 'directory') {
            addConsoleLine(`cd: ${args[0]}: Not a directory`, 'error');
          } else {
            setCurrentDirectory(newPath || '/');
          }
        }
        break;
        
      case 'pwd':
        addConsoleLine(currentDirectory, 'info');
        break;
        
      case 'cat':
        if (!args[0]) {
          addConsoleLine('cat: missing file operand', 'error');
        } else {
          const catPath = getAbsolutePath(args[0]);
          const catNode = navigateToPath(catPath);
          
          if (!catNode) {
            addConsoleLine(`cat: ${args[0]}: No such file or directory`, 'error');
          } else if (catNode.type === 'directory') {
            addConsoleLine(`cat: ${args[0]}: Is a directory`, 'error');
          } else if (catNode.content) {
            catNode.content.split('\n').forEach(line => {
              addConsoleLine(line, 'detail');
            });
          }
        }
        break;
        
      case 'echo':
        addConsoleLine(args.join(' '), 'info');
        break;
        
      case 'clear':
        setConsoleLines([]);
        break;
        
      case 'whoami':
        addConsoleLine('ireddragonicy', 'info');
        break;
        
      case 'date':
        addConsoleLine(new Date().toString(), 'info');
        break;
        
      case 'uptime':
        const uptimeSeconds = Math.floor(progressPercentage);
        const hours = Math.floor(uptimeSeconds / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        const seconds = uptimeSeconds % 60;
        addConsoleLine(`up ${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`, 'info');
        break;
        
      case 'ps':
        addConsoleLine('  PID TTY          TIME CMD', 'info');
        addConsoleLine(' 1337 quantum0    00:00:01 systemd', 'detail');
        addConsoleLine(' 1338 quantum0    00:00:00 neural-engine', 'detail');
        addConsoleLine(' 1339 quantum0    00:00:00 diffusion-core', 'detail');
        addConsoleLine(' 1340 quantum0    00:00:00 quantum-driver', 'detail');
        addConsoleLine(' 1341 quantum0    00:00:00 bash', 'detail');
        processes.forEach(proc => {
          addConsoleLine(`${proc.pid.toString().padStart(5)} quantum0    ${proc.time} ${proc.name}`, 'detail');
        });
        break;
        
      case 'top':
        addConsoleLine('top - ' + new Date().toLocaleTimeString() + ' up 0:00, 1 user, load average: 0.42, 0.69, 1.33', 'info');
        addConsoleLine('Tasks: 42 total, 2 running, 40 sleeping, 0 stopped, 0 zombie', 'detail');
        addConsoleLine(`%Cpu(s): ${cpuUsage.toFixed(1)} us, 5.0 sy, 0.0 ni, ${(100-cpuUsage-5).toFixed(1)} id`, 'detail');
        addConsoleLine(`MiB Mem: 65536.0 total, ${(65536 - memoryUsage * 655.36).toFixed(1)} free, ${(memoryUsage * 655.36).toFixed(1)} used`, 'detail');
        addConsoleLine('', 'info');
        addConsoleLine('  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND', 'info');
        addConsoleLine(' 1337 root      20   0  123456  12345   1234 S  12.3   1.2   0:01.23 systemd', 'detail');
        addConsoleLine(' 1338 root      20   0  234567  23456   2345 R  45.6   2.3   0:02.34 neural-engine', 'detail');
        addConsoleLine(' 1339 root      20   0  345678  34567   3456 S  23.4   3.4   0:03.45 diffusion-core', 'detail');
        break;
        
      case 'df':
        addConsoleLine('Filesystem     1K-blocks     Used Available Use% Mounted on', 'info');
        addConsoleLine('/dev/nvme0n1   976762584 42000000 884762584   5% /', 'detail');
        addConsoleLine('/dev/nvme1n1   976762584 10000000 916762584   2% /home', 'detail');
        addConsoleLine('tmpfs           33554432        0  33554432   0% /dev/shm', 'detail');
        addConsoleLine('quantum-fs     ∞         42424242  ∞         42% /quantum', 'detail');
        break;
        
      case 'ifconfig':
        addConsoleLine('eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500', 'info');
        addConsoleLine('        inet 192.168.1.42  netmask 255.255.255.0  broadcast 192.168.1.255', 'detail');
        addConsoleLine('        inet6 fe80::42:42ff:fe42:4242  prefixlen 64  scopeid 0x20<link>', 'detail');
        addConsoleLine('        RX packets 424242  bytes 424242424 (424.2 MB)', 'detail');
        addConsoleLine('        TX packets 424242  bytes 424242424 (424.2 MB)', 'detail');
        addConsoleLine('', 'info');
        addConsoleLine('quantum0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 9000', 'info');
        addConsoleLine('        inet 10.0.0.1  netmask 255.255.255.0', 'detail');
        addConsoleLine('        QUANTUM ENTANGLED  latency 0.000000ms', 'detail');
        break;
        
      case 'ping':
        if (!args[0]) {
          addConsoleLine('ping: usage: ping <host>', 'error');
        } else {
          addConsoleLine(`PING ${args[0]} (8.8.8.8) 56(84) bytes of data.`, 'info');
          for (let i = 0; i < 4; i++) {
            await new Promise(resolve => setTimeout(resolve, 500));
            const time = (Math.random() * 10 + 5).toFixed(3);
            addConsoleLine(`64 bytes from ${args[0]}: icmp_seq=${i+1} ttl=64 time=${time} ms`, 'detail');
          }
          addConsoleLine(`--- ${args[0]} ping statistics ---`, 'info');
          addConsoleLine('4 packets transmitted, 4 received, 0% packet loss', 'detail');
        }
        break;
        
      case 'neofetch':
        addConsoleLine('       _____           ireddragonicy@quantum-nexus', 'info');
        addConsoleLine('      /     \\          OS: QuantumOS 42.0 Singularity', 'info');
        addConsoleLine('     /  ^ ^  \\         Host: NEXUS-9000', 'info');
        addConsoleLine('    |  (o o)  |        Kernel: 6.5.0-quantum', 'info');
        addConsoleLine('    |    <    |        Uptime: ' + Math.floor(progressPercentage) + ' seconds', 'info');
        addConsoleLine('     \\  ---  /         Shell: quantum-bash 5.2', 'info');
        addConsoleLine('      \\_____/          Resolution: 3840x2160', 'info');
        addConsoleLine('                       DE: Plasma Quantum', 'info');
        addConsoleLine('  ████████████████     Terminal: quantum-term', 'info');
        addConsoleLine('  ████████████████     CPU: AMD Ryzen 9 7950X (32) @ 5.7GHz', 'info');
        addConsoleLine('  ████████████████     GPU: NVIDIA RTX 4090', 'info');
        addConsoleLine('  ████████████████     Memory: ' + (memoryUsage * 655.36).toFixed(0) + 'MiB / 65536MiB', 'info');
        break;
        
      case 'matrix':
        addConsoleLine('Entering the Matrix...', 'success');
        await new Promise(resolve => setTimeout(resolve, 500));
        addConsoleLine('Wake up, Neo...', 'neural');
        await new Promise(resolve => setTimeout(resolve, 1000));
        addConsoleLine('The Matrix has you...', 'neural');
        await new Promise(resolve => setTimeout(resolve, 1000));
        addConsoleLine('Follow the white rabbit.', 'neural');
        await new Promise(resolve => setTimeout(resolve, 1000));
        addConsoleLine('Knock, knock, Neo.', 'neural');
        setGlitchActive(true);
        setTimeout(() => setGlitchActive(false), 2000);
        break;
        
      case 'hack':
        addConsoleLine('Initializing hack.sh...', 'warning');
        await new Promise(resolve => setTimeout(resolve, 500));
        addConsoleLine('Accessing mainframe...', 'warning');
        for (let i = 0; i <= 100; i += 10) {
          await new Promise(resolve => setTimeout(resolve, 100));
          addConsoleLine(`[${"█".repeat(i/5).padEnd(20, "░")}] ${i}%`, 'detail');
        }
        addConsoleLine('Access granted!', 'success');
        await new Promise(resolve => setTimeout(resolve, 500));
        addConsoleLine('Just kidding, this is just a loading screen 😄', 'info');
        break;
        
      case 'secret':
        if (args[0] === '--unlock') {
          addConsoleLine('🔓 Secret unlocked!', 'success');
          addConsoleLine('Never gonna give you up...', 'warning');
          addConsoleLine('Never gonna let you down...', 'warning');
          addConsoleLine('Never gonna run around and desert you...', 'warning');
          setTimeout(() => {
            window.location.href = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
          }, 2000);
        } else {
          addConsoleLine('🔒 Access denied. Try: secret --unlock', 'error');
        }
        break;
        
      case 'portfolio':
        addConsoleLine('🎯 Accessing portfolio interface...', 'info');
        await new Promise(resolve => setTimeout(resolve, 500));
        addConsoleLine('📊 Loading AI researcher profile...', 'detail');
        await new Promise(resolve => setTimeout(resolve, 300));
        addConsoleLine('🚀 Initializing project showcase...', 'detail');
        await new Promise(resolve => setTimeout(resolve, 300));
        addConsoleLine('✨ Portfolio interface ready!', 'success');
        await new Promise(resolve => setTimeout(resolve, 500));
        addConsoleLine('🔄 Redirecting to main portfolio...', 'warning');
        setTimeout(() => {
          setTerminalMode('boot');
          setProgressPercentage(100);
          onLoadComplete();
        }, 1000);
        break;
        
      case 'mkdir':
        if (!args[0]) {
          addConsoleLine('mkdir: missing operand', 'error');
        } else {
          addConsoleLine(`mkdir: cannot create directory '${args[0]}': Permission denied`, 'error');
          addConsoleLine('(This is a read-only file system simulation)', 'detail');
        }
        break;
        
      case 'rm':
        if (!args[0]) {
          addConsoleLine('rm: missing operand', 'error');
        } else if (args[0] === '-rf' && args[1] === '/') {
          addConsoleLine('rm: it is dangerous to operate recursively on "/"', 'error');
          addConsoleLine('rm: use --no-preserve-root to override this failsafe', 'error');
          addConsoleLine('(Nice try though 😉)', 'detail');
        } else {
          addConsoleLine(`rm: cannot remove '${args[0]}': Permission denied`, 'error');
        }
        break;
        
      case 'sudo':
        if (args[0] === 'rm' && args[1] === '-rf' && args[2] === '/') {
          addConsoleLine('[sudo] password for ireddragonicy: ', 'prompt');
          await new Promise(resolve => setTimeout(resolve, 1000));
          addConsoleLine('', 'info');
          addConsoleLine('Nice try! But this is just a simulation 😄', 'warning');
          addConsoleLine('No actual file system was harmed in the making of this terminal', 'detail');
        } else {
          addConsoleLine('ireddragonicy is not in the sudoers file.', 'error');
          addConsoleLine('This incident will be reported.', 'warning');
          addConsoleLine('(Just kidding, nobody is watching... or are they? 👀)', 'detail');
        }
        break;
        
      case 'history':
        if (commandHistory.commands.length === 0) {
          addConsoleLine('(no command history)', 'detail');
        } else {
          commandHistory.commands.forEach((cmd, i) => {
            addConsoleLine(`  ${(i + 1).toString().padStart(3)} ${cmd}`, 'detail');
          });
        }
        break;
        
      case 'uname':
        if (args[0] === '-a') {
          addConsoleLine('QuantumOS quantum-nexus 6.5.0-quantum #42 SMP PREEMPT_DYNAMIC Thu Jan 1 00:00:00 UTC 2024 x86_64 x86_64 x86_64 GNU/Linux', 'info');
        } else {
          addConsoleLine('QuantumOS', 'info');
        }
        break;
        
      case 'fortune':
        const fortunes = [
          'The only way to do great work is to love what you do. - Steve Jobs',
          'Code is like humor. When you have to explain it, it\'s bad. - Cory House',
          'First, solve the problem. Then, write the code. - John Johnson',
          'Experience is the name everyone gives to their mistakes. - Oscar Wilde',
          'The best way to predict the future is to invent it. - Alan Kay',
          'Simplicity is the soul of efficiency. - Austin Freeman',
          'Talk is cheap. Show me the code. - Linus Torvalds',
          'Programs must be written for people to read, and only incidentally for machines to execute. - Harold Abelson',
        ];
        const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];
        addConsoleLine(fortune, 'info');
        break;
        
      case 'cowsay':
        const message = args.join(' ') || 'Hello, World!';
        const cow = `
        ${'_'.repeat(message.length + 2)}
       < ${message} >
        ${'-'.repeat(message.length + 2)}
               \\   ^__^
                \\  (oo)\\_______
                   (__)\\       )\\/\\
                       ||----w |
                       ||     ||`;
        cow.split('\n').forEach(line => addConsoleLine(line, 'info'));
        break;
        
      case 'sl':
        addConsoleLine('Command not found: sl', 'error');
        addConsoleLine('Did you mean: ls?', 'detail');
        await new Promise(resolve => setTimeout(resolve, 500));
        addConsoleLine('', 'info');
        addConsoleLine('Just kidding! Here comes the train! 🚂', 'success');
        const train = `
                        (  ) (@@) ( )  (@)  ()    @@    O     @     O     @
                   (@@@)
               (    )
            (@@@@)
          (   )
        ====        ________                ___________
    _D _|  |_______/        \__I_I_____===__|_________|_____
     |(_)---  |   H\________/ |   |        =|___ ___|      |_
     /     |  |   H  |  |     |   |         ||_| |_||      |_
    |      |  |   H  |__--------------------| [___] |      =|
    | ________|___H__/__|_____/[][]~\\_______|       |      -|
    |/ |   |-----------I_____I [][] []  D   |=======|________|
  __/ =| o |=-~~\  /~~\  /~~\  /~~\ ____Y___________|__|
   |/-=|___|=    ||    ||    ||    |_____/~\___/        |
    \_/      \O=====O=====O=====O_/      \_/            |`;
        train.split('\n').forEach(line => addConsoleLine(line, 'info'));
        break;
        
      case 'vim':
      case 'vi':
      case 'nano':
      case 'emacs':
        addConsoleLine(`Launching ${command}...`, 'info');
        await new Promise(resolve => setTimeout(resolve, 500));
        addConsoleLine('Error: Terminal editor not available in web environment', 'error');
        addConsoleLine('But hey, nice choice of editor! 👍', 'detail');
        if (command === 'vim') {
          addConsoleLine('(BTW, to exit vim: :q!)', 'detail');
        } else if (command === 'emacs') {
          addConsoleLine('(Emacs is an operating system lacking a good text editor)', 'detail');
        }
        break;
        
      case 'htop':
      case 'btop':
        addConsoleLine('System Monitor v4.2.0', 'info');
        addConsoleLine('┌' + '─'.repeat(60) + '┐', 'detail');
        addConsoleLine('│ CPU [███████░░░░░░░░░░░░░] ' + cpuUsage.toFixed(1) + '%'.padStart(35) + ' │', 'detail');
        addConsoleLine('│ RAM [██████████░░░░░░░░░░] ' + memoryUsage.toFixed(1) + '%'.padStart(35) + ' │', 'detail');
        addConsoleLine('│ GPU [██████░░░░░░░░░░░░░░] ' + gpuUsage.toFixed(1) + '%'.padStart(35) + ' │', 'detail');
        addConsoleLine('└' + '─'.repeat(60) + '┘', 'detail');
        addConsoleLine('', 'info');
        addConsoleLine('Top processes by CPU:', 'info');
        processes.slice(0, 5).forEach(proc => {
          addConsoleLine(`  ${proc.name.padEnd(15)} ${proc.cpu.toFixed(1)}% CPU   ${proc.memory}MB RAM`, 'detail');
        });
        break;
        
      case 'tree':
        addConsoleLine(currentDirectory, 'info');
        const treeNode = navigateToPath(currentDirectory);
        if (treeNode && treeNode.children) {
          const drawTree = (node: FileSystemNode, prefix: string = '', isLast: boolean = true) => {
            Object.entries(node.children || {}).forEach(([name, child], index, arr) => {
              const isLastChild = index === arr.length - 1;
              const connector = isLastChild ? '└── ' : '├── ';
              const icon = child.type === 'directory' ? '📁' : '📄';
              addConsoleLine(prefix + connector + icon + ' ' + name, 'detail');
              if (child.type === 'directory' && child.children) {
                const newPrefix = prefix + (isLastChild ? '    ' : '│   ');
                drawTree(child, newPrefix, isLastChild);
              }
            });
          };
          drawTree(treeNode);
        }
        break;
        
      case 'wget':
      case 'curl':
        if (!args[0]) {
          addConsoleLine(`${command}: missing URL`, 'error');
        } else {
          addConsoleLine(`${command}: ${args[0]}`, 'info');
          for (let i = 0; i <= 100; i += 20) {
            await new Promise(resolve => setTimeout(resolve, 200));
            addConsoleLine(`[${"█".repeat(i/5).padEnd(20, " ")}] ${i}%`, 'detail');
          }
          addConsoleLine('Download complete! (simulated)', 'success');
        }
        break;
        
      case 'yes':
        addConsoleLine('Starting infinite yes...', 'warning');
        for (let i = 0; i < 20; i++) {
          await new Promise(resolve => setTimeout(resolve, 50));
          addConsoleLine('y', 'detail');
        }
        addConsoleLine('^C', 'error');
        addConsoleLine('Interrupted by user', 'warning');
        break;
        
      case 'figlet':
        const text = args.join(' ') || 'HELLO';
        addConsoleLine('  _   _ _____ _     _     ___  ', 'info');
        addConsoleLine(' | | | | ____| |   | |   / _ \\ ', 'info');
        addConsoleLine(' | |_| |  _| | |   | |  | | | |', 'info');
        addConsoleLine(' |  _  | |___| |___| |__| |_| |', 'info');
        addConsoleLine(' |_| |_|_____|_____|_____\\___/ ', 'info');
        break;
        
      case 'screenfetch':
      case 'neofetch':
        addConsoleLine('       _____           ireddragonicy@quantum-nexus', 'info');
        addConsoleLine('      /     \\          OS: QuantumOS 42.0 Singularity', 'info');
        addConsoleLine('     /  ^ ^  \\         Host: NEXUS-9000', 'info');
        addConsoleLine('    |  (o o)  |        Kernel: 6.5.0-quantum', 'info');
        addConsoleLine('    |    <    |        Uptime: ' + Math.floor(progressPercentage) + ' seconds', 'info');
        addConsoleLine('     \\  ---  /         Shell: quantum-bash 5.2', 'info');
        addConsoleLine('      \\_____/          Resolution: 3840x2160', 'info');
        addConsoleLine('                       DE: Plasma Quantum', 'info');
        addConsoleLine('  ████████████████     Terminal: quantum-term', 'info');
        addConsoleLine('  ████████████████     CPU: AMD Ryzen 9 7950X (32) @ 5.7GHz', 'info');
        addConsoleLine('  ████████████████     GPU: NVIDIA RTX 4090', 'info');
        addConsoleLine('  ████████████████     Memory: ' + (memoryUsage * 655.36).toFixed(0) + 'MiB / 65536MiB', 'info');
        break;
        
      case 'exit':
      case 'quit':
      case 'logout':
        addConsoleLine('Completing system initialization...', 'info');
        addConsoleLine('Thank you for using QuantumOS Terminal!', 'success');
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTerminalMode('boot');
        setProgressPercentage(100);
        onLoadComplete();
        break;
        
      case 'll':
        // Alias for ls -la
        args.unshift('-la');
        // Fall through to ls
      case 'dir':
        // Alias for ls
        const dirPath = args[0] ? getAbsolutePath(args[0]) : currentDirectory;
        const dirNode = navigateToPath(dirPath);
        
        if (!dirNode) {
          addConsoleLine(`ls: cannot access '${args[0]}': No such file or directory`, 'error');
        } else if (dirNode.type === 'file') {
          addConsoleLine(dirNode.name, 'info');
        } else if (dirNode.children) {
          const items = Object.keys(dirNode.children).sort();
          if (items.length === 0) {
            addConsoleLine('(empty directory)', 'detail');
          } else {
            items.forEach(item => {
              const node = dirNode.children![item];
              const prefix = node.type === 'directory' ? '📁' : '📄';
              const color = node.type === 'directory' ? 'info' : 'detail';
              const size = node.size ? ` (${node.size} bytes)` : '';
              addConsoleLine(`${prefix} ${item}${size}`, color);
            });
          }
        }
        break;
        
      default:
        addConsoleLine(`Command not found: ${command}`, 'error');
        addConsoleLine('Type "help" for available commands', 'detail');
    }
    
    setIsProcessing(false);
  };

  // Handle tab completion
  const handleTabCompletion = () => {
    const parts = currentInput.split(' ');
    const isCommand = parts.length === 1;
    
    if (isCommand) {
      // Complete commands
      const commands = ['help', 'ls', 'cd', 'pwd', 'cat', 'echo', 'clear', 'whoami', 
                       'date', 'uptime', 'ps', 'top', 'htop', 'btop', 'df', 'ifconfig', 'ping', 
                       'neofetch', 'screenfetch', 'matrix', 'hack', 'secret', 'portfolio', 'exit',
                       'mkdir', 'rm', 'sudo', 'history', 'uname', 'fortune', 'cowsay',
                       'sl', 'vim', 'vi', 'nano', 'emacs', 'tree', 'wget', 'curl',
                       'yes', 'figlet'].sort();
      const matches = commands.filter(cmd => cmd.startsWith(parts[0]));
      
      if (matches.length === 1) {
        setCurrentInput(matches[0] + ' ');
      } else if (matches.length > 1) {
        setTabCompletions(matches);
        setShowTabHint(true);
        setTimeout(() => setShowTabHint(false), 3000);
      }
    } else {
      // Complete file paths
      const lastPart = parts[parts.length - 1];
      const pathToComplete = getAbsolutePath(lastPart);
      const parentPath = pathToComplete.substring(0, pathToComplete.lastIndexOf('/')) || '/';
      const parentNode = navigateToPath(parentPath);
      
      if (parentNode && parentNode.children) {
        const prefix = lastPart.split('/').pop() || '';
        const matches = Object.keys(parentNode.children).filter(name => name.startsWith(prefix));
        
        if (matches.length === 1) {
          parts[parts.length - 1] = lastPart.substring(0, lastPart.lastIndexOf('/') + 1) + matches[0];
          setCurrentInput(parts.join(' '));
        } else if (matches.length > 1) {
          setTabCompletions(matches);
          setShowTabHint(true);
          setTimeout(() => setShowTabHint(false), 3000);
        }
      }
    }
  };

  // Handle keyboard events for terminal
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Interactive terminal mode
    if (terminalMode === 'interactive') {
      // Cancel auto-redirect timer when user presses any key
      cancelAutoRedirectTimer();
      
      // Ctrl+C to clear current input
      if (e.ctrlKey && e.key === 'c') {
        e.preventDefault();
        addConsoleLine(`${currentDirectory}$ ${currentInput}^C`, 'input');
        setCurrentInput('');
        return;
      }
      
      // Ctrl+L to clear screen
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        setConsoleLines([]);
        return;
      }
      
      // Tab for completion
      if (e.key === 'Tab') {
        e.preventDefault();
        handleTabCompletion();
        return;
      }
      
      // Arrow up for history
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (commandHistory.commands.length > 0) {
          const newIndex = Math.max(0, commandHistory.currentIndex - 1);
          setCommandHistory(prev => ({ ...prev, currentIndex: newIndex }));
          setCurrentInput(commandHistory.commands[newIndex] || '');
        }
        return;
      }
      
      // Arrow down for history
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (commandHistory.currentIndex < commandHistory.commands.length - 1) {
          const newIndex = commandHistory.currentIndex + 1;
          setCommandHistory(prev => ({ ...prev, currentIndex: newIndex }));
          setCurrentInput(commandHistory.commands[newIndex] || '');
        } else {
          setCommandHistory(prev => ({ ...prev, currentIndex: commandHistory.commands.length }));
          setCurrentInput('');
        }
        return;
      }
      
      // Enter to execute command
      if (e.key === 'Enter') {
        e.preventDefault();
        addConsoleLine(`${currentDirectory}$ ${currentInput}`, 'input');
        processCommand(currentInput);
        setCurrentInput('');
        return;
      }
      
      // Regular character input
      if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        setCurrentInput(prev => prev + e.key);
        return;
      }
      
      // Backspace
      if (e.key === 'Backspace') {
        e.preventDefault();
        setCurrentInput(prev => prev.slice(0, -1));
        return;
      }
    }
    
    // Boot mode - original Ctrl+C behavior
    if (terminalMode === 'boot') {
      if (e.ctrlKey && e.key === 'c' && !showTerminatePrompt) {
        e.preventDefault();
        setShowTerminatePrompt(true);

        // Add interrupt message to console
        addConsoleLine('^C', 'error');
        addConsoleLine('> Interrupt signal received (SIGINT)', 'warning');
        addConsoleLine('> Terminate system initialization? (y/n): _', 'prompt');

        // Auto-close prompt after 5 seconds
        terminateTimeoutRef.current = setTimeout(() => {
          setShowTerminatePrompt(false);
          addConsoleLine('n', 'input');
          addConsoleLine('> Continuing system initialization...', 'info');
        }, 5000);
      }

      // Handle prompt response
      if (showTerminatePrompt) {
        if (e.key === 'y' || e.key === 'Y') {
          e.preventDefault();
          if (terminateTimeoutRef.current) {
            clearTimeout(terminateTimeoutRef.current);
          }

          // Add termination sequence
          addConsoleLine('y', 'input');
          addConsoleLine('> [CRITICAL] System termination initiated...', 'error');
          addConsoleLine('> Shutting down all modules...', 'error');
          addConsoleLine('> Clearing memory...', 'error');
          addConsoleLine('> Goodbye, Operator.', 'error');

          // Easter egg: different redirect
          setTimeout(() => {
            window.location.href = 'https://www.youtube.com/watch?v=xvFZjo5PgG0';
          }, 1500);
        } else if (e.key === 'n' || e.key === 'N' || e.key === 'Escape') {
          e.preventDefault();
          if (terminateTimeoutRef.current) {
            clearTimeout(terminateTimeoutRef.current);
          }
          setShowTerminatePrompt(false);
          addConsoleLine('n', 'input');
          addConsoleLine('> Continuing system initialization...', 'info');
        }
      }
    }
  }, [showTerminatePrompt, terminalMode, currentInput, currentDirectory, commandHistory, cancelAutoRedirectTimer]);

  // Add keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (terminateTimeoutRef.current) {
        clearTimeout(terminateTimeoutRef.current);
      }
      if (autoRedirectTimeoutRef.current) {
        clearTimeout(autoRedirectTimeoutRef.current);
      }
    };
  }, [handleKeyDown]);

  // Set client flag
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Generate session ID and other client-side values
  useEffect(() => {
    if (!isClient) return;

    // Generate session ID
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    setSessionId(`SES-${timestamp}-${random}`);

    // Generate matrix rain characters
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const rain = [];
    for (let i = 0; i < 50; i++) {
      rain.push(chars[Math.floor(Math.random() * chars.length)]);
    }
    setMatrixRain(rain);

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
  }, [isClient]);

  // Update time and system metrics
  useEffect(() => {
    if (!isClient) return;

    const updateMetrics = () => {
      setCurrentTime(new Date().toLocaleTimeString());

      // Update CPU cores
      setCpuCores(prev => {
        const newCores = prev.map(core => ({
          ...core,
          usage: Math.max(0, Math.min(100,
            core.usage + (Math.random() - 0.5) * 20
          )),
          frequency: 4.5 + (Math.random() - 0.5) * 0.4,
          temperature: Math.round(Math.max(40, Math.min(85,
            core.temperature + (Math.random() - 0.5) * 2
          )))
        }));

        // Calculate average CPU usage and temperature
        const avgCpuUsage = newCores.reduce((acc, core) => acc + core.usage, 0) / newCores.length;
        const avgCpuTemp = Math.round(newCores.reduce((acc, core) => acc + core.temperature, 0) / newCores.length);

        // Update system metrics with the calculated values
        setSystemMetrics(prev => prev.map(metric => {
          let newValue = metric.value;
          let newDetails = { ...metric.details };

          if (metric.label === 'CPU') {
            newValue = avgCpuUsage;
            newDetails.temperature = avgCpuTemp;
          } else if (metric.label === 'GPU') {
            newValue = Math.max(0, Math.min(metric.max,
              metric.value + (Math.random() - 0.5) * metric.max * 0.1
            ));
            newDetails.temperature = Math.round(Math.max(50, Math.min(85,
              (newDetails.temperature || 65) + (Math.random() - 0.5) * 3
            )));
          } else if (metric.label === 'VRAM') {
            newValue = Math.max(0, Math.min(metric.max,
              metric.value + (Math.random() - 0.5) * metric.max * 0.1
            ));
            newDetails.temperature = Math.round(Math.max(50, Math.min(80,
              (newDetails.temperature || 60) + (Math.random() - 0.5) * 2
            )));
          } else if (metric.label === 'Disk I/O') {
            newValue = Math.max(0, Math.min(metric.max,
              metric.value + (Math.random() - 0.5) * metric.max * 0.1
            ));
            newDetails.temperature = Math.round(Math.max(30, Math.min(65,
              (newDetails.temperature || 38) + (Math.random() - 0.5) * 1
            )));
          } else if (metric.label === 'RAM') {
            // Will be updated from ramModules state
            newValue = metric.value;
          } else {
            newValue = Math.max(0, Math.min(metric.max,
              metric.value + (Math.random() - 0.5) * metric.max * 0.1
            ));
          }

          const newHistory = [...metric.history.slice(1), newValue];

          return {
            ...metric,
            value: newValue,
            history: newHistory,
            details: newDetails
          };
        }));

        return newCores;
      });

      // Update RAM modules
      setRamModules(prev => {
        const newModules = prev.map(module => ({
          ...module,
          usage: Math.max(0, Math.min(module.size,
            module.usage + (Math.random() - 0.5) * 1000
          ))
        }));

        // Update RAM metric with total usage
        const totalUsage = newModules.reduce((acc, module) => acc + module.usage, 0);
        setSystemMetrics(prev => prev.map(metric =>
          metric.label === 'RAM' ? {
            ...metric,
            value: totalUsage,
            history: [...metric.history.slice(1), totalUsage]
          } : metric
        ));

        return newModules;
      });

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
  }, [isClient]);

  // Line graph component
  const LineGraph = ({ data, color, height = 60, graphId }: { data: number[]; color: string; height?: number; graphId: string }) => {
    const width = 100;
    const padding = 2;
    const max = Math.max(...data, 1);

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * (width - padding * 2) + padding;
      const y = height - (value / max) * (height - padding * 2) - padding;
      return `${x},${y}`;
    }).join(' ');

    const area = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;
    const gradientId = `gradient-${graphId}`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.6" />
            <stop offset="100%" stopColor={color} stopOpacity="0.1" />
          </linearGradient>
        </defs>

        <polygon
          points={area}
          fill={`url(#${gradientId})`}
        />

        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Add glow effect */}
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.3"
          filter="blur(2px)"
        />
      </svg>
    );
  };

  // Particle animation on canvas
  useEffect(() => {
    if (!isClient) return;

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

    let animationId: number;
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

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isClient]);

  // Console messages with types
  const initMessages = [
    { text: '> System boot sequence initiated...', type: 'info' },
    { text: '> BIOS Version: v4.2.0 Phoenix', type: 'system' },
    { text: '> Checking hardware compatibility...', type: 'info' },
    { text: '> CPU: AMD Ryzen 9 7950X @ 5.7GHz (16C/32T)', type: 'hardware' },
    { text: '> GPU: NVIDIA RTX 4090 24GB GDDR6X', type: 'hardware' },
    { text: '> RAM: 64GB (4x16GB) DDR5 @ 6000MHz CL30', type: 'hardware' },
    { text: '> SSD: Samsung 990 PRO 2TB NVMe Gen4', type: 'hardware' },
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

  // Initialize modules with complex sequence
  useEffect(() => {
    let hasInitialized = false;
    
    const initializeModules = async () => {
      if (hasInitialized) return;
      hasInitialized = true;
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

            // Update CPU cores usage during loading
            setCpuCores(prev => prev.map((core, idx) => ({
              ...core,
              usage: Math.min(95, 20 + Math.random() * 60 + (idx === i % 16 ? 20 : 0))
            })));

            // Update RAM usage
            setRamModules(prev => prev.map((module, idx) => ({
              ...module,
              usage: Math.min(module.size, (progress / 100) * module.size * 0.7 + Math.random() * 1000)
            })));
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
          setCpuCores(prev => prev.map(core => ({
            ...core,
            usage: Math.max(5, core.usage - Math.random() * 20)
          })));

          setRamModules(prev => prev.map(module => ({
            ...module,
            usage: Math.max(module.size * 0.2, module.usage - Math.random() * 500)
          })));
        }
      }

      setSystemStatus('ONLINE');

      // Switch to interactive terminal mode
      await new Promise(resolve => setTimeout(resolve, 1000));
      addConsoleLine('', 'info');
      addConsoleLine('> Entering interactive terminal mode...', 'success');
      addConsoleLine('> Type "help" for available commands', 'info');
      addConsoleLine('> Auto-redirect to portfolio in 10 seconds if inactive...', 'detail');
      addConsoleLine('', 'info');
      setTerminalMode('interactive');
      
      // Will be handled by separate useEffect
      
      // Initialize some processes
      const initialProcesses: Process[] = [
        { pid: 2001, name: 'node', cpu: 12.3, memory: 256, time: '00:00:12', user: 'root', status: 'running' },
        { pid: 2002, name: 'chrome', cpu: 8.5, memory: 512, time: '00:00:08', user: 'ireddragonicy', status: 'running' },
        { pid: 2003, name: 'vscode', cpu: 5.2, memory: 384, time: '00:00:05', user: 'ireddragonicy', status: 'sleeping' },
      ];
      setProcesses(initialProcesses);
      
      // Don't auto-complete, let user interact
      // onLoadComplete();
    };

    initializeModules();
  }, []);

  // Start auto-redirect timer when interactive mode is entered
  useEffect(() => {
    if (terminalMode === 'interactive' && !autoRedirectStarted) {
      const timer = setTimeout(() => {
        startAutoRedirectTimer();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [terminalMode, autoRedirectStarted, startAutoRedirectTimer]);

  // Auto-scroll console
  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [consoleLines]);

  // Generate circuit pattern
  const circuitPattern = useMemo(() => {
    if (!isClient) return [];

    const paths = [];
    for (let i = 0; i < 10; i++) {
      const startX = Math.random() * 100;
      const startY = Math.random() * 100;
      const endX = Math.random() * 100;
      const endY = Math.random() * 100;
      const midX = (startX + endX) / 2 + (Math.random() - 0.5) * 20;
      const midY = (startY + endY) / 2 + (Math.random() - 0.5) * 20;

      paths.push({
        id: `path-${i}`,
        d: `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`
      });
    }
    return paths;
  }, [isClient]);

  // Get unified metrics
  const cpuUsage = systemMetrics.find(m => m.label === 'CPU')?.value || 0;
  const gpuUsage = systemMetrics.find(m => m.label === 'GPU')?.value || 0;
  const memoryUsage = ((systemMetrics.find(m => m.label === 'RAM')?.value || 0) / 65536) * 100;

  if (!isClient) {
    return (
      <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center">
        <div className="text-cyan-400 font-mono">Initializing...</div>
      </div>
    );
  }

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
              key={`matrix-${i}`}
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
          {circuitPattern.map((path) => (
            <motion.path
              key={path.id}
              d={path.d}
              fill="none"
              stroke="cyan"
              strokeWidth="0.1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, delay: parseInt(path.id.split('-')[1]) * 0.2, repeat: Infinity }}
            />
          ))}
        </svg>

        {/* Hexagonal patterns */}
        <div className="absolute inset-0 opacity-20">
          {hexPatterns.map((hex, i) => (
            <motion.div
              key={`hex-${i}`}
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

        {/* Terminate prompt overlay */}
        <AnimatePresence>
          {showTerminatePrompt && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-red-900/20 border border-red-500 rounded-lg p-6 max-w-md"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                    <span className="text-red-500 text-2xl">⚠</span>
                  </div>
                  <div>
                    <h3 className="text-red-500 font-mono font-bold text-lg">SIGINT RECEIVED</h3>
                    <p className="text-red-400 font-mono text-sm">Process interrupt signal detected</p>
                  </div>
                </div>
                <p className="text-gray-300 font-mono text-sm mb-4">
                  WARNING: Terminating system initialization may result in undefined behavior.
                  All loaded modules will be forcefully stopped.
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-cyan-400 font-mono text-sm">Continue termination? (Y/N)</p>
                  <div className="flex gap-2">
                    <motion.span
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="text-red-400 font-mono text-sm"
                    >
                      Press Y or N
                    </motion.span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main container */}
        <div className="relative w-full max-w-7xl mx-auto px-4 lg:px-8">
          {/* Top metrics bar with graphs */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 bg-black/80 backdrop-blur-xl border border-cyan-500/30 rounded-lg p-4"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {systemMetrics.map((metric, i) => (
                <div key={`metric-${i}-${metric.label}`} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-gray-400">{metric.label}</span>
                    <span className="text-xs font-mono" style={{ color: metric.color }}>
                      {metric.label === 'CPU' || metric.label === 'GPU' ?
                        `${metric.value.toFixed(0)}${metric.unit}` :
                        `${metric.value.toFixed(0)}${metric.unit}`
                      }
                    </span>
                  </div>

                  <div className="h-12 relative">
                    <LineGraph
                      data={metric.history}
                      color={metric.color}
                      height={48}
                      graphId={`${metric.label}-${i}`}
                    />
                  </div>

                  {metric.details && (
                    <div className="text-[10px] font-mono text-gray-500 space-y-0.5">
                      {metric.details.cores && <div>Cores: {metric.details.cores}</div>}
                      {metric.details.threads && <div>Threads: {metric.details.threads}</div>}
                      {metric.details.frequency && <div>{metric.details.frequency}</div>}
                      {metric.details.modules && <div>Modules: {metric.details.modules}</div>}
                      {metric.details.speed && <div>Speed: {metric.details.speed}</div>}
                      {metric.details.temperature && (
                        <div className={
                          metric.details.temperature > 75 ? 'text-red-400' :
                          metric.details.temperature > 60 ? 'text-yellow-400' :
                          'text-green-400'
                        }>
                          Temp: {metric.details.temperature}°C
                        </div>
                      )}
                    </div>
                  )}
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

              <div className="text-[10px] font-mono text-gray-500 mb-2 flex items-center gap-4">
                {terminalMode === 'boot' ? (
                  <>
                    <span>Press Ctrl+C to interrupt process</span>
                    <span className="text-red-400">⚡</span>
                  </>
                ) : (
                  <>
                    <span className="text-cyan-400">Interactive Mode</span>
                    <span className="text-gray-400">•</span>
                    <span>Ctrl+C: Cancel</span>
                    <span className="text-gray-400">•</span>
                    <span>Ctrl+L: Clear</span>
                    <span className="text-gray-400">•</span>
                    <span>Tab: Complete</span>
                    <span className="text-gray-400">•</span>
                    <span>↑↓: History</span>
                    <span className="text-gray-400">•</span>
                    <span>Type "help" for commands</span>
                    {autoRedirectCountdown !== null && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="text-yellow-400">Auto-redirect in {autoRedirectCountdown}s</span>
                      </>
                    )}
                  </>
                )}
              </div>

              <div
                ref={consoleRef}
                className="h-[380px] overflow-y-auto font-mono text-xs lg:text-sm space-y-1 custom-scrollbar"
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
                      ${line.type === 'prompt' ? 'text-yellow-400 font-bold' : ''}
                      ${line.type === 'input' ? 'text-white font-bold' : ''}
                    `}
                  >
                    {line.text}
                  </motion.div>
                ))}
                
                {/* Interactive prompt */}
                {terminalMode === 'interactive' && (
                  <div className="flex items-center text-white font-mono">
                    <span className="text-green-400">{currentDirectory}</span>
                    <span className="text-cyan-400">$</span>
                    <span className="ml-2">{currentInput}</span>
                    <motion.span
                      animate={{ opacity: [1, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="inline-block w-2 h-4 bg-cyan-400 ml-1"
                    />
                  </div>
                )}
                
                {/* Auto-redirect countdown warning */}
                {autoRedirectCountdown !== null && autoRedirectCountdown <= 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 p-3 bg-yellow-900/20 rounded border border-yellow-500/40"
                  >
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="text-sm font-mono text-yellow-400 flex items-center gap-2"
                    >
                      <span className="text-lg">⏰</span>
                      <span>Auto-redirecting to portfolio in {autoRedirectCountdown} seconds...</span>
                    </motion.div>
                    <div className="text-xs text-gray-400 mt-1">
                      Press any key to cancel auto-redirect
                    </div>
                  </motion.div>
                )}

                {/* Tab completion hint */}
                {showTabHint && tabCompletions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-2 p-2 bg-gray-800/80 rounded border border-cyan-500/30"
                  >
                    <div className="text-xs text-gray-400 mb-1">Tab completions:</div>
                    <div className="flex flex-wrap gap-2">
                      {tabCompletions.map((completion, i) => (
                        <span key={i} className="text-cyan-400 text-sm">
                          {completion}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
                
                {terminalMode === 'boot' && (
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="inline-block w-2 h-4 bg-cyan-400 ml-1"
                  />
                )}
              </div>

              {/* Hardware Details */}
              <div className="mt-4 grid grid-cols-2 gap-4 border-t border-cyan-500/20 pt-4">
                {/* CPU Cores */}
                <div>
                  <div className="text-xs font-mono text-gray-400 mb-2">CPU CORES</div>
                  <div className="grid grid-cols-8 gap-1">
                    {cpuCores.map((core, i) => (
                      <motion.div
                        key={`core-${i}`}
                        className="relative group"
                        whileHover={{ scale: 1.2 }}
                      >
                        <div
                          className="w-6 h-6 rounded border border-cyan-500/30 flex items-center justify-center text-[8px] font-mono"
                          style={{
                            backgroundColor: `rgba(6, 182, 212, ${core.usage / 100})`,
                            borderColor: core.usage > 80 ? '#ef4444' : core.usage > 50 ? '#f59e0b' : '#06b6d4'
                          }}
                        >
                          {i}
                        </div>
                        <div className="absolute bottom-full mb-1 left-1/2 transform -translate-x-1/2 bg-black/90 rounded px-2 py-1 text-[10px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                          <div className="text-cyan-400">Core {i}</div>
                          <div>Usage: {core.usage.toFixed(0)}%</div>
                          <div>Freq: {core.frequency.toFixed(1)}GHz</div>
                          <div className={
                            core.temperature > 75 ? 'text-red-400' :
                            core.temperature > 60 ? 'text-yellow-400' :
                            'text-green-400'
                          }>
                            Temp: {core.temperature}°C
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* RAM Modules */}
                <div>
                  <div className="text-xs font-mono text-gray-400 mb-2">RAM MODULES</div>
                  <div className="space-y-1">
                    {ramModules.map((module, i) => (
                      <div key={`ram-${i}`} className="flex items-center gap-2">
                        <div className="text-[10px] font-mono text-gray-500">DIMM{i}</div>
                        <div className="flex-1 h-4 bg-gray-800 rounded-sm overflow-hidden relative">
                          <motion.div
                            className="h-full bg-gradient-to-r from-purple-500 to-purple-600"
                            animate={{ width: `${(module.usage / module.size) * 100}%` }}
                            transition={{ duration: 0.3 }}
                          />
                          <div className="absolute inset-0 flex items-center justify-between px-1 text-[9px] font-mono">
                            <span className="text-white/70">{module.manufacturer}</span>
                            <span className="text-white/70">{(module.usage / 1024).toFixed(1)}GB/{(module.size / 1024).toFixed(0)}GB</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Waveform visualization */}
              <div className="mt-4 border-t border-cyan-500/20 pt-3">
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
                      key={`wave-${i}`}
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

                {/* Terminal Mode Indicator */}
                {terminalMode === 'interactive' && (
                  <div className="mb-3 p-2 bg-green-500/10 border border-green-500/30 rounded">
                    <div className="text-xs font-mono text-green-400 flex items-center gap-2">
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-2 h-2 rounded-full bg-green-400"
                      />
                      <span>INTERACTIVE MODE ACTIVE</span>
                    </div>
                    <div className="text-[10px] font-mono text-gray-500 mt-1">
                      Type "help" for commands • "exit" to continue
                    </div>
                  </div>
                )}

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

                {/* System Resources - Updated to use unified metrics */}
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
                      <g key={`node-${i}`}>
                        {node.connected.map(targetId => {
                          const target = networkNodes[targetId];
                          if (!target) return null;
                          return (
                            <motion.line
                              key={`line-${i}-${targetId}`}
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
                      key={`module-${module.id}`}
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
                  <span className="text-yellow-400">{sessionId}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">UPTIME:</span>
                  <span className="text-purple-400">{Math.floor(progressPercentage)}s</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">TIME:</span>
                  <span className="text-cyan-400">{currentTime}</span>
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