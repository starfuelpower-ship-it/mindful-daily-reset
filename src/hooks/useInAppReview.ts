import { useEffect, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { toast } from 'sonner';

const REVIEW_STORAGE_KEY = 'cozy_habits_review_data';
const MIN_HABITS_COMPLETED = 7;
const MIN_ACTIVE_DAYS = 3;

// Google Play Store listing URL for fallback
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=app.lovable.53d04b63e0ee43f3822af5b2e6319d75';

interface ReviewData {
  habitsCompleted: number;
  activeDays: string[]; // ISO date strings of days with completions
  hasRequestedAutoReview: boolean; // For automatic one-time prompt
  lastRequestDate?: string;
}

const getReviewData = (): ReviewData => {
  try {
    const stored = localStorage.getItem(REVIEW_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {}
  return { habitsCompleted: 0, activeDays: [], hasRequestedAutoReview: false };
};

const saveReviewData = (data: ReviewData) => {
  localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(data));
};

const getTodayDateString = (): string => {
  return new Date().toISOString().split('T')[0];
};

export function useInAppReview() {
  // Track habit completion with day tracking
  const trackHabitCompletion = useCallback(() => {
    const data = getReviewData();
    data.habitsCompleted = (data.habitsCompleted || 0) + 1;
    
    // Track unique active days
    const today = getTodayDateString();
    if (!data.activeDays) {
      data.activeDays = [];
    }
    if (!data.activeDays.includes(today)) {
      data.activeDays.push(today);
    }
    
    saveReviewData(data);
  }, []);

  // Check if user is eligible for automatic review prompt
  const isEligibleForAutoReview = useCallback((): boolean => {
    const data = getReviewData();
    
    // Never show if already prompted once
    if (data.hasRequestedAutoReview) {
      return false;
    }

    // Check criteria: 7 habits OR 3 separate days
    const meetsHabitCriteria = (data.habitsCompleted || 0) >= MIN_HABITS_COMPLETED;
    const meetsDayCriteria = (data.activeDays?.length || 0) >= MIN_ACTIVE_DAYS;

    return meetsHabitCriteria || meetsDayCriteria;
  }, []);

  // Open Play Store as fallback
  const openPlayStore = useCallback(() => {
    try {
      window.open(PLAY_STORE_URL, '_blank');
    } catch (error) {
      console.error('Failed to open Play Store:', error);
    }
  }, []);

  // Request review with fallback to Play Store
  const requestReview = useCallback(async (isManualTrigger: boolean = false) => {
    // On web, just open Play Store
    if (!Capacitor.isNativePlatform()) {
      if (isManualTrigger) {
        openPlayStore();
        toast.success('Thanks for supporting Cozy Habits! 💚');
      }
      return;
    }

    try {
      // Dynamically import to avoid errors on web
      const { InAppReview } = await import('@capacitor-community/in-app-review');
      await InAppReview.requestReview();
      
      // Show thank you message for manual triggers
      if (isManualTrigger) {
        toast.success('Thanks for supporting Cozy Habits! 💚');
      }
    } catch (error) {
      console.error('In-app review not available, falling back to Play Store:', error);
      // Fallback to Play Store if in-app review fails
      if (isManualTrigger) {
        openPlayStore();
        toast.success('Thanks for supporting Cozy Habits! 💚');
      }
    }
  }, [openPlayStore]);

  // Manual rate button handler (always available)
  const handleRateApp = useCallback(async () => {
    await requestReview(true);
  }, [requestReview]);

  // Automatic one-time review prompt (only triggers once per user)
  const tryAutoRequestReview = useCallback(async () => {
    if (!isEligibleForAutoReview()) {
      return;
    }

    // Mark as requested BEFORE attempting (to ensure one-time only)
    const data = getReviewData();
    data.hasRequestedAutoReview = true;
    data.lastRequestDate = new Date().toISOString();
    saveReviewData(data);

    // Only attempt on native platform
    if (Capacitor.isNativePlatform()) {
      try {
        const { InAppReview } = await import('@capacitor-community/in-app-review');
        await InAppReview.requestReview();
      } catch (error) {
        // Silently fail for automatic prompts - don't annoy user
        console.log('Auto review prompt not shown:', error);
      }
    }
  }, [isEligibleForAutoReview]);

  return {
    trackHabitCompletion,
    tryAutoRequestReview,
    handleRateApp,
    isEligibleForAutoReview,
  };
}
