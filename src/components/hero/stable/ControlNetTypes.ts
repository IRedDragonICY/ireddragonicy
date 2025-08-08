import type { ControlNetType } from '../../hero/constants';

export type ControlNetState = {
  type: ControlNetType;
  enabled: boolean;
  weight: number; // 0..2
  preprocessor?: string;
};

export type OverlayDataMap = {
  openpose?: string | null; // data URL
  depth?: string | null;
  canny?: string | null;
};


