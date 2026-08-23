import { useCallback, useEffect, useState } from 'react';
import { applyTheme, getStoredTheme, systemPrefersDark, type Theme } from '@/lib/theme';

const ORDER: Theme[] = ['light', 'dark', 'system'];

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // While in "system" mode, follow live OS preference changes.
  useEffect(() => {
    if (theme !== 'system') return;
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('system');
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const index = ORDER.indexOf(theme);
    setTheme(ORDER[(index + 1) % ORDER.length]);
  }, [theme]);

  return { theme, resolvedTheme: theme === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : theme, toggleTheme };
}
