import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { LOCAL_STORAGE_KEYS } from '../utils/constants';

const ThemeContext = createContext(null);

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(mode) {
  return mode === 'system' ? getSystemTheme() : mode;
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(
    () => localStorage.getItem(LOCAL_STORAGE_KEYS.THEME) || 'system'
  );
  const [resolved, setResolved] = useState(() => resolveTheme(mode));

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolved);
  }, [resolved]);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEYS.THEME, mode);
    setResolved(resolveTheme(mode));

    if (mode !== 'system') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setResolved(getSystemTheme());
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

  const setTheme = useCallback((next) => setMode(next), []);

  return (
    <ThemeContext.Provider value={{ mode, resolvedTheme: resolved, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
