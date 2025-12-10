import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCloudHabits, CloudHabit } from '@/hooks/useCloudHabits';
import { useHabits } from '@/hooks/useHabits';
import { CloudHabitCard } from '@/components/CloudHabitCard';
import { HabitCard } from '@/components/HabitCard';
import { ProgressBar } from '@/components/ProgressBar';
import { AddHabitDialog } from '@/components/AddHabitDialog';
import { EditHabitDialog } from '@/components/EditHabitDialog';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { RefreshCw, Settings, User, Cloud } from 'lucide-react';
import { toast } from 'sonner';

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useAuth();
  const [editingHabit, setEditingHabit] = useState<CloudHabit | null>(null);
  const [hasMigrated, setHasMigrated] = useState(false);

  // Cloud habits (for logged-in users)
  const cloudHabits = useCloudHabits();
  
  // Local habits (for guests)
  const localHabits = useHabits();

  // Use cloud or local based on auth status
  const isLoggedIn = !!user;
  const habits = isLoggedIn ? cloudHabits.habits : localHabits.habits;
  const isLoading = authLoading || (isLoggedIn ? cloudHabits.isLoading : localHabits.isLoading);
  const completedCount = isLoggedIn ? cloudHabits.completedCount : localHabits.completedCount;
  const totalCount = isLoggedIn ? cloudHabits.totalCount : localHabits.totalCount;
  const progressPercent = isLoggedIn ? cloudHabits.progressPercent : localHabits.progressPercent;

  // Migrate local habits to cloud after login
  useEffect(() => {
    if (user && !hasMigrated && !cloudHabits.isLoading) {
      const localStorageHabits = localStorage.getItem('daily-reset-habits');
      if (localStorageHabits) {
        const parsed = JSON.parse(localStorageHabits);
        if (parsed.length > 0 && cloudHabits.habits.length === 0) {
          cloudHabits.migrateLocalHabits(parsed);
          setHasMigrated(true);
        }
      }
    }
  }, [user, hasMigrated, cloudHabits.isLoading]);

  const handleAddHabit = (name: string, category: string, notes: string) => {
    if (isLoggedIn) {
      cloudHabits.addHabit(name, category, notes);
    } else {
      localHabits.addHabit(name, category as any, notes);
    }
  };

  const handleToggleHabit = (id: string) => {
    if (isLoggedIn) {
      cloudHabits.toggleHabit(id);
    } else {
      localHabits.toggleHabit(id);
    }
  };

  const handleDeleteHabit = (id: string) => {
    if (isLoggedIn) {
      cloudHabits.deleteHabit(id);
    } else {
      localHabits.deleteHabit(id);
    }
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <RefreshCw className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-6 pb-32">
        {/* Header */}
        <header className="flex items-start justify-between mb-6 animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Daily Reset</h1>
            <p className="text-muted-foreground mt-1">{today}</p>
          </div>
          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/settings')}
                className="text-muted-foreground"
              >
                <Settings className="w-5 h-5" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/auth')}
                className="text-muted-foreground"
              >
                <User className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </header>

        {/* Sync indicator */}
        {isLoggedIn && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 animate-fade-in">
            <Cloud className="w-3.5 h-3.5" />
            <span>Synced to cloud</span>
          </div>
        )}

        {/* Progress */}
        {totalCount > 0 && (
          <div className="mb-6 animate-slide-up">
            <ProgressBar
              completed={completedCount}
              total={totalCount}
              percent={progressPercent}
            />
          </div>
        )}

        {/* Habits List */}
        <section className="mb-6">
          {habits.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-3">
              {isLoggedIn ? (
                cloudHabits.habits.map((habit, index) => (
                  <div key={habit.id} className="animate-slide-up">
                    <CloudHabitCard
                      habit={habit}
                      onToggle={handleToggleHabit}
                      onEdit={setEditingHabit}
                      index={index}
                    />
                  </div>
                ))
              ) : (
                localHabits.habits.map((habit, index) => (
                  <div key={habit.id} className="animate-slide-up">
                    <HabitCard
                      habit={habit}
                      onToggle={handleToggleHabit}
                      onDelete={handleDeleteHabit}
                      index={index}
                    />
                  </div>
                ))
              )}
            </div>
          )}
        </section>

        {/* Fixed Add Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
          <div className="max-w-lg mx-auto">
            <AddHabitDialog onAdd={handleAddHabit} />
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      {isLoggedIn && (
        <EditHabitDialog
          habit={editingHabit}
          open={!!editingHabit}
          onOpenChange={(open) => !open && setEditingHabit(null)}
          onUpdate={cloudHabits.updateHabit}
          onDelete={cloudHabits.deleteHabit}
        />
      )}
    </div>
  );
};

export default Index;
