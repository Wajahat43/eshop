'use client';

import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    // Check initial theme from body attribute
    const bodyTheme = document.body.getAttribute('data-theme') as Theme;
    if (bodyTheme) {
      setTheme(bodyTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const setThemeValue = (newTheme: Theme) => {
    setTheme(newTheme);
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return {
    theme,
    toggleTheme,
    setTheme: setThemeValue,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };
}
