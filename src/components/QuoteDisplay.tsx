import { useQuotes } from '@/contexts/QuotesContext';
import { Quote } from 'lucide-react';

export function QuoteDisplay() {
  const { currentQuote } = useQuotes();

  if (!currentQuote) return null;

  return (
    <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-primary/5 border border-primary/10 animate-fade-in">
      <Quote className="w-4 h-4 text-primary/60 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-foreground/70 font-medium leading-relaxed italic">
        {currentQuote}
      </p>
    </div>
  );
}
