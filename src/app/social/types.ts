import type { IconType } from 'react-icons';

export interface SocialItem {
  id: string;
  name: string;
  href: string;
  icon: IconType;
  description: string;
  accent: string; // primary hex for border/glow
  gradientFrom: string;
  gradientTo: string;
}

export interface GameItem {
  id: string;
  name: string;
  server: string;
  uid?: string;
  ign?: string;
  icon?: IconType;
  videoSrc?: string;
  accent: string;
  gradientFrom: string;
  gradientTo: string;
}

export interface SocialStats {
  followers?: number | null;
  following?: number | null;
  posts?: number | null;
  likes?: number | null;
  subscribers?: number | null;
  videos?: number | null;
  views?: number | null;
  distanceKm?: number | null;
  movingTime?: string | null;
  loading: boolean;
}

export interface PersonalInfo {
  alias: string;
}

export interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}