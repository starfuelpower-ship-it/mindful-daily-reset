import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useCloudHabits, CloudHabit } from '@/hooks/useCloudHabits';
import { useHabits } from '@/hooks/useHabits';
import { useUserSettings } from '@/hooks/useUserSettings';
import { CloudHabitCard } from '@/components/CloudHabitCard';
import { HabitCard } from '@/components/HabitCard';
import { ProgressRing } from '@/components/ProgressRing';
import { PlantGrowth } from '@/components/PlantGrowth';
import { DaySelector } from '@/components/DaySelector';
import { AddHabitDialog } from '@/components/AddHabitDialog';
import { EditHabitDialog } from '@/components/EditHabitDialog';
import { EmptyState } from '@/components/EmptyState';
import { BottomTabBar } from '@/components/BottomTabBar';
import { DailyReflectionModal } from '@/components/DailyReflectionModal';
import { MotivationalMessage } from '@/components/MotivationalMessage';
import { Button } from '@/components/ui/button';
import { RefreshCw, Settings, User, Cloud, Moon, Sun } from 'lucide-react';
import { format } from 'date-fns';

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { settings } = useUserSettings();
  const [editingHabit, setEditingHabit] = useState<CloudHabit | null>(null);
  const [hasMigrated, setHasMigrated] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showReflection, setShowReflection] = useState(false);
  const hasShownReflectionToday = useRef(false);

  // User preferences (with defaults for guests)
  const confettiEnabled = settings?.confetti_enabled ?? true;
  const soundEnabled = settings?.sound_enabled ?? true;

  // Cloud habits (for logged-in users)
  const cloudHabits = useCloudHabits();
  
  // Local habits (for guests)
  const localHabits = useHabits();

  // Use cloud or local based on auth status
  const isLoggedIn = !!user;
  const habits = isLoggedIn ? cloudHabits.habits : localHabits.habits;
  const isLoading = authLoading || (isLoggedIn ? cloudHabits.isLoading : localHabits.isLoading);
  const completedCount = isLoggedIn ? cloudHabits.completedCount : localHabits.completedCount;
  const totalCount = isLoggedIn ? cloudHabits.totalCount : localHabits.totalCount;
  const progressPercent = isLoggedIn ? cloudHabits.progressPercent : localHabits.progressPercent;

  // Calculate best streak for plant growth
  const bestStreak = useMemo(() => {
    const currentHabits = isLoggedIn ? cloudHabits.habits : localHabits.habits;
    if (currentHabits.length === 0) return 0;
    return Math.max(...currentHabits.map(h => (h as any).streak || 0), 0);
  }, [isLoggedIn, cloudHabits.habits, localHabits.habits]);

  // Migrate local habits to cloud after login
  useEffect(() => {
    if (user && !hasMigrated && !cloudHabits.isLoading) {
      const localStorageHabits = localStorage.getItem('daily-reset-habits');
      if (localStorageHabits) {
        const parsed = JSON.parse(localStorageHabits);
        if (parsed.length > 0 && cloudHabits.habits.length === 0) {
          cloudHabits.migrateLocalHabits(parsed);
          setHasMigrated(true);
        }
      }
    }
  }, [user, hasMigrated, cloudHabits.isLoading]);

  // Show daily reflection when all habits are completed (for logged-in users only)
  useEffect(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const reflectionKey = `reflection-shown-${today}`;
    const alreadyShown = localStorage.getItem(reflectionKey) === 'true';
    
    if (
      isLoggedIn && 
      totalCount > 0 && 
      completedCount === totalCount && 
      !hasShownReflectionToday.current &&
      !alreadyShown &&
      !isLoading
    ) {
      // Small delay to let celebration animation play first
      const timer = setTimeout(() => {
        setShowReflection(true);
        hasShownReflectionToday.current = true;
        localStorage.setItem(reflectionKey, 'true');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [completedCount, totalCount, isLoggedIn, isLoading]);

  const handleAddHabit = (name: string, category: string, notes: string, icon?: string, color?: string) => {
    if (isLoggedIn) {
      cloudHabits.addHabit(name, category, notes, icon, color);
    } else {
      localHabits.addHabit(name, category as any, notes);
    }
  };

  const handleToggleHabit = (id: string) => {
    if (isLoggedIn) {
      cloudHabits.toggleHabit(id);
    } else {
      localHabits.toggleHabit(id);
    }
  };

  const handleDeleteHabit = (id: string) => {
    if (isLoggedIn) {
      cloudHabits.deleteHabit(id);
    } else {
      localHabits.deleteHabit(id);
    }
  };

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <RefreshCw className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 pt-6 pb-40">
        {/* Header */}
        <header className="flex items-start justify-between mb-4 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Daily Reset</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {format(new Date(), 'EEEE, MMMM d')}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>
            {isLoggedIn ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/settings')}
                className="text-muted-foreground hover:text-foreground"
              >
                <Settings className="w-5 h-5" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/auth')}
                className="text-muted-foreground"
              >
                <User className="w-4 h-4 mr-1.5" />
                Sign In
              </Button>
            )}
          </div>
        </header>

        {/* Day Selector */}
        <div className="mb-4 -mx-1 animate-fade-in">
          <DaySelector
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </div>

        {/* Progress Section with Plant */}
        <div className="ios-card p-5 mb-5 animate-slide-up">
          <div className="flex items-center gap-4">
            {/* Plant Growth */}
            <PlantGrowth streak={bestStreak} size="sm" showLabel={false} />
            
            {/* Progress Ring */}
            <ProgressRing
              progress={progressPercent}
              size={60}
              strokeWidth={6}
            />
            
            {/* Stats */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-muted-foreground mb-0.5">Today's Progress</p>
              <p className="text-lg font-semibold text-foreground">
                {completedCount} of {totalCount} habits
              </p>
              <div className="flex items-center gap-3 mt-1.5">
                {bestStreak > 0 && (
                  <span className="text-xs text-primary font-medium">
                    🔥 {bestStreak} day best
                  </span>
                )}
                {isLoggedIn && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Cloud className="w-3 h-3" />
                    Synced
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Motivational Message */}
        <div className="mb-5">
          <MotivationalMessage 
            bestStreak={bestStreak} 
            completedToday={completedCount} 
            totalHabits={totalCount} 
          />
        </div>

        {/* Habits List */}
        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground">Habits</h2>
            <span className="text-sm text-muted-foreground">
              {completedCount}/{totalCount} done
            </span>
          </div>
          
          {habits.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {isLoggedIn ? (
                cloudHabits.habits.map((habit, index) => (
                  <div 
                    key={habit.id} 
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <CloudHabitCard
                      habit={habit}
                      onToggle={handleToggleHabit}
                      onEdit={setEditingHabit}
                      index={index}
                      confettiEnabled={confettiEnabled}
                      soundEnabled={soundEnabled}
                    />
                  </div>
                ))
              ) : (
                localHabits.habits.map((habit, index) => (
                  <div 
                    key={habit.id} 
                    className="animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <HabitCard
                      habit={habit}
                      onToggle={handleToggleHabit}
                      onDelete={handleDeleteHabit}
                      index={index}
                      confettiEnabled={confettiEnabled}
                      soundEnabled={soundEnabled}
                    />
                  </div>
                ))
              )}
            </div>
          )}
        </section>

        {/* Fixed Add Button */}
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-background via-background/95 to-transparent pointer-events-none">
          <div className="max-w-lg mx-auto pointer-events-auto">
            <AddHabitDialog onAdd={handleAddHabit} />
          </div>
        </div>
      </div>

      {/* Bottom Tab Bar */}
      <BottomTabBar />

      {/* Edit Dialog */}
      {isLoggedIn && (
        <EditHabitDialog
          habit={editingHabit}
          open={!!editingHabit}
          onOpenChange={(open) => !open && setEditingHabit(null)}
          onUpdate={cloudHabits.updateHabit}
          onDelete={cloudHabits.deleteHabit}
        />
      )}

      {/* Daily Reflection Modal */}
      <DailyReflectionModal
        open={showReflection}
        onOpenChange={setShowReflection}
        completedCount={completedCount}
        totalCount={totalCount}
      />
    </div>
  );
};

export default Index;
