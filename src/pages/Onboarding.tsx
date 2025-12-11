import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  ArrowLeft,
  Flame, 
  Sun, 
  Moon, 
  Sparkles, 
  Check, 
  Zap, 
  Trophy, 
  Calendar,
  Heart,
  Leaf,
  Cat,
  Coins,
  Cloud,
  CloudRain,
  Snowflake,
  Music,
  Crown,
  Shirt,
  Target,
  Gift,
  Star,
  X,
  Volume2,
  TreeDeciduous
} from 'lucide-react';
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
  const [direction, setDirection] = useState<'next' | 'prev'>('next');

  const totalSteps = 9;

  // Check if user has already completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const localComplete = localStorage.getItem(ONBOARDING_KEY);
      if (localComplete === 'true') {
        navigate('/', { replace: true });
        return;
      }

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
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, habit];
    });
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      setTheme(selectedTheme);
      localStorage.setItem('daily-reset-theme', selectedTheme);

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

        await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            theme: selectedTheme,
          });
      }

      localStorage.setItem(ONBOARDING_KEY, 'true');
      toast.success('Welcome to Cozy Habits! 🎉');
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
      setDirection('next');
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (step > 0) {
      setDirection('prev');
      setStep(step - 1);
    }
  };

  const skipOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    navigate('/');
  };

  const canProceed = () => {
    if (step === 2) return selectedHabits.length > 0;
    return true;
  };

  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }

  // Get step-specific gradient color
  const getStepColor = () => {
    const colors = [
      'from-rose-400 to-pink-500',      // Welcome
      'from-emerald-400 to-green-500',  // Habits intro
      'from-blue-400 to-cyan-500',      // Choose habits
      'from-amber-400 to-orange-500',   // Streaks
      'from-green-400 to-emerald-600',  // Plant
      'from-pink-400 to-rose-500',      // Cat
      'from-amber-400 to-yellow-500',   // Points
      'from-violet-400 to-purple-500',  // Cozy + Premium
      'from-rose-400 via-purple-500 to-cyan-400', // Finish
    ];
    return colors[step] || colors[0];
  };

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={cn(
          "absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-20 transition-all duration-700",
          `bg-gradient-to-br ${getStepColor()}`
        )} />
        <div className={cn(
          "absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full blur-3xl opacity-15 transition-all duration-700",
          `bg-gradient-to-br ${getStepColor()}`
        )} />
      </div>

      {/* Skip button */}
      <button
        onClick={skipOnboarding}
        className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors z-10"
        aria-label="Skip tutorial"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Progress bar */}
      <div className="p-6 pt-8 relative z-10">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-muted-foreground">{step + 1} of {totalSteps}</span>
          <button
            onClick={skipOnboarding}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip
          </button>
        </div>
        <div className="h-1 bg-muted rounded-full overflow-hidden">
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
      <main className="flex-1 max-w-lg mx-auto px-6 py-4 w-full overflow-y-auto relative z-10">
        <div className={cn(
          "transition-all duration-300",
          direction === 'next' ? "animate-slide-in-right" : "animate-slide-in-left"
        )}>
          {/* Step 0: Welcome */}
          {step === 0 && (
            <div className="space-y-6 text-center">
              <div className={cn(
                "w-24 h-24 mx-auto rounded-3xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br",
                getStepColor()
              )}>
                <Heart className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">Welcome to Cozy Habits</h1>
                <p className="text-sm text-muted-foreground">Your mindful habit companion</p>
              </div>
              
              <p className="text-muted-foreground text-sm leading-relaxed">
                Build consistent habits using a relaxing interface, streak tracking, and gamified rewards.
              </p>
              
              <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20">
                <p className="text-sm text-foreground font-medium italic">
                  "Grow your daily habits, evolve your plant, and take care of your cozy companion."
                </p>
              </div>
              
              <div className="flex items-center justify-center gap-6 pt-2">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-1">
                    <Leaf className="w-6 h-6 text-green-500" />
                  </div>
                  <span className="text-xs text-muted-foreground">Grow</span>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mb-1">
                    <Flame className="w-6 h-6 text-amber-500" />
                  </div>
                  <span className="text-xs text-muted-foreground">Streak</span>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-pink-500/20 flex items-center justify-center mb-1">
                    <Cat className="w-6 h-6 text-pink-500" />
                  </div>
                  <span className="text-xs text-muted-foreground">Companion</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: How Habits Work */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <div className={cn(
                  "w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br",
                  getStepColor()
                )}>
                  <Target className="w-10 h-10" />
                </div>
                <h1 className="text-xl font-bold text-foreground">Build Daily Habits</h1>
                <p className="text-sm text-muted-foreground">Your path to consistency</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border/50">
                  <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">Add a Habit</p>
                    <p className="text-xs text-muted-foreground">Tap + to create habits like "Drink water" or "Read 10 pages"</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border/50">
                  <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">Daily Check-ins</p>
                    <p className="text-xs text-muted-foreground">Tap habits to mark them complete each day</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border/50">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                    <Flame className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-foreground">Build Streaks</p>
                    <p className="text-xs text-muted-foreground">Complete habits daily to build streaks!</p>
                  </div>
                </div>
              </div>
              
              <p className="text-xs text-center text-muted-foreground">
                Completing habits helps your plant and cat progress too! 🌱
              </p>
            </div>
          )}

          {/* Step 2: Choose First Habits */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <h1 className="text-xl font-bold text-foreground">Choose Your First Habits</h1>
                <p className="text-sm text-muted-foreground">
                  Pick up to 3 to start
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
                You can add more habits anytime!
              </p>
            </div>
          )}

          {/* Step 3: Streaks */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <div className={cn(
                  "w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br",
                  getStepColor()
                )}>
                  <Flame className="w-10 h-10" />
                </div>
                <h1 className="text-xl font-bold text-foreground">Streaks Matter</h1>
                <p className="text-sm text-muted-foreground">Your secret to consistency</p>
              </div>

              {/* Visual streak demo */}
              <div className="ios-card p-4 space-y-3">
                <div className="flex items-center justify-center gap-1">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <span className="text-[10px] text-muted-foreground">{day}</span>
                      <div className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center transition-all',
                        i < 5 
                          ? 'bg-primary text-primary-foreground' 
                          : i === 5 
                          ? 'bg-primary/30 border-2 border-dashed border-primary'
                          : 'bg-muted'
                      )}>
                        {i < 5 && <Check className="w-3 h-3" />}
                        {i === 5 && <span className="text-[10px]">?</span>}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-center gap-2 text-primary font-bold">
                  <Flame className="w-4 h-4" />
                  <span>5 Day Streak!</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                  <Calendar className="w-4 h-4 text-green-500" />
                  <span className="text-xs text-foreground">Complete daily to keep your streak</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  <span className="text-xs text-foreground">Bonus points at 7, 14, 30 days!</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Plant Growth */}
          {step === 4 && (
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <div className={cn(
                  "w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br",
                  getStepColor()
                )}>
                  <TreeDeciduous className="w-10 h-10" />
                </div>
                <h1 className="text-xl font-bold text-foreground">Watch Your Plant Grow</h1>
                <p className="text-sm text-muted-foreground">From seed to cozy tree</p>
              </div>

              <p className="text-muted-foreground text-xs leading-relaxed text-center">
                Your plant evolves through 5 stages as you complete habits consistently.
              </p>
              
              <div className="flex items-end justify-center gap-1 py-3">
                <div className="text-center">
                  <div className="text-xl mb-1">🌱</div>
                  <span className="text-[9px] text-muted-foreground">Seed</span>
                </div>
                <ArrowRight className="w-3 h-3 text-muted-foreground mb-4" />
                <div className="text-center">
                  <div className="text-xl mb-1">🌿</div>
                  <span className="text-[9px] text-muted-foreground">Sprout</span>
                </div>
                <ArrowRight className="w-3 h-3 text-muted-foreground mb-4" />
                <div className="text-center">
                  <div className="text-2xl mb-1">🪴</div>
                  <span className="text-[9px] text-muted-foreground">Plant</span>
                </div>
                <ArrowRight className="w-3 h-3 text-muted-foreground mb-4" />
                <div className="text-center">
                  <div className="text-2xl mb-1">🌸</div>
                  <span className="text-[9px] text-muted-foreground">Bloom</span>
                </div>
                <ArrowRight className="w-3 h-3 text-muted-foreground mb-4" />
                <div className="text-center">
                  <div className="text-3xl mb-1">🌳</div>
                  <span className="text-[9px] text-muted-foreground">Tree</span>
                </div>
              </div>
              
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <p className="text-xs text-center text-green-600 dark:text-green-400 font-medium">
                  "Your seed will grow as you complete habits and maintain streaks."
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Cat Companion */}
          {step === 5 && (
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <div className={cn(
                  "w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br",
                  getStepColor()
                )}>
                  <Cat className="w-10 h-10" />
                </div>
                <h1 className="text-xl font-bold text-foreground">Your Cozy Cat</h1>
                <p className="text-sm text-muted-foreground">A friend that celebrates with you</p>
              </div>

              <div className="flex justify-center py-2">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-200 to-amber-300 dark:from-gray-400 dark:to-gray-500 flex items-center justify-center animate-bounce-slow">
                    <span className="text-4xl">🐱</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-pink-500 flex items-center justify-center">
                    <Heart className="w-3 h-3 text-white fill-white" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span className="text-xs">Reacts when you complete habits</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Cat className="w-4 h-4 text-pink-500" />
                  <span className="text-xs">Tap to see cute animations</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shirt className="w-4 h-4 text-purple-500" />
                  <span className="text-xs">Dress up in adorable outfits</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Points & Outfits */}
          {step === 6 && (
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <div className={cn(
                  "w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br",
                  getStepColor()
                )}>
                  <Coins className="w-10 h-10" />
                </div>
                <h1 className="text-xl font-bold text-foreground">Earn Points & Outfits</h1>
                <p className="text-sm text-muted-foreground">Rewards for your consistency</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-card border border-border/50 text-center">
                  <Check className="w-5 h-5 text-green-500 mx-auto mb-1" />
                  <p className="text-xs font-medium text-foreground">Complete Habits</p>
                  <p className="text-[10px] text-muted-foreground">+10 points each</p>
                </div>
                <div className="p-3 rounded-xl bg-card border border-border/50 text-center">
                  <Flame className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                  <p className="text-xs font-medium text-foreground">Streak Bonus</p>
                  <p className="text-[10px] text-muted-foreground">Up to +50 points</p>
                </div>
              </div>
              
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <span className="text-lg">🎩</span>
                    <p className="text-[9px] text-muted-foreground">Hats</p>
                  </div>
                  <div className="text-center">
                    <span className="text-lg">🧣</span>
                    <p className="text-[9px] text-muted-foreground">Scarves</p>
                  </div>
                  <div className="text-center">
                    <span className="text-lg">👑</span>
                    <p className="text-[9px] text-muted-foreground">Crowns</p>
                  </div>
                  <div className="text-center">
                    <span className="text-lg">🎧</span>
                    <p className="text-[9px] text-muted-foreground">More!</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border/50">
                <Gift className="w-4 h-4 text-purple-500" />
                <p className="text-xs text-muted-foreground">
                  Visit <span className="font-medium text-foreground">Points Shop</span> for bundles!
                </p>
              </div>
            </div>
          )}

          {/* Step 7: Cozy Ambience + Premium */}
          {step === 7 && (
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <div className={cn(
                  "w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br",
                  getStepColor()
                )}>
                  <Cloud className="w-10 h-10" />
                </div>
                <h1 className="text-xl font-bold text-foreground">Cozy Atmosphere</h1>
                <p className="text-sm text-muted-foreground">Create your perfect vibe</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
                  <CloudRain className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                  <p className="text-[10px] font-medium text-foreground">Rain</p>
                </div>
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center">
                  <Snowflake className="w-5 h-5 text-cyan-500 mx-auto mb-1" />
                  <p className="text-[10px] font-medium text-foreground">Snow</p>
                </div>
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                  <Sun className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                  <p className="text-[10px] font-medium text-foreground">Sun Rays</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                <Music className="w-5 h-5 text-purple-500" />
                <div className="text-left flex-1">
                  <p className="text-xs font-medium text-foreground">Lo-fi Music</p>
                  <p className="text-[10px] text-muted-foreground">Relaxing beats</p>
                </div>
                <Volume2 className="w-4 h-4 text-purple-400" />
              </div>

              {/* Premium mention */}
              <div className="p-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-purple-500/10 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-4 h-4 text-purple-500" />
                  <span className="text-xs font-medium text-foreground">Premium (Optional)</span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Unlock exclusive outfits, bonus points, extended stats & themes when you're ready.
                </p>
              </div>
            </div>
          )}

          {/* Step 8: Finish - Pick Theme */}
          {step === 8 && (
            <div className="space-y-5">
              <div className="text-center space-y-2">
                <div className={cn(
                  "w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-white shadow-lg bg-gradient-to-br",
                  getStepColor()
                )}>
                  <Sparkles className="w-10 h-10" />
                </div>
                <h1 className="text-xl font-bold text-foreground">You're All Set!</h1>
                <p className="text-sm text-muted-foreground">Pick your theme and start</p>
              </div>

              {/* Theme Selection */}
              <div className="space-y-2">
                {[
                  { id: 'light', label: 'Light', icon: Sun, emoji: '☀️' },
                  { id: 'dark', label: 'Dark', icon: Moon, emoji: '🌙' },
                  { id: 'system', label: 'Auto', icon: Sparkles, emoji: '✨' },
                ].map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setSelectedTheme(option.id as typeof selectedTheme)}
                    className={cn(
                      'w-full ios-card p-3 flex items-center gap-3 transition-all',
                      selectedTheme === option.id
                        ? 'ring-2 ring-primary bg-primary/5'
                        : 'hover:bg-muted/50'
                    )}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-accent/20 flex items-center justify-center text-lg">
                      {option.emoji}
                    </div>
                    <p className="font-medium text-foreground flex-1 text-left">{option.label}</p>
                    {selectedTheme === option.id && (
                      <Check className="w-4 h-4 text-primary" />
                    )}
                  </button>
                ))}
              </div>

              {/* Summary */}
              <div className="p-3 rounded-xl bg-card border border-border/50 space-y-2">
                <p className="text-xs font-medium text-foreground text-center">What you can do:</p>
                <div className="grid grid-cols-2 gap-1 text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-green-500" />
                    <span>Add habits</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-green-500" />
                    <span>Check in daily</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-green-500" />
                    <span>Grow your plant</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-green-500" />
                    <span>Dress up your cat</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-green-500" />
                    <span>Earn points</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-green-500" />
                    <span>Customize vibe</span>
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-center text-muted-foreground">
                Replay this tutorial anytime from Settings! 🌟
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Navigation */}
      <div className="p-6 pb-8 safe-bottom relative z-10">
        <Button
          onClick={nextStep}
          disabled={!canProceed() || loading}
          className={cn(
            "w-full h-12 text-base rounded-2xl font-semibold bg-gradient-to-r text-white border-0",
            getStepColor()
          )}
        >
          {loading ? (
            'Setting up...'
          ) : step === totalSteps - 1 ? (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Start My Journey
            </>
          ) : step === 0 ? (
            <>
              Get Started
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          ) : (
            <>
              Continue
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>

        {step > 0 && (
          <button
            onClick={prevStep}
            className="w-full mt-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}

        {step === 2 && selectedHabits.length === 0 && (
          <button
            onClick={nextStep}
            className="w-full mt-2 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for now
          </button>
        )}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in-left {
          animation: slide-in-left 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
