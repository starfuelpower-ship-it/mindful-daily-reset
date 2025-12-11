import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Flame, Sun, Moon, Sparkles, Check, Zap, Trophy, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const SUGGESTED_HABITS = [
  { name: 'Drink water', icon: '💧', category: 'Health' },
  { name: 'Exercise', icon: '💪', category: 'Fitness' },
  { name: 'Read for 15 min', icon: '📚', category: 'Mindset' },
  { name: 'Meditate', icon: '🧘', category: 'Mindset' },
  { name: 'Take a walk', icon: '🚶', category: 'Health' },
  { name: 'Stretch', icon: '🤸', category: 'Fitness' },
  { name: 'Write in journal', icon: '✍️', category: 'Mindset' },
  { name: 'No social media', icon: '📵', category: 'Productivity' },
  { name: 'Early wake up', icon: '☀️', category: 'Health' },
];

const ONBOARDING_KEY = 'daily-reset-onboarding-complete';

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setTheme } = useTheme();
  const [step, setStep] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [selectedHabits, setSelectedHabits] = useState<typeof SUGGESTED_HABITS>([]);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  const totalSteps = 4;

  // Check if user has already completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      // Check localStorage first (works for guests too)
      const localComplete = localStorage.getItem(ONBOARDING_KEY);
      if (localComplete === 'true') {
        navigate('/', { replace: true });
        return;
      }

      // If logged in, check if they have any habits (returning user)
      if (user) {
        const { data: habits } = await supabase
          .from('habits')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        if (habits && habits.length > 0) {
          localStorage.setItem(ONBOARDING_KEY, 'true');
          navigate('/', { replace: true });
          return;
        }
      }

      setCheckingStatus(false);
    };

    checkOnboardingStatus();
  }, [user, navigate]);

  const toggleHabit = (habit: typeof SUGGESTED_HABITS[0]) => {
    setSelectedHabits(prev => {
      const isSelected = prev.find(h => h.name === habit.name);
      if (isSelected) {
        return prev.filter(h => h.name !== habit.name);
      }
      // Limit to 3 habits
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, habit];
    });
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Apply theme
      setTheme(selectedTheme);
      localStorage.setItem('daily-reset-theme', selectedTheme);

      // Create habits if logged in
      if (user && selectedHabits.length > 0) {
        for (const habit of selectedHabits) {
          await supabase
            .from('habits')
            .insert({
              user_id: user.id,
              name: habit.name,
              icon: habit.icon,
              category: habit.category,
              archived: false,
            });
        }

        // Save user settings
        await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            theme: selectedTheme,
          });
      }

      // Mark onboarding complete
      localStorage.setItem(ONBOARDING_KEY, 'true');

      toast.success('Welcome to Daily Reset! 🎉');
      navigate('/');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const canProceed = () => {
    if (step === 1) return selectedHabits.length > 0;
    return true;
  };

  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-background to-background flex flex-col">
      {/* Progress dots */}
      <div className="p-6 pt-8">
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                i === step ? 'w-6 bg-primary' : i < step ? 'bg-primary' : 'bg-muted'
              )}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-lg mx-auto px-6 py-4 w-full overflow-y-auto">
        {/* Step 0: Welcome */}
        {step === 0 && (
          <div className="space-y-8 animate-fade-in text-center">
            <div className="space-y-4">
              <div className="w-28 h-28 mx-auto rounded-3xl bg-gradient-to-br from-primary/20 to-accent/30 flex items-center justify-center shadow-lg">
                <span className="text-6xl">🌱</span>
              </div>
              <h1 className="text-3xl font-bold text-foreground">Welcome to Daily Reset</h1>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Build better habits, one day at a time. Track your progress, build streaks, and grow!
              </p>
            </div>

            <div className="space-y-3 text-left">
              <div className="ios-card p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Check className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Simple & Beautiful</p>
                  <p className="text-sm text-muted-foreground">Track habits with a tap</p>
                </div>
              </div>
              <div className="ios-card p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Build Streaks</p>
                  <p className="text-sm text-muted-foreground">Stay motivated every day</p>
                </div>
              </div>
              <div className="ios-card p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Fresh Start Daily</p>
                  <p className="text-sm text-muted-foreground">Reset at midnight, start fresh</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Choose Habits */}
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Choose Your First Habits</h1>
              <p className="text-muted-foreground">
                Pick up to 3 habits to start with
                <span className="ml-2 text-primary font-medium">
                  ({selectedHabits.length}/3)
                </span>
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {SUGGESTED_HABITS.map((habit) => {
                const isSelected = selectedHabits.find(h => h.name === habit.name);
                const isDisabled = !isSelected && selectedHabits.length >= 3;

                return (
                  <button
                    key={habit.name}
                    onClick={() => toggleHabit(habit)}
                    disabled={isDisabled}
                    className={cn(
                      'ios-card p-3 text-center transition-all relative',
                      isSelected
                        ? 'ring-2 ring-primary bg-primary/10'
                        : isDisabled
                        ? 'opacity-40 cursor-not-allowed'
                        : 'hover:bg-muted/50'
                    )}
                  >
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                    <span className="text-2xl block">{habit.icon}</span>
                    <p className="font-medium mt-1.5 text-xs text-foreground leading-tight">{habit.name}</p>
                  </button>
                );
              })}
            </div>

            <p className="text-center text-xs text-muted-foreground">
              You can add more habits later
            </p>
          </div>
        )}

        {/* Step 2: Theme */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Pick Your Look</h1>
              <p className="text-muted-foreground">Choose a theme that suits you</p>
            </div>

            <div className="space-y-3">
              {[
                { id: 'light', label: 'Light Mode', icon: Sun, emoji: '☀️', description: 'Bright and clean' },
                { id: 'dark', label: 'Dark Mode', icon: Moon, emoji: '🌙', description: 'Easy on the eyes' },
                { id: 'system', label: 'Auto', icon: Sparkles, emoji: '✨', description: 'Match your device' },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedTheme(option.id as typeof selectedTheme)}
                  className={cn(
                    'w-full ios-card p-4 flex items-center gap-4 transition-all',
                    selectedTheme === option.id
                      ? 'ring-2 ring-primary bg-primary/5'
                      : 'hover:bg-muted/50'
                  )}
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center text-2xl">
                    {option.emoji}
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-foreground">{option.label}</p>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  {selectedTheme === option.id && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Learn about Streaks */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-foreground">How Streaks Work</h1>
              <p className="text-muted-foreground">Your secret to building habits</p>
            </div>

            {/* Visual streak demo */}
            <div className="ios-card p-5 space-y-4">
              <div className="flex items-center justify-center gap-1">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span className="text-xs text-muted-foreground">{day}</span>
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center transition-all',
                      i < 5 
                        ? 'bg-primary text-primary-foreground' 
                        : i === 5 
                        ? 'bg-primary/30 border-2 border-dashed border-primary'
                        : 'bg-muted'
                    )}>
                      {i < 5 && <Check className="w-4 h-4" />}
                      {i === 5 && <span className="text-xs">?</span>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center gap-2 text-primary font-bold text-lg">
                <Flame className="w-5 h-5" />
                <span>5 Day Streak!</span>
              </div>
            </div>

            {/* Tips */}
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                <Calendar className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground text-sm">Complete daily</p>
                  <p className="text-xs text-muted-foreground">Check off habits every day to keep your streak alive</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                <Flame className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground text-sm">Don't break the chain</p>
                  <p className="text-xs text-muted-foreground">Missing a day resets your streak to zero</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                <Trophy className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground text-sm">Watch yourself grow</p>
                  <p className="text-xs text-muted-foreground">Your plant grows as your streaks increase</p>
                </div>
              </div>
            </div>

            <p className="text-center text-sm text-primary font-medium">
              Ready to start your streak? Let's go! 🚀
            </p>
          </div>
        )}
      </main>

      {/* Navigation */}
      <div className="p-6 pb-8 safe-bottom">
        <Button
          onClick={nextStep}
          disabled={!canProceed() || loading}
          className="w-full h-14 text-lg rounded-2xl font-semibold"
        >
          {loading ? (
            'Setting up...'
          ) : step === totalSteps - 1 ? (
            "Let's Go!"
          ) : step === 0 ? (
            'Get Started'
          ) : (
            'Continue'
          )}
          {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
        </Button>

        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="w-full mt-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Go back
          </button>
        )}

        {step === 1 && selectedHabits.length === 0 && (
          <button
            onClick={nextStep}
            className="w-full mt-2 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}
