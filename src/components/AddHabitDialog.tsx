import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
import { Category, HABIT_ICONS, OLD_CATEGORY_CONFIG } from '@/types/habit';
import { cn } from '@/lib/utils';

// ============================================
// ADD HABIT DIALOG
// ============================================
// Modal for creating new habits
// Customize: Add more fields or change the layout

const categories: Category[] = ['Health', 'Productivity', 'Fitness', 'Mindset', 'Custom'];

interface AddHabitDialogProps {
  onAdd?: (name: string, category: string, notes: string) => void;
  // New props for cloud mode
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave?: (
    name: string,
    category: Category,
    icon: string,
    notes?: string
  ) => Promise<boolean>;
}

export function AddHabitDialog({ onAdd, open: controlledOpen, onOpenChange, onSave }: AddHabitDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Health');
  const [icon, setIcon] = useState('✅');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  const resetForm = () => {
    setName('');
    setCategory('Health');
    setIcon('✅');
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (onSave) {
      // Cloud mode
      setSaving(true);
      const success = await onSave(name.trim(), category, icon, notes.trim() || undefined);
      setSaving(false);
      if (success) {
        resetForm();
        setOpen(false);
      }
    } else if (onAdd) {
      // Local mode (legacy)
      onAdd(name.trim(), category, notes.trim());
      resetForm();
      setOpen(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };

  // If controlled, don't render trigger
  if (isControlled) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md mx-4 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              Add New Habit
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            {/* Habit name */}
            <div className="space-y-2">
              <Label htmlFor="name">Habit Name</Label>
              <Input
                id="name"
                placeholder="e.g., Morning workout"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 rounded-xl"
                autoFocus
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
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

            {/* Icon picker */}
            <div className="space-y-2">
              <Label>Icon</Label>
              <div className="grid grid-cols-8 gap-2 p-3 bg-muted rounded-xl max-h-32 overflow-y-auto">
                {HABIT_ICONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setIcon(emoji)}
                    className={cn(
                      'w-9 h-9 rounded-lg flex items-center justify-center text-xl transition-all',
                      icon === emoji
                        ? 'bg-primary text-primary-foreground scale-110'
                        : 'hover:bg-card'
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes or details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="rounded-xl resize-none"
                rows={3}
              />
            </div>

            {/* Save button */}
            <Button
              type="submit"
              disabled={!name.trim() || saving}
              className="w-full h-12 rounded-xl text-base font-semibold"
            >
              {saving ? 'Creating...' : 'Create Habit'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  // Uncontrolled with trigger (legacy)
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
