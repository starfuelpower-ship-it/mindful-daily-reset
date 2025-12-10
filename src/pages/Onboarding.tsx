import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sun, Moon, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ============================================
// ONBOARDING STEPS
// ============================================

const SUGGESTED_HABITS = [
  { name: 'Drink water', icon: '💧', category: 'Health' },
  { name: 'Exercise', icon: '💪', category: 'Fitness' },
  { name: 'Read', icon: '📚', category: 'Mindset' },
  { name: 'Meditate', icon: '🧘', category: 'Mindset' },
  { name: 'Sleep 8 hours', icon: '😴', category: 'Health' },
  { name: 'Journal', icon: '✍️', category: 'Mindset' },
];

const GOALS = [
  { id: 'health', label: 'Improve health', emoji: '❤️' },
  { id: 'productivity', label: 'Be more productive', emoji: '🎯' },
  { id: 'mindfulness', label: 'Practice mindfulness', emoji: '🧠' },
  { id: 'fitness', label: 'Get fit', emoji: '💪' },
  { id: 'learning', label: 'Learn new things', emoji: '📚' },
  { id: 'social', label: 'Connect with others', emoji: '👥' },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [selectedHabits, setSelectedHabits] = useState<typeof SUGGESTED_HABITS>([]);
  const [loading, setLoading] = useState(false);

  const totalSteps = 4;

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(g => g !== goalId)
        : [...prev, goalId]
    );
  };

  const toggleHabit = (habit: typeof SUGGESTED_HABITS[0]) => {
    setSelectedHabits(prev =>
      prev.find(h => h.name === habit.name)
        ? prev.filter(h => h.name !== habit.name)
        : [...prev, habit]
    );
  };

  const handleComplete = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      // Update profile with display name
      await supabase
        .from('profiles')
        .update({ display_name: displayName.trim() || null })
        .eq('id', user.id);

      // Create user settings with theme
      await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          theme,
        });

      // Create selected habits
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

      toast.success('Welcome to Daily Reset!');
      navigate('/');
    } catch (error) {
      console.error('Onboarding error:', error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return true; // Name is optional
      case 2: return selectedGoals.length > 0;
      case 3: return true; // Theme has default
      case 4: return true; // Habits are optional
      default: return true;
    }
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background flex flex-col">
      {/* Progress */}
      <div className="p-4">
        <div className="flex gap-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={cn(
                'h-1 flex-1 rounded-full transition-all',
                i < step ? 'bg-primary' : 'bg-muted'
              )}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-lg mx-auto px-6 py-8 w-full">
        {/* Step 1: Name */}
        {step === 1 && (
          <div className="space-y-8 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <span className="text-4xl">👋</span>
              </div>
              <h1 className="text-2xl font-bold">Welcome!</h1>
              <p className="text-muted-foreground">What should we call you?</p>
            </div>
            <Input
              placeholder="Your name (optional)"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="h-14 text-lg rounded-2xl text-center"
            />
          </div>
        )}

        {/* Step 2: Goals */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold">What are your goals?</h1>
              <p className="text-muted-foreground">Select all that apply</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {GOALS.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={cn(
                    'ios-card p-4 text-left transition-all',
                    selectedGoals.includes(goal.id)
                      ? 'ring-2 ring-primary bg-primary/5'
                      : 'hover:bg-muted'
                  )}
                >
                  <span className="text-2xl">{goal.emoji}</span>
                  <p className="font-medium mt-2 text-sm">{goal.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Theme */}
        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold">Choose your theme</h1>
              <p className="text-muted-foreground">You can change this later</p>
            </div>
            <div className="space-y-3">
              {[
                { id: 'light', label: 'Light', icon: Sun, description: 'Clean and bright' },
                { id: 'dark', label: 'Dark', icon: Moon, description: 'Easy on the eyes' },
                { id: 'system', label: 'System', icon: Sparkles, description: 'Match device settings' },
              ].map((option) => (
                <button
                  key={option.id}
                  onClick={() => setTheme(option.id as typeof theme)}
                  className={cn(
                    'w-full ios-card p-4 flex items-center gap-4 transition-all',
                    theme === option.id
                      ? 'ring-2 ring-primary bg-primary/5'
                      : 'hover:bg-muted'
                  )}
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <option.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">{option.label}</p>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Habits */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold">Start with habits</h1>
              <p className="text-muted-foreground">Pick some to get started (optional)</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {SUGGESTED_HABITS.map((habit) => (
                <button
                  key={habit.name}
                  onClick={() => toggleHabit(habit)}
                  className={cn(
                    'ios-card p-4 text-left transition-all',
                    selectedHabits.find(h => h.name === habit.name)
                      ? 'ring-2 ring-primary bg-primary/5'
                      : 'hover:bg-muted'
                  )}
                >
                  <span className="text-2xl">{habit.icon}</span>
                  <p className="font-medium mt-2 text-sm">{habit.name}</p>
                  <p className="text-xs text-muted-foreground">{habit.category}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Navigation */}
      <div className="p-6 safe-bottom">
        <Button
          onClick={nextStep}
          disabled={!canProceed() || loading}
          className="w-full h-14 text-lg rounded-2xl"
        >
          {loading ? 'Setting up...' : step === totalSteps ? 'Get Started' : 'Continue'}
          {!loading && <ArrowRight className="w-5 h-5 ml-2" />}
        </Button>
        
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="w-full mt-3 text-sm text-muted-foreground hover:text-foreground"
          >
            Go back
          </button>
        )}
      </div>
    </div>
  );
}
