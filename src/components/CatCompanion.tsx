import { useState, useEffect, useRef, memo, useCallback } from 'react';
import { useCompanion } from '@/contexts/CompanionContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

type CatAnimation = 'idle' | 'blink' | 'groom' | 'stretch' | 'sleep' | 'tail' | 'walk' | 'happy' | 'roll';

const IDLE_ANIMATIONS: CatAnimation[] = ['idle', 'blink', 'groom', 'stretch', 'sleep', 'tail'];
const ANIMATION_DURATIONS: Record<CatAnimation, number> = {
  idle: 3000,
  blink: 800,
  groom: 2500,
  stretch: 2000,
  sleep: 4000,
  tail: 1500,
  walk: 3000,
  happy: 1200,
  roll: 2000,
};

const MIN_SCALE = 0.6;
const MAX_SCALE = 1.5;
const DEFAULT_SCALE = 1;

export const CatCompanion = memo(() => {
  const { showCompanion, companionType, currentReaction } = useCompanion();
  const { resolvedTheme } = useTheme();
  const [animation, setAnimation] = useState<CatAnimation>('idle');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(DEFAULT_SCALE);
  const [isDragging, setIsDragging] = useState(false);
  const [isPinching, setIsPinching] = useState(false);
  const [isWalking, setIsWalking] = useState(false);
  const [facingLeft, setFacingLeft] = useState(false);
  
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

  // Cycle through idle animations
  useEffect(() => {
    if (!showCompanion || companionType !== 'cat') return;
    if (currentReaction) return;

    const cycleAnimation = () => {
      const randomAnim = IDLE_ANIMATIONS[Math.floor(Math.random() * IDLE_ANIMATIONS.length)];
      setAnimation(randomAnim);
      
      animationTimeout.current = setTimeout(cycleAnimation, ANIMATION_DURATIONS[randomAnim] + Math.random() * 2000);
    };

    animationTimeout.current = setTimeout(cycleAnimation, 2000);

    return () => {
      if (animationTimeout.current) clearTimeout(animationTimeout.current);
    };
  }, [showCompanion, companionType, currentReaction]);

  // Occasional walking (only when not dragged)
  useEffect(() => {
    if (!showCompanion || companionType !== 'cat') return;
    if (dragPosition.x !== 0 || dragPosition.y !== 0) return; // Don't walk if user moved the cat

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
      const delay = 30000 + Math.random() * 30000;
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
      // Pinch gesture
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      initialPinchDistance.current = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      initialScale.current = scale;
      setIsPinching(true);
    } else if (e.touches.length === 1) {
      // Drag gesture
      setIsDragging(true);
      dragStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      catStartPos.current = { ...dragPosition };
    }
  }, [scale, dragPosition]);

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
      
      // Constrain to screen bounds
      const maxX = window.innerWidth - 60;
      const maxY = window.innerHeight - 140;
      
      const newX = Math.min(maxX, Math.max(-maxX + 120, catStartPos.current.x + deltaX));
      const newY = Math.min(0, Math.max(-maxY, catStartPos.current.y + deltaY));
      
      setDragPosition({ x: newX, y: newY });
      
      // Face direction of movement
      if (Math.abs(deltaX) > 5) {
        setFacingLeft(deltaX < 0);
      }
    }
  }, [isPinching, isDragging]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setIsPinching(false);
  }, []);

  // Mouse handlers for desktop
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    catStartPos.current = { ...dragPosition };
  }, [dragPosition]);

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
  }, []);

  // Mouse wheel for scaling on desktop
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setScale((prev) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, prev + delta)));
  }, []);

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
        transition: isDragging || isPinching ? 'none' : isWalking ? 'transform 3s ease-in-out' : 'transform 0.2s ease-out',
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
          )}>
            {/* Body */}
            <ellipse
              cx="32"
              cy="42"
              rx="14"
              ry="10"
              className={cn(
                isDark ? 'fill-gray-400' : 'fill-amber-200',
                animation === 'sleep' && 'animate-cat-breathe'
              )}
            />
            
            {/* Head */}
            <circle
              cx="32"
              cy="28"
              r="12"
              className={isDark ? 'fill-gray-400' : 'fill-amber-200'}
            />
            
            {/* Left ear */}
            <polygon
              points="22,20 26,28 18,28"
              className={isDark ? 'fill-gray-400' : 'fill-amber-200'}
            />
            <polygon
              points="23,22 25,26 20,26"
              className={isDark ? 'fill-gray-500' : 'fill-pink-200'}
            />
            
            {/* Right ear */}
            <polygon
              points="42,20 46,28 38,28"
              className={isDark ? 'fill-gray-400' : 'fill-amber-200'}
            />
            <polygon
              points="41,22 44,26 39,26"
              className={isDark ? 'fill-gray-500' : 'fill-pink-200'}
            />
            
            {/* Eyes */}
            <g className={cn(
              animation === 'blink' && 'animate-cat-blink',
              animation === 'sleep' && 'opacity-0',
              animation === 'happy' && 'animate-cat-happy-eyes'
            )}>
              <ellipse cx="27" cy="26" rx="2.5" ry={animation === 'happy' ? '1' : '3'} className="fill-gray-800" />
              <ellipse cx="37" cy="26" rx="2.5" ry={animation === 'happy' ? '1' : '3'} className="fill-gray-800" />
              {animation !== 'happy' && (
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
            
            {/* Mouth */}
            <path
              d="M30 33 Q32 35 34 33"
              stroke={isDark ? '#374151' : '#92400e'}
              strokeWidth="1"
              fill="none"
              className={animation === 'happy' ? 'animate-cat-smile' : ''}
            />
            
            {/* Whiskers */}
            <g className={isDark ? 'stroke-gray-500' : 'stroke-amber-400'} strokeWidth="0.5">
              <line x1="18" y1="30" x2="26" y2="31" />
              <line x1="18" y1="32" x2="26" y2="32" />
              <line x1="18" y1="34" x2="26" y2="33" />
              <line x1="46" y1="30" x2="38" y2="31" />
              <line x1="46" y1="32" x2="38" y2="32" />
              <line x1="46" y1="34" x2="38" y2="33" />
            </g>
            
            {/* Front paws */}
            <ellipse cx="26" cy="50" rx="4" ry="3" className={isDark ? 'fill-gray-400' : 'fill-amber-200'} />
            <ellipse cx="38" cy="50" rx="4" ry="3" className={isDark ? 'fill-gray-400' : 'fill-amber-200'} />
            
            {/* Grooming paw */}
            {animation === 'groom' && (
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
                animation === 'happy' && 'animate-cat-tail-fast'
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
        
        .animate-cat-blink { animation: cat-blink 0.8s ease-in-out; }
        .animate-cat-breathe { animation: cat-breathe 2s ease-in-out infinite; }
        .animate-cat-stretch { animation: cat-stretch 2s ease-in-out; }
        .animate-cat-tail { animation: cat-tail 1.5s ease-in-out infinite; transform-origin: 46px 42px; }
        .animate-cat-tail-fast { animation: cat-tail-fast 0.4s ease-in-out infinite; transform-origin: 46px 42px; }
        .animate-cat-groom { animation: cat-groom 0.5s ease-in-out infinite; }
        .animate-cat-walk { animation: cat-walk 0.3s ease-in-out infinite; }
        .animate-cat-roll { animation: cat-roll 2s ease-in-out; }
        .animate-cat-zzz { animation: cat-zzz 1.5s ease-in-out infinite; }
        .animate-cat-happy-eyes { animation: cat-happy-eyes 0.3s ease-in-out infinite; }
        .animate-cat-smile { transform: scaleY(1.3); }
      `}</style>
    </div>
  );
});

CatCompanion.displayName = 'CatCompanion';
