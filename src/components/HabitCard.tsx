import { Habit } from '@/types/habit';
import { Check, Flame, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HabitCardProps {
  habit: Habit;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  index: number;
}

const categoryClass: Record<string, string> = {
  Health: 'category-health',
  Productivity: 'category-productivity',
  Fitness: 'category-fitness',
  Mindset: 'category-mindset',
  Custom: 'category-custom',
};

export function HabitCard({ habit, onToggle, onDelete, index }: HabitCardProps) {
  return (
    <div
      className={cn(
        'habit-card group',
        habit.completedToday && 'completed'
      )}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={() => onToggle(habit.id)}
          className={cn(
            'mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300',
            habit.completedToday
              ? 'bg-primary border-primary animate-check-bounce'
              : 'border-muted-foreground/30 hover:border-primary/50'
          )}
          aria-label={habit.completedToday ? 'Mark incomplete' : 'Mark complete'}
        >
          {habit.completedToday && (
            <Check className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={3} />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3
              className={cn(
                'font-medium text-foreground transition-all duration-300',
                habit.completedToday && 'line-through text-muted-foreground'
              )}
            >
              {habit.name}
            </h3>
            <span className={cn('category-badge', categoryClass[habit.category])}>
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
                  'w-4 h-4 text-category-fitness',
                  habit.streak >= 7 && 'animate-streak-pulse'
                )}
              />
              <span className="text-muted-foreground">
                {habit.streak} day{habit.streak !== 1 ? 's' : ''} streak
              </span>
            </div>
          )}
        </div>

        {/* Delete button */}
        <button
          onClick={() => onDelete(habit.id)}
          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all duration-200"
          aria-label="Delete habit"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
