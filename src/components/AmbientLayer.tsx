import { useEffect, useRef, memo } from 'react';
import { useAmbient, AmbientMode } from '@/contexts/AmbientContext';

// Rain effect component
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
    const dropCount = 40; // Low density

    for (let i = 0; i < dropCount; i++) {
      drops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 1 + Math.random() * 1.5, // Slow speed
        length: 15 + Math.random() * 20,
        opacity: 0.1 + Math.random() * 0.15,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drops.forEach((drop) => {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + 0.5, drop.y + drop.length);
        ctx.strokeStyle = `rgba(150, 180, 200, ${drop.opacity})`;
        ctx.lineWidth = 1;
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
      className="fixed inset-0 pointer-events-none z-0"
      style={{ filter: 'blur(0.5px)' }}
    />
  );
});

RainEffect.displayName = 'RainEffect';

// Sun rays effect component
const SunRaysEffect = memo(() => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: '-30%',
            right: `${5 + i * 12}%`,
            width: '150px',
            height: '180%',
            background: `linear-gradient(
              135deg,
              rgba(255, 248, 220, ${0.06 + i * 0.015}) 0%,
              rgba(255, 223, 150, ${0.04}) 50%,
              transparent 100%
            )`,
            transform: `rotate(${20 + i * 6}deg)`,
            filter: 'blur(25px)',
            animation: `sunRayFade ${7 + i * 1.5}s ease-in-out infinite`,
            animationDelay: `${i * 1}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes sunRayFade {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
});

SunRaysEffect.displayName = 'SunRaysEffect';

// Snow effect component
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
    const flakeCount = 30; // Very light density

    for (let i = 0; i < flakeCount; i++) {
      flakes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 0.3 + Math.random() * 0.5, // Very slow
        size: 2 + Math.random() * 3,
        opacity: 0.15 + Math.random() * 0.2,
        drift: Math.random() * 0.5 - 0.25,
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
        flake.x += flake.drift + Math.sin(flake.y * 0.01) * 0.3;

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
      className="fixed inset-0 pointer-events-none z-0"
      style={{ filter: 'blur(0.5px)' }}
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

  if (!visualsEnabled || ambientMode === 'off') {
    return null;
  }

  const EffectComponent = effectComponents[ambientMode];

  if (!EffectComponent) {
    return null;
  }

  return <EffectComponent />;
}
