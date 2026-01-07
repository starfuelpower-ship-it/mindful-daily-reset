import { useState } from 'react';
import { Category, OLD_CATEGORY_CONFIG } from '@/types/habit';
import { cn } from '@/lib/utils';

const categories: (Category | 'All')[] = ['All', 'Health', 'Productivity', 'Fitness', 'Mindset', 'Custom'];

interface HabitCategoryFilterProps {
  selectedCategory: Category | 'All';
  onCategoryChange: (category: Category | 'All') => void;
}

export function HabitCategoryFilter({ selectedCategory, onCategoryChange }: HabitCategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
      {categories.map((category) => {
        const isActive = selectedCategory === category;
        const color = category === 'All' ? 'hsl(var(--primary))' : OLD_CATEGORY_CONFIG[category].color;
        
        return (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={cn(
              'flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
              'border',
              isActive
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground border-border hover:border-primary/50'
            )}
            style={isActive && category !== 'All' ? { 
              backgroundColor: color,
              borderColor: color,
            } : undefined}
          >
            {category === 'All' ? '✨ All' : `${OLD_CATEGORY_CONFIG[category].icon} ${category}`}
          </button>
        );
      })}
    </div>
  );
}
