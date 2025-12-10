export type Category = 'Health' | 'Productivity' | 'Fitness' | 'Mindset' | 'Custom';

export interface Habit {
  id: string;
  name: string;
  category: Category;
  notes: string;
  completedToday: boolean;
  streak: number;
  lastCompletedDate: string | null;
  createdAt: string;
}
