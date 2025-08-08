export const SAMPLERS = [
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
  'UniPC',
] as const;

export type Sampler = typeof SAMPLERS[number];

export const MODELS = [
  'SDXL 1.0',
  'SD 1.5',
  'SD 2.1',
  'SDXL Turbo',
] as const;

export type ModelName = typeof MODELS[number];

export const CONTROLNET_TYPES = [
  'none',
  'depth',
  'canny',
  'scribble',
] as const;

export type ControlNetType = typeof CONTROLNET_TYPES[number];

export const CONTROLNET_PREPROCESSORS: Record<Exclude<ControlNetType, 'none'>, string[]> = {
  depth: ['MiDaS', 'LeReS', 'ZoeDepth'],
  canny: ['Canny (Low)', 'Canny (Medium)', 'Canny (High)'],
  scribble: ['Scribble (Thin)', 'Scribble (Medium)', 'Scribble (Thick)'],
};


