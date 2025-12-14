import { useState } from 'react';
import { Check, Lock, Eye, EyeOff } from 'lucide-react';
import { useTheme, PREMIUM_THEMES } from '@/contexts/ThemeContext';
import { usePremium } from '@/contexts/PremiumContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const THEME_PREVIEWS = {
  default: {
    bg: 'bg-[hsl(20,50%,98%)]',
    primary: 'bg-[hsl(43,90%,58%)]',
    accent: 'bg-[hsl(180,50%,90%)]',
  },
  pastel: {
    bg: 'bg-[hsl(330,30%,97%)]',
    primary: 'bg-[hsl(330,70%,70%)]',
    accent: 'bg-[hsl(200,60%,90%)]',
  },
  neon: {
    bg: 'bg-[hsl(260,30%,12%)]',
    primary: 'bg-[hsl(280,100%,65%)]',
    accent: 'bg-[hsl(180,100%,50%)]',
  },
  forest: {
    bg: 'bg-[hsl(140,20%,95%)]',
    primary: 'bg-[hsl(150,50%,45%)]',
    accent: 'bg-[hsl(80,40%,85%)]',
  },
  sunset: {
    bg: 'bg-[hsl(30,40%,96%)]',
    primary: 'bg-[hsl(25,90%,55%)]',
    accent: 'bg-[hsl(45,80%,85%)]',
  },
};

export const ThemePicker = () => {
  const { colorTheme, setColorTheme, previewTheme, setPreviewTheme } = useTheme();
  const { isPremium } = usePremium();
  const navigate = useNavigate();
  const [isPreviewing, setIsPreviewing] = useState(false);

  const handleThemeSelect = (themeId: 'default' | 'pastel' | 'neon' | 'forest' | 'sunset') => {
    if (themeId === 'default' || isPremium) {
      setColorTheme(themeId);
      setIsPreviewing(false);
    }
  };

  const handlePreview = (themeId: 'default' | 'pastel' | 'neon' | 'forest' | 'sunset') => {
    if (!isPremium && themeId !== 'default') {
      setPreviewTheme(themeId);
      setIsPreviewing(true);
    }
  };

  const handleStopPreview = () => {
    setPreviewTheme(null);
    setIsPreviewing(false);
  };

  const activeTheme = previewTheme || colorTheme;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Color Theme</h3>
        {isPreviewing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleStopPreview}
            className="text-xs h-7 gap-1.5"
          >
            <EyeOff className="w-3 h-3" />
            Exit Preview
          </Button>
        )}
      </div>

      {/* Default Theme */}
      <div
        onClick={() => handleThemeSelect('default')}
        className={cn(
          "relative p-3 rounded-xl border-2 cursor-pointer transition-all",
          activeTheme === 'default' && !previewTheme
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        )}
      >
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", THEME_PREVIEWS.default.bg)}>
            <div className={cn("w-5 h-5 rounded-full", THEME_PREVIEWS.default.primary)} />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm text-foreground">Default</p>
            <p className="text-xs text-muted-foreground">Standard theme</p>
          </div>
          {activeTheme === 'default' && !previewTheme && (
            <Check className="w-5 h-5 text-primary" />
          )}
        </div>
      </div>

      {/* Premium Themes */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium">Premium Themes</span>
          {!isPremium && <Lock className="w-3 h-3" />}
        </div>

        <div className="grid grid-cols-2 gap-2">
          {PREMIUM_THEMES.map((theme) => {
            const preview = THEME_PREVIEWS[theme.id];
            const isActive = activeTheme === theme.id;
            const isLocked = !isPremium;

            return (
              <div
                key={theme.id}
                className={cn(
                  "relative p-3 rounded-xl border-2 transition-all",
                  isActive
                    ? "border-primary bg-primary/5"
                    : "border-border",
                  isLocked ? "cursor-default" : "cursor-pointer hover:border-primary/50"
                )}
                onClick={() => !isLocked && handleThemeSelect(theme.id)}
              >
                {/* Theme Preview Swatch */}
                <div className={cn(
                  "w-full h-12 rounded-lg mb-2 flex items-center justify-center gap-1 p-2",
                  preview.bg
                )}>
                  <div className={cn("w-4 h-4 rounded-full", preview.primary)} />
                  <div className={cn("w-3 h-3 rounded-full", preview.accent)} />
                </div>

                <p className="font-medium text-xs text-foreground truncate">{theme.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{theme.description}</p>

                {/* Active Check */}
                {isActive && !previewTheme && (
                  <div className="absolute top-2 right-2">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                )}

                {/* Preview indicator */}
                {previewTheme === theme.id && (
                  <div className="absolute top-2 right-2">
                    <Eye className="w-4 h-4 text-primary animate-pulse" />
                  </div>
                )}

                {/* Lock / Preview Button for non-premium (hide when this theme is being previewed) */}
                {isLocked && previewTheme !== theme.id && (
                  <div className="absolute inset-0 bg-background/60 backdrop-blur-[1px] rounded-xl flex flex-col items-center justify-center gap-1">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[10px] px-2 gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreview(theme.id);
                      }}
                    >
                      <Eye className="w-3 h-3" />
                      Preview
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upgrade CTA */}
      {!isPremium && (
        <Button
          variant="outline"
          className="w-full mt-3 border-primary/30 text-primary hover:bg-primary/10"
          onClick={() => navigate('/premium')}
        >
          Unlock All Themes
        </Button>
      )}

      {/* Preview Banner */}
      {isPreviewing && previewTheme && (
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 text-center">
          <p className="text-sm font-medium text-foreground mb-2">
            Previewing: {PREMIUM_THEMES.find(t => t.id === previewTheme)?.name}
          </p>
          <div className="flex gap-2 justify-center">
            <Button
              size="sm"
              onClick={() => navigate('/premium')}
              className="text-xs"
            >
              Unlock Theme
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleStopPreview}
              className="text-xs"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
