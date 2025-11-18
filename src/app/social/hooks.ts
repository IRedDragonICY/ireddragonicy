import { useState, useEffect } from 'react';
import type { SocialStats } from './types';
import { cacheUtils, formatUtils } from './utils';

export interface ApiHookConfig {
  service: string;
  identifier: string;
  endpoint: string;
}

/**
 * Generic hook for fetching social media stats
 */
export function useSocialStats<T extends SocialStats>(config: ApiHookConfig): T {
  const [stats, setStats] = useState<T>({
    loading: true,
  } as T);

  useEffect(() => {
    let aborted = false;
    const controller = new AbortController();

    const fetchStats = async () => {
      const cacheKey = formatUtils.generateCacheKey(config.service, config.identifier);
      
      try {
        // Load from cache first
        const cached = cacheUtils.loadCached<Partial<T>>(cacheKey);
        if (!aborted && cached) {
          setStats(prev => ({ ...prev, ...cached, loading: false }));
        }
      } catch {
        // Ignore cache errors
      }

      try {
        const res = await fetch(config.endpoint, { signal: controller.signal });
        const data = await res.json();
        
        if (aborted) return;

        setStats(prev => ({ 
          ...Object.keys(data).reduce((acc, key) => {
            acc[key as keyof T] = data[key] ?? prev[key as keyof T] ?? null;
            return acc;
          }, {} as Partial<T>),
          loading: false 
        } as T));

        // Cache if we have valid data
        const hasValidData = Object.values(data).some(v => v !== null && v !== undefined);
        if (hasValidData) {
          cacheUtils.saveCached(cacheKey, data);
        }
      } catch {
        if (aborted) return;
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();

    return () => {
      aborted = true;
      controller.abort();
    };
  }, [config.service, config.identifier, config.endpoint]);

  return stats;
}

// Specific hooks for each service
export const useXStats = (username: string) => 
  useSocialStats<SocialStats & { posts: number | null }>({
    service: 'x',
    identifier: username,
    endpoint: `/api/x-stats?u=${username}`
  });

export const useThreadsStats = (username: string) =>
  useSocialStats<Pick<SocialStats, 'followers' | 'loading'>>({
    service: 'threads',
    identifier: username,
    endpoint: `/api/threads-stats?u=${username}`
  });

export const usePinterestStats = (username: string) =>
  useSocialStats<Pick<SocialStats, 'followers' | 'following' | 'loading'>>({
    service: 'pinterest',
    identifier: username,
    endpoint: `/api/pinterest-stats?u=${username}`
  });

export const useInstagramStats = (username: string) =>
  useSocialStats<Pick<SocialStats, 'posts' | 'followers' | 'following' | 'loading'>>({
    service: 'instagram',
    identifier: username,
    endpoint: `/api/instagram-stats?u=${username}`
  });

export const useYoutubeStats = (channel: string) =>
  useSocialStats<Pick<SocialStats, 'subscribers' | 'videos' | 'views' | 'loading'>>({
    service: 'youtube',
    identifier: channel,
    endpoint: `/api/youtube-stats?c=${channel}`
  });

export const useBlueskyStats = (handle: string) =>
  useSocialStats<Pick<SocialStats, 'followers' | 'following' | 'posts' | 'loading'>>({
    service: 'bluesky',
    identifier: handle,
    endpoint: `/api/bluesky-stats?u=${handle}`
  });

export const useTiktokStats = (username: string) =>
  useSocialStats<Pick<SocialStats, 'followers' | 'following' | 'likes' | 'loading'>>({
    service: 'tiktok',
    identifier: username,
    endpoint: `/api/tiktok-stats?u=${username}`
  });

export const useHoyolabStats = (id: string) =>
  useSocialStats<Pick<SocialStats, 'posts' | 'following' | 'followers' | 'likes' | 'loading'>>({
    service: 'hoyolab',
    identifier: id,
    endpoint: `/api/hoyolab-stats?id=${id}`
  });

export const useStravaStats = (id: string) =>
  useSocialStats<Pick<SocialStats, 'followers' | 'following' | 'distanceKm' | 'movingTime' | 'loading'>>({
    service: 'strava',
    identifier: id,
    endpoint: `/api/strava-stats?id=${id}`
  });