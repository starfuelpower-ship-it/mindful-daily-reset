import { useState } from 'react';
import { Snowflake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStreakFreeze } from '@/hooks/useStreakFreeze';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function StreakFreezeButton() {
  const { freezesAvailable, isLoading, useFreeze } = useStreakFreeze();
  const [isOpen, setIsOpen] = useState(false);
  const [isUsing, setIsUsing] = useState(false);

  const handleUseFreeze = async () => {
    setIsUsing(true);
    const success = await useFreeze();
    setIsUsing(false);
    if (success) {
      setIsOpen(false);
    }
  };

  if (isLoading) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs"
              disabled={freezesAvailable < 1}
            >
              <Snowflake className="w-4 h-4 text-blue-400" />
              <span className="font-medium">{freezesAvailable}</span>
            </Button>
          </AlertDialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>{freezesAvailable > 0 ? 'Use streak freeze to protect your streaks' : 'No freezes available (refills weekly)'}</p>
        </TooltipContent>
      </Tooltip>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Snowflake className="w-5 h-5 text-blue-400" />
            Use Streak Freeze?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Using a streak freeze will protect all your habit streaks for today. 
            Even if you don't complete your habits, your streaks won't reset.
            <br /><br />
            <span className="text-muted-foreground">
              You get 1 free streak freeze per week.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isUsing}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleUseFreeze}
            disabled={isUsing}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {isUsing ? 'Freezing...' : '🧊 Use Freeze'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
