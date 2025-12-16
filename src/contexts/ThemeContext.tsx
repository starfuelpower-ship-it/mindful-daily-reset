import { createContext, useContext, useEffect, useState, useCallback } from 'react';

type BaseTheme = 'light' | 'dark' | 'system';
type ColorThemeId = 'default' | 'pastel' | 'forest' | 'sunset' | 'moonlight' | 'midnight' | 'moss' | 'stone' | 'lavender' | 'rose';

interface ThemeInfo {
  id: ColorThemeId;
  name: string;
  description: string;
  isFree: boolean;
}

interface ThemeContextType {
  theme: BaseTheme;
  setTheme: (theme: BaseTheme) => void;
  resolvedTheme: 'light' | 'dark';
  colorTheme: ColorThemeId;
  setColorTheme: (theme: ColorThemeId) => void;
  previewTheme: ColorThemeId | null;
  setPreviewTheme: (theme: ColorThemeId | null) => void;
  resetPreview: () => void;
}

// Free themes available to all users
export const FREE_THEMES: ThemeInfo[] = [
  { id: 'default', name: 'Cozy Default', description: 'Warm golden tones', isFree: true },
  { id: 'pastel', name: 'Light Pastel', description: 'Soft pinks and creams', isFree: true },
  { id: 'forest', name: 'Forest Green', description: 'Calm natural tones', isFree: true },
];

// Premium themes requiring subscription
export const PREMIUM_THEMES: ThemeInfo[] = [
  { id: 'sunset', name: 'Sunset Orange', description: 'Warm evening glow', isFree: false },
  { id: 'moonlight', name: 'Moonlight Blue', description: 'Calm nighttime energy', isFree: false },
  { id: 'midnight', name: 'Midnight Ink', description: 'Quiet and distraction-free', isFree: false },
  { id: 'moss', name: 'Moss Green', description: 'Deep earthy grounding', isFree: false },
  { id: 'stone', name: 'Rainy Stone', description: 'Cool gray serenity', isFree: false },
  { id: 'lavender', name: 'Lavender Mist', description: 'Gentle emotional comfort', isFree: false },
  { id: 'rose', name: 'Rose Dusk', description: 'Cozy intimate warmth', isFree: false },
];

export const ALL_THEMES: ThemeInfo[] = [...FREE_THEMES, ...PREMIUM_THEMES];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<BaseTheme>(() => {
    const stored = localStorage.getItem('daily-reset-theme');
    return (stored as BaseTheme) || 'system';
  });

  const [colorTheme, setColorThemeState] = useState<ColorThemeId>(() => {
    const stored = localStorage.getItem('daily-reset-color-theme');
    return (stored as ColorThemeId) || 'default';
  });

  const [previewTheme, setPreviewTheme] = useState<ColorThemeId | null>(null);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  const resetPreview = useCallback(() => setPreviewTheme(null), []);

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
    const themeClasses = ['theme-pastel', 'theme-neon', 'theme-forest', 'theme-sunset', 
      'theme-moonlight', 'theme-midnight', 'theme-moss', 'theme-stone', 'theme-lavender', 'theme-rose'];
    root.classList.remove(...themeClasses);
    
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

  const setColorTheme = (newTheme: ColorThemeId) => {
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
      setPreviewTheme,
      resetPreview
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
