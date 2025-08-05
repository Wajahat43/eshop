'use client';

import { useEffect } from 'react';

export function ThemeScript() {
  useEffect(() => {
    // Get theme from localStorage or default to 'light'
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Set theme based on saved preference or system preference
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');

    // Apply theme immediately to prevent flash
    document.body.setAttribute('data-theme', theme);

    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, []);

  return null;
}
