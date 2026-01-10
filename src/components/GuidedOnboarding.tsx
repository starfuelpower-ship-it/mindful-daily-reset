/**
 * Guided Onboarding Component (V3)
 * 
 * An interactive app tour with:
 * 1. Welcome - Friendly intro
 * 2. App Tour - Interactive walkthrough with arrows pointing to UI elements
 * 3. Create First Habit - Guide to create and complete a habit
 * 4. Value Summary - Gentle approach reminder + paywall trigger
 * 
 * Features:
 * - Arrows pointing to UI elements
 * - Subtle premium feature hints
 * - Cat companion callout
 * - Music auto-plays during onboarding
 * - Cannot be skipped
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  Heart, 
  ArrowRight, 
  Leaf, 
  Sparkles, 
  Check, 
  Star,
  Cat,
  Target,
  Gift,
  Flame,
  ChevronRight,
  Hand,
  BarChart3,
  Crown,
  Palette,
  Music,
  ChevronDown,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useAuth } from '@/contexts/AuthContext';
import { useMusic } from '@/contexts/MusicContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Tour step types
type TourStep = 
  | 'welcome'
  | 'tour-habits'
  | 'tour-cat'
  | 'tour-stats'
  | 'tour-rewards'
  | 'create-habit'
  | 'complete-habit'
  | 'view-reward'
  | 'value-summary';

// Suggested habits for quick creation
const QUICK_HABITS = [
  { name: 'Drink water', icon: '💧', category: 'Health' },
  { name: 'Take a walk', icon: '🚶', category: 'Health' },
  { name: 'Read 10 min', icon: '📚', category: 'Mindset' },
  { name: 'Stretch', icon: '🤸', category: 'Fitness' },
  { name: 'Meditate', icon: '🧘', category: 'Mindset' },
  { name: 'Gratitude note', icon: '🙏', category: 'Mindset' },
];

interface GuidedOnboardingProps {
  onComplete: () => void;
}

export function GuidedOnboarding({ onComplete }: GuidedOnboardingProps) {
  const { user } = useAuth();
  const { completeOnboarding, markFirstHabitCreated, markHabitCompleted } = useOnboarding();
  const { musicEnabled, setMusicEnabled } = useMusic();
  
  const [currentStep, setCurrentStep] = useState<TourStep>('welcome');
  const [createdHabit, setCreatedHabit] = useState<{ name: string; icon: string } | null>(null);
  const [isHabitCompleted, setIsHabitCompleted] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-enable music during onboarding
  useEffect(() => {
    if (!musicEnabled) {
      setMusicEnabled(true);
    }
  }, []);

  // Get step index for progress bar
  const getStepIndex = (): number => {
    const steps: TourStep[] = [
      'welcome',
      'tour-habits',
      'tour-cat',
      'tour-stats',
      'tour-rewards',
      'create-habit',
      'complete-habit',
      'view-reward',
      'value-summary'
    ];
    return steps.indexOf(currentStep);
  };

  const totalSteps = 9;
  const progressPercent = ((getStepIndex() + 1) / totalSteps) * 100;

  // Handle habit creation
  const handleCreateHabit = async (habit: typeof QUICK_HABITS[0]) => {
    if (!user) {
      toast.error('Please sign in first');
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          name: habit.name,
          icon: habit.icon,
          category: habit.category,
          archived: false,
        });
      
      if (error) throw error;
      
      setCreatedHabit({ name: habit.name, icon: habit.icon });
      markFirstHabitCreated();
      setCurrentStep('complete-habit');
    } catch (error) {
      console.error('Failed to create habit:', error);
      toast.error('Failed to create habit');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle habit completion
  const handleCompleteHabit = async () => {
    if (!user || !createdHabit) return;
    
    setIsLoading(true);
    try {
      const { data: habits } = await supabase
        .from('habits')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', createdHabit.name)
        .limit(1);
      
      if (habits && habits.length > 0) {
        await supabase
          .from('habits')
          .update({
            completed_today: true,
            last_completed_date: new Date().toISOString().split('T')[0],
            streak: 1,
          })
          .eq('id', habits[0].id);
        
        await supabase
          .from('habit_completions')
          .insert({
            habit_id: habits[0].id,
            user_id: user.id,
            completed: true,
          });
      }
      
      setIsHabitCompleted(true);
      markHabitCompleted();
      setCurrentStep('view-reward');
      setTimeout(() => setShowReward(true), 500);
    } catch (error) {
      console.error('Failed to complete habit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle final completion
  const handleFinish = () => {
    completeOnboarding();
    onComplete();
  };

  // Render arrow pointer component
  const ArrowPointer = ({ direction = 'down', className = '' }: { direction?: 'up' | 'down' | 'left' | 'right'; className?: string }) => (
    <div className={cn(
      "flex items-center justify-center animate-bounce",
      direction === 'down' && "flex-col",
      direction === 'up' && "flex-col rotate-180",
      direction === 'left' && "flex-row rotate-90",
      direction === 'right' && "flex-row -rotate-90",
      className
    )}>
      <ChevronDown className="w-8 h-8 text-primary" />
      <ChevronDown className="w-8 h-8 text-primary -mt-4" />
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-background overflow-y-auto">
      <div className="min-h-screen flex flex-col">
        {/* Progress bar */}
        <div className="p-6 pt-12">
          <div className="flex items-center justify-between mb-2 max-w-lg mx-auto">
            <div className="flex items-center gap-2 text-primary">
              <Music className="w-4 h-4" />
              <span className="text-xs">Music playing</span>
            </div>
            <span className="text-xs text-muted-foreground">{getStepIndex() + 1} of {totalSteps}</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden max-w-lg mx-auto">
            <div 
              className="h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r from-primary to-primary/60"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 max-w-lg mx-auto px-6 py-4 w-full">
          
          {/* Step: Welcome */}
          {currentStep === 'welcome' && (
            <div className="space-y-8 text-center animate-fade-in">
              <div className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br from-amber-400 to-primary">
                <Heart className="w-12 h-12" />
              </div>
              
              <div className="space-y-3">
                <h1 className="text-3xl font-bold text-foreground">Welcome to Cozy Habits</h1>
                <p className="text-lg text-muted-foreground">
                  A gentle space to build habits without pressure
                </p>
              </div>
              
              <div className="space-y-4 text-left">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border/50">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center shrink-0">
                    <Leaf className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Simple habit tracking</p>
                    <p className="text-sm text-muted-foreground">Tap to complete, watch your progress grow</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border/50">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                    <Flame className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Build gentle streaks</p>
                    <p className="text-sm text-muted-foreground">No guilt—just steady progress</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border/50">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                    <Gift className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Earn rewards</p>
                    <p className="text-sm text-muted-foreground">Collect points and unlock themes</p>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => setCurrentStep('tour-habits')}
                className="w-full h-14 text-lg font-semibold rounded-2xl gap-2"
              >
                Let me show you around <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          )}

          {/* Step: Tour - Habits */}
          {currentStep === 'tour-habits' && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-3">
                <ArrowPointer direction="up" className="mx-auto" />
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Your Habits Live Here</h2>
                <p className="text-muted-foreground">
                  This is where you'll see all your daily habits. Tap any habit to mark it complete!
                </p>
              </div>
              
              {/* Mock habit card */}
              <div className="p-4 rounded-2xl bg-card border border-border/50 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-blue-500/20 flex items-center justify-center text-2xl">
                    💧
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">Drink water</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Flame className="w-4 h-4 text-amber-500" />
                      <span className="text-sm text-muted-foreground">3 day streak</span>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-muted flex items-center justify-center">
                    <Check className="w-5 h-5 text-muted-foreground/30" />
                  </div>
                </div>
              </div>
              
              <p className="text-center text-sm text-muted-foreground">
                Tap the circle to mark habits as done
              </p>
              
              <Button
                onClick={() => setCurrentStep('tour-cat')}
                className="w-full h-12 rounded-xl gap-2"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Step: Tour - Cat Companion */}
          {currentStep === 'tour-cat' && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-3">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg">
                  <Cat className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Meet Your Cozy Cat! 🐱</h2>
                <p className="text-muted-foreground">
                  Your friendly companion lives in the corner of your screen
                </p>
              </div>
              
              <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border border-orange-200 dark:border-orange-800/50">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">😺</div>
                  <div>
                    <p className="font-medium text-foreground">Your cat cheers you on!</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      They react when you complete habits and sometimes bring you gifts
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <span>Look for the cat in the bottom corner</span>
                <ArrowPointer direction="down" className="scale-50" />
              </div>
              
              <Button
                onClick={() => setCurrentStep('tour-stats')}
                className="w-full h-12 rounded-xl gap-2"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Step: Tour - Stats (Premium hint) */}
          {currentStep === 'tour-stats' && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-500/10 flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Track Your Progress</h2>
                <p className="text-muted-foreground">
                  See your streaks, completions, and patterns over time
                </p>
              </div>
              
              {/* Mock stats preview */}
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-card border border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Today's progress</span>
                    <span className="font-semibold text-foreground">2/5 habits</span>
                  </div>
                  <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full w-2/5 bg-primary rounded-full" />
                  </div>
                </div>
                
                {/* Premium hint */}
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 relative overflow-hidden">
                  <div className="absolute top-2 right-2">
                    <div className="flex items-center gap-1 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      <Crown className="w-3 h-3" />
                      <span>Pro</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-6 h-6 text-primary/50" />
                    <div>
                      <p className="text-sm font-medium text-foreground/70">Detailed analytics</p>
                      <p className="text-xs text-muted-foreground">Weekly & monthly insights</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => setCurrentStep('tour-rewards')}
                className="w-full h-12 rounded-xl gap-2"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Step: Tour - Rewards & Themes */}
          {currentStep === 'tour-rewards' && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <Palette className="w-8 h-8 text-purple-500" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">Rewards & Themes</h2>
                <p className="text-muted-foreground">
                  Earn coins by completing habits and spend them on fun stuff!
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-card border border-border/50 text-center">
                  <Star className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">Earn Points</p>
                  <p className="text-xs text-muted-foreground">Complete habits daily</p>
                </div>
                <div className="p-4 rounded-xl bg-card border border-border/50 text-center">
                  <Gift className="w-6 h-6 text-pink-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground">Unlock Items</p>
                  <p className="text-xs text-muted-foreground">Cat costumes & more</p>
                </div>
              </div>
              
              {/* Premium theme hint */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-purple-500/5 border border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Premium themes</p>
                    <p className="text-xs text-muted-foreground">Unlock all themes with Pro</p>
                  </div>
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              
              <Button
                onClick={() => setCurrentStep('create-habit')}
                className="w-full h-12 rounded-xl gap-2"
              >
                Now let's create your first habit! <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Step: Create habit */}
          {currentStep === 'create-habit' && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-primary mb-4">
                  <Hand className="w-5 h-5" />
                  <span className="text-sm font-medium">Tap to create</span>
                </div>
                <h2 className="text-xl font-bold text-foreground">Pick your first habit</h2>
                <p className="text-sm text-muted-foreground">Start small—you can add more later!</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {QUICK_HABITS.map((habit) => (
                  <button
                    key={habit.name}
                    onClick={() => handleCreateHabit(habit)}
                    disabled={isLoading}
                    className="p-4 rounded-xl bg-card border border-border/50 text-center hover:border-primary/50 hover:bg-primary/5 transition-all active:scale-95"
                  >
                    <span className="text-3xl block mb-2">{habit.icon}</span>
                    <p className="text-sm font-medium text-foreground">{habit.name}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step: Complete habit */}
          {currentStep === 'complete-habit' && createdHabit && (
            <div className="space-y-6 text-center animate-fade-in">
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-primary mb-4">
                  <Hand className="w-5 h-5" />
                  <span className="text-sm font-medium">Tap to complete!</span>
                </div>
                <h2 className="text-xl font-bold text-foreground">Great choice! 🎉</h2>
                <p className="text-sm text-muted-foreground">Now mark it as done</p>
              </div>
              
              <button
                onClick={handleCompleteHabit}
                disabled={isLoading}
                className={cn(
                  "w-full p-6 rounded-2xl border-2 transition-all active:scale-95",
                  isHabitCompleted
                    ? "bg-green-500/10 border-green-500"
                    : "bg-card border-border hover:border-primary"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-all",
                    isHabitCompleted ? "bg-green-500" : "bg-muted"
                  )}>
                    {isHabitCompleted ? (
                      <Check className="w-8 h-8 text-white" />
                    ) : (
                      createdHabit.icon
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">{createdHabit.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {isHabitCompleted ? 'Completed! ✓' : 'Tap to complete'}
                    </p>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Step: View reward */}
          {currentStep === 'view-reward' && (
            <div className="space-y-6 text-center animate-fade-in">
              <div className={cn(
                "w-24 h-24 mx-auto rounded-3xl flex items-center justify-center shadow-lg bg-gradient-to-br from-yellow-400 to-amber-500",
                showReward && "animate-pulse"
              )}>
                <Gift className="w-12 h-12 text-white" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">Amazing! 🌟</h2>
                <p className="text-muted-foreground">
                  You just earned your first points!
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <Star className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                  <p className="text-lg font-bold text-foreground">+10</p>
                  <p className="text-xs text-muted-foreground">Points earned</p>
                </div>
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                  <Flame className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <p className="text-lg font-bold text-foreground">1 day</p>
                  <p className="text-xs text-muted-foreground">Streak started</p>
                </div>
              </div>
              
              <Button
                onClick={() => setCurrentStep('value-summary')}
                className="w-full h-12 rounded-xl gap-2"
              >
                One more thing <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Step: Value Summary */}
          {currentStep === 'value-summary' && (
            <div className="space-y-8 text-center animate-fade-in">
              <div className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br from-rose-400 to-pink-500">
                <Sparkles className="w-12 h-12" />
              </div>
              
              <div className="space-y-3">
                <h1 className="text-2xl font-bold text-foreground">You're all set! 🎉</h1>
                <p className="text-muted-foreground">
                  Here's our philosophy on habits
                </p>
              </div>
              
              <div className="space-y-4 text-left">
                <div className="p-5 rounded-xl bg-card border border-border/50">
                  <p className="text-lg font-medium text-foreground mb-2">🌱 Small wins matter</p>
                  <p className="text-sm text-muted-foreground">
                    Every tiny habit you complete is a victory
                  </p>
                </div>
                
                <div className="p-5 rounded-xl bg-card border border-border/50">
                  <p className="text-lg font-medium text-foreground mb-2">💚 No pressure, ever</p>
                  <p className="text-sm text-muted-foreground">
                    Missed a day? That's okay. We're here to support, not judge
                  </p>
                </div>
                
                <div className="p-5 rounded-xl bg-card border border-border/50">
                  <p className="text-lg font-medium text-foreground mb-2">🌿 Consistency builds naturally</p>
                  <p className="text-sm text-muted-foreground">
                    Focus on showing up. Your garden grows one day at a time
                  </p>
                </div>
              </div>
              
              <Button
                onClick={handleFinish}
                className="w-full h-14 text-lg font-semibold rounded-2xl shadow-lg shadow-primary/30 gap-2"
              >
                Start my journey <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
