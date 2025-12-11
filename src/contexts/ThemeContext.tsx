import { createContext, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

type BaseTheme = 'light' | 'dark' | 'system';
type PremiumTheme = 'pastel' | 'neon' | 'forest' | 'sunset';
type ColorTheme = PremiumTheme | 'default';

interface ThemeContextType {
  theme: BaseTheme;
  setTheme: (theme: BaseTheme) => void;
  resolvedTheme: 'light' | 'dark';
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
  previewTheme: ColorTheme | null;
  setPreviewTheme: (theme: ColorTheme | null) => void;
}

export const PREMIUM_THEMES: { id: PremiumTheme; name: string; description: string }[] = [
  { id: 'pastel', name: 'Light Pastel', description: 'Soft pinks and creams' },
  { id: 'neon', name: 'Dark Neon', description: 'Vibrant cyberpunk vibes' },
  { id: 'forest', name: 'Forest Green', description: 'Calm natural tones' },
  { id: 'sunset', name: 'Sunset Orange', description: 'Warm evening glow' },
];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  
  const [theme, setTheme] = useState<BaseTheme>(() => {
    const stored = localStorage.getItem('daily-reset-theme');
    return (stored as BaseTheme) || 'system';
  });

  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => {
    const stored = localStorage.getItem('daily-reset-color-theme');
    return (stored as ColorTheme) || 'default';
  });

  const [previewTheme, setPreviewTheme] = useState<ColorTheme | null>(null);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Reset preview theme when navigating between pages
  useEffect(() => {
    setPreviewTheme(null);
  }, [location.pathname]);

  // Apply base light/dark theme
  useEffect(() => {
    const root = window.document.documentElement;

    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        root.classList.add('dark');
        setResolvedTheme('dark');
      } else {
        root.classList.remove('dark');
        setResolvedTheme('light');
      }
    };

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      applyTheme(mediaQuery.matches);

      const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      applyTheme(theme === 'dark');
    }
  }, [theme]);

  // Apply color theme (or preview)
  useEffect(() => {
    const root = window.document.documentElement;
    const activeTheme = previewTheme || colorTheme;
    
    // Remove all theme classes
    root.classList.remove('theme-pastel', 'theme-neon', 'theme-forest', 'theme-sunset');
    
    // Add the active theme class
    if (activeTheme !== 'default') {
      root.classList.add(`theme-${activeTheme}`);
    }
  }, [colorTheme, previewTheme]);


  // Persist theme choices
  useEffect(() => {
    localStorage.setItem('daily-reset-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('daily-reset-color-theme', colorTheme);
  }, [colorTheme]);

  const setColorTheme = (newTheme: ColorTheme) => {
    setColorThemeState(newTheme);
    setPreviewTheme(null); // Clear preview when setting actual theme
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      resolvedTheme, 
      colorTheme, 
      setColorTheme,
      previewTheme,
      setPreviewTheme
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
