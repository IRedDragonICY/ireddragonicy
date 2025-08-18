import type { CacheItem } from './types';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const cacheUtils = {
  /**
   * Load cached data from localStorage
   */
  loadCached<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      
      const cached: CacheItem<T> = JSON.parse(raw);
      const now = Date.now();
      
      // Check if cache is expired
      if (now - cached.timestamp > cached.ttl) {
        localStorage.removeItem(key);
        return null;
      }
      
      return cached.data;
    } catch {
      return null;
    }
  },

  /**
   * Save data to localStorage with TTL
   */
  saveCached<T>(key: string, value: T, ttl: number = CACHE_TTL): void {
    try {
      const cacheItem: CacheItem<T> = {
        data: value,
        timestamp: Date.now(),
        ttl,
      };
      localStorage.setItem(key, JSON.stringify(cacheItem));
    } catch {
      // Silently fail if localStorage is not available
    }
  },

  /**
   * Clear specific cache key
   */
  clearCache(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch {
      // Silently fail
    }
  },

  /**
   * Clear all social cache
   */
  clearAllCache(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('stat:')) {
          localStorage.removeItem(key);
        }
      });
    } catch {
      // Silently fail
    }
  }
};

export const clipboardUtils = {
  /**
   * Copy text to clipboard
   */
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }
};

export const searchUtils = {
  /**
   * Filter social items based on query
   */
  filterSocials<T extends { name: string; description: string; href: string }>(
    items: T[],
    query: string
  ): T[] {
    const lowerQ = query.toLowerCase();
    return items.filter(item =>
      item.name.toLowerCase().includes(lowerQ) ||
      item.description.toLowerCase().includes(lowerQ) ||
      item.href.toLowerCase().includes(lowerQ)
    );
  },

  /**
   * Filter game items based on query
   */
  filterGames<T extends { name: string; server: string; uid?: string; ign?: string }>(
    items: T[],
    query: string
  ): T[] {
    const lowerQ = query.toLowerCase();
    return items.filter(item =>
      item.name.toLowerCase().includes(lowerQ) ||
      item.server.toLowerCase().includes(lowerQ) ||
      (item.uid?.toLowerCase().includes(lowerQ) ?? false) ||
      (item.ign?.toLowerCase().includes(lowerQ) ?? false)
    );
  }
};

export const formatUtils = {
  /**
   * Format numbers with Indonesian locale
   */
  formatNumber(num: number | null): string {
    if (num === null) return '—';
    return num.toLocaleString('id-ID');
  },

  /**
   * Generate cache key for API stats
   */
  generateCacheKey(service: string, identifier: string): string {
    return `stat:${service}:${identifier}`;
  }
};