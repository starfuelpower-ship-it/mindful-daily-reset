import { CloudHabit } from '@/hooks/useCloudHabits';
import { Check, Flame, Heart, Zap, Dumbbell, Brain, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CloudHabitCardProps {
  habit: CloudHabit;
  onToggle: (id: string) => void;
  onEdit: (habit: CloudHabit) => void;
  index: number;
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

export function CloudHabitCard({ habit, onToggle, onEdit, index }: CloudHabitCardProps) {
  const CategoryIcon = categoryIcons[habit.category] || Sparkles;
  
  const customStyle = habit.color ? {
    borderColor: `${habit.color}33`,
    backgroundColor: habit.completed_today ? `${habit.color}15` : undefined,
  } : {};

  return (
    <div
      className={cn(
        'habit-card group cursor-pointer',
        habit.completed_today && 'completed'
      )}
      style={{ 
        animationDelay: `${index * 50}ms`,
        ...customStyle,
      }}
      onClick={() => onEdit(habit)}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle(habit.id);
          }}
          className={cn(
            'mt-0.5 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300',
            habit.completed_today
              ? 'bg-primary border-primary animate-check-bounce'
              : 'border-muted-foreground/30 hover:border-primary/50'
          )}
          style={habit.color && habit.completed_today ? {
            backgroundColor: habit.color,
            borderColor: habit.color,
          } : undefined}
          aria-label={habit.completed_today ? 'Mark incomplete' : 'Mark complete'}
        >
          {habit.completed_today && (
            <Check className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={3} />
          )}
        </button>

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
                  'w-4 h-4',
                  habit.streak >= 7 && 'animate-streak-pulse'
                )}
                style={{ color: habit.color || 'hsl(var(--category-fitness))' }}
              />
              <span className="text-muted-foreground">
                {habit.streak} day{habit.streak !== 1 ? 's' : ''} streak
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
