import { useState, useEffect } from 'react';
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
import { Trash2 } from 'lucide-react';
import { HabitIconPicker } from './HabitIconPicker';
import { HabitColorPicker } from './HabitColorPicker';
import { OLD_CATEGORY_CONFIG, Category } from '@/types/habit';

const categories: Category[] = ['Health', 'Productivity', 'Fitness', 'Mindset', 'Custom'];

interface EditHabitDialogProps {
  habit: CloudHabit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, updates: Partial<Pick<CloudHabit, 'name' | 'category' | 'notes' | 'color' | 'icon'>>) => void;
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
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>('Custom');
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState('');
  const [icon, setIcon] = useState('check-circle');

  // Reset form when habit changes
  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setCategory(habit.category);
      setNotes(habit.notes || '');
      setColor(habit.color || '');
      setIcon(habit.icon || 'check-circle');
    }
  }, [habit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!habit || !name.trim()) return;
    
    onUpdate(habit.id, { 
      name: name.trim(), 
      category, 
      notes: notes.trim(),
      color: isPremium ? color : undefined,
      icon,
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
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Edit Habit</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Icon, Color, and Name row */}
          <div className="flex items-start gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Icon</Label>
              <HabitIconPicker 
                value={icon} 
                onChange={setIcon}
                color={color || undefined}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Color</Label>
              <HabitColorPicker 
                value={color} 
                onChange={setColor}
                isPremium={isPremium}
                showPremiumLock={true}
              />
            </div>
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="edit-name" className="text-xs">Habit Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Morning meditation"
                className="h-14 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="edit-category" className="rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: OLD_CATEGORY_CONFIG[cat].color }}
                      />
                      {cat}
                    </div>
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
              className="rounded-xl resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              className="flex-1 rounded-xl"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            <Button type="submit" className="flex-1 rounded-xl" disabled={!name.trim()}>
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
