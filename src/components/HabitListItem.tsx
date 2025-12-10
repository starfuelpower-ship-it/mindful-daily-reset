import { useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Habit, OLD_CATEGORY_CONFIG } from '@/types/habit';
import { ConfettiAnimation } from './ConfettiAnimation';

// ============================================
// HABIT LIST ITEM
// ============================================
// Individual habit card with completion toggle
// Customize: Modify the card design, animations, or add more info

interface HabitListItemProps {
  habit: Habit;
  completed: boolean;
  streak: number;
  onToggle: () => void;
  onClick: () => void;
  confettiEnabled?: boolean;
  soundEnabled?: boolean;
}

export function HabitListItem({
  habit,
  completed,
  streak,
  onToggle,
  onClick,
  confettiEnabled = true,
  soundEnabled = true,
}: HabitListItemProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const categoryConfig = OLD_CATEGORY_CONFIG[habit.category];
  const categoryColor = categoryConfig?.color || OLD_CATEGORY_CONFIG.Custom.color;
  const icon = habit.icon || categoryConfig?.icon || '✅';

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!completed) {
      setIsAnimating(true);
      if (confettiEnabled) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }
      if (soundEnabled) {
        // Play completion sound
        const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      }
      setTimeout(() => setIsAnimating(false), 300);
    }
    
    onToggle();
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'ios-card p-4 cursor-pointer transition-all duration-200 hover:shadow-elevated',
        completed && 'opacity-75'
      )}
    >
      {showConfetti && <ConfettiAnimation />}
      
      <div className="flex items-center gap-4">
        {/* Completion checkbox */}
        <button
          onClick={handleToggle}
          className={cn(
            'habit-checkbox',
            completed && 'checked',
            isAnimating && 'animate-check-bounce'
          )}
          style={{
            borderColor: completed ? categoryColor : undefined,
            backgroundColor: completed ? categoryColor : undefined,
          }}
        >
          {completed && (
            <Check className="w-4 h-4 text-white" strokeWidth={3} />
          )}
        </button>

        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ backgroundColor: `${categoryColor}20` }}
        >
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              'font-semibold text-foreground truncate',
              completed && 'line-through text-muted-foreground'
            )}
          >
            {habit.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {streak > 0 ? (
              <span className={cn(streak > 0 && 'text-primary font-medium')}>
                🔥 {streak} day streak
              </span>
            ) : (
              <span>Start your streak today!</span>
            )}
          </p>
        </div>

        {/* Category badge */}
        <div
          className="px-2 py-1 rounded-full text-xs font-medium text-white"
          style={{ backgroundColor: categoryColor }}
        >
          {habit.category}
        </div>
      </div>
    </div>
  );
}
