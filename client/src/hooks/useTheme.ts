import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'flowtyme.theme';

export function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function getStoredTheme(): Theme | null {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === 'light' || saved === 'dark' ? saved : null;
}

export function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme);
}

export function useTheme() {
  const [explicitTheme, setExplicitTheme] = useState<Theme | null>(() => getStoredTheme());
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme() ?? getSystemTheme());

  useEffect(() => {
    const resolved = explicitTheme ?? getSystemTheme();
    setTheme(resolved);
    applyTheme(resolved);
    if (explicitTheme) {
      localStorage.setItem(STORAGE_KEY, explicitTheme);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [explicitTheme]);

  useEffect(() => {
    if (explicitTheme !== null) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      const next = mq.matches ? 'dark' : 'light';
      setTheme(next);
      applyTheme(next);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [explicitTheme]);

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setExplicitTheme(next);
  }, [theme]);

  return { theme, toggleTheme };
}
