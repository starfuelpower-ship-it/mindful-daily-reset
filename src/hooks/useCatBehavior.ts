import { useState, useEffect, useCallback, useRef } from 'react';

export type CatState = 
  | 'idle' 
  | 'blinking' 
  | 'grooming' 
  | 'stretching' 
  | 'walking' 
  | 'sleeping' 
  | 'playful' 
  // Tap reactions
  | 'tap_reaction'
  | 'tap_meow'
  | 'tap_spin'
  | 'tap_bounce'
  | 'tap_curious'
  | 'tap_love'
  | 'tap_roll'
  | 'tap_shake'
  | 'tap_wave'
  | 'tap_jump'
  // Idle variations
  | 'idle_look_left'
  | 'idle_look_right'
  | 'idle_look_up'
  | 'idle_ear_twitch'
  | 'idle_tail_swish'
  | 'idle_yawn'
  | 'idle_sniff'
  | 'idle_whisker_twitch'
  // Active behaviors
  | 'pounce_ready'
  | 'pounce'
  | 'loaf'
  | 'knead'
  | 'belly_up'
  | 'sit_tall'
  | 'crouch'
  | 'startled'
  | 'happy_dance'
  | 'tail_chase'
  | 'head_shake'
  | 'lick_paw'
  | 'scratch_ear';

// All tap reaction states for random selection
const TAP_REACTIONS: CatState[] = [
  'tap_reaction', 'tap_meow', 'tap_spin', 'tap_bounce', 'tap_curious',
  'tap_love', 'tap_roll', 'tap_shake', 'tap_wave', 'tap_jump'
];

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
  idle: { min: 6000, max: 12000 },
  blinking: { min: 300, max: 500 },
  grooming: { min: 2500, max: 4000 },
  stretching: { min: 2000, max: 3000 },
  walking: { min: 3000, max: 5000 },
  sleeping: { min: 6000, max: 12000 },
  playful: { min: 1500, max: 2500 },
  // Tap reactions
  tap_reaction: { min: 800, max: 1200 },
  tap_meow: { min: 1000, max: 1400 },
  tap_spin: { min: 600, max: 900 },
  tap_bounce: { min: 700, max: 1000 },
  tap_curious: { min: 1200, max: 1600 },
  tap_love: { min: 1000, max: 1400 },
  tap_roll: { min: 1200, max: 1600 },
  tap_shake: { min: 600, max: 900 },
  tap_wave: { min: 800, max: 1200 },
  tap_jump: { min: 700, max: 1000 },
  // Idle variations
  idle_look_left: { min: 1500, max: 2500 },
  idle_look_right: { min: 1500, max: 2500 },
  idle_look_up: { min: 1200, max: 2000 },
  idle_ear_twitch: { min: 400, max: 700 },
  idle_tail_swish: { min: 1500, max: 2500 },
  idle_yawn: { min: 1800, max: 2500 },
  idle_sniff: { min: 800, max: 1200 },
  idle_whisker_twitch: { min: 500, max: 800 },
  // Active behaviors
  pounce_ready: { min: 1200, max: 1800 },
  pounce: { min: 600, max: 900 },
  loaf: { min: 4000, max: 8000 },
  knead: { min: 2500, max: 4000 },
  belly_up: { min: 2000, max: 3500 },
  sit_tall: { min: 3000, max: 5000 },
  crouch: { min: 1500, max: 2500 },
  startled: { min: 500, max: 800 },
  happy_dance: { min: 1500, max: 2200 },
  tail_chase: { min: 2000, max: 3000 },
  head_shake: { min: 600, max: 900 },
  lick_paw: { min: 2000, max: 3000 },
  scratch_ear: { min: 1800, max: 2800 },
};

// States that can transition to from idle during day
const DAY_TRANSITIONS: CatState[] = [
  'blinking', 'grooming', 'stretching', 'playful', 'walking',
  'idle_look_left', 'idle_look_right', 'idle_look_up', 'idle_ear_twitch',
  'idle_tail_swish', 'idle_yawn', 'idle_sniff', 'idle_whisker_twitch',
  'pounce_ready', 'loaf', 'knead', 'sit_tall', 'crouch',
  'happy_dance', 'tail_chase', 'lick_paw', 'scratch_ear'
];

// States that can transition to from idle during night (dark mode)
const NIGHT_TRANSITIONS: CatState[] = [
  'blinking', 'sleeping', 'idle', 'loaf', 'idle_yawn',
  'idle_ear_twitch', 'idle_tail_swish'
];

// Weights for state selection (higher = more likely)
const STATE_WEIGHTS: Record<CatState, number> = {
  idle: 2,
  blinking: 4,
  grooming: 2,
  stretching: 2,
  walking: 1,
  sleeping: 3,
  playful: 2,
  // Tap reactions (0 = only triggered by tap)
  tap_reaction: 0,
  tap_meow: 0,
  tap_spin: 0,
  tap_bounce: 0,
  tap_curious: 0,
  tap_love: 0,
  tap_roll: 0,
  tap_shake: 0,
  tap_wave: 0,
  tap_jump: 0,
  // Idle variations
  idle_look_left: 3,
  idle_look_right: 3,
  idle_look_up: 2,
  idle_ear_twitch: 4,
  idle_tail_swish: 3,
  idle_yawn: 2,
  idle_sniff: 2,
  idle_whisker_twitch: 3,
  // Active behaviors
  pounce_ready: 1,
  pounce: 0,
  loaf: 2,
  knead: 2,
  belly_up: 1,
  sit_tall: 2,
  crouch: 1,
  startled: 0,
  happy_dance: 1,
  tail_chase: 1,
  head_shake: 1,
  lick_paw: 2,
  scratch_ear: 2,
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
      // Random happy reaction
      const happyStates: CatState[] = ['playful', 'happy_dance', 'tap_love', 'tap_bounce'];
      const randomState = happyStates[Math.floor(Math.random() * happyStates.length)];
      setState(s => ({ ...s, currentState: randomState }));
      timeoutRef.current = setTimeout(() => {
        setState(s => ({ ...s, currentState: 'idle' }));
      }, 1500);
    } else if (hasReaction === 'all_complete') {
      setState(s => ({ ...s, currentState: 'happy_dance' }));
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
        
        let nextState = selectNextState(isDarkMode, hasCustomPosition);
        
        // Chain pounce_ready -> pounce
        if (state.currentState === 'pounce_ready') {
          nextState = 'pounce';
        }
        
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
        } else if (nextState === 'tail_chase') {
          // Tail chase animation with rotation
          setState(s => ({ ...s, currentState: 'tail_chase' }));
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