import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useStreakFreeze() {
  const { user } = useAuth();
  const [freezesAvailable, setFreezesAvailable] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current freeze count and check for weekly refill
  const fetchFreezes = useCallback(async () => {
    if (!user) {
      setFreezesAvailable(0);
      setIsLoading(false);
      return;
    }

    try {
      // Check for weekly refill first
      await supabase.rpc('check_streak_freeze_refill');

      // Get current freeze count
      const { data, error } = await supabase
        .from('user_points')
        .select('streak_freezes_available')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      setFreezesAvailable(data?.streak_freezes_available ?? 1);
    } catch (error) {
      console.error('Error fetching streak freezes:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFreezes();
  }, [fetchFreezes]);

  const useFreeze = useCallback(async () => {
    if (!user) return false;
    if (freezesAvailable < 1) {
      toast.error('No streak freezes available');
      return false;
    }

    try {
      const { data, error } = await supabase.rpc('use_streak_freeze');
      
      if (error) throw error;
      
      const result = data as { success: boolean; freezes_remaining?: number; error?: string } | null;
      
      if (result?.success) {
        setFreezesAvailable(result.freezes_remaining ?? 0);
        toast.success('🧊 Streak freeze used! Your streaks are protected for today.');
        return true;
      } else {
        toast.error(result?.error || 'Failed to use streak freeze');
        return false;
      }
    } catch (error) {
      console.error('Error using streak freeze:', error);
      toast.error('Failed to use streak freeze');
      return false;
    }
  }, [user, freezesAvailable]);

  return {
    freezesAvailable,
    isLoading,
    useFreeze,
    refetch: fetchFreezes,
  };
}
