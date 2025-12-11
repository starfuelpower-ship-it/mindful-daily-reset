import { useState, useEffect } from 'react';
import { Trophy, Flame, Star, Target, Zap, Award, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  requirement: number;
  type: 'streak' | 'total' | 'perfect' | 'habits';
  color: string;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_habit',
    name: 'Getting Started',
    description: 'Complete your first habit',
    icon: <Star className="w-6 h-6" />,
    requirement: 1,
    type: 'total',
    color: 'hsl(45, 90%, 50%)',
  },
  {
    id: 'streak_3',
    name: 'On Fire',
    description: 'Reach a 3-day streak',
    icon: <Flame className="w-6 h-6" />,
    requirement: 3,
    type: 'streak',
    color: 'hsl(25, 80%, 55%)',
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Reach a 7-day streak',
    icon: <Flame className="w-6 h-6" />,
    requirement: 7,
    type: 'streak',
    color: 'hsl(15, 85%, 50%)',
  },
  {
    id: 'streak_14',
    name: 'Fortnight Fighter',
    description: 'Reach a 14-day streak',
    icon: <Zap className="w-6 h-6" />,
    requirement: 14,
    type: 'streak',
    color: 'hsl(280, 70%, 55%)',
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Reach a 30-day streak',
    icon: <Trophy className="w-6 h-6" />,
    requirement: 30,
    type: 'streak',
    color: 'hsl(45, 95%, 50%)',
  },
  {
    id: 'streak_100',
    name: 'Century Club',
    description: 'Reach a 100-day streak',
    icon: <Award className="w-6 h-6" />,
    requirement: 100,
    type: 'streak',
    color: 'hsl(0, 0%, 85%)',
  },
  {
    id: 'perfect_week',
    name: 'Perfect Week',
    description: 'Complete all habits for 7 days',
    icon: <Target className="w-6 h-6" />,
    requirement: 7,
    type: 'perfect',
    color: 'hsl(150, 60%, 45%)',
  },
  {
    id: 'habit_collector',
    name: 'Habit Collector',
    description: 'Create 5 different habits',
    icon: <Star className="w-6 h-6" />,
    requirement: 5,
    type: 'habits',
    color: 'hsl(200, 70%, 50%)',
  },
];

interface AchievementsUIProps {
  compact?: boolean;
}

export function AchievementsUI({ compact = false }: AchievementsUIProps) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    bestStreak: 0,
    totalCompletions: 0,
    perfectDays: 0,
    totalHabits: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      // Get habits and their streaks
      const { data: habits } = await supabase
        .from('habits')
        .select('id, streak')
        .eq('user_id', user.id)
        .eq('archived', false);

      // Get total completions
      const { count: completionCount } = await supabase
        .from('habit_completions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      const bestStreak = habits?.reduce((max, h) => Math.max(max, h.streak || 0), 0) || 0;

      setStats({
        bestStreak,
        totalCompletions: completionCount || 0,
        perfectDays: Math.floor((completionCount || 0) / (habits?.length || 1)),
        totalHabits: habits?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching achievement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgress = (achievement: Achievement): number => {
    switch (achievement.type) {
      case 'streak':
        return Math.min(100, (stats.bestStreak / achievement.requirement) * 100);
      case 'total':
        return Math.min(100, (stats.totalCompletions / achievement.requirement) * 100);
      case 'perfect':
        return Math.min(100, (stats.perfectDays / achievement.requirement) * 100);
      case 'habits':
        return Math.min(100, (stats.totalHabits / achievement.requirement) * 100);
      default:
        return 0;
    }
  };

  const isUnlocked = (achievement: Achievement): boolean => {
    return getProgress(achievement) >= 100;
  };

  const unlockedCount = ACHIEVEMENTS.filter(a => isUnlocked(a)).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Trophy className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">{unlockedCount}/{ACHIEVEMENTS.length}</span>
        <span className="text-xs text-muted-foreground">achievements</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Achievements</h3>
        </div>
        <span className="text-sm text-muted-foreground">
          {unlockedCount}/{ACHIEVEMENTS.length} unlocked
        </span>
      </div>

      {/* Achievement Grid */}
      <div className="grid grid-cols-2 gap-3">
        {ACHIEVEMENTS.map((achievement) => {
          const unlocked = isUnlocked(achievement);
          const progress = getProgress(achievement);

          return (
            <div
              key={achievement.id}
              className={cn(
                'relative p-4 rounded-2xl border transition-all',
                unlocked
                  ? 'bg-card border-primary/30'
                  : 'bg-muted/30 border-border/50'
              )}
            >
              {/* Icon */}
              <div
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center mb-3',
                  unlocked ? 'bg-primary/20' : 'bg-muted'
                )}
                style={{ color: unlocked ? achievement.color : 'hsl(var(--muted-foreground))' }}
              >
                {unlocked ? achievement.icon : <Lock className="w-5 h-5" />}
              </div>

              {/* Info */}
              <h4 className={cn(
                'font-medium text-sm mb-1',
                unlocked ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {achievement.name}
              </h4>
              <p className="text-xs text-muted-foreground mb-2">
                {achievement.description}
              </p>

              {/* Progress Bar */}
              {!unlocked && (
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/50 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}

              {/* Unlocked Badge */}
              {unlocked && (
                <div className="absolute top-2 right-2">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: achievement.color }}
                  >
                    <Star className="w-3 h-3 text-white" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-2 pt-2">
        <div className="text-center p-2 rounded-xl bg-muted/50">
          <p className="text-lg font-bold text-foreground">{stats.bestStreak}</p>
          <p className="text-xs text-muted-foreground">Best Streak</p>
        </div>
        <div className="text-center p-2 rounded-xl bg-muted/50">
          <p className="text-lg font-bold text-foreground">{stats.totalCompletions}</p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </div>
        <div className="text-center p-2 rounded-xl bg-muted/50">
          <p className="text-lg font-bold text-foreground">{stats.perfectDays}</p>
          <p className="text-xs text-muted-foreground">Perfect Days</p>
        </div>
        <div className="text-center p-2 rounded-xl bg-muted/50">
          <p className="text-lg font-bold text-foreground">{stats.totalHabits}</p>
          <p className="text-xs text-muted-foreground">Habits</p>
        </div>
      </div>
    </div>
  );
}
