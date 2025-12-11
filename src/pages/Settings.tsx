import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePremium } from '@/contexts/PremiumContext';
import { Button } from '@/components/ui/button';
import { ThemePicker } from '@/components/ThemePicker';
import { AmbientSettings } from '@/components/AmbientSettings';
import { CompanionSettings } from '@/components/CompanionSettings';
import { MusicSettings } from '@/components/MusicSettings';
import { ArrowLeft, Crown, LogOut, User, ChevronRight, Sparkles, BarChart3, LayoutGrid, Coffee, Cat, Music } from 'lucide-react';
import { toast } from 'sonner';

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { isPremium } = usePremium();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>

        <div className="space-y-6">
          {/* Premium Banner */}
          {!isPremium && (
            <button
              onClick={() => navigate('/premium')}
              className="w-full bg-gradient-to-r from-primary/20 to-accent rounded-2xl p-4 border border-primary/30 text-left transition-all hover:shadow-md active:scale-[0.99]"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Go Premium</h3>
                    <p className="text-sm text-muted-foreground">Unlock all features</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </button>
          )}

          {isPremium && (
            <div className="bg-gradient-to-r from-primary/20 to-accent rounded-2xl p-4 border border-primary/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <Crown className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Premium Active</h3>
                  <p className="text-sm text-muted-foreground">You have access to all features</p>
                </div>
              </div>
            </div>
          )}

          {/* Account Section */}
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground px-1">Account</h2>
            <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
              {user ? (
                <>
                  <div className="p-4 flex items-center gap-3 border-b border-border/50">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{user.email}</p>
                      <p className="text-sm text-muted-foreground">Signed in</p>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full p-4 flex items-center gap-3 text-left hover:bg-muted/50 transition-colors"
                  >
                    <LogOut className="w-5 h-5 text-muted-foreground" />
                    <span className="text-foreground">Sign Out</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate('/auth')}
                  className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <span className="text-foreground">Sign In</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </button>
              )}
            </div>
          </div>

          {/* Cozy Atmosphere Section */}
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground px-1 flex items-center gap-2">
              <Coffee className="w-4 h-4" />
              Cozy Atmosphere
            </h2>
            <div className="bg-card rounded-2xl border border-border/50 p-4">
              <AmbientSettings />
            </div>
          </div>

          {/* Background Music Section */}
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground px-1 flex items-center gap-2">
              <Music className="w-4 h-4" />
              Background Music
            </h2>
            <div className="bg-card rounded-2xl border border-border/50 p-4">
              <MusicSettings />
            </div>
          </div>

          {/* Companion Section */}
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground px-1 flex items-center gap-2">
              <Cat className="w-4 h-4" />
              Companion
            </h2>
            <div className="bg-card rounded-2xl border border-border/50 p-4">
              <CompanionSettings />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground px-1">Appearance</h2>
            <div className="bg-card rounded-2xl border border-border/50 p-4">
              <ThemePicker />
            </div>
          </div>

          {/* Premium Features Section */}
          <div className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground px-1">Premium Features</h2>
            <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
              <button
                onClick={() => isPremium ? navigate('/stats') : navigate('/premium')}
                className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors border-b border-border/50"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-muted-foreground" />
                  <span className="text-foreground">Weekly Stats</span>
                </div>
                {!isPremium && <Crown className="w-4 h-4 text-primary" />}
                {isPremium && <ChevronRight className="w-5 h-5 text-muted-foreground" />}
              </button>

              <button
                onClick={() => navigate('/widgets')}
                className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors border-b border-border/50"
              >
                <div className="flex items-center gap-3">
                  <LayoutGrid className="w-5 h-5 text-muted-foreground" />
                  <span className="text-foreground">Home Screen Widgets</span>
                </div>
                {!isPremium && <Crown className="w-4 h-4 text-primary" />}
                {isPremium && <ChevronRight className="w-5 h-5 text-muted-foreground" />}
              </button>

              <button
                onClick={() => !isPremium && navigate('/premium')}
                className="w-full p-4 flex items-center justify-between hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-muted-foreground" />
                  <span className="text-foreground">Unlimited Reminders</span>
                </div>
                {!isPremium && <Crown className="w-4 h-4 text-primary" />}
              </button>
            </div>
          </div>

          {/* App Info */}
          <div className="text-center pt-4">
            <p className="text-sm text-muted-foreground">Daily Reset v1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  );
}
