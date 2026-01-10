import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import type { ThemeColor } from '@/types/task';

export function useTheme() {
  const [theme, setTheme] = useLocalStorage<ThemeColor>('task-tracker-theme', 'default');
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('task-tracker-dark-mode', false);

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('theme-ocean', 'theme-forest', 'theme-sunset', 'theme-berry', 'theme-midnight', 'dark');
    
    // Add current theme class
    if (theme !== 'default') {
      root.classList.add(`theme-${theme}`);
    }
    
    // Add dark mode class
    if (darkMode) {
      root.classList.add('dark');
    }
  }, [theme, darkMode]);

  return { theme, setTheme, darkMode, setDarkMode };
}
