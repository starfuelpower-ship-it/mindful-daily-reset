import { Flame, Leaf, CheckCircle2, Heart, Sparkles, Cat } from 'lucide-react';
import { useAchievements } from '@/hooks/useAchievements';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface WidgetProps {
  className?: string;
}

// Breathing animation style for gentle glow effect
const breathingGlow = "animate-[pulse_4s_ease-in-out_infinite]";

// Small Widget - Next Habit (cozy, warm tone)
const SmallWidget = ({ className }: WidgetProps) => (
  <div className={cn(
    "w-[158px] h-[158px] rounded-[22px] p-3 flex flex-col justify-between relative overflow-hidden",
    "bg-gradient-to-br from-card via-card to-muted/50 shadow-lg border border-border/30",
    className
  )}>
    {/* Subtle ambient glow */}
    <div className={cn(
      "absolute -top-8 -right-8 w-24 h-24 rounded-full bg-primary/10 blur-2xl",
      breathingGlow
    )} />
    
    <div className="flex items-center justify-between relative z-10">
      <span className="text-2xl">🌅</span>
      <Heart className="w-3.5 h-3.5 text-primary/60" />
    </div>
    <div className="space-y-1 relative z-10">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Waiting for you</p>
      <p className="text-sm font-semibold text-foreground leading-tight">Morning Walk</p>
      <p className="text-xs text-primary/80 font-medium">Ready when you are</p>
    </div>
  </div>
);

// Medium Widget - Today's Progress (warm, encouraging)
const MediumWidget = ({ className }: WidgetProps) => (
  <div className={cn(
    "w-[338px] h-[158px] rounded-[22px] p-4 flex flex-col justify-between relative overflow-hidden",
    "bg-gradient-to-br from-card via-card to-muted/50 shadow-lg border border-border/30",
    className
  )}>
    {/* Subtle ambient particles */}
    <div className={cn(
      "absolute top-4 right-16 w-2 h-2 rounded-full bg-primary/30",
      breathingGlow
    )} />
    <div className={cn(
      "absolute bottom-8 right-8 w-1.5 h-1.5 rounded-full bg-amber-400/40 animate-[pulse_5s_ease-in-out_infinite]"
    )} />
    
    <div className="flex items-center justify-between relative z-10">
      <div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">You showed up today</p>
        <p className="text-lg font-bold text-foreground">5 of 7 completed</p>
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
            className="transition-all duration-1000"
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </span>
      </div>
    </div>
    <div className="flex gap-1.5 relative z-10">
      {[true, true, true, true, true, false, false].map((done, i) => (
        <div 
          key={i} 
          className={cn(
            "flex-1 h-2 rounded-full transition-all duration-500",
            done ? "bg-primary" : "bg-muted"
          )} 
        />
      ))}
    </div>
  </div>
);

// Large Widget - Streak and Plant (alive, cozy)
const LargeWidget = ({ className }: WidgetProps) => (
  <div className={cn(
    "w-[338px] h-[338px] rounded-[22px] p-5 flex flex-col justify-between relative overflow-hidden",
    "bg-gradient-to-br from-card via-card to-muted/50 shadow-lg border border-border/30",
    className
  )}>
    {/* Ambient glow behind plant */}
    <div className={cn(
      "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-primary/5 blur-3xl",
      breathingGlow
    )} />
    
    <div className="relative z-10">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Cozy Habits</p>
      <p className="text-xl font-bold text-foreground mt-1">Still growing together</p>
    </div>
    
    {/* Plant illustration with subtle animation */}
    <div className="flex-1 flex items-center justify-center relative z-10">
      <div className="relative">
        <div className={cn(
          "w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center",
          "animate-[pulse_6s_ease-in-out_infinite]"
        )}>
          <Leaf className="w-12 h-12 text-primary" />
        </div>
        {/* Cat peeking */}
        <div className={cn(
          "absolute -bottom-1 -right-3 w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center",
          "animate-[bounce_3s_ease-in-out_infinite]"
        )} style={{ animationDuration: '4s' }}>
          <Cat className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className={cn(
          "absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent flex items-center justify-center",
          breathingGlow
        )}>
          <span className="text-lg">✨</span>
        </div>
      </div>
    </div>

    {/* Stats row */}
    <div className="grid grid-cols-3 gap-3 relative z-10">
      <div className="bg-muted/50 rounded-xl p-3 text-center">
        <div className="flex items-center justify-center gap-1 text-primary">
          <Flame className="w-4 h-4" />
          <span className="font-bold text-lg">12</span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">Days together</p>
      </div>
      <div className="bg-muted/50 rounded-xl p-3 text-center">
        <div className="flex items-center justify-center gap-1 text-primary">
          <CheckCircle2 className="w-4 h-4" />
          <span className="font-bold text-lg">85%</span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">This week</p>
      </div>
      <div className="bg-muted/50 rounded-xl p-3 text-center">
        <div className="flex items-center justify-center gap-1 text-primary">
          <Heart className="w-4 h-4" />
          <span className="font-bold text-lg">21</span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">Best streak</p>
      </div>
    </div>
  </div>
);

// Widget preview card - no longer locked behind premium since it's just a preview
const PreviewWidget = ({ 
  children, 
}: { 
  children: React.ReactNode; 
}) => {
  return (
    <div className="relative">
      {children}
      {/* Preview badge overlay */}
      <div className="absolute top-2 right-2 bg-muted/90 backdrop-blur-sm text-xs font-medium px-2 py-0.5 rounded-full text-muted-foreground">
        Preview
      </div>
    </div>
  );
};

export const WidgetPreviews = () => {
  const { checkAndAwardAchievements } = useAchievements();

  // Award achievement for visiting widgets page
  useEffect(() => {
    checkAndAwardAchievements({ widgetsViewed: true });
  }, [checkAndAwardAchievements]);

  const handleWidgetTap = () => {
    toast("Widgets are not available yet — coming soon! 🚧", {
      description: "We're working on real Android home screen widgets.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with warm copy */}
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">Widget Design Previews</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Here's what we're planning for home screen widgets
        </p>
      </div>

      {/* Small Widget */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Small</span>
          <span className="text-xs text-muted-foreground">• A gentle reminder</span>
        </div>
        <div className="flex justify-center" onClick={handleWidgetTap}>
          <PreviewWidget>
            <SmallWidget />
          </PreviewWidget>
        </div>
      </div>

      {/* Medium Widget */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Medium</span>
          <span className="text-xs text-muted-foreground">• See your progress</span>
        </div>
        <div className="flex justify-center overflow-x-auto pb-2 -mx-4 px-4" onClick={handleWidgetTap}>
          <PreviewWidget>
            <MediumWidget />
          </PreviewWidget>
        </div>
      </div>

      {/* Large Widget */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">Large</span>
          <span className="text-xs text-muted-foreground">• Your cozy companion</span>
        </div>
        <div className="flex justify-center overflow-x-auto pb-2 -mx-4 px-4" onClick={handleWidgetTap}>
          <PreviewWidget>
            <LargeWidget />
          </PreviewWidget>
        </div>
      </div>

      {/* Coming Soon CTA */}
      <div className="bg-muted/50 rounded-xl p-4 text-center border border-border/50">
        <p className="text-sm text-foreground font-medium mb-1">
          🎯 Feature in Development
        </p>
        <p className="text-xs text-muted-foreground">
          Real Android home screen widgets are coming soon. We'll notify you when they're ready!
        </p>
      </div>
    </div>
  );
};
