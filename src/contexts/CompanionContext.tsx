import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { CostumeType } from '@/components/CatCostume';

export type CompanionType = 'cat' | 'none';

interface CompanionContextType {
  showCompanion: boolean;
  setShowCompanion: (show: boolean) => void;
  companionType: CompanionType;
  setCompanionType: (type: CompanionType) => void;
  equippedCostume: CostumeType;
  setEquippedCostume: (costume: CostumeType) => Promise<void>;
  triggerReaction: (type: 'habit_complete' | 'all_complete') => void;
  currentReaction: 'habit_complete' | 'all_complete' | null;
  isLoading: boolean;
}

const CompanionContext = createContext<CompanionContextType | undefined>(undefined);

const COMPANION_SHOW_KEY = 'daily-reset-show-companion';
const COMPANION_TYPE_KEY = 'daily-reset-companion-type';
const EQUIPPED_COSTUME_KEY = 'daily-reset-equipped-costume';

export function CompanionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  
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

  const [equippedCostume, setEquippedCostumeState] = useState<CostumeType>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(EQUIPPED_COSTUME_KEY);
      return (stored as CostumeType) || 'none';
    }
    return 'none';
  });

  const [currentReaction, setCurrentReaction] = useState<'habit_complete' | 'all_complete' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initialized = useRef(false);

  // Load user's equipped costume from database
  useEffect(() => {
    const loadEquippedCostume = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // First check user_settings for show_companion
        const { data: settingsData } = await supabase
          .from('user_settings')
          .select('show_companion, companion_type')
          .eq('user_id', user.id)
          .single();

        if (settingsData) {
          setLocalShowCompanion(settingsData.show_companion ?? true);
          setLocalCompanionType((settingsData.companion_type as CompanionType) || 'cat');
        }

        // Then check user_equipped_costume
        const { data: costumeData } = await supabase
          .from('user_equipped_costume')
          .select('costume_id')
          .eq('user_id', user.id)
          .single();

        if (costumeData?.costume_id) {
          // Get the costume details to find the costume type
          const { data: costumeDetails } = await supabase
            .from('cat_costumes')
            .select('name')
            .eq('id', costumeData.costume_id)
            .single();

          if (costumeDetails) {
            // Map costume name to costume type
            const costumeMap: Record<string, CostumeType> = {
              'Cozy Scarf': 'scarf',
              'Wizard Hat': 'wizard_hat',
              'Raincoat & Boots': 'raincoat',
              'Sleepy Nightcap': 'sleep_cap',
              'Headphones': 'headphones',
              'Flower Crown': 'flower_crown',
              'Bow Tie': 'bow_tie',
              'Santa Hat': 'santa_hat',
              'Royal Crown': 'crown',
              'Winter Beanie': 'winter_beanie',
              'Summer Sunhat': 'sunhat',
              'Cozy Sweater': 'sweater',
              'Hero Cape': 'cape',
              'Party Hat': 'party_hat',
            };
            const costumeType = costumeMap[costumeDetails.name] || 'none';
            setEquippedCostumeState(costumeType);
            localStorage.setItem(EQUIPPED_COSTUME_KEY, costumeType);
          }
        }
        
        initialized.current = true;
      } catch (error) {
        console.error('Error loading companion data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEquippedCostume();
  }, [user]);

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

  useEffect(() => {
    localStorage.setItem(EQUIPPED_COSTUME_KEY, equippedCostume);
  }, [equippedCostume]);

  const setShowCompanion = useCallback(async (show: boolean) => {
    setLocalShowCompanion(show);
    if (user) {
      try {
        await supabase
          .from('user_settings')
          .update({ show_companion: show })
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error updating show_companion:', error);
      }
    }
  }, [user]);

  const setCompanionType = useCallback(async (type: CompanionType) => {
    setLocalCompanionType(type);
    if (user) {
      try {
        await supabase
          .from('user_settings')
          .update({ companion_type: type })
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Error updating companion_type:', error);
      }
    }
  }, [user]);

  const setEquippedCostume = useCallback(async (costume: CostumeType) => {
    setEquippedCostumeState(costume);
    localStorage.setItem(EQUIPPED_COSTUME_KEY, costume);

    if (user) {
      try {
        // Map costume type back to database costume name
        const costumeNameMap: Record<CostumeType, string | null> = {
          none: null,
          scarf: 'Cozy Scarf',
          wizard_hat: 'Wizard Hat',
          raincoat: 'Raincoat & Boots',
          sleep_cap: 'Sleepy Nightcap',
          headphones: 'Headphones',
          flower_crown: 'Flower Crown',
          bow_tie: 'Bow Tie',
          santa_hat: 'Santa Hat',
          crown: 'Royal Crown',
          winter_beanie: 'Winter Beanie',
          sunhat: 'Summer Sunhat',
          sweater: 'Cozy Sweater',
          cape: 'Hero Cape',
          party_hat: 'Party Hat',
        };

        const costumeName = costumeNameMap[costume];
        let costumeId: string | null = null;

        if (costumeName) {
          // Get the costume ID from the database
          const { data: costumeData } = await supabase
            .from('cat_costumes')
            .select('id')
            .eq('name', costumeName)
            .single();

          costumeId = costumeData?.id || null;
        }

        // Check if user already has an equipped costume record
        const { data: existing } = await supabase
          .from('user_equipped_costume')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (existing) {
          await supabase
            .from('user_equipped_costume')
            .update({ costume_id: costumeId, updated_at: new Date().toISOString() })
            .eq('user_id', user.id);
        } else {
          await supabase
            .from('user_equipped_costume')
            .insert({ user_id: user.id, costume_id: costumeId });
        }
      } catch (error) {
        console.error('Error updating equipped costume:', error);
      }
    }
  }, [user]);

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
        equippedCostume,
        setEquippedCostume,
        triggerReaction,
        currentReaction,
        isLoading,
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
