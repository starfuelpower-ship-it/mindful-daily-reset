import { Skeleton } from '@/components/ui/skeleton';

export function HabitCardSkeleton() {
  return (
    <div className="ios-card p-4 flex items-center gap-4">
      <Skeleton className="h-12 w-12 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-8 w-8 rounded-full" />
    </div>
  );
}

export function HabitListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <HabitCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProgressSkeleton() {
  return (
    <div className="ios-card p-5 mb-5">
      <div className="flex items-start gap-4">
        <Skeleton className="h-20 w-20 rounded-xl" />
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

export function SettingsItemSkeleton() {
  return (
    <div className="p-4 flex items-center gap-3">
      <Skeleton className="h-5 w-5 rounded" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}

export function SettingsGroupSkeleton({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-3 w-20 ml-1" />
      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
        {Array.from({ length: items }).map((_, i) => (
          <SettingsItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
