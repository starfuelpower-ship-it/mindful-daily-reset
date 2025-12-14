import { useState, useEffect, useRef, memo, useCallback } from 'react';
import { useCompanion, CAT_COLORS, CatColor } from '@/contexts/CompanionContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useSoundEffects, getRandomTapSound, getHabitCompleteSound } from '@/hooks/useSoundEffects';
import { useCatBehavior, CatState } from '@/hooks/useCatBehavior';
import { CatCostume } from './CatCostume';
import { cn } from '@/lib/utils';

const MIN_SCALE = 0.6;
const MAX_SCALE = 1.5;
const DEFAULT_SCALE = 1;

const CAT_POSITION_KEY = 'daily-reset-cat-position';
const CAT_SCALE_KEY = 'daily-reset-cat-scale';

const loadSavedPosition = () => {
  if (typeof window === 'undefined') return { x: 0, y: 0 };
  const saved = localStorage.getItem(CAT_POSITION_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return { x: 0, y: 0 };
    }
  }
  return { x: 0, y: 0 };
};

const loadSavedScale = () => {
  if (typeof window === 'undefined') return DEFAULT_SCALE;
  const saved = localStorage.getItem(CAT_SCALE_KEY);
  if (saved) {
    const scale = parseFloat(saved);
    if (!isNaN(scale) && scale >= MIN_SCALE && scale <= MAX_SCALE) {
      return scale;
    }
  }
  return DEFAULT_SCALE;
};

export const CatCompanion = memo(() => {
  const { showCompanion, companionType, currentReaction, equippedCostume, catColor, catSize } = useCompanion();
  const { resolvedTheme } = useTheme();
  const { playSound, triggerHaptic } = useSoundEffects();
  
  const [dragPosition, setDragPosition] = useState(loadSavedPosition);
  const [walkOffset, setWalkOffset] = useState(0);
  const [scale, setScale] = useState(loadSavedScale);
  const [isDragging, setIsDragging] = useState(false);
  const [isPinching, setIsPinching] = useState(false);
  const [facingLeft, setFacingLeft] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const initialPinchDistance = useRef<number>(0);
  const initialScale = useRef<number>(DEFAULT_SCALE);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const catStartPos = useRef({ x: 0, y: 0 });

  const isDark = resolvedTheme === 'dark';
  const hasCustomPosition = dragPosition.x !== 0 || dragPosition.y !== 0;

  // Cat behavior state machine
  const { currentState, walkDirection, walkProgress, triggerTapReaction } = useCatBehavior({
    isDarkMode: isDark,
    isEnabled: showCompanion && companionType === 'cat',
    hasReaction: currentReaction,
    isDragging,
    hasCustomPosition,
  });

  // Handle walking animation offset
  useEffect(() => {
    if (currentState === 'walking' && walkDirection !== 0) {
      const targetOffset = walkDirection * 40; // Walk 40px in the direction
      setWalkOffset((walkProgress / 100) * targetOffset);
      setFacingLeft(walkDirection < 0);
    } else if (currentState !== 'walking') {
      setWalkOffset(0);
    }
  }, [currentState, walkDirection, walkProgress]);

  // Play cat sounds for reactions
  useEffect(() => {
    if (currentReaction === 'habit_complete') {
      // Play a random happy cat sound when habit is completed
      playSound(getHabitCompleteSound());
    } else if (currentReaction === 'all_complete') {
      // Play achievement sound + happy meow for all habits complete
      playSound('achievement');
      setTimeout(() => playSound('meow_happy'), 300);
    }
  }, [currentReaction, playSound]);

  // Handle tap on cat - play random cat sounds
  const handleCatTap = useCallback(() => {
    triggerTapReaction();
    playSound(getRandomTapSound());
    triggerHaptic('light');
  }, [triggerTapReaction, playSound, triggerHaptic]);

  // Touch handlers for dragging
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
    
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      initialPinchDistance.current = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      initialScale.current = scale;
      setIsPinching(true);
    } else if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      catStartPos.current = { ...dragPosition };
      handleCatTap();
    }
  }, [scale, dragPosition, handleCatTap]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling while dragging/pinching
    if (isPinching && e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      const scaleChange = currentDistance / initialPinchDistance.current;
      const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, initialScale.current * scaleChange));
      setScale(newScale);
    } else if (isDragging && e.touches.length === 1) {
      const deltaX = e.touches[0].clientX - dragStartPos.current.x;
      const deltaY = e.touches[0].clientY - dragStartPos.current.y;
      
      const maxX = window.innerWidth - 60;
      const maxY = window.innerHeight - 140;
      
      const newX = Math.min(maxX, Math.max(-maxX + 120, catStartPos.current.x + deltaX));
      const newY = Math.min(0, Math.max(-maxY, catStartPos.current.y + deltaY));
      
      setDragPosition({ x: newX, y: newY });
      
      if (Math.abs(deltaX) > 5) {
        setFacingLeft(deltaX < 0);
      }
    }
  }, [isPinching, isDragging]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setIsPinching(false);
    localStorage.setItem(CAT_POSITION_KEY, JSON.stringify(dragPosition));
    localStorage.setItem(CAT_SCALE_KEY, String(scale));
  }, [dragPosition, scale]);

  // Mouse handlers for desktop
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    catStartPos.current = { ...dragPosition };
    handleCatTap();
  }, [dragPosition, handleCatTap]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStartPos.current.x;
    const deltaY = e.clientY - dragStartPos.current.y;
    
    const maxX = window.innerWidth - 60;
    const maxY = window.innerHeight - 140;
    
    const newX = Math.min(maxX, Math.max(-maxX + 120, catStartPos.current.x + deltaX));
    const newY = Math.min(0, Math.max(-maxY, catStartPos.current.y + deltaY));
    
    setDragPosition({ x: newX, y: newY });
    
    if (Math.abs(deltaX) > 5) {
      setFacingLeft(deltaX < 0);
    }
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    localStorage.setItem(CAT_POSITION_KEY, JSON.stringify(dragPosition));
  }, [dragPosition]);

  // Mouse wheel for scaling on desktop
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale + delta));
    setScale(newScale);
    localStorage.setItem(CAT_SCALE_KEY, String(newScale));
  }, [scale]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (!showCompanion || companionType !== 'cat') return null;

  return (
    <>
      {/* Invisible overlay - pointer-events: none so it doesn't block UI */}
      <div 
        className="fixed inset-0 z-30 pointer-events-none"
        aria-hidden="true"
      >
        {/* Cat container - only this has pointer-events */}
        <div
          ref={containerRef}
          className={cn(
            'absolute bottom-24 right-4 select-none pointer-events-auto',
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          )}
          style={{
            transform: `translate(${walkOffset + dragPosition.x}px, ${dragPosition.y}px) scale(${scale * catSize})`,
            transition: isDragging || isPinching ? 'none' : currentState === 'walking' ? 'transform 0.05s linear' : 'transform 0.3s ease-out',
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onWheel={handleWheel}
        >
          <div
            className={cn(
              'relative w-16 h-16',
              facingLeft && 'scale-x-[-1]'
            )}
            style={{ transition: 'transform 0.2s ease-out' }}
          >
            <CatBody 
              state={currentState} 
              isDark={isDark} 
              costume={equippedCostume}
              catColor={catColor}
            />
          </div>
        </div>
      </div>
      
      <CatStyles />
    </>
  );
});

CatCompanion.displayName = 'CatCompanion';

// Separate component for the cat body SVG to optimize renders
interface CatBodyProps {
  state: CatState;
  isDark: boolean;
  costume: string;
  catColor: CatColor;
}

const CatBody = memo(({ state, isDark, costume, catColor }: CatBodyProps) => {
  const colorData = CAT_COLORS[catColor];
  // In dark mode, use gray tones for better visibility unless user explicitly chose a color
  const bodyColor = isDark && catColor === 'default' ? '#9ca3af' : colorData.body;
  const bodyColorDark = isDark && catColor === 'default' ? '#6b7280' : colorData.bodyDark;
  const innerEarColor = isDark && catColor === 'default' ? '#6b7280' : colorData.innerEar;
  const eyeColor = '#1f2937';
  const noseColor = '#f472b6';
  const whiskerColor = isDark ? '#6b7280' : '#fbbf24';
  
  // Animation class mappings
  const stateStr = state as string;
  
  const bodyClass = cn(
    'cat-body',
    stateStr === 'stretching' && 'animate-cat-stretch',
    stateStr === 'playful' && 'animate-cat-playful',
    stateStr === 'tap_reaction' && 'animate-cat-hop',
    stateStr === 'tap_bounce' && 'animate-cat-bounce',
    stateStr === 'tap_spin' && 'animate-cat-spin',
    stateStr === 'tap_meow' && 'animate-cat-meow-body',
    stateStr === 'tap_curious' && 'animate-cat-curious',
    stateStr === 'sleeping' && 'animate-cat-curl',
    stateStr === 'loaf' && 'animate-cat-loaf',
    // New animations
    stateStr === 'tap_love' && 'animate-cat-love',
    stateStr === 'tap_roll' && 'animate-cat-roll',
    stateStr === 'tap_shake' && 'animate-cat-shake',
    stateStr === 'tap_wave' && 'animate-cat-wave',
    stateStr === 'tap_jump' && 'animate-cat-jump',
    stateStr === 'pounce_ready' && 'animate-cat-pounce-ready',
    stateStr === 'pounce' && 'animate-cat-pounce',
    stateStr === 'knead' && 'animate-cat-knead',
    stateStr === 'belly_up' && 'animate-cat-belly-up',
    stateStr === 'sit_tall' && 'animate-cat-sit-tall',
    stateStr === 'crouch' && 'animate-cat-crouch',
    stateStr === 'startled' && 'animate-cat-startled',
    stateStr === 'happy_dance' && 'animate-cat-happy-dance',
    stateStr === 'tail_chase' && 'animate-cat-tail-chase',
    stateStr === 'idle_yawn' && 'animate-cat-yawn',
  );
  
  const headClass = cn(
    'cat-head',
    stateStr === 'tap_reaction' && 'animate-cat-head-tilt',
    stateStr === 'tap_curious' && 'animate-cat-head-curious',
    stateStr === 'tap_meow' && 'animate-cat-head-meow',
    stateStr === 'grooming' && 'animate-cat-head-down',
    stateStr === 'idle_look_left' && 'animate-cat-look-left',
    stateStr === 'idle_look_right' && 'animate-cat-look-right',
    stateStr === 'idle_look_up' && 'animate-cat-look-up',
    stateStr === 'idle_sniff' && 'animate-cat-sniff',
    stateStr === 'head_shake' && 'animate-cat-head-shake',
    stateStr === 'tap_love' && 'animate-cat-head-love',
    stateStr === 'startled' && 'animate-cat-head-startled',
    stateStr === 'idle_yawn' && 'animate-cat-head-yawn',
  );
  
  const tailClass = cn(
    'cat-tail',
    stateStr === 'idle' && 'animate-cat-tail-idle',
    stateStr === 'playful' && 'animate-cat-tail-wag',
    stateStr === 'tap_reaction' && 'animate-cat-tail-wag',
    stateStr === 'tap_bounce' && 'animate-cat-tail-wag',
    stateStr === 'tap_spin' && 'animate-cat-tail-spin',
    stateStr === 'tap_curious' && 'animate-cat-tail-perk',
    stateStr === 'sleeping' && 'animate-cat-tail-wrap',
    stateStr === 'idle_tail_swish' && 'animate-cat-tail-swish',
    stateStr === 'happy_dance' && 'animate-cat-tail-excited',
    stateStr === 'pounce_ready' && 'animate-cat-tail-twitch',
    stateStr === 'startled' && 'animate-cat-tail-puff',
    stateStr === 'tap_love' && 'animate-cat-tail-heart',
  );

  const earClass = cn(
    stateStr === 'idle_ear_twitch' && 'animate-cat-ear-twitch',
    stateStr === 'startled' && 'animate-cat-ears-back',
    stateStr === 'tap_curious' && 'animate-cat-ears-forward',
  );

  const whiskerClass = cn(
    stateStr === 'idle_whisker_twitch' && 'animate-cat-whisker-twitch',
    stateStr === 'idle_sniff' && 'animate-cat-whisker-sniff',
  );

  const pawClass = cn(
    stateStr === 'lick_paw' && 'animate-cat-lick-paw',
    stateStr === 'scratch_ear' && 'animate-cat-scratch',
    stateStr === 'knead' && 'animate-cat-knead-paw',
    stateStr === 'tap_wave' && 'animate-cat-wave-paw',
  );
  
  const isSleeping = stateStr === 'sleeping' || stateStr === 'loaf';
  const isBlinking = stateStr === 'blinking';
  const isMeowing = stateStr === 'tap_meow';
  const isYawning = stateStr === 'idle_yawn';
  const isBellyUp = stateStr === 'belly_up';
  
  const eyesOpen = !isSleeping && !isBlinking && !isYawning;
  const eyesHappy = stateStr === 'playful' || stateStr === 'tap_reaction' || stateStr === 'tap_bounce' || stateStr === 'tap_love' || stateStr === 'happy_dance';
  const eyesWide = stateStr === 'tap_curious' || stateStr === 'tap_spin' || stateStr === 'startled' || stateStr === 'pounce_ready';
  const eyesNarrow = stateStr === 'pounce' || stateStr === 'crouch';

  return (
    <svg
      viewBox="0 0 64 64"
      className="w-full h-full"
      style={{
        filter: isDark ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.5))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
      }}
    >
      {/* Main cat group - costume will be positioned relative to this */}
      <g className={bodyClass}>
        {/* Tail - behind body */}
        <path
          d={isSleeping ? "M24 48 Q18 52 20 48 Q22 44 26 46" : "M46 42 Q56 38 54 28"}
          stroke={bodyColor}
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
          className={tailClass}
        />
        
        {/* Body */}
        <ellipse
          cx="32"
          cy={isSleeping ? '46' : '42'}
          rx={isSleeping ? '12' : '14'}
          ry={isSleeping ? '8' : '10'}
          fill={bodyColor}
          className={isSleeping ? 'animate-cat-breathe' : ''}
        />
        
        {/* Back legs (visible when not sleeping) */}
        {!isSleeping && (
          <>
            <ellipse cx="22" cy="48" rx="4" ry="3" fill={bodyColor} />
            <ellipse cx="42" cy="48" rx="4" ry="3" fill={bodyColor} />
          </>
        )}
        
        {/* Front paws */}
        <ellipse 
          cx={isSleeping ? '38' : '26'} 
          cy={isSleeping ? '50' : '50'} 
          rx="4" 
          ry="3" 
          fill={bodyColor}
          className={cn(
            stateStr === 'grooming' && 'animate-cat-paw-lick',
            stateStr === 'walking' && 'animate-cat-walk-paw-l'
          )}
        />
        <ellipse 
          cx={isSleeping ? '44' : '38'} 
          cy={isSleeping ? '50' : '50'} 
          rx="4" 
          ry="3" 
          fill={bodyColor}
          className={stateStr === 'walking' ? 'animate-cat-walk-paw-r' : ''}
        />
        
        {/* Head group */}
        <g className={headClass}>
          {/* Head */}
          <circle
            cx="32"
            cy={isSleeping ? '42' : '28'}
            r="12"
            fill={bodyColor}
          />
          
          {/* Left ear - cute rounded */}
          <ellipse
            cx={isSleeping ? '22' : '22'}
            cy={isSleeping ? '38' : '20'}
            rx="5"
            ry="6"
            fill={bodyColor}
            className={cn(earClass, stateStr === 'tap_reaction' ? 'animate-cat-ear-perk' : '')}
          />
          <ellipse
            cx={isSleeping ? '22' : '22'}
            cy={isSleeping ? '39' : '21'}
            rx="3"
            ry="4"
            fill={innerEarColor}
          />
          
          {/* Right ear - cute rounded */}
          <ellipse
            cx={isSleeping ? '42' : '42'}
            cy={isSleeping ? '38' : '20'}
            rx="5"
            ry="6"
            fill={bodyColor}
            className={cn(earClass, stateStr === 'tap_reaction' ? 'animate-cat-ear-perk-alt' : '')}
          />
          <ellipse
            cx={isSleeping ? '42' : '42'}
            cy={isSleeping ? '39' : '21'}
            rx="3"
            ry="4"
            fill={innerEarColor}
          />
          
          {/* Eyes */}
          {eyesOpen ? (
            <g className={isBlinking ? 'animate-cat-blink' : ''}>
              {eyesHappy ? (
                // Happy curved eyes
                <>
                  <path d="M25 25 Q27 23 29 25" stroke={eyeColor} strokeWidth="2" fill="none" strokeLinecap="round" />
                  <path d="M35 25 Q37 23 39 25" stroke={eyeColor} strokeWidth="2" fill="none" strokeLinecap="round" />
                </>
              ) : eyesWide ? (
                // Wide curious eyes
                <>
                  <ellipse cx="27" cy={isSleeping ? '40' : '26'} rx="3.5" ry="4" fill={eyeColor} />
                  <ellipse cx="37" cy={isSleeping ? '40' : '26'} rx="3.5" ry="4" fill={eyeColor} />
                  <circle cx="26" cy={isSleeping ? '39' : '25'} r="1.5" fill="white" opacity="0.9" />
                  <circle cx="36" cy={isSleeping ? '39' : '25'} r="1.5" fill="white" opacity="0.9" />
                </>
              ) : (
                // Normal eyes
                <>
                  <ellipse cx="27" cy={isSleeping ? '40' : '26'} rx="2.5" ry="3" fill={eyeColor} />
                  <ellipse cx="37" cy={isSleeping ? '40' : '26'} rx="2.5" ry="3" fill={eyeColor} />
                  <circle cx="26" cy={isSleeping ? '39' : '25'} r="1" fill="white" opacity="0.8" />
                  <circle cx="36" cy={isSleeping ? '39' : '25'} r="1" fill="white" opacity="0.8" />
                </>
              )}
            </g>
          ) : (
            // Closed eyes (sleeping or blinking)
            <g>
              <path 
                d={isSleeping ? "M24 40 Q27 42 30 40" : "M24 26 Q27 28 30 26"} 
                stroke={eyeColor} 
                strokeWidth="1.5" 
                fill="none" 
              />
              <path 
                d={isSleeping ? "M34 40 Q37 42 40 40" : "M34 26 Q37 28 40 26"} 
                stroke={eyeColor} 
                strokeWidth="1.5" 
                fill="none" 
              />
            </g>
          )}
          
          {/* Nose */}
          <ellipse 
            cx="32" 
            cy={isSleeping ? '45' : '31'} 
            rx="1.5" 
            ry="1" 
            fill={noseColor} 
          />
          
          {/* Mouth - open when meowing */}
          {isMeowing ? (
            <ellipse
              cx="32"
              cy="34"
              rx="2.5"
              ry="2"
              fill="#1f2937"
              className="animate-cat-mouth-meow"
            />
          ) : (
            <path
              d={isSleeping ? "M30 47 Q32 49 34 47" : "M30 33 Q32 35 34 33"}
              stroke={isDark ? '#4b5563' : '#92400e'}
              strokeWidth="1"
              fill="none"
            />
          )}
          
          {/* Whiskers */}
          <g stroke={whiskerColor} strokeWidth="0.5" className={stateStr === 'tap_reaction' ? 'animate-cat-whisker-twitch' : ''}>
            <line x1="18" y1={isSleeping ? '44' : '30'} x2="26" y2={isSleeping ? '45' : '31'} />
            <line x1="18" y1={isSleeping ? '46' : '32'} x2="26" y2={isSleeping ? '46' : '32'} />
            <line x1="18" y1={isSleeping ? '48' : '34'} x2="26" y2={isSleeping ? '47' : '33'} />
            <line x1="46" y1={isSleeping ? '44' : '30'} x2="38" y2={isSleeping ? '45' : '31'} />
            <line x1="46" y1={isSleeping ? '46' : '32'} x2="38" y2={isSleeping ? '46' : '32'} />
            <line x1="46" y1={isSleeping ? '48' : '34'} x2="38" y2={isSleeping ? '47' : '33'} />
          </g>
        </g>
        
        {/* Sleep Zs */}
        {isSleeping && (
          <g className="animate-cat-zzz">
            <text x="48" y="32" className="text-[8px] fill-primary font-bold">z</text>
            <text x="52" y="26" className="text-[6px] fill-primary font-bold opacity-70">z</text>
            <text x="56" y="22" className="text-[5px] fill-primary font-bold opacity-50">z</text>
          </g>
        )}
        
        {/* Grooming paw near face */}
        {stateStr === 'grooming' && (
          <ellipse
            cx="28"
            cy="28"
            rx="3"
            ry="4"
            fill={bodyColor}
            className="animate-cat-groom-paw"
          />
        )}
      </g>
      
      {/* Costume layer - rendered on top, positioned to follow cat */}
      <g 
        className="cat-costume-layer"
        style={{
          transform: isSleeping ? 'translate(0, 14px)' : 'none',
          transformOrigin: 'center',
        }}
      >
        <CatCostume costume={costume as any} isDark={isDark} />
      </g>
    </svg>
  );
});

CatBody.displayName = 'CatBody';

// Styles component to keep animations separate and clean
const CatStyles = memo(() => (
  <style>{`
    /* Body animations */
    @keyframes cat-stretch {
      0%, 100% { transform: scaleX(1) scaleY(1); }
      50% { transform: scaleX(1.12) scaleY(0.92); }
    }
    .animate-cat-stretch { animation: cat-stretch 2.5s ease-in-out; }
    
    @keyframes cat-playful {
      0%, 100% { transform: rotate(0deg) translateY(0); }
      25% { transform: rotate(-5deg) translateY(-3px); }
      50% { transform: rotate(5deg) translateY(0); }
      75% { transform: rotate(-3deg) translateY(-2px); }
    }
    .animate-cat-playful { animation: cat-playful 1.5s ease-in-out; }
    
    @keyframes cat-hop {
      0%, 100% { transform: translateY(0); }
      30% { transform: translateY(-8px); }
      50% { transform: translateY(-4px); }
      70% { transform: translateY(-6px); }
    }
    .animate-cat-hop { animation: cat-hop 0.8s ease-out; }
    
    @keyframes cat-curl {
      0%, 100% { transform: scale(1); }
    }
    .animate-cat-curl { transform: scale(0.95); }
    
    @keyframes cat-breathe {
      0%, 100% { transform: scaleY(1); }
      50% { transform: scaleY(1.03); }
    }
    .animate-cat-breathe { animation: cat-breathe 2.5s ease-in-out infinite; }
    
    /* Head animations */
    @keyframes cat-head-tilt {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(12deg); }
    }
    .animate-cat-head-tilt { animation: cat-head-tilt 0.6s ease-out; }
    
    @keyframes cat-head-down {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(2px); }
    }
    .animate-cat-head-down { animation: cat-head-down 1.5s ease-in-out infinite; }
    
    /* Ear animations */
    @keyframes cat-ear-perk {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(-8deg); }
    }
    .animate-cat-ear-perk { animation: cat-ear-perk 0.4s ease-out; }
    .animate-cat-ear-perk-alt { animation: cat-ear-perk 0.4s ease-out 0.1s; }
    
    @keyframes cat-ear-twitch {
      0%, 100% { transform: rotate(0deg) translateY(0); }
      25% { transform: rotate(-5deg) translateY(-1px); }
      50% { transform: rotate(3deg) translateY(0); }
      75% { transform: rotate(-3deg) translateY(-1px); }
    }
    .animate-cat-ear-twitch { animation: cat-ear-twitch 0.4s ease-in-out 2; }
    
    @keyframes cat-ears-back {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(15deg) translateX(2px); }
    }
    .animate-cat-ears-back { animation: cat-ears-back 0.3s ease-out forwards; }
    
    @keyframes cat-ears-forward {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(-10deg); }
    }
    .animate-cat-ears-forward { animation: cat-ears-forward 0.5s ease-out; }
    
    /* Eye animations */
    @keyframes cat-blink {
      0%, 100% { transform: scaleY(1); }
      50% { transform: scaleY(0.1); }
    }
    .animate-cat-blink { animation: cat-blink 0.15s ease-in-out; }
    
    /* Tail animations */
    @keyframes cat-tail-idle {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(8deg); }
    }
    .animate-cat-tail-idle { animation: cat-tail-idle 3s ease-in-out infinite; transform-origin: 46px 42px; }
    
    @keyframes cat-tail-wag {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(15deg); }
      75% { transform: rotate(-15deg); }
    }
    .animate-cat-tail-wag { animation: cat-tail-wag 0.3s ease-in-out infinite; transform-origin: 46px 42px; }
    
    @keyframes cat-tail-wrap {
      0%, 100% { transform: rotate(0deg); }
    }
    .animate-cat-tail-wrap { transform-origin: 24px 48px; }
    
    @keyframes cat-tail-swish {
      0%, 100% { transform: rotate(0deg); }
      20% { transform: rotate(25deg); }
      40% { transform: rotate(-20deg); }
      60% { transform: rotate(15deg); }
      80% { transform: rotate(-10deg); }
    }
    .animate-cat-tail-swish { animation: cat-tail-swish 1.5s ease-in-out; transform-origin: 46px 42px; }
    
    @keyframes cat-tail-excited {
      0%, 100% { transform: rotate(0deg); }
      10% { transform: rotate(20deg); }
      20% { transform: rotate(-20deg); }
      30% { transform: rotate(18deg); }
      40% { transform: rotate(-18deg); }
      50% { transform: rotate(15deg); }
      60% { transform: rotate(-15deg); }
      70% { transform: rotate(10deg); }
      80% { transform: rotate(-10deg); }
      90% { transform: rotate(5deg); }
    }
    .animate-cat-tail-excited { animation: cat-tail-excited 1.5s ease-in-out; transform-origin: 46px 42px; }
    
    @keyframes cat-tail-twitch {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(5deg); }
      50% { transform: rotate(-3deg); }
      75% { transform: rotate(4deg); }
    }
    .animate-cat-tail-twitch { animation: cat-tail-twitch 0.3s ease-in-out infinite; transform-origin: 46px 42px; }
    
    @keyframes cat-tail-puff {
      0% { transform: scale(1); }
      50% { transform: scale(1.3) rotate(10deg); }
      100% { transform: scale(1.2) rotate(5deg); }
    }
    .animate-cat-tail-puff { animation: cat-tail-puff 0.3s ease-out forwards; transform-origin: 46px 42px; }
    
    @keyframes cat-tail-heart {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(10deg) translateY(-2px); }
      50% { transform: rotate(-5deg) translateY(-4px); }
      75% { transform: rotate(8deg) translateY(-2px); }
    }
    .animate-cat-tail-heart { animation: cat-tail-heart 1s ease-in-out; transform-origin: 46px 42px; }
    
    /* Paw animations */
    @keyframes cat-paw-lick {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-8px) rotate(-20deg); }
    }
    .animate-cat-paw-lick { animation: cat-paw-lick 1s ease-in-out infinite; transform-origin: center; }
    
    @keyframes cat-groom-paw {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-2px); }
    }
    .animate-cat-groom-paw { animation: cat-groom-paw 0.5s ease-in-out infinite; }
    
    @keyframes cat-walk-paw-l {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
    }
    .animate-cat-walk-paw-l { animation: cat-walk-paw-l 0.25s ease-in-out infinite; }
    
    @keyframes cat-walk-paw-r {
      0%, 100% { transform: translateY(-3px); }
      50% { transform: translateY(0); }
    }
    .animate-cat-walk-paw-r { animation: cat-walk-paw-r 0.25s ease-in-out infinite; }
    
    @keyframes cat-lick-paw {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      30% { transform: translateY(-10px) rotate(-25deg); }
      60% { transform: translateY(-8px) rotate(-20deg); }
    }
    .animate-cat-lick-paw { animation: cat-lick-paw 2s ease-in-out infinite; }
    
    @keyframes cat-scratch {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      20% { transform: translateY(-12px) rotate(-30deg); }
      40% { transform: translateY(-10px) rotate(-25deg); }
      60% { transform: translateY(-12px) rotate(-30deg); }
      80% { transform: translateY(-10px) rotate(-25deg); }
    }
    .animate-cat-scratch { animation: cat-scratch 1.8s ease-in-out infinite; }
    
    @keyframes cat-knead-paw {
      0%, 100% { transform: translateY(0); }
      25% { transform: translateY(-2px); }
      50% { transform: translateY(0); }
      75% { transform: translateY(-2px); }
    }
    .animate-cat-knead-paw { animation: cat-knead-paw 0.6s ease-in-out infinite; }
    
    @keyframes cat-wave-paw {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      25% { transform: translateY(-8px) rotate(-15deg); }
      50% { transform: translateY(-6px) rotate(10deg); }
      75% { transform: translateY(-8px) rotate(-10deg); }
    }
    .animate-cat-wave-paw { animation: cat-wave-paw 0.8s ease-in-out 2; }
    
    /* Whisker animation */
    @keyframes cat-whisker-twitch {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(3deg); }
    }
    .animate-cat-whisker-twitch { animation: cat-whisker-twitch 0.2s ease-in-out 3; }
    
    @keyframes cat-whisker-sniff {
      0%, 100% { transform: rotate(0deg) translateX(0); }
      25% { transform: rotate(2deg) translateX(1px); }
      50% { transform: rotate(-2deg) translateX(-1px); }
      75% { transform: rotate(1deg) translateX(0.5px); }
    }
    .animate-cat-whisker-sniff { animation: cat-whisker-sniff 0.3s ease-in-out 4; }
    
    /* Sleep Zs */
    @keyframes cat-zzz {
      0%, 100% { opacity: 0; transform: translateY(0); }
      50% { opacity: 1; transform: translateY(-8px); }
    }
    .animate-cat-zzz { animation: cat-zzz 2.5s ease-in-out infinite; }
    
    /* Tap animations */
    @keyframes cat-bounce {
      0%, 100% { transform: translateY(0) scaleY(1); }
      20% { transform: translateY(-12px) scaleY(1.05); }
      40% { transform: translateY(0) scaleY(0.9); }
      60% { transform: translateY(-6px) scaleY(1.02); }
      80% { transform: translateY(0) scaleY(0.95); }
    }
    .animate-cat-bounce { animation: cat-bounce 0.7s ease-out; }
    
    @keyframes cat-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .animate-cat-spin { animation: cat-spin 0.6s ease-in-out; }
    
    @keyframes cat-meow-body {
      0%, 100% { transform: translateY(0); }
      25% { transform: translateY(-2px); }
      50% { transform: translateY(0); }
      75% { transform: translateY(-1px); }
    }
    .animate-cat-meow-body { animation: cat-meow-body 1s ease-in-out; }
    
    @keyframes cat-head-meow {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      30% { transform: translateY(-3px) rotate(-5deg); }
      60% { transform: translateY(-2px) rotate(3deg); }
    }
    .animate-cat-head-meow { animation: cat-head-meow 1s ease-in-out; }
    
    @keyframes cat-mouth-meow {
      0%, 100% { transform: scaleY(1); }
      25% { transform: scaleY(1.3); }
      50% { transform: scaleY(0.8); }
      75% { transform: scaleY(1.2); }
    }
    .animate-cat-mouth-meow { animation: cat-mouth-meow 0.8s ease-in-out; transform-origin: center; }
    
    @keyframes cat-curious {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
    .animate-cat-curious { animation: cat-curious 1.2s ease-in-out; }
    
    @keyframes cat-head-curious {
      0%, 100% { transform: rotate(0deg); }
      30% { transform: rotate(-15deg); }
      70% { transform: rotate(10deg); }
    }
    .animate-cat-head-curious { animation: cat-head-curious 1.2s ease-in-out; }
    
    @keyframes cat-tail-perk {
      0%, 100% { transform: rotate(0deg); }
      50% { transform: rotate(20deg); }
    }
    .animate-cat-tail-perk { animation: cat-tail-perk 0.4s ease-out; transform-origin: 46px 42px; }
    
    @keyframes cat-tail-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(180deg); }
    }
    .animate-cat-tail-spin { animation: cat-tail-spin 0.6s ease-in-out; transform-origin: 46px 42px; }
    
    /* New tap reaction animations */
    @keyframes cat-love {
      0%, 100% { transform: scale(1) translateY(0); }
      25% { transform: scale(1.05) translateY(-3px); }
      50% { transform: scale(1.08) translateY(-5px); }
      75% { transform: scale(1.05) translateY(-3px); }
    }
    .animate-cat-love { animation: cat-love 1s ease-in-out; }
    
    @keyframes cat-head-love {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(-8deg); }
      50% { transform: rotate(8deg); }
      75% { transform: rotate(-5deg); }
    }
    .animate-cat-head-love { animation: cat-head-love 1s ease-in-out; }
    
    @keyframes cat-roll {
      0% { transform: rotate(0deg); }
      50% { transform: rotate(180deg) translateY(-10px); }
      100% { transform: rotate(360deg) translateY(0); }
    }
    .animate-cat-roll { animation: cat-roll 1.2s ease-in-out; }
    
    @keyframes cat-shake {
      0%, 100% { transform: translateX(0); }
      10% { transform: translateX(-3px); }
      20% { transform: translateX(3px); }
      30% { transform: translateX(-3px); }
      40% { transform: translateX(3px); }
      50% { transform: translateX(-2px); }
      60% { transform: translateX(2px); }
      70% { transform: translateX(-1px); }
      80% { transform: translateX(1px); }
    }
    .animate-cat-shake { animation: cat-shake 0.6s ease-in-out; }
    
    @keyframes cat-wave {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
    }
    .animate-cat-wave { animation: cat-wave 0.8s ease-in-out; }
    
    @keyframes cat-jump {
      0%, 100% { transform: translateY(0) scaleY(1); }
      30% { transform: translateY(-20px) scaleY(1.1); }
      50% { transform: translateY(-25px) scaleY(1.05); }
      70% { transform: translateY(-15px) scaleY(1.08); }
    }
    .animate-cat-jump { animation: cat-jump 0.7s ease-out; }
    
    /* Idle variation animations */
    @keyframes cat-look-left {
      0%, 100% { transform: rotate(0deg) translateX(0); }
      50% { transform: rotate(-10deg) translateX(-2px); }
    }
    .animate-cat-look-left { animation: cat-look-left 1.5s ease-in-out; }
    
    @keyframes cat-look-right {
      0%, 100% { transform: rotate(0deg) translateX(0); }
      50% { transform: rotate(10deg) translateX(2px); }
    }
    .animate-cat-look-right { animation: cat-look-right 1.5s ease-in-out; }
    
    @keyframes cat-look-up {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-3px) rotate(-5deg); }
    }
    .animate-cat-look-up { animation: cat-look-up 1.2s ease-in-out; }
    
    @keyframes cat-sniff {
      0%, 100% { transform: translateY(0); }
      20% { transform: translateY(-1px); }
      40% { transform: translateY(0); }
      60% { transform: translateY(-1px); }
      80% { transform: translateY(0); }
    }
    .animate-cat-sniff { animation: cat-sniff 0.8s ease-in-out; }
    
    @keyframes cat-yawn {
      0%, 100% { transform: scaleY(1); }
      30% { transform: scaleY(1.02); }
      50% { transform: scaleY(1.05); }
      70% { transform: scaleY(1.02); }
    }
    .animate-cat-yawn { animation: cat-yawn 1.8s ease-in-out; }
    
    @keyframes cat-head-yawn {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      30% { transform: translateY(-2px) rotate(-3deg); }
      50% { transform: translateY(-3px) rotate(-5deg); }
      70% { transform: translateY(-2px) rotate(-3deg); }
    }
    .animate-cat-head-yawn { animation: cat-head-yawn 1.8s ease-in-out; }
    
    @keyframes cat-head-shake {
      0%, 100% { transform: rotate(0deg); }
      20% { transform: rotate(-8deg); }
      40% { transform: rotate(8deg); }
      60% { transform: rotate(-5deg); }
      80% { transform: rotate(5deg); }
    }
    .animate-cat-head-shake { animation: cat-head-shake 0.6s ease-in-out; }
    
    /* Active behavior animations */
    @keyframes cat-pounce-ready {
      0%, 100% { transform: scaleY(0.9) scaleX(1.05); }
      50% { transform: scaleY(0.85) scaleX(1.08); }
    }
    .animate-cat-pounce-ready { animation: cat-pounce-ready 0.8s ease-in-out infinite; }
    
    @keyframes cat-pounce {
      0% { transform: translateY(0) translateX(0) scaleY(1); }
      30% { transform: translateY(-15px) translateX(20px) scaleY(1.1); }
      60% { transform: translateY(-5px) translateX(35px) scaleY(0.95); }
      100% { transform: translateY(0) translateX(40px) scaleY(1); }
    }
    .animate-cat-pounce { animation: cat-pounce 0.6s ease-out; }
    
    @keyframes cat-loaf {
      0%, 100% { transform: scaleX(1.1) scaleY(0.85); }
    }
    .animate-cat-loaf { transform: scaleX(1.1) scaleY(0.85); }
    
    @keyframes cat-knead {
      0%, 100% { transform: translateY(0); }
      25% { transform: translateY(-1px); }
      50% { transform: translateY(0); }
      75% { transform: translateY(-1px); }
    }
    .animate-cat-knead { animation: cat-knead 1s ease-in-out infinite; }
    
    @keyframes cat-belly-up {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(180deg) scaleY(-1); }
    }
    .animate-cat-belly-up { transform: rotate(20deg) scaleY(0.9); }
    
    @keyframes cat-sit-tall {
      0%, 100% { transform: scaleY(1.1) translateY(-3px); }
    }
    .animate-cat-sit-tall { transform: scaleY(1.08) translateY(-2px); }
    
    @keyframes cat-crouch {
      0%, 100% { transform: scaleY(0.8) scaleX(1.1); }
    }
    .animate-cat-crouch { transform: scaleY(0.8) scaleX(1.08); }
    
    @keyframes cat-startled {
      0% { transform: translateY(0) scaleY(1); }
      30% { transform: translateY(-10px) scaleY(1.15); }
      100% { transform: translateY(-5px) scaleY(1.1); }
    }
    .animate-cat-startled { animation: cat-startled 0.4s ease-out forwards; }
    
    @keyframes cat-head-startled {
      0% { transform: rotate(0deg); }
      50% { transform: rotate(-10deg) translateY(-3px); }
      100% { transform: rotate(-5deg) translateY(-2px); }
    }
    .animate-cat-head-startled { animation: cat-head-startled 0.4s ease-out forwards; }
    
    @keyframes cat-happy-dance {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      20% { transform: translateY(-5px) rotate(-5deg); }
      40% { transform: translateY(0) rotate(5deg); }
      60% { transform: translateY(-5px) rotate(-3deg); }
      80% { transform: translateY(0) rotate(3deg); }
    }
    .animate-cat-happy-dance { animation: cat-happy-dance 1.5s ease-in-out; }
    
    @keyframes cat-tail-chase {
      0% { transform: rotate(0deg); }
      25% { transform: rotate(90deg); }
      50% { transform: rotate(180deg); }
      75% { transform: rotate(270deg); }
      100% { transform: rotate(360deg); }
    }
    .animate-cat-tail-chase { animation: cat-tail-chase 2s linear; }
    
    /* Costume entrance */
    @keyframes costume-in {
      0% { opacity: 0; transform: scale(0.8); }
      100% { opacity: 1; transform: scale(1); }
    }
    .animate-costume-in { animation: costume-in 0.3s ease-out; }
  `}</style>
));

CatStyles.displayName = 'CatStyles';

export default CatCompanion;
