import { useCompanion } from '@/contexts/CompanionContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Cat } from 'lucide-react';

export function CompanionSettings() {
  const { showCompanion, setShowCompanion } = useCompanion();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Cat className="w-4 h-4 text-muted-foreground" />
          <div>
            <Label htmlFor="show-companion" className="text-sm">
              Show Cat Companion
            </Label>
            <p className="text-xs text-muted-foreground">
              A cute animated cat that reacts to your habits
            </p>
          </div>
        </div>
        <Switch
          id="show-companion"
          checked={showCompanion}
          onCheckedChange={setShowCompanion}
        />
      </div>
    </div>
  );
}
