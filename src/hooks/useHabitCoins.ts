/**
 * Per-Habit Per-Day Coin Tracking
 * 
 * Prevents coin exploitation by tracking coin awards per habit per day.
 * Each habit can earn coins only ONCE per day:
 * - Complete habit: +coins (only if not already awarded today for this habit)
 * - Uncheck habit: -coins (reverses the award)
 * - Re-check habit: +coins (restores, but only up to once total)
 */

import { useCallback, useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface HabitCoinRecord {
  habitId: string;
  date: string;
  completed: boolean;
  coinsApplied: boolean;
  coinsAmount: number;
}

// Storage key prefix
const STORAGE_KEY = 'habit_coins_tracking';

/**
 * Get today's date string (YYYY-MM-DD)
 */
function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Hook for managing per-habit-per-day coin tracking
 */
export function useHabitCoins() {
  const { user } = useAuth();
  const [coinRecords, setCoinRecords] = useState<Record<string, HabitCoinRecord>>({});
  const initialized = useRef(false);

  // Load records from localStorage on mount
  useEffect(() => {
    if (!user) {
      setCoinRecords({});
      return;
    }

    const storageKey = `${STORAGE_KEY}_${user.id}`;
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const today = getTodayString();
        
        // Filter out old dates (keep only today's records)
        const todayRecords: Record<string, HabitCoinRecord> = {};
        for (const [key, record] of Object.entries(parsed)) {
          const r = record as HabitCoinRecord;
          if (r.date === today) {
            todayRecords[key] = r;
          }
        }
        
        setCoinRecords(todayRecords);
      } catch (e) {
        console.error('[HabitCoins] Failed to parse stored records:', e);
        setCoinRecords({});
      }
    }
    
    initialized.current = true;
  }, [user]);

  // Save records to localStorage whenever they change
  useEffect(() => {
    if (!user || !initialized.current) return;
    
    const storageKey = `${STORAGE_KEY}_${user.id}`;
    localStorage.setItem(storageKey, JSON.stringify(coinRecords));
  }, [coinRecords, user]);

  /**
   * Get the coin record for a specific habit today
   */
  const getHabitRecord = useCallback((habitId: string): HabitCoinRecord | null => {
    const today = getTodayString();
    const key = `${habitId}_${today}`;
    return coinRecords[key] || null;
  }, [coinRecords]);

  /**
   * Calculate coin delta for a habit toggle
   * Returns: { shouldAwardCoins, amount, isReversal }
   * 
   * Rules:
   * 1. First complete: +coins (coinsApplied = true)
   * 2. Uncheck: -coins (coinsApplied = false, but we remember the amount)
   * 3. Re-check: +coins (coinsApplied = true again, same amount)
   * 4. Further toggles: no net change beyond the original award
   */
  const calculateCoinDelta = useCallback((
    habitId: string, 
    isNowComplete: boolean,
    baseCoinsAmount: number
  ): { 
    shouldAwardCoins: boolean; 
    amount: number; 
    isReversal: boolean;
  } => {
    const today = getTodayString();
    const key = `${habitId}_${today}`;
    const record = coinRecords[key];

    if (isNowComplete) {
      // Checking the habit as complete
      if (!record) {
        // First time completing today - award coins
        return { shouldAwardCoins: true, amount: baseCoinsAmount, isReversal: false };
      } else if (!record.coinsApplied) {
        // Was unchecked, now re-checking - restore coins
        return { shouldAwardCoins: true, amount: record.coinsAmount, isReversal: false };
      } else {
        // Already has coins applied - no additional coins
        return { shouldAwardCoins: false, amount: 0, isReversal: false };
      }
    } else {
      // Unchecking the habit
      if (record && record.coinsApplied) {
        // Reverse the coins
        return { shouldAwardCoins: true, amount: -record.coinsAmount, isReversal: true };
      } else {
        // No coins were applied, nothing to reverse
        return { shouldAwardCoins: false, amount: 0, isReversal: false };
      }
    }
  }, [coinRecords]);

  /**
   * Record a coin transaction for a habit
   */
  const recordCoinTransaction = useCallback((
    habitId: string,
    isComplete: boolean,
    coinsAmount: number
  ): void => {
    const today = getTodayString();
    const key = `${habitId}_${today}`;

    setCoinRecords(prev => ({
      ...prev,
      [key]: {
        habitId,
        date: today,
        completed: isComplete,
        coinsApplied: isComplete,
        coinsAmount: Math.abs(coinsAmount), // Always store positive amount
      }
    }));
  }, []);

  /**
   * Check if habit has already earned coins today
   */
  const hasEarnedCoinsToday = useCallback((habitId: string): boolean => {
    const record = getHabitRecord(habitId);
    return record?.coinsApplied ?? false;
  }, [getHabitRecord]);

  /**
   * Clear all records (for testing/debugging)
   */
  const clearRecords = useCallback(() => {
    setCoinRecords({});
    if (user) {
      const storageKey = `${STORAGE_KEY}_${user.id}`;
      localStorage.removeItem(storageKey);
    }
  }, [user]);

  return {
    getHabitRecord,
    calculateCoinDelta,
    recordCoinTransaction,
    hasEarnedCoinsToday,
    clearRecords,
  };
}
