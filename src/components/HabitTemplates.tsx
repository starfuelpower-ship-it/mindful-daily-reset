import { Category, OLD_CATEGORY_CONFIG } from '@/types/habit';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface HabitTemplate {
  name: string;
  category: Category;
  icon: string;
  description: string;
}

export const HABIT_TEMPLATES: HabitTemplate[] = [
  // Health
  { name: 'Drink 8 glasses of water', category: 'Health', icon: 'droplet', description: 'Stay hydrated throughout the day' },
  { name: 'Sleep 8 hours', category: 'Health', icon: 'moon', description: 'Get quality rest for recovery' },
  { name: 'Take vitamins', category: 'Health', icon: 'pill', description: 'Daily vitamin routine' },
  
  // Fitness
  { name: 'Morning workout', category: 'Fitness', icon: 'dumbbell', description: '30 minutes of exercise' },
  { name: 'Walk 10,000 steps', category: 'Fitness', icon: 'footprints', description: 'Stay active throughout the day' },
  { name: 'Stretch routine', category: 'Fitness', icon: 'activity', description: '10 minutes of stretching' },
  
  // Productivity
  { name: 'Plan my day', category: 'Productivity', icon: 'calendar', description: 'Set daily priorities each morning' },
  { name: 'Read 30 minutes', category: 'Productivity', icon: 'book-open', description: 'Learn something new daily' },
  { name: 'Deep work session', category: 'Productivity', icon: 'target', description: '2 hours of focused work' },
  
  // Mindset
  { name: 'Morning meditation', category: 'Mindset', icon: 'heart', description: '10 minutes of mindfulness' },
  { name: 'Practice gratitude', category: 'Mindset', icon: 'sparkles', description: 'Write 3 things you\'re grateful for' },
  { name: 'Journal thoughts', category: 'Mindset', icon: 'pencil', description: 'Reflect on your day' },
];

interface HabitTemplatesProps {
  onSelect: (template: HabitTemplate) => void;
}

export function HabitTemplates({ onSelect }: HabitTemplatesProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Quick start with a template:</p>
      <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
        {HABIT_TEMPLATES.map((template) => (
          <button
            key={template.name}
            onClick={() => onSelect(template)}
            className={cn(
              'flex items-center gap-3 p-3 rounded-xl text-left transition-all',
              'bg-card border border-border/50 hover:border-primary/50 hover:bg-muted/50'
            )}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
              style={{ backgroundColor: OLD_CATEGORY_CONFIG[template.category].color + '20' }}
            >
              {OLD_CATEGORY_CONFIG[template.category].icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground truncate">{template.name}</p>
              <p className="text-xs text-muted-foreground truncate">{template.description}</p>
            </div>
            <Badge variant="secondary" className="text-xs shrink-0">
              {template.category}
            </Badge>
          </button>
        ))}
      </div>
    </div>
  );
}
