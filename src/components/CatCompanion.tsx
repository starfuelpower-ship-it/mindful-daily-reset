import { useState, useEffect, useRef, memo, useCallback } from 'react';
import { useCompanion } from '@/contexts/CompanionContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

type CatAnimation = 'idle' | 'blink' | 'groom' | 'stretch' | 'sleep' | 'tail' | 'walk' | 'happy' | 'roll' | 'pounce' | 'curious' | 'yawn' | 'pawLick' | 'sit' | 'meow';

const IDLE_ANIMATIONS: CatAnimation[] = ['idle', 'blink', 'groom', 'stretch', 'sleep', 'tail', 'pounce', 'curious', 'yawn', 'pawLick', 'sit', 'meow'];
const ANIMATION_DURATIONS: Record<CatAnimation, number> = {
  idle: 2000,
  blink: 600,
  groom: 2000,
  stretch: 1800,
  sleep: 3500,
  tail: 1200,
  walk: 2500,
  happy: 1000,
  roll: 1800,
  pounce: 1500,
  curious: 2000,
  yawn: 2200,
  pawLick: 1800,
  sit: 2500,
  meow: 1200,
};

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
  const { showCompanion, companionType, currentReaction } = useCompanion();
  const { resolvedTheme } = useTheme();
  const [animation, setAnimation] = useState<CatAnimation>('idle');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragPosition, setDragPosition] = useState(loadSavedPosition);
  const [scale, setScale] = useState(loadSavedScale);
  const [isDragging, setIsDragging] = useState(false);
  const [isPinching, setIsPinching] = useState(false);
  const [isWalking, setIsWalking] = useState(false);
  const [facingLeft, setFacingLeft] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const touchReactionTimeout = useRef<NodeJS.Timeout>();

  // Touch reaction animations
  const TOUCH_REACTIONS: CatAnimation[] = ['happy', 'curious', 'meow', 'pounce', 'stretch', 'yawn'];
  
  const triggerTouchReaction = () => {
    if (touchReactionTimeout.current) clearTimeout(touchReactionTimeout.current);
    const reaction = TOUCH_REACTIONS[Math.floor(Math.random() * TOUCH_REACTIONS.length)];
    setAnimation(reaction);
    setIsTouched(true);
    if (reaction === 'meow') {
      setMouthOpen(true);
      setTimeout(() => setMouthOpen(false), 600);
    }
    touchReactionTimeout.current = setTimeout(() => {
      setIsTouched(false);
      setAnimation('idle');
    }, 1500);
  };
  
  const animationTimeout = useRef<NodeJS.Timeout>();
  const walkTimeout = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);
  const initialPinchDistance = useRef<number>(0);
  const initialScale = useRef<number>(DEFAULT_SCALE);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const catStartPos = useRef({ x: 0, y: 0 });

  const isDark = resolvedTheme === 'dark';

  // Handle reaction animations
  useEffect(() => {
    if (currentReaction === 'habit_complete') {
      setAnimation('happy');
    } else if (currentReaction === 'all_complete') {
      setAnimation('roll');
    }
  }, [currentReaction]);

  // Cycle through idle animations more frequently
  useEffect(() => {
    if (!showCompanion || companionType !== 'cat') return;
    if (currentReaction) return;

    const cycleAnimation = () => {
      const randomAnim = IDLE_ANIMATIONS[Math.floor(Math.random() * IDLE_ANIMATIONS.length)];
      setAnimation(randomAnim);
      
      // Meow animation opens mouth
      if (randomAnim === 'meow') {
        setMouthOpen(true);
        setTimeout(() => setMouthOpen(false), 600);
      }
      
      // Shorter delay between animations for more activity
      animationTimeout.current = setTimeout(cycleAnimation, ANIMATION_DURATIONS[randomAnim] + Math.random() * 1000);
    };

    animationTimeout.current = setTimeout(cycleAnimation, 1000);

    return () => {
      if (animationTimeout.current) clearTimeout(animationTimeout.current);
    };
  }, [showCompanion, companionType, currentReaction]);

  // Occasional walking (only when not dragged)
  useEffect(() => {
    if (!showCompanion || companionType !== 'cat') return;
    if (dragPosition.x !== 0 || dragPosition.y !== 0) return;

    const startWalk = () => {
      if (currentReaction || isDragging) return;
      
      setIsWalking(true);
      setAnimation('walk');
      
      const newX = Math.random() * 60 - 30;
      setFacingLeft(newX < position.x);
      setPosition({ x: newX, y: 0 });
      
      setTimeout(() => {
        setIsWalking(false);
        setAnimation('idle');
      }, ANIMATION_DURATIONS.walk);
    };

    const scheduleWalk = () => {
      const delay = 20000 + Math.random() * 20000;
      walkTimeout.current = setTimeout(() => {
        startWalk();
        scheduleWalk();
      }, delay);
    };

    scheduleWalk();

    return () => {
      if (walkTimeout.current) clearTimeout(walkTimeout.current);
    };
  }, [showCompanion, companionType, currentReaction, position.x, isDragging, dragPosition]);

  // Touch handlers for dragging
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
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
      triggerTouchReaction();
    }
  }, [scale, dragPosition, triggerTouchReaction]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
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
    // Save position and scale when touch ends
    localStorage.setItem(CAT_POSITION_KEY, JSON.stringify(dragPosition));
    localStorage.setItem(CAT_SCALE_KEY, String(scale));
  }, [dragPosition, scale]);

  // Mouse handlers for desktop
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    catStartPos.current = { ...dragPosition };
    triggerTouchReaction();
  }, [dragPosition, triggerTouchReaction]);

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
    // Save position when mouse up
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
    <div
      ref={containerRef}
      className={cn(
        'fixed bottom-20 right-4 z-35 select-none touch-none',
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      )}
      style={{
        transform: `translate(${position.x + dragPosition.x}px, ${dragPosition.y}px) scale(${scale})`,
        transition: isDragging || isPinching ? 'none' : isWalking ? 'transform 2.5s ease-in-out' : 'transform 0.2s ease-out',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
    >
      <div
        className={cn(
          'relative w-12 h-12 transition-transform',
          facingLeft && 'scale-x-[-1]'
        )}
      >
        {/* Cat SVG with animations */}
        <svg
          viewBox="0 0 64 64"
          className="w-full h-full"
          style={{
            filter: isDark ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
          }}
        >
          {/* Cat body */}
          <g className={cn(
            'origin-center',
            animation === 'stretch' && 'animate-cat-stretch',
            animation === 'roll' && 'animate-cat-roll',
            animation === 'pounce' && 'animate-cat-pounce',
            animation === 'curious' && 'animate-cat-curious',
          )}>
            {/* Body */}
            <ellipse
              cx="32"
              cy="42"
              rx="14"
              ry="10"
              className={cn(
                isDark ? 'fill-gray-400' : 'fill-amber-200',
                animation === 'sleep' && 'animate-cat-breathe',
                animation === 'sit' && 'animate-cat-sit-body'
              )}
            />
            
            {/* Head */}
            <circle
              cx="32"
              cy="28"
              r="12"
              className={cn(
                isDark ? 'fill-gray-400' : 'fill-amber-200',
                animation === 'curious' && 'animate-cat-head-tilt',
                animation === 'yawn' && 'animate-cat-head-back'
              )}
            />
            
            {/* Left ear */}
            <polygon
              points="22,20 26,28 18,28"
              className={cn(
                isDark ? 'fill-gray-400' : 'fill-amber-200',
                animation === 'curious' && 'animate-cat-ear-twitch'
              )}
            />
            <polygon
              points="23,22 25,26 20,26"
              className={isDark ? 'fill-gray-500' : 'fill-pink-200'}
            />
            
            {/* Right ear */}
            <polygon
              points="42,20 46,28 38,28"
              className={cn(
                isDark ? 'fill-gray-400' : 'fill-amber-200',
                animation === 'curious' && 'animate-cat-ear-twitch-alt'
              )}
            />
            <polygon
              points="41,22 44,26 39,26"
              className={isDark ? 'fill-gray-500' : 'fill-pink-200'}
            />
            
            {/* Eyes */}
            <g className={cn(
              animation === 'blink' && 'animate-cat-blink',
              animation === 'sleep' && 'opacity-0',
              animation === 'happy' && 'animate-cat-happy-eyes',
              animation === 'yawn' && 'animate-cat-squint',
              animation === 'curious' && 'animate-cat-wide-eyes'
            )}>
              <ellipse cx="27" cy="26" rx="2.5" ry={animation === 'happy' || animation === 'yawn' ? '1' : animation === 'curious' ? '4' : '3'} className="fill-gray-800" />
              <ellipse cx="37" cy="26" rx="2.5" ry={animation === 'happy' || animation === 'yawn' ? '1' : animation === 'curious' ? '4' : '3'} className="fill-gray-800" />
              {animation !== 'happy' && animation !== 'yawn' && (
                <>
                  <circle cx="26" cy="25" r="1" className="fill-white opacity-80" />
                  <circle cx="36" cy="25" r="1" className="fill-white opacity-80" />
                </>
              )}
            </g>
            
            {/* Closed eyes for sleep */}
            {animation === 'sleep' && (
              <g>
                <path d="M24 26 Q27 28 30 26" stroke={isDark ? '#374151' : '#1f2937'} strokeWidth="1.5" fill="none" />
                <path d="M34 26 Q37 28 40 26" stroke={isDark ? '#374151' : '#1f2937'} strokeWidth="1.5" fill="none" />
              </g>
            )}
            
            {/* Nose */}
            <ellipse cx="32" cy="31" rx="1.5" ry="1" className="fill-pink-400" />
            
            {/* Mouth - opens for yawn and meow */}
            {(animation === 'yawn' || mouthOpen) ? (
              <ellipse 
                cx="32" 
                cy="35" 
                rx={animation === 'yawn' ? '4' : '2'} 
                ry={animation === 'yawn' ? '3' : '1.5'} 
                className="fill-pink-300"
              />
            ) : (
              <path
                d="M30 33 Q32 35 34 33"
                stroke={isDark ? '#374151' : '#92400e'}
                strokeWidth="1"
                fill="none"
                className={animation === 'happy' ? 'animate-cat-smile' : ''}
              />
            )}
            
            {/* Tongue for yawn */}
            {animation === 'yawn' && (
              <ellipse cx="32" cy="36" rx="2" ry="1.5" className="fill-pink-400 animate-cat-tongue" />
            )}
            
            {/* Whiskers */}
            <g className={cn(isDark ? 'stroke-gray-500' : 'stroke-amber-400', animation === 'curious' && 'animate-cat-whisker-twitch')} strokeWidth="0.5">
              <line x1="18" y1="30" x2="26" y2="31" />
              <line x1="18" y1="32" x2="26" y2="32" />
              <line x1="18" y1="34" x2="26" y2="33" />
              <line x1="46" y1="30" x2="38" y2="31" />
              <line x1="46" y1="32" x2="38" y2="32" />
              <line x1="46" y1="34" x2="38" y2="33" />
            </g>
            
            {/* Front paws */}
            <ellipse cx="26" cy="50" rx="4" ry="3" className={cn(isDark ? 'fill-gray-400' : 'fill-amber-200', animation === 'pawLick' && 'animate-cat-paw-up')} />
            <ellipse cx="38" cy="50" rx="4" ry="3" className={isDark ? 'fill-gray-400' : 'fill-amber-200'} />
            
            {/* Grooming paw */}
            {(animation === 'groom' || animation === 'pawLick') && (
              <ellipse
                cx="28"
                cy="28"
                rx="3"
                ry="4"
                className={cn(isDark ? 'fill-gray-400' : 'fill-amber-200', 'animate-cat-groom')}
              />
            )}
            
            {/* Tail */}
            <path
              d="M46 42 Q56 38 54 30"
              stroke={isDark ? '#9ca3af' : '#fbbf24'}
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
              className={cn(
                animation === 'tail' && 'animate-cat-tail',
                animation === 'happy' && 'animate-cat-tail-fast',
                animation === 'curious' && 'animate-cat-tail-curious',
                animation === 'pounce' && 'animate-cat-tail-pounce'
              )}
            />
            
            {/* Walking legs */}
            {animation === 'walk' && (
              <g className="animate-cat-walk">
                <ellipse cx="26" cy="52" rx="3" ry="2" className={isDark ? 'fill-gray-400' : 'fill-amber-200'} />
                <ellipse cx="38" cy="52" rx="3" ry="2" className={isDark ? 'fill-gray-400' : 'fill-amber-200'} />
              </g>
            )}
            
            {/* Sleep Zs */}
            {animation === 'sleep' && (
              <g className="animate-cat-zzz">
                <text x="44" y="20" className="text-[8px] fill-primary font-bold">z</text>
                <text x="48" y="14" className="text-[6px] fill-primary font-bold opacity-70">z</text>
                <text x="51" y="10" className="text-[4px] fill-primary font-bold opacity-50">z</text>
              </g>
            )}
            
            {/* Meow sound waves */}
            {mouthOpen && (
              <g className="animate-cat-meow-waves">
                <path d="M40 32 Q44 30 44 34" stroke={isDark ? '#9ca3af' : '#fbbf24'} strokeWidth="1" fill="none" opacity="0.6" />
                <path d="M44 30 Q48 28 48 36" stroke={isDark ? '#9ca3af' : '#fbbf24'} strokeWidth="1" fill="none" opacity="0.4" />
              </g>
            )}
          </g>
        </svg>
      </div>
      
      {/* CSS Animations */}
      <style>{`
        @keyframes cat-blink {
          0%, 90%, 100% { transform: scaleY(1); }
          95% { transform: scaleY(0.1); }
        }
        @keyframes cat-breathe {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.05); }
        }
        @keyframes cat-stretch {
          0%, 100% { transform: scaleX(1) scaleY(1); }
          50% { transform: scaleX(1.15) scaleY(0.9); }
        }
        @keyframes cat-tail {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(10deg); }
          75% { transform: rotate(-10deg); }
        }
        @keyframes cat-tail-fast {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(15deg); }
          50% { transform: rotate(0deg); }
          75% { transform: rotate(-15deg); }
        }
        @keyframes cat-tail-curious {
          0%, 100% { transform: rotate(0deg) translateY(0); }
          50% { transform: rotate(5deg) translateY(-3px); }
        }
        @keyframes cat-tail-pounce {
          0%, 100% { transform: rotate(-10deg); }
          50% { transform: rotate(-25deg); }
        }
        @keyframes cat-groom {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-3px) rotate(-10deg); }
        }
        @keyframes cat-walk {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-2px); }
          75% { transform: translateY(-2px); }
        }
        @keyframes cat-roll {
          0% { transform: rotate(0deg); }
          25% { transform: rotate(90deg) translateY(-5px); }
          50% { transform: rotate(180deg); }
          75% { transform: rotate(270deg) translateY(-5px); }
          100% { transform: rotate(360deg); }
        }
        @keyframes cat-zzz {
          0%, 100% { opacity: 1; transform: translateY(0); }
          50% { opacity: 0.5; transform: translateY(-3px); }
        }
        @keyframes cat-happy-eyes {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.5); }
        }
        @keyframes cat-pounce {
          0%, 100% { transform: translateY(0) scaleY(1); }
          30% { transform: translateY(3px) scaleY(0.85); }
          60% { transform: translateY(-8px) scaleY(1.1); }
          80% { transform: translateY(-2px) scaleY(1); }
        }
        @keyframes cat-curious {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(3px); }
        }
        @keyframes cat-head-tilt {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(8deg); }
        }
        @keyframes cat-head-back {
          0%, 100% { transform: rotate(0deg) translateY(0); }
          50% { transform: rotate(-10deg) translateY(-2px); }
        }
        @keyframes cat-ear-twitch {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
        @keyframes cat-ear-twitch-alt {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(5deg); }
          75% { transform: rotate(-5deg); }
        }
        @keyframes cat-wide-eyes {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes cat-squint {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.3); }
        }
        @keyframes cat-tongue {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.3); }
        }
        @keyframes cat-whisker-twitch {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(2deg); }
          75% { transform: rotate(-2deg); }
        }
        @keyframes cat-paw-up {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes cat-sit-body {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.95); }
        }
        @keyframes cat-meow-waves {
          0% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 0.8; transform: scale(1.1); }
          100% { opacity: 0; transform: scale(1.3); }
        }
        
        .animate-cat-blink { animation: cat-blink 0.6s ease-in-out; }
        .animate-cat-breathe { animation: cat-breathe 2s ease-in-out infinite; }
        .animate-cat-stretch { animation: cat-stretch 1.8s ease-in-out; }
        .animate-cat-tail { animation: cat-tail 1.2s ease-in-out infinite; transform-origin: 46px 42px; }
        .animate-cat-tail-fast { animation: cat-tail-fast 0.3s ease-in-out infinite; transform-origin: 46px 42px; }
        .animate-cat-tail-curious { animation: cat-tail-curious 1s ease-in-out infinite; transform-origin: 46px 42px; }
        .animate-cat-tail-pounce { animation: cat-tail-pounce 0.3s ease-in-out infinite; transform-origin: 46px 42px; }
        .animate-cat-groom { animation: cat-groom 0.4s ease-in-out infinite; }
        .animate-cat-walk { animation: cat-walk 0.25s ease-in-out infinite; }
        .animate-cat-roll { animation: cat-roll 1.8s ease-in-out; }
        .animate-cat-zzz { animation: cat-zzz 1.5s ease-in-out infinite; }
        .animate-cat-happy-eyes { animation: cat-happy-eyes 0.25s ease-in-out infinite; }
        .animate-cat-pounce { animation: cat-pounce 1.5s ease-in-out; }
        .animate-cat-curious { animation: cat-curious 2s ease-in-out; }
        .animate-cat-head-tilt { animation: cat-head-tilt 2s ease-in-out; }
        .animate-cat-head-back { animation: cat-head-back 2.2s ease-in-out; }
        .animate-cat-ear-twitch { animation: cat-ear-twitch 0.5s ease-in-out infinite; }
        .animate-cat-ear-twitch-alt { animation: cat-ear-twitch-alt 0.5s ease-in-out infinite; }
        .animate-cat-wide-eyes { animation: cat-wide-eyes 2s ease-in-out; }
        .animate-cat-squint { animation: cat-squint 2.2s ease-in-out; }
        .animate-cat-tongue { animation: cat-tongue 1s ease-in-out infinite; }
        .animate-cat-whisker-twitch { animation: cat-whisker-twitch 0.3s ease-in-out infinite; }
        .animate-cat-paw-up { animation: cat-paw-up 0.9s ease-in-out infinite; }
        .animate-cat-sit-body { animation: cat-sit-body 2.5s ease-in-out; }
        .animate-cat-meow-waves { animation: cat-meow-waves 0.6s ease-out forwards; }
        .animate-cat-smile { transform: scaleY(1.3); }
      `}</style>
    </div>
  );
});

CatCompanion.displayName = 'CatCompanion';
