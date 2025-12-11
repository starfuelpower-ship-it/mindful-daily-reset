import { useAmbient, AmbientMode } from '@/contexts/AmbientContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CloudRain, Sun, Snowflake, XCircle, Eye, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const AMBIENT_OPTIONS: { id: AmbientMode; label: string; icon: React.ComponentType<any>; description: string }[] = [
  { id: 'off', label: 'Off', icon: XCircle, description: 'No effects' },
  { id: 'rain', label: 'Rain', icon: CloudRain, description: 'Soft raindrops' },
  { id: 'sun_rays', label: 'Sun Rays', icon: Sun, description: 'Warm light rays' },
  { id: 'snow', label: 'Snow', icon: Snowflake, description: 'Gentle snowfall' },
];

export function AmbientSettings() {
  const {
    ambientMode,
    setAmbientMode,
    visualsEnabled,
    setVisualsEnabled,
    soundsEnabled,
    setSoundsEnabled,
    turnOffAllAmbience,
  } = useAmbient();

  return (
    <div className="space-y-4">
      {/* Mode Selection */}
      <div className="space-y-2">
        <Label className="text-sm text-muted-foreground">Atmosphere Style</Label>
        <div className="grid grid-cols-2 gap-2">
          {AMBIENT_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = ambientMode === option.id;
            return (
              <button
                key={option.id}
                onClick={() => setAmbientMode(option.id)}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-xl border transition-all',
                  isSelected
                    ? 'bg-primary/10 border-primary/50 text-primary'
                    : 'bg-background border-border/50 hover:bg-muted/50'
                )}
              >
                <Icon className={cn('w-5 h-5', isSelected ? 'text-primary' : 'text-muted-foreground')} />
                <div className="text-left">
                  <div className={cn('font-medium text-sm', isSelected ? 'text-primary' : 'text-foreground')}>
                    {option.label}
                  </div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <Label htmlFor="ambient-visuals" className="text-sm">
              Ambient Visuals
            </Label>
          </div>
          <Switch
            id="ambient-visuals"
            checked={visualsEnabled}
            onCheckedChange={setVisualsEnabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <Label htmlFor="ambient-sounds" className="text-sm">
              Ambient Sounds
            </Label>
          </div>
          <Switch
            id="ambient-sounds"
            checked={soundsEnabled}
            onCheckedChange={setSoundsEnabled}
          />
        </div>
      </div>

      {/* Quick disable button */}
      {(visualsEnabled || soundsEnabled || ambientMode !== 'off') && (
        <button
          onClick={turnOffAllAmbience}
          className="w-full mt-2 py-2 px-3 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg border border-border/50 hover:bg-muted/30"
        >
          Turn off all ambience
        </button>
      )}
    </div>
  );
}
