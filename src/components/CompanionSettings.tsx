import { useCompanion } from '@/contexts/CompanionContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Cat, Palette, ChevronRight, Maximize2, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function CompanionSettings() {
  const { showCompanion, setShowCompanion, catSize, setCatSize, catSoundsEnabled, setCatSoundsEnabled } = useCompanion();
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
        <>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Maximize2 className="w-4 h-4 text-muted-foreground" />
              <div className="flex-1">
                <Label className="text-sm">Cat Size</Label>
                <p className="text-xs text-muted-foreground">
                  Adjust how big the cat appears
                </p>
              </div>
              <span className="text-xs text-muted-foreground w-12 text-right">
                {Math.round(catSize * 100)}%
              </span>
            </div>
            <Slider
              value={[catSize]}
              onValueChange={([value]) => setCatSize(value)}
              min={0.5}
              max={2}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* Cat Sounds Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-3">
              {catSoundsEnabled ? (
                <Volume2 className="w-4 h-4 text-muted-foreground" />
              ) : (
                <VolumeX className="w-4 h-4 text-muted-foreground" />
              )}
              <div>
                <Label htmlFor="cat-sounds" className="text-sm">
                  Cat Sounds
                </Label>
                <p className="text-xs text-muted-foreground">
                  Meows, purrs, and chirps
                </p>
              </div>
            </div>
            <Switch
              id="cat-sounds"
              checked={catSoundsEnabled}
              onCheckedChange={setCatSoundsEnabled}
            />
          </div>

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
        </>
      )}
    </div>
  );
}
