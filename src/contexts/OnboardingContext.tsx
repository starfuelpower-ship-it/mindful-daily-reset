/**
 * Onboarding Context
 * 
 * Manages the state for the new high-conversion onboarding flow.
 * Tracks: onboarding completion, habit completions, paywall triggers, app open days.
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Storage keys
const STORAGE_KEYS = {
  ONBOARDING_V2_COMPLETE: 'cozy-onboarding-v2-complete',
  FIRST_PAYWALL_SHOWN: 'cozy-first-paywall-shown',
  FIRST_HABIT_COMPLETED: 'cozy-first-habit-completed',
  TOTAL_HABITS_COMPLETED: 'cozy-total-habits-completed',
  FIRST_APP_OPEN_DATE: 'cozy-first-app-open-date',
  PAYWALL_3_HABITS_SHOWN: 'cozy-paywall-3-habits-shown',
  PAYWALL_DAY2_SHOWN: 'cozy-paywall-day2-shown',
} as const;

interface OnboardingState {
  // Onboarding flow
  isOnboardingComplete: boolean;
  hasCreatedFirstHabit: boolean;
  hasCompletedFirstHabit: boolean;
  
  // Paywall tracking
  firstPaywallShown: boolean;
  totalHabitsCompleted: number;
  
  // Day tracking
  firstAppOpenDate: string | null;
  currentDayNumber: number; // Day 1, Day 2, etc.
  
  // Paywall triggers
  shouldShowPaywall: boolean;
  paywallType: 'first' | 'followup' | 'limit' | null;
}

interface OnboardingContextType extends OnboardingState {
  // Actions
  completeOnboarding: () => void;
  markFirstHabitCreated: () => void;
  markHabitCompleted: () => void;
  markFirstPaywallShown: () => void;
  triggerPaywall: (type: 'first' | 'followup' | 'limit') => void;
  dismissPaywall: () => void;
  resetOnboarding: () => void; // For testing
  checkPaywallTriggers: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  // State
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [hasCreatedFirstHabit, setHasCreatedFirstHabit] = useState(false);
  const [hasCompletedFirstHabit, setHasCompletedFirstHabit] = useState(false);
  const [firstPaywallShown, setFirstPaywallShown] = useState(false);
  const [totalHabitsCompleted, setTotalHabitsCompleted] = useState(0);
  const [firstAppOpenDate, setFirstAppOpenDate] = useState<string | null>(null);
  const [currentDayNumber, setCurrentDayNumber] = useState(1);
  const [shouldShowPaywall, setShouldShowPaywall] = useState(false);
  const [paywallType, setPaywallType] = useState<'first' | 'followup' | 'limit' | null>(null);
  const [paywall3HabitsShown, setPaywall3HabitsShown] = useState(false);
  const [paywallDay2Shown, setPaywallDay2Shown] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const loadState = () => {
      const onboardingComplete = localStorage.getItem(STORAGE_KEYS.ONBOARDING_V2_COMPLETE) === 'true';
      const firstPaywall = localStorage.getItem(STORAGE_KEYS.FIRST_PAYWALL_SHOWN) === 'true';
      const firstHabitDone = localStorage.getItem(STORAGE_KEYS.FIRST_HABIT_COMPLETED) === 'true';
      const totalCompleted = parseInt(localStorage.getItem(STORAGE_KEYS.TOTAL_HABITS_COMPLETED) || '0', 10);
      const firstOpen = localStorage.getItem(STORAGE_KEYS.FIRST_APP_OPEN_DATE);
      const paywall3 = localStorage.getItem(STORAGE_KEYS.PAYWALL_3_HABITS_SHOWN) === 'true';
      const paywallD2 = localStorage.getItem(STORAGE_KEYS.PAYWALL_DAY2_SHOWN) === 'true';
      
      setIsOnboardingComplete(onboardingComplete);
      setFirstPaywallShown(firstPaywall);
      setHasCompletedFirstHabit(firstHabitDone);
      setTotalHabitsCompleted(totalCompleted);
      setPaywall3HabitsShown(paywall3);
      setPaywallDay2Shown(paywallD2);
      
      // Set first app open date if not set
      const today = new Date().toISOString().split('T')[0];
      if (!firstOpen) {
        localStorage.setItem(STORAGE_KEYS.FIRST_APP_OPEN_DATE, today);
        setFirstAppOpenDate(today);
        setCurrentDayNumber(1);
      } else {
        setFirstAppOpenDate(firstOpen);
        // Calculate day number
        const firstDate = new Date(firstOpen);
        const todayDate = new Date(today);
        const diffTime = todayDate.getTime() - firstDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setCurrentDayNumber(diffDays);
      }
      
      setIsInitialized(true);
    };
    
    loadState();
  }, []);

  // Sync with user data when logged in
  useEffect(() => {
    if (user && isInitialized) {
      // Check if user has any habits (means they've created first habit)
      const checkUserHabits = async () => {
        const { data: habits } = await supabase
          .from('habits')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);
        
        if (habits && habits.length > 0) {
          setHasCreatedFirstHabit(true);
        }
        
        // Check total completions
        const { count } = await supabase
          .from('habit_completions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        
        if (count && count > 0) {
          setHasCompletedFirstHabit(true);
          setTotalHabitsCompleted(prev => Math.max(prev, count));
          localStorage.setItem(STORAGE_KEYS.TOTAL_HABITS_COMPLETED, String(Math.max(totalHabitsCompleted, count)));
          if (!localStorage.getItem(STORAGE_KEYS.FIRST_HABIT_COMPLETED)) {
            localStorage.setItem(STORAGE_KEYS.FIRST_HABIT_COMPLETED, 'true');
          }
        }
      };
      
      checkUserHabits();
    }
  }, [user, isInitialized]);

  // Complete onboarding
  const completeOnboarding = useCallback(() => {
    setIsOnboardingComplete(true);
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_V2_COMPLETE, 'true');
  }, []);

  // Mark first habit created
  const markFirstHabitCreated = useCallback(() => {
    setHasCreatedFirstHabit(true);
  }, []);

  // Mark habit completed
  const markHabitCompleted = useCallback(() => {
    const newTotal = totalHabitsCompleted + 1;
    setTotalHabitsCompleted(newTotal);
    localStorage.setItem(STORAGE_KEYS.TOTAL_HABITS_COMPLETED, String(newTotal));
    
    if (!hasCompletedFirstHabit) {
      setHasCompletedFirstHabit(true);
      localStorage.setItem(STORAGE_KEYS.FIRST_HABIT_COMPLETED, 'true');
    }
  }, [totalHabitsCompleted, hasCompletedFirstHabit]);

  // Mark first paywall shown
  const markFirstPaywallShown = useCallback(() => {
    setFirstPaywallShown(true);
    localStorage.setItem(STORAGE_KEYS.FIRST_PAYWALL_SHOWN, 'true');
  }, []);

  // Trigger paywall display
  const triggerPaywall = useCallback((type: 'first' | 'followup' | 'limit') => {
    setPaywallType(type);
    setShouldShowPaywall(true);
    
    // Track which follow-up paywalls have been shown
    if (type === 'followup') {
      if (totalHabitsCompleted >= 3 && !paywall3HabitsShown) {
        setPaywall3HabitsShown(true);
        localStorage.setItem(STORAGE_KEYS.PAYWALL_3_HABITS_SHOWN, 'true');
      }
      if (currentDayNumber >= 2 && !paywallDay2Shown) {
        setPaywallDay2Shown(true);
        localStorage.setItem(STORAGE_KEYS.PAYWALL_DAY2_SHOWN, 'true');
      }
    }
  }, [totalHabitsCompleted, paywall3HabitsShown, currentDayNumber, paywallDay2Shown]);

  // Dismiss paywall
  const dismissPaywall = useCallback(() => {
    setShouldShowPaywall(false);
    setPaywallType(null);
  }, []);

  // Check paywall triggers
  const checkPaywallTriggers = useCallback(() => {
    // Don't trigger if onboarding not complete
    if (!isOnboardingComplete) return;
    
    // First paywall: after first habit completion (if not already shown)
    if (hasCompletedFirstHabit && !firstPaywallShown) {
      triggerPaywall('first');
      return;
    }
    
    // Follow-up: 3 habits completed
    if (totalHabitsCompleted >= 3 && firstPaywallShown && !paywall3HabitsShown) {
      triggerPaywall('followup');
      return;
    }
    
    // Follow-up: Day 2 app open
    if (currentDayNumber >= 2 && firstPaywallShown && !paywallDay2Shown) {
      triggerPaywall('followup');
      return;
    }
  }, [
    isOnboardingComplete,
    hasCompletedFirstHabit,
    firstPaywallShown,
    totalHabitsCompleted,
    paywall3HabitsShown,
    currentDayNumber,
    paywallDay2Shown,
    triggerPaywall
  ]);

  // Reset for testing
  const resetOnboarding = useCallback(() => {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    setIsOnboardingComplete(false);
    setHasCreatedFirstHabit(false);
    setHasCompletedFirstHabit(false);
    setFirstPaywallShown(false);
    setTotalHabitsCompleted(0);
    setPaywall3HabitsShown(false);
    setPaywallDay2Shown(false);
    setShouldShowPaywall(false);
    setPaywallType(null);
  }, []);

  const value: OnboardingContextType = {
    isOnboardingComplete,
    hasCreatedFirstHabit,
    hasCompletedFirstHabit,
    firstPaywallShown,
    totalHabitsCompleted,
    firstAppOpenDate,
    currentDayNumber,
    shouldShowPaywall,
    paywallType,
    completeOnboarding,
    markFirstHabitCreated,
    markHabitCompleted,
    markFirstPaywallShown,
    triggerPaywall,
    dismissPaywall,
    resetOnboarding,
    checkPaywallTriggers,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
