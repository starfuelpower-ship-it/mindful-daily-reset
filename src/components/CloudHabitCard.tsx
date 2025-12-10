import { useState, useRef } from 'react';
import { CloudHabit } from '@/hooks/useCloudHabits';
import { Check, Flame, Heart, Zap, Dumbbell, Brain, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CelebrationAnimation } from './CelebrationAnimation';

interface CloudHabitCardProps {
  habit: CloudHabit;
  onToggle: (id: string) => void;
  onEdit: (habit: CloudHabit) => void;
  index: number;
  confettiEnabled?: boolean;
  soundEnabled?: boolean;
}

const categoryIcons: Record<string, React.ElementType> = {
  Health: Heart,
  Productivity: Zap,
  Fitness: Dumbbell,
  Mindset: Brain,
  Custom: Sparkles,
};

const categoryClass: Record<string, string> = {
  Health: 'category-health',
  Productivity: 'category-productivity',
  Fitness: 'category-fitness',
  Mindset: 'category-mindset',
  Custom: 'category-custom',
};

// Completion sound as a small base64 encoded success sound
const playCompletionSound = () => {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
  oscillator.frequency.setValueAtTime(1100, audioContext.currentTime + 0.1);
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.3);
};

export function CloudHabitCard({ 
  habit, 
  onToggle, 
  onEdit, 
  index,
  confettiEnabled = true,
  soundEnabled = true,
}: CloudHabitCardProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationStreak, setCelebrationStreak] = useState(0);
  const [showRipple, setShowRipple] = useState(false);
  const checkboxRef = useRef<HTMLButtonElement>(null);
  
  const CategoryIcon = categoryIcons[habit.category] || Sparkles;
  
  const customStyle = habit.color ? {
    borderColor: `${habit.color}33`,
    backgroundColor: habit.completed_today ? `${habit.color}15` : undefined,
  } : {};

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const wasCompleted = habit.completed_today;
    const newStreak = wasCompleted ? habit.streak - 1 : habit.streak + 1;
    
    // Only celebrate when completing (not uncompleting)
    if (!wasCompleted) {
      // Show ripple effect
      setShowRipple(true);
      setTimeout(() => setShowRipple(false), 600);
      
      // Play sound if enabled
      if (soundEnabled) {
        try {
          playCompletionSound();
        } catch (e) {
          // Audio context might not be available
        }
      }
      
      // Show confetti if enabled
      if (confettiEnabled) {
        setCelebrationStreak(newStreak);
        setShowCelebration(true);
      }
    }
    
    onToggle(habit.id);
  };

  const isMilestone = [7, 14, 30, 60, 100, 365].includes(celebrationStreak);

  return (
    <div
      className={cn(
        'habit-card group cursor-pointer relative overflow-hidden',
        habit.completed_today && 'completed'
      )}
      style={{ 
        animationDelay: `${index * 50}ms`,
        ...customStyle,
      }}
      onClick={() => onEdit(habit)}
    >
      {/* Celebration Animation */}
      {showCelebration && (
        <CelebrationAnimation
          type={isMilestone ? 'milestone' : 'daily'}
          streak={celebrationStreak}
          onComplete={() => setShowCelebration(false)}
        />
      )}
      
      <div className="flex items-start gap-3">
        {/* Checkbox with ripple */}
        <div className="relative">
          <button
            ref={checkboxRef}
            onClick={handleToggle}
            className={cn(
              'mt-0.5 flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300',
              habit.completed_today
                ? 'bg-primary border-primary animate-check-bounce'
                : 'border-muted-foreground/30 hover:border-primary/50 hover:scale-110'
            )}
            style={habit.color && habit.completed_today ? {
              backgroundColor: habit.color,
              borderColor: habit.color,
            } : undefined}
            aria-label={habit.completed_today ? 'Mark incomplete' : 'Mark complete'}
          >
            {habit.completed_today && (
              <Check className="w-4 h-4 text-primary-foreground" strokeWidth={3} />
            )}
          </button>
          
          {/* Ripple effect */}
          {showRipple && (
            <div 
              className="absolute inset-0 rounded-full bg-primary/30 animate-ripple"
              style={habit.color ? { backgroundColor: `${habit.color}40` } : undefined}
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className={cn(
                'font-medium text-foreground transition-all duration-300',
                habit.completed_today && 'line-through text-muted-foreground'
              )}
            >
              {habit.name}
            </h3>
            <span className={cn('category-badge flex items-center gap-1', categoryClass[habit.category])}>
              <CategoryIcon className="w-3 h-3" />
              {habit.category}
            </span>
          </div>

          {habit.notes && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {habit.notes}
            </p>
          )}

          {/* Streak */}
          {habit.streak > 0 && (
            <div className="flex items-center gap-1.5 text-sm">
              <Flame
                className={cn(
                  'w-4 h-4 transition-all duration-300',
                  habit.streak >= 30 && 'animate-streak-pulse text-destructive',
                  habit.streak >= 7 && habit.streak < 30 && 'animate-streak-pulse'
                )}
                style={{ color: habit.color || 'hsl(var(--category-fitness))' }}
              />
              <span className={cn(
                'text-muted-foreground transition-all duration-300',
                habit.streak >= 7 && 'font-medium',
                habit.streak >= 30 && 'text-primary font-semibold'
              )}>
                {habit.streak} day{habit.streak !== 1 ? 's' : ''} streak
                {habit.streak >= 30 && ' 🔥'}
                {habit.streak >= 7 && habit.streak < 30 && ' ⭐'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
