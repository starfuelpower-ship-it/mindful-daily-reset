import { useState } from 'react';
import { CloudHabit } from '@/hooks/useCloudHabits';
import { usePremium } from '@/contexts/PremiumContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Crown, Trash2 } from 'lucide-react';

const categories = ['Health', 'Productivity', 'Fitness', 'Mindset', 'Custom'] as const;

const habitColors = [
  { name: 'Default', value: '' },
  { name: 'Rose', value: 'hsl(350, 60%, 55%)' },
  { name: 'Orange', value: 'hsl(25, 80%, 55%)' },
  { name: 'Yellow', value: 'hsl(45, 80%, 50%)' },
  { name: 'Teal', value: 'hsl(175, 60%, 45%)' },
  { name: 'Blue', value: 'hsl(220, 70%, 55%)' },
  { name: 'Purple', value: 'hsl(280, 60%, 55%)' },
];

interface EditHabitDialogProps {
  habit: CloudHabit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, updates: Partial<Pick<CloudHabit, 'name' | 'category' | 'notes' | 'color'>>) => void;
  onDelete: (id: string) => void;
}

export function EditHabitDialog({ 
  habit, 
  open, 
  onOpenChange, 
  onUpdate, 
  onDelete 
}: EditHabitDialogProps) {
  const { isPremium } = usePremium();
  const [name, setName] = useState(habit?.name || '');
  const [category, setCategory] = useState(habit?.category || 'Custom');
  const [notes, setNotes] = useState(habit?.notes || '');
  const [color, setColor] = useState(habit?.color || '');

  // Reset form when habit changes
  useState(() => {
    if (habit) {
      setName(habit.name);
      setCategory(habit.category);
      setNotes(habit.notes || '');
      setColor(habit.color || '');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habit || !name.trim()) return;
    
    onUpdate(habit.id, { 
      name: name.trim(), 
      category, 
      notes: notes.trim(),
      color: isPremium ? color : null,
    });
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!habit) return;
    onDelete(habit.id);
    onOpenChange(false);
  };

  if (!habit) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Habit</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Habit Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Morning meditation"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="edit-category">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes (optional)</Label>
            <Textarea
              id="edit-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes..."
              rows={3}
            />
          </div>

          {/* Color Selection - Premium Only */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Color</Label>
              {!isPremium && <Crown className="w-3.5 h-3.5 text-primary" />}
            </div>
            <div className="flex flex-wrap gap-2">
              {habitColors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  disabled={!isPremium && c.value !== ''}
                  onClick={() => setColor(c.value)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === c.value ? 'border-foreground scale-110' : 'border-transparent'
                  } ${!isPremium && c.value !== '' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  style={{ 
                    backgroundColor: c.value || 'hsl(var(--primary))',
                  }}
                  title={c.name}
                />
              ))}
            </div>
            {!isPremium && (
              <p className="text-xs text-muted-foreground">
                Upgrade to Premium to use custom colors
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="flex-1"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button type="submit" className="flex-1" disabled={!name.trim()}>
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
