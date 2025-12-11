import { useEffect, useRef, memo, useState } from 'react';
import { useAmbient, AmbientMode } from '@/contexts/AmbientContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

// Light mode colors for better visibility
const LIGHT_MODE_COLORS = {
  rain: 'rgba(142, 174, 207, 0.35)', // Gray-blue #8EAECF
  snow: 'rgba(181, 181, 181, 0.4)', // Soft gray #B5B5B5
};

// Dark mode colors (original subtle colors)
const DARK_MODE_COLORS = {
  rain: 'rgba(180, 200, 220, 0.08)',
  snow: 'rgba(255, 255, 255, 0.12)',
};

// Rain effect component
const RainEffect = memo(({ isDark }: { isDark: boolean }) => {
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
    const dropCount = isDark ? 25 : 35; // More drops in light mode for visibility

    for (let i = 0; i < dropCount; i++) {
      drops.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 0.8 + Math.random() * 1,
        length: 12 + Math.random() * 18,
        opacity: isDark ? (0.04 + Math.random() * 0.06) : (0.25 + Math.random() * 0.15),
      });
    }

    const rainColor = isDark ? DARK_MODE_COLORS.rain : LIGHT_MODE_COLORS.rain;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drops.forEach((drop) => {
        ctx.beginPath();
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + 0.3, drop.y + drop.length);
        ctx.strokeStyle = isDark 
          ? `rgba(180, 200, 220, ${drop.opacity})`
          : `rgba(142, 174, 207, ${drop.opacity})`;
        ctx.lineWidth = isDark ? 0.8 : 1;
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
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0"
      style={{ filter: 'blur(0.3px)' }}
    />
  );
});

RainEffect.displayName = 'RainEffect';

// Sun rays effect component
const SunRaysEffect = memo(({ isDark }: { isDark: boolean }) => {
  // Light mode: warm gold (#E9D694), Dark mode: original pale yellow
  const rayCount = isDark ? 4 : 5;
  
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(rayCount)].map((_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: '-40%',
            right: `${8 + i * 14}%`,
            width: isDark ? '120px' : '140px',
            height: '200%',
            background: isDark
              ? `linear-gradient(
                  135deg,
                  rgba(255, 250, 230, ${0.02 + i * 0.008}) 0%,
                  rgba(255, 235, 180, ${0.015}) 50%,
                  transparent 100%
                )`
              : `linear-gradient(
                  135deg,
                  rgba(233, 214, 148, ${0.12 + i * 0.02}) 0%,
                  rgba(233, 214, 148, ${0.06}) 50%,
                  transparent 100%
                )`,
            transform: `rotate(${22 + i * 8}deg)`,
            filter: isDark ? 'blur(30px)' : 'blur(25px)',
            animation: `sunRayFade ${9 + i * 2}s ease-in-out infinite`,
            animationDelay: `${i * 1.5}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes sunRayFade {
          0%, 100% { opacity: ${isDark ? 0.4 : 0.6}; }
          50% { opacity: ${isDark ? 0.8 : 1}; }
        }
      `}</style>
    </div>
  );
});

SunRaysEffect.displayName = 'SunRaysEffect';

// Snow effect component
const SnowEffect = memo(({ isDark }: { isDark: boolean }) => {
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
    const flakeCount = isDark ? 18 : 25; // More flakes in light mode

    for (let i = 0; i < flakeCount; i++) {
      flakes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 0.2 + Math.random() * 0.3,
        size: isDark ? (1.5 + Math.random() * 2) : (2 + Math.random() * 2.5),
        opacity: isDark ? (0.06 + Math.random() * 0.08) : (0.3 + Math.random() * 0.15),
        drift: Math.random() * 0.3 - 0.15,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      flakes.forEach((flake) => {
        ctx.beginPath();
        ctx.arc(flake.x, flake.y, flake.size, 0, Math.PI * 2);
        ctx.fillStyle = isDark 
          ? `rgba(255, 255, 255, ${flake.opacity})`
          : `rgba(181, 181, 181, ${flake.opacity})`;
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
  }, [isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0"
      style={{ filter: 'blur(0.3px)' }}
    />
  );
});

SnowEffect.displayName = 'SnowEffect';

export function AmbientLayer() {
  const { ambientMode, visualsEnabled } = useAmbient();
  const { resolvedTheme } = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [currentMode, setCurrentMode] = useState<AmbientMode>(ambientMode);

  const isDark = resolvedTheme === 'dark';

  // Handle fade transitions
  useEffect(() => {
    if (visualsEnabled && ambientMode !== 'off') {
      setCurrentMode(ambientMode);
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [ambientMode, visualsEnabled]);

  if (!visualsEnabled && !isVisible) {
    return null;
  }

  const showOverlay = isVisible && !isDark && currentMode !== 'off';

  // Get effect component based on mode
  const getEffectComponent = () => {
    switch (currentMode) {
      case 'rain':
        return <RainEffect isDark={isDark} />;
      case 'sun_rays':
        return <SunRaysEffect isDark={isDark} />;
      case 'snow':
        return <SnowEffect isDark={isDark} />;
      default:
        return null;
    }
  };

  const EffectComponent = getEffectComponent();

  return (
    <>
      {/* Subtle darkening overlay for Light Mode only */}
      <div
        className={cn(
          'fixed inset-0 pointer-events-none z-30 transition-opacity duration-500 ease-in-out',
          showOverlay ? 'opacity-100' : 'opacity-0'
        )}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)' }}
        aria-hidden="true"
      />
      
      {/* Ambient effects layer */}
      <div
        className={cn(
          'fixed inset-0 pointer-events-none z-40 transition-opacity duration-700 ease-in-out',
          isVisible && EffectComponent ? 'opacity-100' : 'opacity-0'
        )}
        aria-hidden="true"
      >
        {EffectComponent}
      </div>
    </>
  );
}
