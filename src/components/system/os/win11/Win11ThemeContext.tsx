'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type ThemeMode = 'light' | 'dark';

type Win11Theme = {
  themeMode: ThemeMode;
  accentColor: string; // hex
  transparency: boolean;
  setThemeMode: (m: ThemeMode) => void;
  setAccentColor: (c: string) => void;
  setTransparency: (t: boolean) => void;
};

const Ctx = createContext<Win11Theme | null>(null);

export const Win11ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [accentColor, setAccentColor] = useState<string>('#3b82f6');
  const [transparency, setTransparency] = useState<boolean>(true);

  // Load persisted
  useEffect(() => {
    try {
      const t = window.localStorage.getItem('win11.theme');
      const a = window.localStorage.getItem('win11.accent');
      const tr = window.localStorage.getItem('win11.transparency');
      if (t === 'light' || t === 'dark') setThemeMode(t);
      if (a) setAccentColor(a);
      if (tr != null) setTransparency(tr === '1');
    } catch {}
  }, []);

  // Persist
  useEffect(() => {
    try {
      window.localStorage.setItem('win11.theme', themeMode);
      window.localStorage.setItem('win11.accent', accentColor);
      window.localStorage.setItem('win11.transparency', transparency ? '1' : '0');
    } catch {}
  }, [themeMode, accentColor, transparency]);

  // Apply to document (dark class + CSS variables)
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (themeMode === 'dark') root.classList.add('dark'); else root.classList.remove('dark');
      root.style.setProperty('--win-accent', accentColor);
      root.style.setProperty('--win-transparency', transparency ? '1' : '0');
    }
  }, [themeMode, accentColor, transparency]);

  const value = useMemo<Win11Theme>(() => ({
    themeMode,
    accentColor,
    transparency,
    setThemeMode,
    setAccentColor,
    setTransparency,
  }), [themeMode, accentColor, transparency]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useWin11Theme = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useWin11Theme must be used within Win11ThemeProvider');
  return ctx;
};


