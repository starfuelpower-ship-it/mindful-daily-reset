import { useState, useEffect } from 'react';
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
import { Category, OLD_CATEGORY_CONFIG } from '@/types/habit';
import { HabitIconPicker } from './HabitIconPicker';
import { HabitColorPicker } from './HabitColorPicker';
import { usePremium } from '@/contexts/PremiumContext';

const categories: Category[] = ['Health', 'Productivity', 'Fitness', 'Mindset', 'Custom'];

interface AddHabitDialogProps {
  onAdd?: (name: string, category: string, notes: string, icon?: string, color?: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSave?: (
    name: string,
    category: Category,
    icon: string,
    notes?: string,
    color?: string
  ) => Promise<boolean>;
}

export function AddHabitDialog({ onAdd, open: controlledOpen, onOpenChange, onSave }: AddHabitDialogProps) {
  const { isPremium } = usePremium();
  const [internalOpen, setInternalOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('Health');
  const [icon, setIcon] = useState('check-circle');
  const [color, setColor] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled ? onOpenChange! : setInternalOpen;

  const resetForm = () => {
    setName('');
    setCategory('Health');
    setIcon('check-circle');
    setColor('');
    setNotes('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalColor = isPremium ? color : '';

    if (onSave) {
      setSaving(true);
      const success = await onSave(name.trim(), category, icon, notes.trim() || undefined, finalColor || undefined);
      setSaving(false);
      if (success) {
        resetForm();
        setOpen(false);
      }
    } else if (onAdd) {
      onAdd(name.trim(), category, notes.trim(), icon, finalColor);
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

  const DialogBody = () => (
    <form onSubmit={handleSubmit} className="space-y-5 pt-2">
      {/* Icon and Color pickers */}
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
          <Label className="text-xs flex items-center gap-1">
            Color
          </Label>
          <HabitColorPicker 
            value={color} 
            onChange={setColor}
            isPremium={isPremium}
            showPremiumLock={true}
          />
        </div>
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="name" className="text-xs">Habit Name</Label>
          <Input
            id="name"
            placeholder="e.g., Morning workout"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-14 rounded-xl text-base"
            autoFocus
          />
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
          <SelectTrigger className="h-12 rounded-xl">
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
  );

  if (isControlled) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md mx-4 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-center">
              Add New Habit
            </DialogTitle>
          </DialogHeader>
          <DialogBody />
        </DialogContent>
      </Dialog>
    );
  }

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
        <DialogBody />
      </DialogContent>
    </Dialog>
  );
}
