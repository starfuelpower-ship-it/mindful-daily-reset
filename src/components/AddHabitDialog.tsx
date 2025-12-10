import { useState } from 'react';
import { Category } from '@/types/habit';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const categories: Category[] = ['Health', 'Productivity', 'Fitness', 'Mindset', 'Custom'];

interface AddHabitDialogProps {
  onAdd: (name: string, category: Category, notes: string) => void;
}

export function AddHabitDialog({ onAdd }: AddHabitDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Health');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd(name.trim(), category, notes.trim());
    setName('');
    setCategory('Health');
    setNotes('');
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setName('');
      setCategory('Health');
      setNotes('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="w-full gap-2 h-12 text-base rounded-xl shadow-soft-sm">
          <Plus className="w-5 h-5" />
          Add Habit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md mx-4 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Add New Habit</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-2">
            <label htmlFor="habit-name" className="text-sm font-medium text-foreground">
              Habit Name
            </label>
            <Input
              id="habit-name"
              placeholder="e.g., Morning meditation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-11 rounded-xl"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium text-foreground">
              Category
            </label>
            <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="rounded-lg">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium text-foreground">
              Notes (optional)
            </label>
            <Textarea
              id="notes"
              placeholder="Add any notes or reminders..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[80px] rounded-xl resize-none"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base rounded-xl"
            disabled={!name.trim()}
          >
            Save Habit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
