import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  points_reward: number;
  is_hidden: boolean;
  sort_order: number;
}

interface UserAchievement {
  achievement_id: string;
  earned_at: string;
}

const CATEGORY_ORDER = ['progress', 'streak', 'reflection', 'ai', 'companion', 'plant', 'economy', 'secret'];

const CATEGORY_LABELS: Record<string, string> = {
  progress: 'Gentle Progress',
  streak: 'Consistency',
  reflection: 'Reflection',
  ai: 'AI Companion',
  companion: 'Cozy Friend',
  plant: 'Growth',
  economy: 'Rewards',
  secret: 'Discoveries',
};

export function useAchievements() {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [earnedAchievements, setEarnedAchievements] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchAchievements = useCallback(async () => {
    try {
      const { data: allAchievements, error: achError } = await supabase
        .from('achievements')
        .select('*')
        .order('category')
        .order('sort_order');

      if (achError) throw achError;
      setAchievements(allAchievements || []);

      if (user) {
        const { data: userAch, error: userError } = await supabase
          .from('user_achievements')
          .select('achievement_id, earned_at')
          .eq('user_id', user.id);

        if (userError) throw userError;
        setEarnedAchievements(new Set((userAch || []).map(a => a.achievement_id)));
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  const earnAchievement = useCallback(async (achievementKey: string) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const { data, error } = await supabase.rpc('earn_achievement', {
        _achievement_key: achievementKey
      });

      if (error) throw error;

      const result = data as { success: boolean; error?: string; achievement_name?: string; points_awarded?: number } | null;

      if (result?.success) {
        const achievement = achievements.find(a => a.key === achievementKey);
        if (achievement) {
          setEarnedAchievements(prev => new Set([...prev, achievement.id]));
          
          // Show gentle toast
          toast.success(`${achievement.icon} ${achievement.name}`, {
            description: achievement.description,
            duration: 4000,
          });
        }
        return { success: true, points: result.points_awarded };
      }

      return { success: false, error: result?.error || 'Unknown error' };
    } catch (error) {
      console.error('Error earning achievement:', error);
      return { success: false, error: 'Failed to earn achievement' };
    }
  }, [user, achievements]);

  const checkAndAwardAchievements = useCallback(async (context: {
    habitCompleted?: boolean;
    journalEntry?: boolean;
    moodLogged?: boolean;
    stressLogged?: boolean;
    aiUsed?: boolean;
    costumeEquipped?: boolean;
    costumeChanged?: boolean;
    rewardsVisited?: boolean;
    pointsEarned?: boolean;
    pointsSpent?: boolean;
    currentHour?: number;
    ambientMode?: string;
  }) => {
    if (!user) return;

    // Check time-based secret achievements
    const hour = context.currentHour ?? new Date().getHours();
    
    if (hour >= 0 && hour < 5 && context.habitCompleted) {
      await earnAchievement('midnight_calm');
    }
    
    if (hour >= 5 && hour < 9 && context.habitCompleted) {
      await earnAchievement('early_light');
    }

    // Rain ambience achievement
    if (context.ambientMode === 'rain' && context.habitCompleted) {
      await earnAchievement('rainy_day');
    }

    // First habit completion
    if (context.habitCompleted) {
      await earnAchievement('first_step');
    }

    // Journal achievements
    if (context.journalEntry) {
      await earnAchievement('quiet_moment');
    }

    // Mood achievements  
    if (context.moodLogged) {
      await earnAchievement('checking_in');
    }

    // Stress slider
    if (context.stressLogged) {
      await earnAchievement('deep_breath');
    }

    // AI achievements
    if (context.aiUsed) {
      await earnAchievement('first_insight');
    }

    // Companion achievements
    if (context.rewardsVisited) {
      await earnAchievement('new_friend');
    }

    if (context.costumeEquipped) {
      await earnAchievement('dressed_day');
    }

    // Economy achievements
    if (context.pointsEarned) {
      await earnAchievement('first_rewards');
    }

    if (context.pointsSpent) {
      await earnAchievement('treat_yourself');
    }

  }, [user, earnAchievement]);

  // Group achievements by category
  const achievementsByCategory = achievements.reduce((acc, ach) => {
    if (!acc[ach.category]) {
      acc[ach.category] = [];
    }
    acc[ach.category].push(ach);
    return acc;
  }, {} as Record<string, Achievement[]>);

  // Sort categories by predefined order
  const sortedCategories = CATEGORY_ORDER.filter(cat => achievementsByCategory[cat]);

  const totalAchievements = achievements.filter(a => !a.is_hidden).length;
  const earnedCount = achievements.filter(a => !a.is_hidden && earnedAchievements.has(a.id)).length;
  const totalPoints = achievements
    .filter(a => earnedAchievements.has(a.id))
    .reduce((sum, a) => sum + (a.points_reward || 0), 0);

  return {
    achievements,
    achievementsByCategory,
    sortedCategories,
    earnedAchievements,
    loading,
    earnAchievement,
    checkAndAwardAchievements,
    totalAchievements,
    earnedCount,
    totalPoints,
    CATEGORY_LABELS,
    refresh: fetchAchievements,
  };
}
