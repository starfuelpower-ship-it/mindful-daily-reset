import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Info, Sparkles } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// ============================================
// PLANT GROWTH SYSTEM - Evolution Stages
// ============================================
// Visual progression based on total habit completions
// Stages evolve as user builds consistency over time

interface PlantGrowthProps {
  totalCompletions: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showProgress?: boolean;
  animate?: boolean;
  onLevelUp?: (newStage: PlantStage, stageName: string) => void;
}

export type PlantStage = 'seed' | 'sprout' | 'small-plant' | 'blooming-plant' | 'cozy-tree';

export interface StageInfo {
  stage: PlantStage;
  level: number;
  name: string;
  description: string;
  minCompletions: number;
  color: string;
}

export const STAGES: StageInfo[] = [
  { 
    stage: 'seed', 
    level: 1,
    name: 'Growth Seed', 
    description: 'Your journey begins here',
    minCompletions: 0, 
    color: 'hsl(30, 60%, 45%)' 
  },
  { 
    stage: 'sprout', 
    level: 2,
    name: 'Tender Sprout', 
    description: 'Breaking through the soil',
    minCompletions: 15, 
    color: 'hsl(120, 50%, 50%)' 
  },
  { 
    stage: 'small-plant', 
    level: 3,
    name: 'Young Plant', 
    description: 'Growing stronger each day',
    minCompletions: 50, 
    color: 'hsl(130, 55%, 45%)' 
  },
  { 
    stage: 'blooming-plant', 
    level: 4,
    name: 'Blooming Plant', 
    description: 'Flourishing with care',
    minCompletions: 150, 
    color: 'hsl(140, 60%, 40%)' 
  },
  { 
    stage: 'cozy-tree', 
    level: 5,
    name: 'Cozy Tree', 
    description: 'A symbol of dedication',
    minCompletions: 365, 
    color: 'hsl(150, 50%, 35%)' 
  },
];

export function getStageForCompletions(completions: number): StageInfo {
  for (let i = STAGES.length - 1; i >= 0; i--) {
    if (completions >= STAGES[i].minCompletions) {
      return STAGES[i];
    }
  }
  return STAGES[0];
}

export function getNextStage(currentStage: PlantStage): StageInfo | null {
  const currentIndex = STAGES.findIndex(s => s.stage === currentStage);
  if (currentIndex < STAGES.length - 1) {
    return STAGES[currentIndex + 1];
  }
  return null;
}

export function getCompletionsToNextStage(totalCompletions: number): number {
  const nextStage = getNextStage(getStageForCompletions(totalCompletions).stage);
  if (!nextStage) return 0;
  return nextStage.minCompletions - totalCompletions;
}

export function getProgressToNextStage(completions: number): number {
  const currentStage = getStageForCompletions(completions);
  const nextStage = getNextStage(currentStage.stage);
  
  if (!nextStage) return 100;
  
  const progressInStage = completions - currentStage.minCompletions;
  const stageRange = nextStage.minCompletions - currentStage.minCompletions;
  
  return Math.min(100, (progressInStage / stageRange) * 100);
}

// Plant SVG Components for each stage
const SeedSVG = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className}>
    {/* Soil */}
    <ellipse cx="32" cy="52" rx="20" ry="6" fill="hsl(25, 40%, 30%)" />
    {/* Seed */}
    <ellipse cx="32" cy="44" rx="8" ry="10" fill="hsl(30, 50%, 40%)" />
    <ellipse cx="30" cy="42" rx="2" ry="3" fill="hsl(30, 40%, 50%)" opacity="0.5" />
    {/* Crack hint */}
    <path d="M32 38 L32 42 L34 44" stroke="hsl(30, 60%, 35%)" strokeWidth="1.5" fill="none" />
  </svg>
);

const SproutSVG = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className}>
    {/* Soil */}
    <ellipse cx="32" cy="54" rx="18" ry="5" fill="hsl(25, 40%, 30%)" />
    {/* Stem */}
    <path d="M32 54 Q32 44 32 38" stroke="hsl(120, 45%, 40%)" strokeWidth="3" fill="none" strokeLinecap="round" />
    {/* First leaves */}
    <ellipse cx="26" cy="36" rx="6" ry="4" fill="hsl(120, 50%, 50%)" transform="rotate(-30 26 36)" />
    <ellipse cx="38" cy="36" rx="6" ry="4" fill="hsl(120, 50%, 50%)" transform="rotate(30 38 36)" />
    {/* Leaf veins */}
    <path d="M24 36 L28 36" stroke="hsl(120, 40%, 40%)" strokeWidth="0.5" />
    <path d="M36 36 L40 36" stroke="hsl(120, 40%, 40%)" strokeWidth="0.5" />
  </svg>
);

const SmallPlantSVG = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className}>
    {/* Pot */}
    <path d="M20 52 L24 60 L40 60 L44 52 Z" fill="hsl(15, 50%, 45%)" />
    <rect x="18" y="50" width="28" height="4" rx="1" fill="hsl(15, 55%, 50%)" />
    {/* Stem */}
    <path d="M32 50 Q32 40 32 28" stroke="hsl(130, 50%, 40%)" strokeWidth="3" fill="none" strokeLinecap="round" />
    {/* Leaves */}
    <ellipse cx="24" cy="38" rx="8" ry="5" fill="hsl(130, 55%, 50%)" transform="rotate(-40 24 38)" />
    <ellipse cx="40" cy="38" rx="8" ry="5" fill="hsl(130, 55%, 50%)" transform="rotate(40 40 38)" />
    <ellipse cx="26" cy="28" rx="7" ry="4" fill="hsl(130, 50%, 55%)" transform="rotate(-25 26 28)" />
    <ellipse cx="38" cy="28" rx="7" ry="4" fill="hsl(130, 50%, 55%)" transform="rotate(25 38 28)" />
    {/* Top leaves */}
    <ellipse cx="32" cy="20" rx="5" ry="8" fill="hsl(130, 55%, 45%)" />
  </svg>
);

const BloomingPlantSVG = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className}>
    {/* Pot */}
    <path d="M20 52 L24 60 L40 60 L44 52 Z" fill="hsl(15, 50%, 45%)" />
    <rect x="18" y="50" width="28" height="4" rx="1" fill="hsl(15, 55%, 50%)" />
    {/* Stem */}
    <path d="M32 50 Q32 38 32 22" stroke="hsl(140, 50%, 38%)" strokeWidth="4" fill="none" strokeLinecap="round" />
    {/* Large leaves */}
    <ellipse cx="22" cy="42" rx="10" ry="6" fill="hsl(140, 55%, 45%)" transform="rotate(-45 22 42)" />
    <ellipse cx="42" cy="42" rx="10" ry="6" fill="hsl(140, 55%, 45%)" transform="rotate(45 42 42)" />
    <ellipse cx="20" cy="32" rx="9" ry="5" fill="hsl(140, 50%, 50%)" transform="rotate(-30 20 32)" />
    <ellipse cx="44" cy="32" rx="9" ry="5" fill="hsl(140, 50%, 50%)" transform="rotate(30 44 32)" />
    {/* Flowers */}
    <circle cx="32" cy="14" r="6" fill="hsl(340, 70%, 70%)" />
    <circle cx="32" cy="14" r="3" fill="hsl(45, 90%, 60%)" />
    <circle cx="24" cy="22" r="4" fill="hsl(300, 60%, 75%)" />
    <circle cx="24" cy="22" r="2" fill="hsl(45, 90%, 60%)" />
    <circle cx="40" cy="22" r="4" fill="hsl(200, 60%, 70%)" />
    <circle cx="40" cy="22" r="2" fill="hsl(45, 90%, 60%)" />
  </svg>
);

const CozyTreeSVG = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className}>
    {/* Ground */}
    <ellipse cx="32" cy="58" rx="22" ry="4" fill="hsl(25, 40%, 35%)" />
    {/* Trunk */}
    <rect x="28" y="40" width="8" height="18" rx="2" fill="hsl(25, 45%, 35%)" />
    <rect x="30" y="42" width="2" height="14" fill="hsl(25, 35%, 45%)" opacity="0.5" />
    {/* Canopy layers */}
    <ellipse cx="32" cy="32" rx="22" ry="16" fill="hsl(150, 50%, 40%)" />
    <ellipse cx="32" cy="28" rx="18" ry="12" fill="hsl(150, 55%, 45%)" />
    <ellipse cx="32" cy="24" rx="14" ry="10" fill="hsl(150, 60%, 50%)" />
    <ellipse cx="32" cy="20" rx="10" ry="8" fill="hsl(150, 55%, 55%)" />
    {/* Highlights */}
    <ellipse cx="26" cy="22" rx="4" ry="3" fill="hsl(150, 50%, 60%)" opacity="0.6" />
    <ellipse cx="38" cy="30" rx="5" ry="4" fill="hsl(150, 50%, 60%)" opacity="0.4" />
    {/* Small details */}
    <circle cx="22" cy="34" r="2" fill="hsl(340, 60%, 70%)" />
    <circle cx="42" cy="30" r="2" fill="hsl(340, 60%, 70%)" />
    <circle cx="30" cy="18" r="1.5" fill="hsl(45, 80%, 65%)" />
  </svg>
);

const PLANT_COMPONENTS: Record<PlantStage, React.FC<{ className?: string }>> = {
  'seed': SeedSVG,
  'sprout': SproutSVG,
  'small-plant': SmallPlantSVG,
  'blooming-plant': BloomingPlantSVG,
  'cozy-tree': CozyTreeSVG,
};

export function PlantGrowth({ 
  totalCompletions, 
  size = 'md', 
  showLabel = true, 
  showProgress = true,
  animate = true,
  onLevelUp 
}: PlantGrowthProps) {
  const [showGrowthAnimation, setShowGrowthAnimation] = useState(false);
  const previousStageRef = useRef<PlantStage | null>(null);
  
  const currentStageInfo = getStageForCompletions(totalCompletions);
  const nextStage = getNextStage(currentStageInfo.stage);
  const progress = getProgressToNextStage(totalCompletions);
  const completionsToNext = getCompletionsToNextStage(totalCompletions);
  
  // Detect stage changes for animation and callback
  useEffect(() => {
    if (previousStageRef.current && previousStageRef.current !== currentStageInfo.stage && animate) {
      setShowGrowthAnimation(true);
      onLevelUp?.(currentStageInfo.stage, currentStageInfo.name);
      const timer = setTimeout(() => setShowGrowthAnimation(false), 2000);
      return () => clearTimeout(timer);
    }
    previousStageRef.current = currentStageInfo.stage;
  }, [currentStageInfo.stage, currentStageInfo.name, animate, onLevelUp]);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const PlantComponent = PLANT_COMPONENTS[currentStageInfo.stage];

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Plant Container */}
      <div 
        className={cn(
          'relative rounded-3xl bg-gradient-to-b from-accent/30 to-accent/10 flex items-center justify-center p-2',
          showGrowthAnimation && 'animate-growth-burst'
        )}
      >
        {/* Glow effect during growth */}
        {showGrowthAnimation && (
          <div className="absolute inset-0 rounded-3xl bg-primary/30 animate-pulse" />
        )}
        
        {/* Sparkles during growth */}
        {showGrowthAnimation && (
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <Sparkles
                key={i}
                className="absolute w-4 h-4 text-yellow-400 animate-ping"
                style={{
                  left: `${10 + Math.random() * 80}%`,
                  top: `${10 + Math.random() * 80}%`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: '1s',
                }}
              />
            ))}
          </div>
        )}
        
        {/* Plant SVG */}
        <div 
          className={cn(
            sizeClasses[size],
            'transition-transform duration-500',
            showGrowthAnimation && 'scale-110'
          )}
        >
          <PlantComponent className="w-full h-full" />
        </div>
      </div>

      {/* Stage Label */}
      {showLabel && (
        <div className="text-center space-y-0.5">
          <div className="flex items-center justify-center gap-1.5">
            <p className="font-semibold text-foreground text-sm">
              {currentStageInfo.name}
            </p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="text-muted-foreground hover:text-foreground transition-colors">
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[250px] text-center">
                  <p className="font-medium mb-1">🌱 Plant Evolution</p>
                  <p className="text-xs text-muted-foreground">
                    Complete your daily habits to help your plant grow. As you build consistency, 
                    it will evolve from a seed to a sprout, young plant, blooming plant, and finally a cozy tree!
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-xs text-muted-foreground">
            Level {currentStageInfo.level} • {totalCompletions} completions
          </p>
        </div>
      )}

      {/* Progress to next stage */}
      {showProgress && nextStage && (
        <div className="w-full max-w-[140px] space-y-1">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground text-center">
            {completionsToNext} more to evolve → {nextStage.name}
          </p>
        </div>
      )}

      {/* Max stage message */}
      {showProgress && !nextStage && (
        <div className="flex items-center gap-1 text-xs text-primary font-medium">
          <Sparkles className="w-3 h-3" />
          <span>Fully Evolved!</span>
          <Sparkles className="w-3 h-3" />
        </div>
      )}
    </div>
  );
}

// Compact badge version for display elsewhere
export function PlantBadge({ totalCompletions }: { totalCompletions: number }) {
  const stage = getStageForCompletions(totalCompletions);
  const PlantComponent = PLANT_COMPONENTS[stage.stage];
  
  return (
    <div 
      className="w-10 h-10 rounded-xl flex items-center justify-center bg-accent/20"
      title={`${stage.name} - Level ${stage.level}`}
    >
      <PlantComponent className="w-8 h-8" />
    </div>
  );
}

// Export for backwards compatibility
export { getStageForCompletions as getStageForStreak };
