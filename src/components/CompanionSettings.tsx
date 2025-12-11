import { useCompanion } from '@/contexts/CompanionContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Cat, Palette, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CompanionSettings() {
  const { showCompanion, setShowCompanion } = useCompanion();
  const navigate = useNavigate();

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

      {showCompanion && (
        <Button
          variant="outline"
          className="w-full justify-between"
          onClick={() => navigate('/cat')}
        >
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            <span>Customize Cat Costume</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </Button>
      )}
    </div>
  );
}
