import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

interface QuotesContextType {
  currentQuote: string;
  refreshQuote: () => void;
}

const QuotesContext = createContext<QuotesContextType | undefined>(undefined);

const COZY_QUOTES = [
  "Every sunrise is an invitation to brighten someone's day.",
  "Small steps lead to big transformations.",
  "Be gentle with yourself; you're doing the best you can.",
  "The journey of a thousand miles begins with a single step.",
  "Your only limit is your mind.",
  "Embrace the glorious mess that you are.",
  "Breathe deeply. Live fully.",
  "Today is a gift. That's why it's called the present.",
  "You are enough, just as you are.",
  "Progress, not perfection.",
  "Let your light shine bright.",
  "Kindness is a language everyone understands.",
  "Trust the timing of your life.",
  "You are stronger than you think.",
  "Every moment is a fresh beginning.",
  "Choose joy, even in the small things.",
  "Your vibe attracts your tribe.",
  "Be the reason someone smiles today.",
  "Stars can't shine without darkness.",
  "Growth happens outside your comfort zone.",
  "You're not behind; you're exactly where you need to be.",
  "Inhale confidence, exhale doubt.",
  "Good things take time.",
  "Your potential is endless.",
  "Make today so awesome that yesterday gets jealous.",
  "Bloom where you are planted.",
  "The best is yet to come.",
  "You are capable of amazing things.",
  "Let go of what you can't change.",
  "Focus on the good.",
  "You matter more than you know.",
  "Dream big, start small, act now.",
  "Peace begins with a smile.",
  "Your story isn't over yet.",
  "Be patient with your progress.",
  "Sunshine mixed with a little hurricane.",
  "Create the life you can't wait to wake up to.",
  "You are the artist of your life.",
  "Keep going. Keep growing.",
  "Life is tough, but so are you.",
  "Find joy in the ordinary.",
  "You've survived 100% of your worst days.",
  "Be the energy you want to attract.",
  "One day at a time.",
  "You're doing better than you think.",
  "Let your dreams be bigger than your fears.",
  "Stay close to what keeps you feeling alive.",
  "Your future self is cheering you on.",
  "Make peace with your broken pieces.",
  "You deserve your own love.",
  "Every day is a second chance.",
  "Happiness blooms from within.",
  "You are worthy of all good things.",
  "Keep your face toward the sunshine.",
  "The world needs your unique light.",
  "Be stubborn about your goals.",
  "Self-care is not selfish.",
  "You are your only competition.",
  "Celebrate every tiny victory.",
  "You're allowed to take up space.",
  "Magic happens when you believe.",
  "Your energy introduces you before you speak.",
  "Be brave enough to be bad at something new.",
  "You're growing, even if you can't see it.",
  "Rest is productive too.",
  "Your heart knows the way.",
  "Keep planting seeds of kindness.",
  "You are a work of art in progress.",
  "Let your soul shine.",
  "Difficult roads lead to beautiful destinations.",
  "You are loved more than you know.",
  "Take life one cup of coffee at a time.",
  "Your comfort zone is beautiful but nothing grows there.",
  "Be unapologetically yourself.",
  "The sun will rise and we will try again.",
  "You are the hero of your own story.",
  "Breathe in peace, breathe out stress.",
  "You've got this, and I've got you.",
  "Stay soft in a hard world.",
  "Your peace is your priority.",
  "Life is better when you're laughing.",
  "You are someone's reason to smile.",
  "Keep blooming, no matter the season.",
  "You are braver than you believe.",
  "Good vibes only.",
  "Your mistakes don't define you.",
  "Be a voice, not an echo.",
  "The universe has your back.",
  "You are exactly where you're meant to be.",
  "Let your kindness be contagious.",
  "Every ending is a new beginning.",
  "You are a masterpiece and a work in progress.",
  "Stay curious, stay humble.",
  "Your presence is a present.",
  "Life doesn't have to be perfect to be wonderful.",
  "You are the calm in your own storm.",
  "Be the change you wish to see.",
  "Your journey is uniquely yours.",
  "Shine bright, even on cloudy days.",
  "You are magic wrapped in human.",
  "Keep showing up for yourself.",
  "The little things are the big things.",
  "You deserve rest without guilt.",
  "Your story is worth telling.",
  "Be proud of how far you've come.",
  "You radiate beautiful energy.",
  "Every day may not be good, but there's good in every day.",
  "Your best days are ahead of you.",
  "Be someone's sunshine today.",
  "You are worthy of taking up space.",
  "Life is a beautiful struggle.",
  "Your light inspires others.",
  "Keep moving forward, beautiful soul.",
  "You are not alone in this.",
  "Find beauty in the small moments.",
  "Your dreams are valid.",
  "Be kind to your future self.",
  "You are resilient and strong.",
  "Let love guide your way.",
  "Your vibe creates your life.",
  "Stay grounded, stay reaching.",
  "You are someone's answered prayer.",
  "Keep your heart open and curious.",
  "Life rewards those who show up.",
  "You are a ray of sunshine.",
  "Be gentle, be kind, be you.",
  "Your growth is inspiring.",
  "Keep watering your own grass.",
  "You are becoming who you need to be.",
  "Find your calm in the chaos.",
  "Your presence makes a difference.",
  "Be proud of your soft heart.",
  "Life is too short for bad vibes.",
  "You are worthy of happiness.",
  "Keep choosing yourself.",
  "Your soul is a garden—tend it well.",
  "Be patient, your time is coming.",
  "You are made of stardust and dreams.",
  "Find magic in the mundane.",
  "Your heart is your compass.",
  "Keep breathing, keep believing.",
  "You are a beacon of hope.",
  "Be the peace you seek.",
  "Your story has power.",
  "Life is a dance—embrace the rhythm.",
  "You are worthy just as you are.",
  "Keep spreading kindness like confetti.",
  "Your light never dims.",
  "Be grateful for the small wins.",
  "You are writing your own story.",
  "Find joy in the journey.",
  "Your presence is a gift.",
  "Keep blooming in your own time.",
  "You are loved beyond measure.",
  "Be your own biggest fan.",
  "Your soul knows the way.",
  "Life is meant to be enjoyed.",
  "You are a beautiful soul.",
  "Keep shining, keep rising.",
  "Your energy is magnetic.",
  "Be brave, be bold, be you.",
  "You are a force of nature.",
  "Find peace in the present.",
  "Your dreams deserve your belief.",
  "Keep trusting the journey.",
  "You are stronger than yesterday.",
  "Be the light in someone's darkness.",
  "Your heart is your greatest strength.",
  "Life is full of second chances.",
  "You are worthy of your dreams.",
  "Keep growing, keep glowing.",
  "Your spirit is unbreakable.",
  "Be patient with your healing.",
  "You are a walking miracle.",
  "Find beauty in imperfection.",
  "Your journey is beautiful.",
  "Keep moving at your own pace.",
  "You are deserving of all good things.",
  "Be proud of who you're becoming.",
  "Your soul is beautiful.",
  "Life is a collection of moments.",
  "You are someone's inspiration.",
  "Keep radiating positivity.",
  "Your growth is beautiful.",
  "Be kind to your wandering mind.",
  "You are a source of light.",
  "Find strength in your softness.",
  "Your heart is full of magic.",
  "Keep believing in yourself.",
  "You are exactly enough.",
  "Be gentle with your growth.",
  "Your presence matters deeply.",
  "Life rewards the patient heart.",
  "You are blooming beautifully.",
  "Keep nurturing your dreams.",
  "Your journey is just beginning.",
  "Be the love you want to feel.",
  "You are a gift to this world.",
  "Find peace in progress.",
  "Your spirit is radiant.",
  "Keep honoring your path.",
  "You are worthy of peace.",
  "Be proud of your resilience.",
  "Your light guides others home.",
];

export function QuotesProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [currentQuote, setCurrentQuote] = useState('');
  const [usedIndices, setUsedIndices] = useState<Set<number>>(new Set());

  const getRandomQuote = useCallback(() => {
    let availableIndices = Array.from(
      { length: COZY_QUOTES.length },
      (_, i) => i
    ).filter((i) => !usedIndices.has(i));

    // Reset if we've used all quotes
    if (availableIndices.length === 0) {
      setUsedIndices(new Set());
      availableIndices = Array.from({ length: COZY_QUOTES.length }, (_, i) => i);
    }

    const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    setUsedIndices((prev) => new Set([...prev, randomIndex]));
    return COZY_QUOTES[randomIndex];
  }, [usedIndices]);

  const refreshQuote = useCallback(() => {
    setCurrentQuote(getRandomQuote());
  }, [getRandomQuote]);

  // Change quote on route change
  useEffect(() => {
    setCurrentQuote(getRandomQuote());
  }, [location.pathname]);

  // Initial quote
  useEffect(() => {
    if (!currentQuote) {
      setCurrentQuote(getRandomQuote());
    }
  }, []);

  return (
    <QuotesContext.Provider value={{ currentQuote, refreshQuote }}>
      {children}
    </QuotesContext.Provider>
  );
}

export function useQuotes() {
  const context = useContext(QuotesContext);
  if (context === undefined) {
    throw new Error('useQuotes must be used within a QuotesProvider');
  }
  return context;
}
