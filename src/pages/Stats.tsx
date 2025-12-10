import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePremium } from '@/contexts/PremiumContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Flame, TrendingUp, Calendar, Loader2 } from 'lucide-react';

interface WeeklyStats {
  day: string;
  completed: number;
  total: number;
}

export default function Stats() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium, isLoading: premiumLoading } = usePremium();
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStats[]>([]);
  const [totalCompletions, setTotalCompletions] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!premiumLoading && !isPremium) {
      navigate('/premium');
    }
  }, [isPremium, premiumLoading, navigate]);

  useEffect(() => {
    if (user && isPremium) {
      fetchStats();
    }
  }, [user, isPremium]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      // Get last 7 days
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toISOString().split('T')[0]);
      }

      // Fetch completions for last 7 days
      const { data: completions } = await supabase
        .from('habit_completions')
        .select('completed_at')
        .eq('user_id', user.id)
        .gte('completed_at', days[0])
        .lte('completed_at', days[6]);

      // Fetch total habits
      const { data: habits } = await supabase
        .from('habits')
        .select('id, streak')
        .eq('user_id', user.id);

      const totalHabits = habits?.length || 0;

      // Calculate weekly stats
      const stats: WeeklyStats[] = days.map(day => {
        const dayCompletions = completions?.filter(c => c.completed_at === day).length || 0;
        const dayName = new Date(day).toLocaleDateString('en-US', { weekday: 'short' });
        return {
          day: dayName,
          completed: dayCompletions,
          total: totalHabits,
        };
      });

      setWeeklyStats(stats);
      setTotalCompletions(completions?.length || 0);
      
      // Find longest streak
      const maxStreak = habits?.reduce((max, h) => Math.max(max, h.streak), 0) || 0;
      setLongestStreak(maxStreak);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const weeklyCompletionRate = weeklyStats.length > 0
    ? Math.round(
        (weeklyStats.reduce((sum, s) => sum + s.completed, 0) /
          Math.max(weeklyStats.reduce((sum, s) => sum + s.total, 0), 1)) * 100
      )
    : 0;

  if (premiumLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Weekly Stats</h1>
        </div>

        <div className="space-y-6 animate-fade-in">
          {/* Overview Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card rounded-2xl p-4 border border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">Completion Rate</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{weeklyCompletionRate}%</p>
            </div>
            <div className="bg-card rounded-2xl p-4 border border-border/50">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Flame className="w-4 h-4" />
                <span className="text-sm">Best Streak</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{longestStreak}</p>
            </div>
          </div>

          {/* Weekly Chart */}
          <div className="bg-card rounded-2xl p-4 border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">This Week</span>
            </div>
            
            <div className="flex items-end justify-between gap-2 h-32">
              {weeklyStats.map((stat, index) => {
                const height = stat.total > 0 
                  ? Math.max((stat.completed / stat.total) * 100, 8) 
                  : 8;
                const isToday = index === weeklyStats.length - 1;
                
                return (
                  <div key={stat.day} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full rounded-lg transition-all duration-500"
                      style={{ 
                        height: `${height}%`,
                        backgroundColor: isToday 
                          ? 'hsl(var(--primary))' 
                          : 'hsl(var(--primary) / 0.3)',
                      }}
                    />
                    <span className={`text-xs ${isToday ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      {stat.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total Completions */}
          <div className="bg-card rounded-2xl p-4 border border-border/50 text-center">
            <p className="text-sm text-muted-foreground mb-1">Total Completions This Week</p>
            <p className="text-4xl font-bold text-primary">{totalCompletions}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
