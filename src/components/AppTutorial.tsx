import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  CheckCircle2, 
  Sparkles, 
  Cat, 
  Settings, 
  Coins, 
  Cloud, 
  Music,
  ChevronRight,
  X
} from 'lucide-react';

const TUTORIAL_KEY = 'cozy_habits_tutorial_seen';

interface TutorialStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    icon: <CheckCircle2 className="w-12 h-12" />,
    title: 'Build Better Habits',
    description: 'Create daily habits and track your progress. Complete them each day to build powerful streaks and watch your plant grow!',
    color: 'from-green-400 to-emerald-500',
  },
  {
    icon: <Coins className="w-12 h-12" />,
    title: 'Earn Points',
    description: 'Every habit you complete earns you points. Maintain streaks for bonus rewards. Use points to unlock adorable costumes!',
    color: 'from-amber-400 to-orange-500',
  },
  {
    icon: <Cat className="w-12 h-12" />,
    title: 'Meet Your Companion',
    description: 'Your cozy cat companion cheers you on! Drag it around, dress it up in costumes, and watch it react when you complete habits.',
    color: 'from-pink-400 to-rose-500',
  },
  {
    icon: <Cloud className="w-12 h-12" />,
    title: 'Cozy Atmosphere',
    description: 'Enable ambient effects like rain, snow, or sun rays in Settings. Create your perfect cozy environment for habit tracking.',
    color: 'from-blue-400 to-cyan-500',
  },
  {
    icon: <Music className="w-12 h-12" />,
    title: 'Lo-fi Music',
    description: 'Relax with optional lo-fi background music. Adjust volume or disable it anytime in Settings under Music.',
    color: 'from-purple-400 to-violet-500',
  },
  {
    icon: <Settings className="w-12 h-12" />,
    title: 'Customize Everything',
    description: 'Visit Settings to personalize your experience: themes, sounds, notifications, and more. Make it truly yours!',
    color: 'from-slate-400 to-slate-600',
  },
];

interface AppTutorialProps {
  onComplete: () => void;
}

export function AppTutorial({ onComplete }: AppTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur-sm">
      <div className="relative w-full max-w-md">
        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute -top-2 right-0 p-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                index === currentStep
                  ? 'w-6 bg-primary'
                  : index < currentStep
                  ? 'bg-primary/50'
                  : 'bg-muted'
              )}
            />
          ))}
        </div>

        {/* Content card */}
        <div className="ios-card p-8 text-center">
          {/* Icon */}
          <div className={cn(
            'w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center text-white bg-gradient-to-br',
            step.color
          )}>
            {step.icon}
          </div>

          {/* Text */}
          <h2 className="text-2xl font-bold text-foreground mb-3">
            {step.title}
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-8">
            {step.description}
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleNext}
              size="lg"
              className="w-full"
            >
              {isLastStep ? (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get Started
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>

            {!isLastStep && (
              <Button
                variant="ghost"
                onClick={handleSkip}
                className="text-muted-foreground"
              >
                Skip Tutorial
              </Button>
            )}
          </div>
        </div>

        {/* Step counter */}
        <p className="text-center text-sm text-muted-foreground mt-4">
          {currentStep + 1} of {tutorialSteps.length}
        </p>
      </div>
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

export default AppTutorial;
