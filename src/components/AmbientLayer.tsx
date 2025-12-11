import { useEffect, useRef, memo, useState } from 'react';
import { useAmbient, AmbientMode } from '@/contexts/AmbientContext';
import { cn } from '@/lib/utils';

// Rain effect component - very subtle overlay
const RainEffect = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const drops: { x: number; y: number; speed: number; length: number; opacity: number }[] = [];
    const dropCount = 25; // Very low density

    for (let i = 0; i < dropCount; i++) {
      drops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 0.8 + Math.random() * 1, // Slow speed
        length: 12 + Math.random() * 15,
        opacity: 0.04 + Math.random() * 0.06, // Very low opacity
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drops.forEach((drop) => {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + 0.3, drop.y + drop.length);
        ctx.strokeStyle = `rgba(180, 200, 220, ${drop.opacity})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();

        drop.y += drop.speed;
        if (drop.y > canvas.height) {
          drop.y = -drop.length;
          drop.x = Math.random() * canvas.width;
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0"
      style={{ filter: 'blur(0.3px)' }}
    />
  );
});

RainEffect.displayName = 'RainEffect';

// Sun rays effect component - very subtle
const SunRaysEffect = memo(() => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: '-40%',
            right: `${8 + i * 15}%`,
            width: '120px',
            height: '200%',
            background: `linear-gradient(
              135deg,
              rgba(255, 250, 230, ${0.02 + i * 0.008}) 0%,
              rgba(255, 235, 180, ${0.015}) 50%,
              transparent 100%
            )`,
            transform: `rotate(${22 + i * 8}deg)`,
            filter: 'blur(30px)',
            animation: `sunRayFade ${9 + i * 2}s ease-in-out infinite`,
            animationDelay: `${i * 1.5}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes sunRayFade {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
});

SunRaysEffect.displayName = 'SunRaysEffect';

// Snow effect component - very subtle
const SnowEffect = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const flakes: { x: number; y: number; speed: number; size: number; opacity: number; drift: number }[] = [];
    const flakeCount = 18; // Very light density

    for (let i = 0; i < flakeCount; i++) {
      flakes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 0.2 + Math.random() * 0.3, // Very slow
        size: 1.5 + Math.random() * 2,
        opacity: 0.06 + Math.random() * 0.08, // Very low opacity
        drift: Math.random() * 0.3 - 0.15,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      flakes.forEach((flake) => {
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
        ctx.fill();

        flake.y += flake.speed;
        flake.x += flake.drift + Math.sin(flake.y * 0.008) * 0.2;

        if (flake.y > canvas.height) {
          flake.y = -flake.size;
          flake.x = Math.random() * canvas.width;
        }
        if (flake.x > canvas.width) flake.x = 0;
        if (flake.x < 0) flake.x = canvas.width;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0"
      style={{ filter: 'blur(0.3px)' }}
    />
  );
});

SnowEffect.displayName = 'SnowEffect';

const effectComponents: Record<AmbientMode, React.ComponentType | null> = {
  off: null,
  rain: RainEffect,
  sun_rays: SunRaysEffect,
  snow: SnowEffect,
};

export function AmbientLayer() {
  const { ambientMode, visualsEnabled } = useAmbient();
  const [isVisible, setIsVisible] = useState(false);
  const [currentMode, setCurrentMode] = useState<AmbientMode>(ambientMode);

  // Handle fade transitions
  useEffect(() => {
    if (visualsEnabled && ambientMode !== 'off') {
      // Fade in new effect
      setCurrentMode(ambientMode);
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      // Fade out
      setIsVisible(false);
    }
  }, [ambientMode, visualsEnabled]);

  if (!visualsEnabled && !isVisible) {
    return null;
  }

  const EffectComponent = effectComponents[currentMode];

  if (!EffectComponent && !isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        'fixed inset-0 pointer-events-none z-40 transition-opacity duration-700 ease-in-out',
        isVisible && EffectComponent ? 'opacity-100' : 'opacity-0'
      )}
      aria-hidden="true"
    >
      {EffectComponent && <EffectComponent />}
    </div>
  );
}
