import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

export type AmbientMode = 'off' | 'rain' | 'sun_rays' | 'snow';

interface AmbientContextType {
  ambientMode: AmbientMode;
  setAmbientMode: (mode: AmbientMode) => void;
  visualsEnabled: boolean;
  setVisualsEnabled: (enabled: boolean) => void;
  soundsEnabled: boolean;
  setSoundsEnabled: (enabled: boolean) => void;
  isLoading: boolean;
  turnOffAllAmbience: () => void;
}

const AmbientContext = createContext<AmbientContextType | undefined>(undefined);

// Local storage keys for guests
const AMBIENT_MODE_KEY = 'daily-reset-ambient-mode';
const AMBIENT_VISUALS_KEY = 'daily-reset-ambient-visuals';
const AMBIENT_SOUNDS_KEY = 'daily-reset-ambient-sounds';

export function AmbientProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { settings, updateSettings, loading } = useUserSettings();
  const { resolvedTheme } = useTheme();
  
  // Local state for immediate UI updates
  const [localMode, setLocalMode] = useState<AmbientMode>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(AMBIENT_MODE_KEY);
      return (stored as AmbientMode) || 'sun_rays';
    }
    return 'sun_rays';
  });
  
  const [localVisualsEnabled, setLocalVisualsEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(AMBIENT_VISUALS_KEY);
      return stored === null ? true : stored === 'true';
    }
    return true;
  });
  
  const [localSoundsEnabled, setLocalSoundsEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(AMBIENT_SOUNDS_KEY);
      return stored === 'true';
    }
    return false;
  });
  
  const initialized = useRef(false);

  // Sync local state with settings from database (for logged-in users)
  useEffect(() => {
    if (user && settings && !initialized.current) {
      const mode = (settings as any).ambient_mode as AmbientMode || 'sun_rays';
      const visuals = (settings as any).ambient_visuals_enabled ?? true;
      const sounds = (settings as any).ambient_sounds_enabled ?? false;
      
      // Apply dark mode default: visuals off in dark mode unless explicitly set
      const shouldEnableVisuals = resolvedTheme === 'dark' ? visuals : visuals;
      
      setLocalMode(mode);
      setLocalVisualsEnabled(shouldEnableVisuals);
      setLocalSoundsEnabled(sounds);
      initialized.current = true;
    }
  }, [user, settings, resolvedTheme]);

  // Persist to localStorage for guests
  useEffect(() => {
    if (!user) {
      localStorage.setItem(AMBIENT_MODE_KEY, localMode);
    }
  }, [localMode, user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem(AMBIENT_VISUALS_KEY, String(localVisualsEnabled));
    }
  }, [localVisualsEnabled, user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem(AMBIENT_SOUNDS_KEY, String(localSoundsEnabled));
    }
  }, [localSoundsEnabled, user]);

  const setAmbientMode = useCallback(async (mode: AmbientMode) => {
    setLocalMode(mode);
    if (user) {
      await updateSettings({ ambient_mode: mode } as any);
    }
  }, [updateSettings, user]);

  const setVisualsEnabled = useCallback(async (enabled: boolean) => {
    setLocalVisualsEnabled(enabled);
    if (user) {
      await updateSettings({ ambient_visuals_enabled: enabled } as any);
    }
  }, [updateSettings, user]);

  const setSoundsEnabled = useCallback(async (enabled: boolean) => {
    setLocalSoundsEnabled(enabled);
    if (user) {
      await updateSettings({ ambient_sounds_enabled: enabled } as any);
    }
  }, [updateSettings, user]);

  const turnOffAllAmbience = useCallback(async () => {
    setLocalMode('off');
    setLocalVisualsEnabled(false);
    setLocalSoundsEnabled(false);
    if (user) {
      await updateSettings({
        ambient_mode: 'off',
        ambient_visuals_enabled: false,
        ambient_sounds_enabled: false,
      } as any);
    }
  }, [updateSettings, user]);

  return (
    <AmbientContext.Provider
      value={{
        ambientMode: localMode,
        setAmbientMode,
        visualsEnabled: localVisualsEnabled,
        setVisualsEnabled,
        soundsEnabled: localSoundsEnabled,
        setSoundsEnabled,
        isLoading: loading,
        turnOffAllAmbience,
      }}
    >
      {children}
    </AmbientContext.Provider>
  );
}

export function useAmbient() {
  const context = useContext(AmbientContext);
  if (!context) {
    throw new Error('useAmbient must be used within an AmbientProvider');
  }
  return context;
}
