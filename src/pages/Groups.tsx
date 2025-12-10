import { Users, Plus, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePremium } from '@/contexts/PremiumContext';
import { BottomTabBar } from '@/components/BottomTabBar';
import { PremiumLock } from '@/components/PremiumLock';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Groups() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium } = usePremium();

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-foreground">Groups</h1>
          <p className="text-sm text-muted-foreground">Build habits together</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
          {/* Illustration */}
          <div className="w-40 h-40 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-8">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-primary/30 flex items-center justify-center">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <div className="absolute -right-4 -bottom-2 w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-accent-foreground" />
              </div>
            </div>
          </div>

          {/* Text */}
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Better Together
          </h2>
          <p className="text-muted-foreground max-w-xs mb-8">
            It's always nice to have someone on your side. Invite friends to share your journey and keep each other motivated.
          </p>

          {/* Action */}
          {isPremium ? (
            <Button className="gap-2 h-12 px-6 rounded-xl">
              <Plus className="w-5 h-5" />
              Create Group
            </Button>
          ) : (
            <PremiumLock feature="Create and join groups to share streaks">
              <Button className="gap-2 h-12 px-6 rounded-xl" disabled>
                <Plus className="w-5 h-5" />
                Create Group
              </Button>
            </PremiumLock>
          )}
        </div>

        {/* Coming Soon Features */}
        <div className="ios-card p-6 mt-8">
          <h3 className="font-semibold text-foreground mb-4">Coming Soon</h3>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span>👥</span>
              </div>
              Create habit groups with friends
            </li>
            <li className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span>🏆</span>
              </div>
              Compete on streak leaderboards
            </li>
            <li className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span>💬</span>
              </div>
              Share progress and encouragement
            </li>
            <li className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span>🎯</span>
              </div>
              Set group challenges
            </li>
          </ul>
        </div>
      </main>

      <BottomTabBar />
    </div>
  );
}
