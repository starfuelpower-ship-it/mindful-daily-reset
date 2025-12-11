import { useState, useEffect, useCallback, useRef } from 'react';

export type CatState = 
  | 'idle' 
  | 'blinking' 
  | 'grooming' 
  | 'stretching' 
  | 'walking' 
  | 'sleeping' 
  | 'playful' 
  | 'tap_reaction'
  | 'tap_meow'
  | 'tap_spin'
  | 'tap_bounce'
  | 'tap_curious';

// All tap reaction states for random selection
const TAP_REACTIONS: CatState[] = ['tap_reaction', 'tap_meow', 'tap_spin', 'tap_bounce', 'tap_curious'];

interface CatBehaviorConfig {
  isDarkMode: boolean;
  isEnabled: boolean;
  hasReaction: 'habit_complete' | 'all_complete' | null;
  isDragging: boolean;
  hasCustomPosition: boolean;
}

interface CatBehaviorState {
  currentState: CatState;
  walkDirection: number; // -1 left, 0 none, 1 right
  walkProgress: number; // 0-100
}

const STATE_DURATIONS: Record<CatState, { min: number; max: number }> = {
  idle: { min: 8000, max: 15000 },
  blinking: { min: 400, max: 600 },
  grooming: { min: 2500, max: 4000 },
  stretching: { min: 2000, max: 3000 },
  walking: { min: 3000, max: 5000 },
  sleeping: { min: 6000, max: 12000 },
  playful: { min: 1500, max: 2500 },
  tap_reaction: { min: 800, max: 1200 },
  tap_meow: { min: 1000, max: 1400 },
  tap_spin: { min: 600, max: 900 },
  tap_bounce: { min: 700, max: 1000 },
  tap_curious: { min: 1200, max: 1600 },
};

// States that can transition to from idle during day
const DAY_TRANSITIONS: CatState[] = ['blinking', 'grooming', 'stretching', 'playful', 'walking'];

// States that can transition to from idle during night (dark mode)
const NIGHT_TRANSITIONS: CatState[] = ['blinking', 'sleeping', 'idle'];

// Weights for state selection (higher = more likely)
const STATE_WEIGHTS: Record<CatState, number> = {
  idle: 3,
  blinking: 4,
  grooming: 2,
  stretching: 2,
  walking: 1,
  sleeping: 3,
  playful: 2,
  tap_reaction: 0, // Only triggered by tap
  tap_meow: 0,
  tap_spin: 0,
  tap_bounce: 0,
  tap_curious: 0,
};

function getRandomDuration(state: CatState): number {
  const { min, max } = STATE_DURATIONS[state];
  return min + Math.random() * (max - min);
}

function selectNextState(isDarkMode: boolean, hasCustomPosition: boolean): CatState {
  const transitions = isDarkMode ? NIGHT_TRANSITIONS : DAY_TRANSITIONS;
  
  // Filter out walking if cat has been moved
  const availableStates = hasCustomPosition 
    ? transitions.filter(s => s !== 'walking') 
    : transitions;
  
  // Weighted random selection
  const weights = availableStates.map(s => STATE_WEIGHTS[s]);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < availableStates.length; i++) {
    random -= weights[i];
    if (random <= 0) return availableStates[i];
  }
  
  return 'idle';
}

export function useCatBehavior(config: CatBehaviorConfig) {
  const { isDarkMode, isEnabled, hasReaction, isDragging, hasCustomPosition } = config;
  
  const [state, setState] = useState<CatBehaviorState>({
    currentState: 'idle',
    walkDirection: 0,
    walkProgress: 0,
  });
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  const walkIntervalRef = useRef<NodeJS.Timeout>();
  const lastBlinkRef = useRef<number>(Date.now());
  
  // Handle reaction animations from habit completion
  useEffect(() => {
    if (hasReaction === 'habit_complete') {
      setState(s => ({ ...s, currentState: 'playful' }));
      timeoutRef.current = setTimeout(() => {
        setState(s => ({ ...s, currentState: 'idle' }));
      }, 1500);
    } else if (hasReaction === 'all_complete') {
      setState(s => ({ ...s, currentState: 'playful' }));
      timeoutRef.current = setTimeout(() => {
        setState(s => ({ ...s, currentState: 'idle' }));
      }, 2500);
    }
  }, [hasReaction]);
  
  // Main behavior loop
  useEffect(() => {
    if (!isEnabled || isDragging) return;
    
    const scheduleNextState = () => {
      const duration = getRandomDuration(state.currentState);
      
      timeoutRef.current = setTimeout(() => {
        // Don't interrupt reactions
        if (hasReaction) return scheduleNextState();
        
        const nextState = selectNextState(isDarkMode, hasCustomPosition);
        
        // Handle walking state
        if (nextState === 'walking') {
          const direction = Math.random() > 0.5 ? 1 : -1;
          setState(s => ({ 
            ...s, 
            currentState: 'walking',
            walkDirection: direction,
            walkProgress: 0 
          }));
          
          // Animate walk progress
          let progress = 0;
          walkIntervalRef.current = setInterval(() => {
            progress += 2;
            setState(s => ({ ...s, walkProgress: progress }));
            if (progress >= 100) {
              clearInterval(walkIntervalRef.current);
              setState(s => ({ ...s, currentState: 'idle', walkDirection: 0 }));
            }
          }, 50);
        } else {
          setState(s => ({ ...s, currentState: nextState }));
        }
        
        scheduleNextState();
      }, duration);
    };
    
    scheduleNextState();
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (walkIntervalRef.current) clearInterval(walkIntervalRef.current);
    };
  }, [isEnabled, isDragging, isDarkMode, hasCustomPosition, hasReaction, state.currentState]);
  
  // Periodic blinking (every 3-6 seconds when not in other animations)
  useEffect(() => {
    if (!isEnabled) return;
    
    const blinkInterval = setInterval(() => {
      const now = Date.now();
      if (
        now - lastBlinkRef.current > 3000 && 
        state.currentState === 'idle' &&
        !hasReaction
      ) {
        setState(s => ({ ...s, currentState: 'blinking' }));
        lastBlinkRef.current = now;
        
        setTimeout(() => {
          setState(s => {
            if (s.currentState === 'blinking') {
              return { ...s, currentState: 'idle' };
            }
            return s;
          });
        }, 500);
      }
    }, 3000 + Math.random() * 3000);
    
    return () => clearInterval(blinkInterval);
  }, [isEnabled, state.currentState, hasReaction]);
  
  // Tap reaction handler - randomly selects from available tap animations
  const triggerTapReaction = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    // Pick a random tap reaction
    const randomTapState = TAP_REACTIONS[Math.floor(Math.random() * TAP_REACTIONS.length)];
    setState(s => ({ ...s, currentState: randomTapState }));
    
    timeoutRef.current = setTimeout(() => {
      setState(s => ({ ...s, currentState: 'idle' }));
    }, getRandomDuration(randomTapState));
  }, []);
  
  return {
    ...state,
    triggerTapReaction,
  };
}
