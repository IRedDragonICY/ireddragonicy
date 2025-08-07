// src/components/terminal/types.ts
// Shared terminal and loading screen types to keep components lightweight and maintainable

export interface LoadingScreenProps {
  onLoadComplete: () => void;
  startMode?: 'boot' | 'interactive';
  variant?: 'full' | 'fast';
  autoRedirectOnIdle?: boolean;
}

export interface SystemModule {
  id: string;
  name: string;
  status: 'pending' | 'loading' | 'complete' | 'error';
  progress: number;
  submodules?: string[];
  memoryUsage?: number;
  threads?: number;
}

export interface FileSystemNode {
  name: string;
  type: 'file' | 'directory';
  content?: string;
  children?: { [key: string]: FileSystemNode };
  permissions?: string;
  owner?: string;
  size?: number;
  modified?: Date;
}

export interface Process {
  pid: number;
  name: string;
  cpu: number;
  memory: number;
  time: string;
  user: string;
  status: 'running' | 'sleeping' | 'zombie';
}

export interface CommandHistory {
  commands: string[];
  currentIndex: number;
}

export interface NetworkNode {
  id: number;
  x: number;
  y: number;
  connected: number[];
  active: boolean;
}

export interface SystemMetric {
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

export interface CPUCore {
  id: number;
  usage: number;
  frequency: number;
  temperature: number;
}

export interface RAMModule {
  id: number;
  size: number;
  speed: number;
  manufacturer: string;
  usage: number;
}


