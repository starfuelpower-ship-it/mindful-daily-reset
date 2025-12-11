import { useMemo } from 'react';
import { Sparkles } from 'lucide-react';

interface MotivationalMessageProps {
  bestStreak: number;
  completedToday: number;
  totalHabits: number;
}

const GENERAL_MESSAGES = [
  "Every small step counts toward big change.",
  "You're building something amazing, one habit at a time.",
  "Consistency is the secret to transformation.",
  "Today is another chance to be your best self.",
  "Small daily improvements lead to stunning results.",
  "Progress, not perfection.",
  "The best time to start was yesterday. The next best time is now.",
  "Your future self will thank you.",
  "One day or day one? You decide.",
  "Be patient with yourself. Self-growth is tender.",
];

const STREAK_MESSAGES = {
  low: [ // 1-3 days
    "Great start! Keep the momentum going!",
    "You're on a roll! Don't stop now.",
    "Building that streak brick by brick!",
  ],
  medium: [ // 4-7 days
    "Amazing! Your streak is getting stronger!",
    "You're proving what consistency can do!",
    "Keep it up! You're doing incredible.",
  ],
  high: [ // 8-14 days
    "Wow! Your dedication is inspiring!",
    "You're a habit machine! Keep crushing it!",
    "Your streak is on fire! 🔥",
  ],
  legendary: [ // 15+ days
    "Legendary status! You're unstoppable!",
    "Your discipline is truly remarkable!",
    "You've mastered the art of consistency!",
  ],
};

const COMPLETION_MESSAGES = {
  allDone: [
    "Perfect day! You completed everything!",
    "All habits done! Time to celebrate! 🎉",
    "100% today! You're amazing!",
  ],
  almostDone: [
    "So close! Just a few more to go!",
    "Almost there! Finish strong!",
    "You've got this! Final push!",
  ],
  halfDone: [
    "Halfway there! Keep the momentum!",
    "Great progress! You're doing well!",
    "Nice work! Keep it going!",
  ],
};

export const MotivationalMessage = ({ 
  bestStreak, 
  completedToday, 
  totalHabits 
}: MotivationalMessageProps) => {
  const message = useMemo(() => {
    // Use date as seed for daily rotation
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
    );
    
    // Priority 1: All habits completed
    if (totalHabits > 0 && completedToday === totalHabits) {
      const messages = COMPLETION_MESSAGES.allDone;
      return messages[dayOfYear % messages.length];
    }
    
    // Priority 2: Streak-based messages
    if (bestStreak >= 15) {
      const messages = STREAK_MESSAGES.legendary;
      return messages[dayOfYear % messages.length];
    }
    if (bestStreak >= 8) {
      const messages = STREAK_MESSAGES.high;
      return messages[dayOfYear % messages.length];
    }
    if (bestStreak >= 4) {
      const messages = STREAK_MESSAGES.medium;
      return messages[dayOfYear % messages.length];
    }
    if (bestStreak >= 1) {
      const messages = STREAK_MESSAGES.low;
      return messages[dayOfYear % messages.length];
    }
    
    // Priority 3: Progress-based messages
    if (totalHabits > 0) {
      const progressRatio = completedToday / totalHabits;
      if (progressRatio >= 0.75) {
        const messages = COMPLETION_MESSAGES.almostDone;
        return messages[dayOfYear % messages.length];
      }
      if (progressRatio >= 0.5) {
        const messages = COMPLETION_MESSAGES.halfDone;
        return messages[dayOfYear % messages.length];
      }
    }
    
    // Default: General motivational messages
    return GENERAL_MESSAGES[dayOfYear % GENERAL_MESSAGES.length];
  }, [bestStreak, completedToday, totalHabits]);

  return (
    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 animate-fade-in">
      <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
      <p className="text-sm text-foreground/80 font-medium leading-snug">
        {message}
      </p>
    </div>
  );
};
