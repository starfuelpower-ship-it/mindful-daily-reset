import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Sparkles, 
  Cat, 
  Settings, 
  Coins, 
  Cloud, 
  Music,
  ChevronRight,
  ChevronLeft,
  X,
  Leaf,
  Heart,
  Check,
  Plus,
  Flame,
  Crown,
  Shirt,
  Sun,
  Snowflake,
  CloudRain,
  Volume2,
  TreeDeciduous,
  Star,
  Target,
  CalendarCheck,
  Gift
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const TUTORIAL_KEY = 'cozy_habits_tutorial_seen';

interface TutorialStep {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  color: string;
  illustration?: React.ReactNode;
}

interface AppTutorialProps {
  onComplete: () => void;
}

export function AppTutorial({ onComplete }: AppTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const tutorialSteps: TutorialStep[] = [
    // Step 1: Welcome
    {
      id: 'welcome',
      icon: <Heart className="w-10 h-10" />,
      title: 'Welcome to Cozy Habits',
      subtitle: 'Your mindful habit companion',
      color: 'from-amber-400 to-primary',
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
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
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mb-1">
                <Cat className="w-6 h-6 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">Companion</span>
            </div>
          </div>
        </div>
      ),
    },
    // Step 2: Habit System
    {
      id: 'habits',
      icon: <Target className="w-10 h-10" />,
      title: 'Build Daily Habits',
      subtitle: 'Your path to consistency',
      color: 'from-emerald-400 to-green-500',
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-card border border-border/50">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                <Plus className="w-4 h-4 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-foreground">Add a Habit</p>
                <p className="text-xs text-muted-foreground">Tap the + button to create habits like "Drink water" or "Read 10 pages"</p>
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
                <p className="text-xs text-muted-foreground">Complete habits daily to build streaks – don't break the chain!</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-center text-muted-foreground pt-2">
            Completing habits helps your plant and cat progress too! 🌱
          </p>
        </div>
      ),
    },
    // Step 3: Plant Growth
    {
      id: 'plant',
      icon: <TreeDeciduous className="w-10 h-10" />,
      title: 'Watch Your Plant Grow',
      subtitle: 'From seed to cozy tree',
      color: 'from-green-400 to-emerald-600',
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your plant evolves through 5 stages as you complete habits consistently.
          </p>
          <div className="flex items-end justify-center gap-2 py-4">
            <div className="text-center">
              <div className="text-2xl mb-1">🌱</div>
              <span className="text-[10px] text-muted-foreground">Seed</span>
            </div>
            <ChevronRight className="w-3 h-3 text-muted-foreground mb-4" />
            <div className="text-center">
              <div className="text-2xl mb-1">🌿</div>
              <span className="text-[10px] text-muted-foreground">Sprout</span>
            </div>
            <ChevronRight className="w-3 h-3 text-muted-foreground mb-4" />
            <div className="text-center">
              <div className="text-3xl mb-1">🪴</div>
              <span className="text-[10px] text-muted-foreground">Plant</span>
            </div>
            <ChevronRight className="w-3 h-3 text-muted-foreground mb-4" />
            <div className="text-center">
              <div className="text-3xl mb-1">🌸</div>
              <span className="text-[10px] text-muted-foreground">Bloom</span>
            </div>
            <ChevronRight className="w-3 h-3 text-muted-foreground mb-4" />
            <div className="text-center">
              <div className="text-4xl mb-1">🌳</div>
              <span className="text-[10px] text-muted-foreground">Tree</span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20">
            <p className="text-xs text-center text-green-600 dark:text-green-400 font-medium">
              "Your seed will grow as you complete habits and maintain streaks."
            </p>
          </div>
        </div>
      ),
    },
    // Step 4: Cat Companion
    {
      id: 'cat',
      icon: <Cat className="w-10 h-10" />,
      title: 'Your Cozy Cat',
      subtitle: 'A friend that celebrates with you',
      color: 'from-amber-400 to-primary',
      content: (
        <div className="space-y-4">
          <div className="flex justify-center py-2">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-200 to-amber-300 dark:from-gray-400 dark:to-gray-500 flex items-center justify-center animate-bounce-slow">
                <span className="text-4xl">🐱</span>
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                <Heart className="w-3 h-3 text-white fill-white" />
              </div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Reacts when you complete habits</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Cat className="w-4 h-4 text-primary" />
              <span>Tap to see cute animations</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shirt className="w-4 h-4 text-purple-500" />
              <span>Dress up in adorable outfits</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Settings className="w-4 h-4 text-slate-500" />
              <span>Drag to reposition, pinch to resize</span>
            </div>
          </div>
        </div>
      ),
    },
    // Step 5: Points & Outfits
    {
      id: 'points',
      icon: <Coins className="w-10 h-10" />,
      title: 'Earn Points & Outfits',
      subtitle: 'Rewards for your consistency',
      color: 'from-amber-400 to-orange-500',
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
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
                <span className="text-xl">🎩</span>
                <p className="text-[10px] text-muted-foreground">Hats</p>
              </div>
              <div className="text-center">
                <span className="text-xl">🧣</span>
                <p className="text-[10px] text-muted-foreground">Scarves</p>
              </div>
              <div className="text-center">
                <span className="text-xl">👑</span>
                <p className="text-[10px] text-muted-foreground">Crowns</p>
              </div>
              <div className="text-center">
                <span className="text-xl">🎧</span>
                <p className="text-[10px] text-muted-foreground">More!</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border/50">
            <Gift className="w-4 h-4 text-purple-500" />
            <p className="text-xs text-muted-foreground">
              Visit the <span className="font-medium text-foreground">Points Shop</span> to get points faster!
            </p>
          </div>
        </div>
      ),
    },
    // Step 6: Cozy Ambience
    {
      id: 'ambience',
      icon: <Cloud className="w-10 h-10" />,
      title: 'Cozy Atmosphere',
      subtitle: 'Create your perfect vibe',
      color: 'from-blue-400 to-cyan-500',
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm leading-relaxed text-center">
            Set the mood with ambient effects and lo-fi music.
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center">
              <CloudRain className="w-6 h-6 text-blue-500 mx-auto mb-1" />
              <p className="text-xs font-medium text-foreground">Rain</p>
            </div>
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-center">
              <Snowflake className="w-6 h-6 text-cyan-500 mx-auto mb-1" />
              <p className="text-xs font-medium text-foreground">Snow</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
              <Sun className="w-6 h-6 text-amber-500 mx-auto mb-1" />
              <p className="text-xs font-medium text-foreground">Sun Rays</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <Music className="w-5 h-5 text-purple-500" />
            <div className="text-left">
              <p className="text-xs font-medium text-foreground">Lo-fi Background Music</p>
              <p className="text-[10px] text-muted-foreground">Relaxing beats while you track habits</p>
            </div>
            <Volume2 className="w-4 h-4 text-purple-400 ml-auto" />
          </div>
          <p className="text-xs text-center text-muted-foreground">
            Customize in <span className="font-medium">Settings → Cozy Atmosphere</span>
          </p>
        </div>
      ),
    },
    // Step 7: Premium (soft intro)
    {
      id: 'premium',
      icon: <Crown className="w-10 h-10" />,
      title: 'Premium Features',
      subtitle: 'Optional extras for habit lovers',
      color: 'from-violet-400 to-purple-600',
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm leading-relaxed text-center">
            Unlock extra features when you're ready to level up.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border/50">
              <Star className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-foreground">Exclusive premium outfits</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border/50">
              <Coins className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-foreground">Bonus points multiplier</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border/50">
              <CalendarCheck className="w-4 h-4 text-green-500" />
              <span className="text-xs text-foreground">Extended stats & history</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border/50">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-foreground">Premium themes & widgets</span>
            </div>
          </div>
          <p className="text-[11px] text-center text-muted-foreground pt-1">
            The free version has everything you need to build great habits! Premium is just a bonus. ✨
          </p>
        </div>
      ),
    },
    // Step 8: Get Started
    {
      id: 'finish',
      icon: <Sparkles className="w-10 h-10" />,
      title: "You're All Set!",
      subtitle: 'Start your cozy habit journey',
      color: 'from-amber-400 via-purple-500 to-cyan-400',
      content: (
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm leading-relaxed text-center">
            Here's what you can do now:
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
              <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-xs font-bold">1</div>
              <span className="text-sm text-foreground">Add your first habit</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold">2</div>
              <span className="text-sm text-foreground">Check in daily</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">3</div>
              <span className="text-sm text-foreground">Watch your plant grow</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20">
              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">4</div>
              <span className="text-sm text-foreground">Customize your cat</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
              <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">5</div>
              <span className="text-sm text-foreground">Adjust your cozy settings</span>
            </div>
          </div>
          <p className="text-xs text-center text-muted-foreground pt-1">
            You can replay this tutorial anytime from Settings! 🌟
          </p>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setDirection('next');
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setIsAnimating(false);
      }, 150);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setDirection('prev');
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(prev => prev - 1);
        setIsAnimating(false);
      }, 150);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem(TUTORIAL_KEY, 'true');
    setIsVisible(false);
    onComplete();
  };

  if (!isVisible) return null;

  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/98 backdrop-blur-md">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className={cn(
          "absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-20 transition-all duration-700",
          `bg-gradient-to-br ${step.color}`
        )} />
        <div className={cn(
          "absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full blur-3xl opacity-15 transition-all duration-700 delay-100",
          `bg-gradient-to-br ${step.color}`
        )} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Skip button - single X button */}
        <button
          onClick={handleSkip}
          className="absolute -top-2 right-0 p-2.5 rounded-full bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors z-10"
          aria-label="Skip tutorial"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress bar */}
        <div className="mb-6 pt-2">
          <div className="flex justify-center items-center mb-2">
            <span className="text-xs text-muted-foreground">{currentStep + 1} of {tutorialSteps.length}</span>
          </div>
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full rounded-full transition-all duration-500 ease-out bg-gradient-to-r",
                step.color
              )}
              style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content card */}
        <div 
          className={cn(
            "ios-card p-6 transition-all duration-300",
            isAnimating && direction === 'next' && "opacity-0 translate-x-4",
            isAnimating && direction === 'prev' && "opacity-0 -translate-x-4",
            !isAnimating && "opacity-100 translate-x-0"
          )}
        >
          {/* Icon */}
          <div className={cn(
            "w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br shadow-lg",
            step.color
          )}>
            {step.icon}
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-foreground text-center mb-1">
            {step.title}
          </h2>
          {step.subtitle && (
            <p className="text-sm text-muted-foreground text-center mb-4">
              {step.subtitle}
            </p>
          )}

          {/* Dynamic content */}
          <div className="mb-6">
            {step.content}
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            {!isFirstStep && (
              <Button
                variant="outline"
                onClick={handlePrev}
                className="flex-1"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              className={cn(
                "flex-1 bg-gradient-to-r text-white border-0",
                step.color
              )}
            >
              {isLastStep ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start My Journey
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mt-4">
          {tutorialSteps.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (index < currentStep) {
                  setDirection('prev');
                } else {
                  setDirection('next');
                }
                setIsAnimating(true);
                setTimeout(() => {
                  setCurrentStep(index);
                  setIsAnimating(false);
                }, 150);
              }}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                index === currentStep
                  ? 'w-6 bg-primary'
                  : index < currentStep
                  ? 'bg-primary/50 hover:bg-primary/70'
                  : 'bg-muted hover:bg-muted-foreground/30'
              )}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>
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
      `}</style>
    </div>
  );
}

// Hook to check if tutorial should be shown
export function useTutorial() {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(TUTORIAL_KEY);
    if (!seen) {
      setShowTutorial(true);
    }
  }, []);

  const completeTutorial = () => {
    setShowTutorial(false);
  };

  const resetTutorial = () => {
    localStorage.removeItem(TUTORIAL_KEY);
    setShowTutorial(true);
  };

  return { showTutorial, completeTutorial, resetTutorial };
}

// Export for settings reset
export const TUTORIAL_STORAGE_KEY = TUTORIAL_KEY;

export default AppTutorial;
