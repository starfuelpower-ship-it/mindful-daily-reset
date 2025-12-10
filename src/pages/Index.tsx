import { useHabits } from '@/hooks/useHabits';
import { HabitCard } from '@/components/HabitCard';
import { ProgressBar } from '@/components/ProgressBar';
import { AddHabitDialog } from '@/components/AddHabitDialog';
import { EmptyState } from '@/components/EmptyState';
import { RefreshCw } from 'lucide-react';

const Index = () => {
  const {
    habits,
    isLoading,
    addHabit,
    toggleHabit,
    deleteHabit,
    completedCount,
    totalCount,
    progressPercent,
  } = useHabits();

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
      <div className="max-w-lg mx-auto px-4 py-8 pb-32">
        {/* Header */}
        <header className="mb-6 animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground">Daily Reset</h1>
          <p className="text-muted-foreground mt-1">{today}</p>
        </header>

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
              {habits.map((habit, index) => (
                <div key={habit.id} className="animate-slide-up">
                  <HabitCard
                    habit={habit}
                    onToggle={toggleHabit}
                    onDelete={deleteHabit}
                    index={index}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Fixed Add Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
          <div className="max-w-lg mx-auto">
            <AddHabitDialog onAdd={addHabit} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
