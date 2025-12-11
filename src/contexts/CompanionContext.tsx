import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useUserSettings } from '@/hooks/useUserSettings';
import { useAuth } from '@/contexts/AuthContext';

export type CompanionType = 'cat' | 'none';

interface CompanionContextType {
  showCompanion: boolean;
  setShowCompanion: (show: boolean) => void;
  companionType: CompanionType;
  setCompanionType: (type: CompanionType) => void;
  triggerReaction: (type: 'habit_complete' | 'all_complete') => void;
  currentReaction: 'habit_complete' | 'all_complete' | null;
  isLoading: boolean;
}

const CompanionContext = createContext<CompanionContextType | undefined>(undefined);

const COMPANION_SHOW_KEY = 'daily-reset-show-companion';
const COMPANION_TYPE_KEY = 'daily-reset-companion-type';

export function CompanionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { settings, updateSettings, loading } = useUserSettings();
  
  const [localShowCompanion, setLocalShowCompanion] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(COMPANION_SHOW_KEY);
      return stored === null ? true : stored === 'true';
    }
    return true;
  });
  
  const [localCompanionType, setLocalCompanionType] = useState<CompanionType>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(COMPANION_TYPE_KEY);
      return (stored as CompanionType) || 'cat';
    }
    return 'cat';
  });

  const [currentReaction, setCurrentReaction] = useState<'habit_complete' | 'all_complete' | null>(null);
  const initialized = useRef(false);

  // Sync with database settings
  useEffect(() => {
    if (user && settings && !initialized.current) {
      const show = (settings as any).show_companion ?? true;
      const type = (settings as any).companion_type as CompanionType || 'cat';
      setLocalShowCompanion(show);
      setLocalCompanionType(type);
      initialized.current = true;
    }
  }, [user, settings]);

  // Persist to localStorage for guests
  useEffect(() => {
    if (!user) {
      localStorage.setItem(COMPANION_SHOW_KEY, String(localShowCompanion));
    }
  }, [localShowCompanion, user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem(COMPANION_TYPE_KEY, localCompanionType);
    }
  }, [localCompanionType, user]);

  const setShowCompanion = useCallback(async (show: boolean) => {
    setLocalShowCompanion(show);
    if (user) {
      await updateSettings({ show_companion: show } as any);
    }
  }, [updateSettings, user]);

  const setCompanionType = useCallback(async (type: CompanionType) => {
    setLocalCompanionType(type);
    if (user) {
      await updateSettings({ companion_type: type } as any);
    }
  }, [updateSettings, user]);

  const triggerReaction = useCallback((type: 'habit_complete' | 'all_complete') => {
    setCurrentReaction(type);
    // Clear reaction after animation completes
    setTimeout(() => setCurrentReaction(null), 2000);
  }, []);

  return (
    <CompanionContext.Provider
      value={{
        showCompanion: localShowCompanion,
        setShowCompanion,
        companionType: localCompanionType,
        setCompanionType,
        triggerReaction,
        currentReaction,
        isLoading: loading,
      }}
    >
      {children}
    </CompanionContext.Provider>
  );
}

export function useCompanion() {
  const context = useContext(CompanionContext);
  if (!context) {
    throw new Error('useCompanion must be used within a CompanionProvider');
  }
  return context;
}
