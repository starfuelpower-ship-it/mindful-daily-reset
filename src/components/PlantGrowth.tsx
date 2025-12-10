import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

// ============================================
// PLANT GROWTH SYSTEM
// ============================================
// Visual representation of user's longest streak
// Stages: Seed (0-2) → Sprout (3-6) → Small Plant (7-13) → Leafy Plant (14-29) → Tree (30+)

interface PlantGrowthProps {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animate?: boolean;
}

type PlantStage = 'seed' | 'sprout' | 'small-plant' | 'leafy-plant' | 'tree';

interface StageInfo {
  stage: PlantStage;
  name: string;
  emoji: string;
  minStreak: number;
  color: string;
}

const STAGES: StageInfo[] = [
  { stage: 'seed', name: 'Seed', emoji: '🌰', minStreak: 0, color: 'hsl(30, 60%, 45%)' },
  { stage: 'sprout', name: 'Sprout', emoji: '🌱', minStreak: 3, color: 'hsl(120, 50%, 50%)' },
  { stage: 'small-plant', name: 'Small Plant', emoji: '🌿', minStreak: 7, color: 'hsl(130, 55%, 45%)' },
  { stage: 'leafy-plant', name: 'Leafy Plant', emoji: '🪴', minStreak: 14, color: 'hsl(140, 60%, 40%)' },
  { stage: 'tree', name: 'Tree', emoji: '🌳', minStreak: 30, color: 'hsl(150, 50%, 35%)' },
];

function getStageForStreak(streak: number): StageInfo {
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if (streak >= STAGES[i].minStreak) {
      return STAGES[i];
    }
  }
  return STAGES[0];
}

function getNextStage(currentStage: PlantStage): StageInfo | null {
  const currentIndex = STAGES.findIndex(s => s.stage === currentStage);
  if (currentIndex < STAGES.length - 1) {
    return STAGES[currentIndex + 1];
  }
  return null;
}

function getProgressToNextStage(streak: number): number {
  const currentStage = getStageForStreak(streak);
  const nextStage = getNextStage(currentStage.stage);
  
  if (!nextStage) return 100;
  
  const progressInStage = streak - currentStage.minStreak;
  const stageRange = nextStage.minStreak - currentStage.minStreak;
  
  return Math.min(100, (progressInStage / stageRange) * 100);
}

export function PlantGrowth({ streak, size = 'md', showLabel = true, animate = true }: PlantGrowthProps) {
  const [showGrowthAnimation, setShowGrowthAnimation] = useState(false);
  const [previousStage, setPreviousStage] = useState<PlantStage | null>(null);
  
  const currentStageInfo = getStageForStreak(streak);
  const nextStage = getNextStage(currentStageInfo.stage);
  const progress = getProgressToNextStage(streak);
  
  // Detect stage changes for animation
  useEffect(() => {
    if (previousStage && previousStage !== currentStageInfo.stage && animate) {
      setShowGrowthAnimation(true);
      const timer = setTimeout(() => setShowGrowthAnimation(false), 1500);
      return () => clearTimeout(timer);
    }
    setPreviousStage(currentStageInfo.stage);
  }, [currentStageInfo.stage, animate]);

  const sizeClasses = {
    sm: 'w-16 h-16 text-3xl',
    md: 'w-24 h-24 text-5xl',
    lg: 'w-32 h-32 text-6xl',
  };

  const containerSizes = {
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Plant Container */}
      <div 
        className={cn(
          'relative rounded-3xl bg-gradient-to-b from-accent/30 to-accent/10 flex items-center justify-center',
          containerSizes[size],
          showGrowthAnimation && 'animate-growth-burst'
        )}
      >
        {/* Glow effect during growth */}
        {showGrowthAnimation && (
          <div className="absolute inset-0 rounded-3xl bg-primary/20 animate-pulse-glow" />
        )}
        
        {/* Sparkles during growth */}
        {showGrowthAnimation && (
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-sparkle"
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        )}
        
        {/* Plant emoji */}
        <div 
          className={cn(
            sizeClasses[size],
            'flex items-center justify-center transition-transform duration-500',
            showGrowthAnimation && 'animate-plant-grow'
          )}
        >
          {currentStageInfo.emoji}
        </div>
        
        {/* Pot base */}
        <div 
          className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-3 rounded-b-xl"
          style={{ backgroundColor: 'hsl(25, 50%, 35%)' }}
        />
      </div>

      {/* Stage info */}
      {showLabel && (
        <div className="text-center space-y-1">
          <p className="font-medium text-foreground">{currentStageInfo.name}</p>
          <p className="text-xs text-muted-foreground">
            {streak} day{streak !== 1 ? 's' : ''} streak
          </p>
        </div>
      )}

      {/* Progress to next stage */}
      {nextStage && showLabel && (
        <div className="w-full max-w-[120px] space-y-1">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            {nextStage.minStreak - streak} days to {nextStage.name}
          </p>
        </div>
      )}

      {/* Max stage celebration */}
      {!nextStage && showLabel && (
        <p className="text-xs text-primary font-medium flex items-center gap-1">
          ✨ Fully Grown!
        </p>
      )}
    </div>
  );
}

// Compact version for habit cards
export function PlantBadge({ streak }: { streak: number }) {
  const stage = getStageForStreak(streak);
  
  return (
    <div 
      className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
      style={{ backgroundColor: `${stage.color}20` }}
      title={`${stage.name} - ${streak} day streak`}
    >
      {stage.emoji}
    </div>
  );
}

// Export utilities
export { getStageForStreak, getNextStage, getProgressToNextStage, STAGES };
export type { PlantStage, StageInfo };
