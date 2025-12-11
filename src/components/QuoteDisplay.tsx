import { useQuotes } from '@/contexts/QuotesContext';
import { Quote } from 'lucide-react';
import { useSoundEffects } from '@/hooks/useSoundEffects';

export function QuoteDisplay() {
  const { currentQuote, refreshQuote } = useQuotes();
  const { playSound } = useSoundEffects();

  if (!currentQuote) return null;

  const handleTap = () => {
    playSound('click');
    refreshQuote();
  };

  return (
    <button
      onClick={handleTap}
      className="w-full flex items-start gap-2 px-4 py-3 rounded-xl bg-primary/5 border border-primary/10 animate-fade-in hover:bg-primary/10 active:scale-[0.98] transition-all text-left cursor-pointer"
    >
      <Quote className="w-4 h-4 text-primary/60 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-foreground/70 font-medium leading-relaxed italic">
        {currentQuote}
      </p>
    </button>
  );
}
