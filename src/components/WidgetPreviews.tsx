import { Lock, Flame, Leaf, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { usePremium } from '@/contexts/PremiumContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WidgetProps {
  className?: string;
}

// Small Widget - Next Habit
const SmallWidget = ({ className }: WidgetProps) => (
  <div className={cn(
    "w-[158px] h-[158px] rounded-[22px] p-3 flex flex-col justify-between",
    "bg-gradient-to-br from-card via-card to-muted/50 shadow-lg border border-border/30",
    className
  )}>
    <div className="flex items-center justify-between">
      <span className="text-2xl">🏃</span>
      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
    </div>
    <div className="space-y-1">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Next Up</p>
      <p className="text-sm font-semibold text-foreground leading-tight">Morning Run</p>
      <p className="text-xs text-primary font-medium">Due in 2h</p>
    </div>
  </div>
);

// Medium Widget - Today's Progress
const MediumWidget = ({ className }: WidgetProps) => (
  <div className={cn(
    "w-[338px] h-[158px] rounded-[22px] p-4 flex flex-col justify-between",
    "bg-gradient-to-br from-card via-card to-muted/50 shadow-lg border border-border/30",
    className
  )}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Today's Progress</p>
        <p className="text-lg font-bold text-foreground">5 of 7 habits</p>
      </div>
      <div className="relative w-14 h-14">
        <svg className="w-14 h-14 -rotate-90">
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="6"
          />
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="6"
            strokeDasharray={`${(5/7) * 150.8} 150.8`}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">
          71%
        </span>
      </div>
    </div>
    <div className="flex gap-1.5">
      {[true, true, true, true, true, false, false].map((done, i) => (
        <div 
          key={i} 
          className={cn(
            "flex-1 h-2 rounded-full",
            done ? "bg-primary" : "bg-muted"
          )} 
        />
      ))}
    </div>
  </div>
);

// Large Widget - Streak and Plant
const LargeWidget = ({ className }: WidgetProps) => (
  <div className={cn(
    "w-[338px] h-[338px] rounded-[22px] p-5 flex flex-col justify-between",
    "bg-gradient-to-br from-card via-card to-muted/50 shadow-lg border border-border/30",
    className
  )}>
    <div>
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Cozy Habits</p>
      <p className="text-xl font-bold text-foreground mt-1">Your Progress</p>
    </div>
    
    {/* Plant illustration */}
    <div className="flex-1 flex items-center justify-center">
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
          <Leaf className="w-12 h-12 text-primary" />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent flex items-center justify-center">
          <span className="text-lg">✨</span>
        </div>
      </div>
    </div>

    {/* Stats row */}
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-muted/50 rounded-xl p-3 text-center">
        <div className="flex items-center justify-center gap-1 text-primary">
          <Flame className="w-4 h-4" />
          <span className="font-bold text-lg">12</span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">Day Streak</p>
      </div>
      <div className="bg-muted/50 rounded-xl p-3 text-center">
        <div className="flex items-center justify-center gap-1 text-primary">
          <CheckCircle2 className="w-4 h-4" />
          <span className="font-bold text-lg">85%</span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">This Week</p>
      </div>
      <div className="bg-muted/50 rounded-xl p-3 text-center">
        <div className="flex items-center justify-center gap-1 text-primary">
          <TrendingUp className="w-4 h-4" />
          <span className="font-bold text-lg">21</span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">Best Streak</p>
      </div>
    </div>
  </div>
);

// Widget with premium lock overlay
const LockedWidget = ({ 
  children, 
  size 
}: { 
  children: React.ReactNode; 
  size: 'small' | 'medium' | 'large';
}) => {
  const { isPremium } = usePremium();
  const navigate = useNavigate();

  if (isPremium) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="opacity-60 blur-[2px] pointer-events-none">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/40 backdrop-blur-[1px] rounded-[22px]">
        <Lock className="w-6 h-6 text-muted-foreground mb-2" />
        <p className="text-xs text-muted-foreground font-medium mb-2">Premium</p>
        <Button
          size="sm"
          variant="secondary"
          className="h-7 text-xs px-3"
          onClick={() => navigate('/premium')}
        >
          Unlock
        </Button>
      </div>
    </div>
  );
};

export const WidgetPreviews = () => {
  const { isPremium } = usePremium();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">Home Screen Widgets</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Add widgets to your home screen for quick access
        </p>
      </div>

      {/* Small Widget */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Small</span>
          <span className="text-xs text-muted-foreground">• Next Habit</span>
        </div>
        <div className="flex justify-center">
          <LockedWidget size="small">
            <SmallWidget />
          </LockedWidget>
        </div>
      </div>

      {/* Medium Widget */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Medium</span>
          <span className="text-xs text-muted-foreground">• Today's Progress</span>
        </div>
        <div className="flex justify-center overflow-x-auto pb-2 -mx-4 px-4">
          <LockedWidget size="medium">
            <MediumWidget />
          </LockedWidget>
        </div>
      </div>

      {/* Large Widget */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Large</span>
          <span className="text-xs text-muted-foreground">• Streak & Plant</span>
        </div>
        <div className="flex justify-center overflow-x-auto pb-2 -mx-4 px-4">
          <LockedWidget size="large">
            <LargeWidget />
          </LockedWidget>
        </div>
      </div>

      {/* Instructions / CTA */}
      {isPremium ? (
        <div className="bg-primary/10 rounded-xl p-4 text-center">
          <p className="text-sm text-foreground font-medium">
            Add widgets via your phone's widget gallery
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Long press your home screen → Add Widget → Cozy Habits
          </p>
        </div>
      ) : (
        <div className="bg-muted rounded-xl p-4 text-center">
          <p className="text-sm text-foreground font-medium mb-3">
            Unlock all widgets with Premium
          </p>
          <Button onClick={() => navigate('/premium')} className="w-full">
            Go Premium
          </Button>
        </div>
      )}
    </div>
  );
};
