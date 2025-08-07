// src/components/terminal/utils.ts
// Small utility helpers for timing and storage, to keep components focused on UI concerns

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const safeLocalStorageGet = (key: string): string | null => {
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const safeLocalStorageSet = (key: string, value: string) => {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
};


