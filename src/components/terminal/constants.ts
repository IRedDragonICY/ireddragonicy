// src/components/terminal/constants.ts
// Constants and immutable configs for the terminal application

export const AUTO_REDIRECT_DELAY_MS = 10_000;
export const AUTO_REDIRECT_COUNTDOWN_SECS = 10;

export const STORAGE_KEYS = {
  hasBooted: 'hasBooted',
  terminalAutoRedirectHandled: 'terminalAutoRedirectHandled',
} as const;

export const INIT_MESSAGES = [
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
] as const;


