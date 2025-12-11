import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const CAT_INTRO_KEY = 'daily-reset-cat-intro-shown';

export function CatCompanionIntro() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const hasShown = localStorage.getItem(CAT_INTRO_KEY);
    if (!hasShown) {
      // Show after a small delay for better UX
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem(CAT_INTRO_KEY, 'true');
  };

  if (!show) return null;

  return (
    <div 
      className={cn(
        'fixed bottom-36 right-4 z-40 max-w-[200px] animate-fade-in',
        'bg-card border border-border/50 rounded-2xl p-3 shadow-lg'
      )}
    >
      {/* Speech bubble pointer */}
      <div className="absolute -bottom-2 right-6 w-4 h-4 bg-card border-r border-b border-border/50 transform rotate-45" />
      
      <button
        onClick={handleDismiss}
        className="absolute -top-2 -right-2 w-6 h-6 bg-muted rounded-full flex items-center justify-center hover:bg-muted/80 transition-colors"
      >
        <X className="w-3 h-3 text-muted-foreground" />
      </button>
      
      <p className="text-sm text-foreground leading-relaxed">
        <span className="text-lg mr-1">🐱</span> 
        Meet your companion! Drag me around or pinch to resize. I'll cheer you on!
      </p>
    </div>
  );
}
