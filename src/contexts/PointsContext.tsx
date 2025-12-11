import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Point values
export const POINTS = {
  HABIT_COMPLETE: 10,
  ALL_HABITS_COMPLETE: 25,
  STREAK_BONUS_3: 15,
  STREAK_BONUS_7: 30,
  STREAK_BONUS_14: 50,
  STREAK_BONUS_30: 100,
  DAILY_CHECK_IN: 5,
  WEEKLY_BONUS: 50,
};

interface PointsContextType {
  balance: number;
  totalEarned: number;
  isLoading: boolean;
  earnPoints: (amount: number, type: string, description: string) => Promise<void>;
  spendPoints: (amount: number, description: string) => Promise<boolean>;
  checkDailyBonus: () => Promise<void>;
  checkWeeklyBonus: () => Promise<void>;
  recentEarning: { amount: number; type: string } | null;
  clearRecentEarning: () => void;
}

const PointsContext = createContext<PointsContextType | undefined>(undefined);

export function PointsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [recentEarning, setRecentEarning] = useState<{ amount: number; type: string } | null>(null);
  const initialized = useRef(false);

  // Fetch user points
  const fetchPoints = useCallback(async () => {
    if (!user) {
      setBalance(0);
      setTotalEarned(0);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_points')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setBalance(data.balance);
        setTotalEarned(data.total_earned);
      } else {
        // Create initial points record
        const { data: newData, error: insertError } = await supabase
          .from('user_points')
          .insert({ user_id: user.id, balance: 0, total_earned: 0 })
          .select()
          .single();

        if (insertError) throw insertError;
        if (newData) {
          setBalance(newData.balance);
          setTotalEarned(newData.total_earned);
        }
      }
    } catch (error) {
      console.error('Error fetching points:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && !initialized.current) {
      fetchPoints();
      initialized.current = true;
    } else if (!user) {
      initialized.current = false;
      setIsLoading(false);
    }
  }, [user, fetchPoints]);

  const earnPoints = useCallback(async (amount: number, type: string, description: string) => {
    if (!user) return;

    try {
      // Update balance
      const { error: updateError } = await supabase
        .from('user_points')
        .update({
          balance: balance + amount,
          total_earned: totalEarned + amount,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Log transaction
      await supabase.from('point_transactions').insert({
        user_id: user.id,
        amount,
        type,
        description,
      });

      setBalance((prev) => prev + amount);
      setTotalEarned((prev) => prev + amount);
      setRecentEarning({ amount, type });

      // Clear the recent earning after animation
      setTimeout(() => setRecentEarning(null), 3000);
    } catch (error) {
      console.error('Error earning points:', error);
    }
  }, [user, balance, totalEarned]);

  const spendPoints = useCallback(async (amount: number, description: string): Promise<boolean> => {
    if (!user || balance < amount) return false;

    try {
      const { error: updateError } = await supabase
        .from('user_points')
        .update({
          balance: balance - amount,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Log transaction
      await supabase.from('point_transactions').insert({
        user_id: user.id,
        amount: -amount,
        type: 'purchase',
        description,
      });

      setBalance((prev) => prev - amount);
      return true;
    } catch (error) {
      console.error('Error spending points:', error);
      toast.error('Failed to complete purchase');
      return false;
    }
  }, [user, balance]);

  const checkDailyBonus = useCallback(async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data } = await supabase
        .from('user_points')
        .select('last_daily_bonus')
        .eq('user_id', user.id)
        .single();

      if (data?.last_daily_bonus !== today) {
        await supabase
          .from('user_points')
          .update({ last_daily_bonus: today })
          .eq('user_id', user.id);

        await earnPoints(POINTS.DAILY_CHECK_IN, 'daily_bonus', 'Daily check-in bonus');
        toast.success(`+${POINTS.DAILY_CHECK_IN} points for checking in today!`, {
          icon: '✨',
        });
      }
    } catch (error) {
      console.error('Error checking daily bonus:', error);
    }
  }, [user, earnPoints]);

  const checkWeeklyBonus = useCallback(async () => {
    if (!user) return;

    try {
      const today = new Date();
      const dayOfWeek = today.getDay();
      
      // Only give weekly bonus on Sunday (0) or Monday (1)
      if (dayOfWeek !== 0 && dayOfWeek !== 1) return;

      const thisWeekStart = new Date(today);
      thisWeekStart.setDate(today.getDate() - dayOfWeek);
      const weekStartStr = thisWeekStart.toISOString().split('T')[0];

      const { data } = await supabase
        .from('user_points')
        .select('last_weekly_bonus')
        .eq('user_id', user.id)
        .single();

      if (!data?.last_weekly_bonus || data.last_weekly_bonus < weekStartStr) {
        await supabase
          .from('user_points')
          .update({ last_weekly_bonus: weekStartStr })
          .eq('user_id', user.id);

        await earnPoints(POINTS.WEEKLY_BONUS, 'weekly_bonus', 'Weekly dedication bonus');
        toast.success(`+${POINTS.WEEKLY_BONUS} points weekly bonus!`, {
          icon: '🎉',
        });
      }
    } catch (error) {
      console.error('Error checking weekly bonus:', error);
    }
  }, [user, earnPoints]);

  const clearRecentEarning = useCallback(() => {
    setRecentEarning(null);
  }, []);

  return (
    <PointsContext.Provider
      value={{
        balance,
        totalEarned,
        isLoading,
        earnPoints,
        spendPoints,
        checkDailyBonus,
        checkWeeklyBonus,
        recentEarning,
        clearRecentEarning,
      }}
    >
      {children}
    </PointsContext.Provider>
  );
}

export function usePoints() {
  const context = useContext(PointsContext);
  if (context === undefined) {
    throw new Error('usePoints must be used within a PointsProvider');
  }
  return context;
}
