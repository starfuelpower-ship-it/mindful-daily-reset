/**
 * Guided Onboarding Component (V2)
 * 
 * A 3-step mandatory onboarding flow:
 * 1. Welcome - Friendly intro
 * 2. Interactive Walkthrough - Create habit, complete it, see rewards
 * 3. Value Reinforcement - Summary of gentle approach
 * 
 * This onboarding CANNOT be skipped.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Hand
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Interactive step states
type InteractiveStep = 'intro' | 'create-habit' | 'complete-habit' | 'view-reward' | 'done';

// Suggested habits for quick creation
const QUICK_HABITS = [
  { name: 'Drink water', icon: '💧', category: 'Health' },
  { name: 'Take a walk', icon: '🚶', category: 'Health' },
  { name: 'Read 10 min', icon: '📚', category: 'Mindset' },
  { name: 'Stretch', icon: '🤸', category: 'Fitness' },
  { name: 'Meditate', icon: '🧘', category: 'Mindset' },
  { name: 'No phone before bed', icon: '📵', category: 'Health' },
];

interface GuidedOnboardingProps {
  onComplete: () => void;
}

export function GuidedOnboarding({ onComplete }: GuidedOnboardingProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { completeOnboarding, markFirstHabitCreated, markHabitCompleted } = useOnboarding();
  
  // Main step (0 = Welcome, 1 = Interactive, 2 = Value)
  const [step, setStep] = useState(0);
  
  // Interactive step sub-state
  const [interactiveStep, setInteractiveStep] = useState<InteractiveStep>('intro');
  
  // Created habit for interactive flow
  const [createdHabit, setCreatedHabit] = useState<{ name: string; icon: string } | null>(null);
  const [isHabitCompleted, setIsHabitCompleted] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Progress indicator
  const totalSteps = 3;

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
      setInteractiveStep('complete-habit');
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
      // Get the habit we just created
      const { data: habits } = await supabase
        .from('habits')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', createdHabit.name)
        .limit(1);
      
      if (habits && habits.length > 0) {
        // Mark as completed
        await supabase
          .from('habits')
          .update({
            completed_today: true,
            last_completed_date: new Date().toISOString().split('T')[0],
            streak: 1,
          })
          .eq('id', habits[0].id);
        
        // Add completion record
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
      setInteractiveStep('view-reward');
      
      // Show reward animation after a delay
      setTimeout(() => setShowReward(true), 500);
    } catch (error) {
      console.error('Failed to complete habit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle step navigation
  const handleNext = () => {
    if (step === 0) {
      // Move to interactive step
      setStep(1);
      setInteractiveStep('intro');
    } else if (step === 1) {
      // Only proceed if interactive steps are done
      if (interactiveStep === 'done' || showReward) {
        setStep(2);
      }
    } else if (step === 2) {
      // Complete onboarding
      completeOnboarding();
      onComplete();
    }
  };

  // Get step color
  const getStepColor = () => {
    const colors = [
      'from-amber-400 to-primary',         // Welcome
      'from-emerald-400 to-green-500',     // Interactive
      'from-rose-400 to-pink-500',         // Value
    ];
    return colors[step] || colors[0];
  };

  // Can proceed to next step?
  const canProceed = () => {
    if (step === 0) return true;
    if (step === 1) return showReward || interactiveStep === 'done';
    if (step === 2) return true;
    return true;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-background overflow-y-auto">
      <div className="min-h-screen flex flex-col">
        {/* Progress bar */}
        <div className="p-6 pt-12">
          <div className="flex justify-center items-center mb-2">
            <span className="text-xs text-muted-foreground">{step + 1} of {totalSteps}</span>
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden max-w-lg mx-auto">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r",
                getStepColor()
              )}
              style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 max-w-lg mx-auto px-6 py-4 w-full">
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="space-y-8 text-center animate-fade-in">
              <div className={cn(
                "w-24 h-24 mx-auto rounded-3xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br",
                getStepColor()
              )}>
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
                    <p className="font-medium text-foreground">Watch your plant grow</p>
                    <p className="text-sm text-muted-foreground">Every habit you complete helps your garden flourish</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border/50">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                    <Flame className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Build gentle streaks</p>
                    <p className="text-sm text-muted-foreground">No guilt, no pressure—just steady progress</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border/50">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                    <Cat className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Meet your cozy companion</p>
                    <p className="text-sm text-muted-foreground">A friendly cat cheers you on</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Interactive Walkthrough */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              {/* Intro sub-step */}
              {interactiveStep === 'intro' && (
                <div className="text-center space-y-6">
                  <div className={cn(
                    "w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br",
                    getStepColor()
                  )}>
                    <Target className="w-10 h-10" />
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">Let's try it together</h2>
                    <p className="text-muted-foreground">
                      Create your first habit and see how it feels
                    </p>
                  </div>
                  
                  <Button
                    onClick={() => setInteractiveStep('create-habit')}
                    className={cn(
                      "px-8 gap-2 bg-gradient-to-r text-white",
                      getStepColor()
                    )}
                  >
                    Let's go <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Create habit sub-step */}
              {interactiveStep === 'create-habit' && (
                <div className="space-y-6">
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 text-primary mb-4">
                      <Hand className="w-5 h-5" />
                      <span className="text-sm font-medium">Tap to create your first habit</span>
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Pick a habit to start with</h2>
                    <p className="text-sm text-muted-foreground">Choose something small and achievable</p>
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

              {/* Complete habit sub-step */}
              {interactiveStep === 'complete-habit' && createdHabit && (
                <div className="space-y-6 text-center">
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 text-primary mb-4">
                      <Hand className="w-5 h-5" />
                      <span className="text-sm font-medium">Tap to complete it!</span>
                    </div>
                    <h2 className="text-xl font-bold text-foreground">Great choice! 🎉</h2>
                    <p className="text-sm text-muted-foreground">Now let's mark it as done</p>
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

              {/* View reward sub-step */}
              {interactiveStep === 'view-reward' && (
                <div className="space-y-6 text-center">
                  <div className={cn(
                    "w-24 h-24 mx-auto rounded-3xl flex items-center justify-center shadow-lg bg-gradient-to-br from-yellow-400 to-amber-500 animate-bounce",
                    showReward && "animate-pulse"
                  )}>
                    <Gift className="w-12 h-12 text-white" />
                  </div>
                  
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-foreground">Amazing! 🌟</h2>
                    <p className="text-muted-foreground">
                      You just earned your first points and your plant grew!
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
                  
                  <p className="text-sm text-muted-foreground">
                    Keep completing habits to grow your garden and earn rewards!
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Value Reinforcement */}
          {step === 2 && (
            <div className="space-y-8 text-center animate-fade-in">
              <div className={cn(
                "w-24 h-24 mx-auto rounded-3xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br",
                getStepColor()
              )}>
                <Sparkles className="w-12 h-12" />
              </div>
              
              <div className="space-y-3">
                <h1 className="text-2xl font-bold text-foreground">A gentle reminder</h1>
                <p className="text-muted-foreground">
                  Here's our philosophy on building habits
                </p>
              </div>
              
              <div className="space-y-4 text-left">
                <div className="p-5 rounded-xl bg-card border border-border/50">
                  <p className="text-lg font-medium text-foreground mb-2">🌱 Small wins matter</p>
                  <p className="text-sm text-muted-foreground">
                    Every tiny habit you complete is a victory. There's no such thing as "too small."
                  </p>
                </div>
                
                <div className="p-5 rounded-xl bg-card border border-border/50">
                  <p className="text-lg font-medium text-foreground mb-2">💚 No pressure, ever</p>
                  <p className="text-sm text-muted-foreground">
                    Missed a day? That's okay. Life happens. We're here to support, not judge.
                  </p>
                </div>
                
                <div className="p-5 rounded-xl bg-card border border-border/50">
                  <p className="text-lg font-medium text-foreground mb-2">🌿 Consistency builds naturally</p>
                  <p className="text-sm text-muted-foreground">
                    Focus on showing up, not perfection. Your plant grows one day at a time.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Navigation */}
        <footer className="p-6 pt-2">
          <div className="max-w-lg mx-auto">
            <Button
              onClick={handleNext}
              disabled={!canProceed() || isLoading}
              className={cn(
                "w-full h-14 text-lg font-semibold rounded-2xl gap-2 bg-gradient-to-r text-white shadow-lg",
                getStepColor()
              )}
            >
              {step === 2 ? "Let's begin!" : "Continue"}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}
