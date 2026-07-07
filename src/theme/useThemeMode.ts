'use client';

import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_THEME, applyTheme, storeTheme, type ThemeMode } from './themeStorage';

function readDomTheme(): ThemeMode {
  if (typeof document === 'undefined') return DEFAULT_THEME;
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export interface UseThemeMode {
  readonly mode: ThemeMode;
  readonly toggle: () => void;
}

export function useThemeMode(): UseThemeMode {
  const [mode, setMode] = useState<ThemeMode>(DEFAULT_THEME);

  useEffect(() => {
    setMode(readDomTheme());
    const observer = new MutationObserver(() => setMode(readDomTheme()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const toggle = useCallback(() => {
    const next: ThemeMode = readDomTheme() === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    storeTheme(next);
    setMode(next);
  }, []);

  return { mode, toggle };
}
