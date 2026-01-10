/**
 * Smart Paywall Component
 * 
 * High-conversion paywall with:
 * - Weekly trial emphasis (primary)
 * - 4-second countdown timer for skip button (first paywall only)
 * - Monthly/Annual/Lifetime as secondary options
 * - Supportive messaging
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Crown, 
  Check, 
  X, 
  Sparkles, 
  Shield, 
  Heart,
  Star,
  Gift,
  ChevronDown,
  ChevronUp,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { usePremium } from '@/contexts/PremiumContext';
import { useRevenueCat } from '@/hooks/useRevenueCat';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Weekly trial product ID
const WEEKLY_TRIAL_PRODUCT_ID = 'weekly:trial';

const BENEFITS = [
  { icon: Sparkles, text: 'Unlimited habits & tracking' },
  { icon: Heart, text: 'Gentle AI reflections' },
  { icon: Star, text: 'All themes & customization' },
  { icon: Gift, text: 'Exclusive rewards & features' },
];

interface SmartPaywallProps {
  isVisible: boolean;
  type: 'first' | 'followup' | 'limit';
  onDismiss: () => void;
  onSubscribed?: () => void;
}

export function SmartPaywall({ isVisible, type, onDismiss, onSubscribed }: SmartPaywallProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium, refreshPremiumStatus } = usePremium();
  const { purchaseSubscription, isLoading, getPriceForPlan, restorePurchases, isNativePlatform } = useRevenueCat();
  const { markFirstPaywallShown } = useOnboarding();
  
  // State
  const [countdown, setCountdown] = useState(type === 'first' ? 4 : 0);
  const [canSkip, setCanSkip] = useState(type !== 'first');
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'weekly' | 'monthly' | 'annual' | 'lifetime'>('weekly');

  // Countdown timer for first paywall
  useEffect(() => {
    if (type !== 'first' || countdown === 0) {
      setCanSkip(true);
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setCanSkip(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [type, countdown]);

  // Mark first paywall as shown
  useEffect(() => {
    if (isVisible && type === 'first') {
      markFirstPaywallShown();
    }
  }, [isVisible, type, markFirstPaywallShown]);

  // Handle weekly trial purchase
  const handleStartTrial = useCallback(async () => {
    if (!user) {
      toast.error('Please sign in to start your free trial');
      navigate('/auth');
      return;
    }

    if (!isNativePlatform) {
      toast.info('In-app purchases are only available in the app');
      return;
    }

    setIsProcessing(true);
    try {
      console.log('[SmartPaywall] Starting weekly trial purchase...');
      // Purchase the weekly trial product (weekly:trial in RevenueCat)
      const success = await purchaseSubscription('weekly');
      
      if (success) {
        await refreshPremiumStatus();
        toast.success('Welcome to Premium! 🎉 Your 7-day trial has started.');
        onSubscribed?.();
        onDismiss();
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }, [user, navigate, purchaseSubscription, refreshPremiumStatus, onSubscribed, onDismiss, isNativePlatform]);

  // Handle other plan purchases
  const handleOtherPurchase = useCallback(async (plan: 'monthly' | 'annual' | 'lifetime') => {
    if (!user) {
      toast.error('Please sign in to upgrade');
      navigate('/auth');
      return;
    }

    if (!isNativePlatform) {
      toast.info('In-app purchases are only available in the app');
      return;
    }

    setIsProcessing(true);
    try {
      console.log('[SmartPaywall] Purchasing plan:', plan);
      const success = await purchaseSubscription(plan);
      
      if (success) {
        await refreshPremiumStatus();
        toast.success('Welcome to Premium! 🎉');
        onSubscribed?.();
        onDismiss();
      }
    } catch (error) {
      console.error('Purchase error:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [user, navigate, purchaseSubscription, refreshPremiumStatus, onSubscribed, onDismiss, isNativePlatform]);

  // Handle restore
  const handleRestore = async () => {
    setIsProcessing(true);
    const success = await restorePurchases();
    setIsProcessing(false);
    
    if (success) {
      await refreshPremiumStatus();
      onDismiss();
    }
  };

  // Handle skip/dismiss
  const handleSkip = () => {
    if (!canSkip) return;
    onDismiss();
  };

  // Don't render if not visible or already premium
  if (!isVisible || isPremium) return null;

  // Get messaging based on type
  const getMessaging = () => {
    switch (type) {
      case 'first':
        return {
          title: "You're doing great! 🌱",
          subtitle: "Keep the momentum going with Premium",
          description: "Try all premium features free for 7 days. No commitment, cancel anytime.",
        };
      case 'followup':
        return {
          title: "Your habits are growing! 🌸",
          subtitle: "Unlock your full potential",
          description: "Premium helps you build lasting habits with gentle guidance and more features.",
        };
      case 'limit':
        return {
          title: "You've discovered Premium features ✨",
          subtitle: "Unlock everything with Premium",
          description: "Get unlimited access to all features and keep your progress going.",
        };
      default:
        return {
          title: "Unlock Premium",
          subtitle: "Get the full experience",
          description: "Unlimited habits, themes, and gentle AI guidance.",
        };
    }
  };

  const messaging = getMessaging();
  const weeklyPrice = '$2.99/week';
  const monthlyPrice = getPriceForPlan('monthly') || '$7.99';
  const annualPrice = getPriceForPlan('annual') || '$39.99';
  const lifetimePrice = getPriceForPlan('lifetime') || '$99.99';

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen flex flex-col">
        {/* Header with close button */}
        <header className="flex justify-end p-4">
          <button
            onClick={handleSkip}
            disabled={!canSkip || isProcessing}
            className={cn(
              "p-2 rounded-full transition-all",
              canSkip
                ? "text-muted-foreground hover:text-foreground hover:bg-muted"
                : "text-muted-foreground/30 cursor-not-allowed"
            )}
          >
            {canSkip ? (
              <X className="w-6 h-6" />
            ) : (
              <div className="w-6 h-6 flex items-center justify-center text-sm font-medium">
                {countdown}
              </div>
            )}
          </button>
        </header>

        {/* Main content */}
        <main className="flex-1 max-w-lg mx-auto px-6 py-4 w-full">
          {/* Hero */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/30">
              <Crown className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">{messaging.title}</h1>
            <p className="text-lg text-foreground/80 mb-1">{messaging.subtitle}</p>
            <p className="text-sm text-muted-foreground">{messaging.description}</p>
          </div>

          {/* Benefits */}
          <div className="space-y-3 mb-8">
            {BENEFITS.map((benefit, index) => (
              <div
                key={benefit.text}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl bg-card border border-border/50 animate-slide-up",
                  `stagger-${index + 1}`
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <benefit.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="font-medium text-foreground">{benefit.text}</span>
                <Check className="w-5 h-5 text-green-500 ml-auto" />
              </div>
            ))}
          </div>

          {/* Primary CTA - Weekly Trial */}
          <div className="space-y-4 mb-6">
            <div className="relative">
              {/* Badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  7 DAYS FREE
                </span>
              </div>
              
              <Button
                onClick={handleStartTrial}
                disabled={isProcessing}
                className="w-full h-16 text-lg font-semibold rounded-2xl bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/30 hover:shadow-xl transition-all"
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  <span className="flex flex-col items-center">
                    <span>Start 7-day free trial</span>
                    <span className="text-xs font-normal opacity-80">Then {weeklyPrice} · cancel anytime</span>
                  </span>
                )}
              </Button>
            </div>

            {/* Trust badge */}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Cancel anytime. No charge until trial ends.</span>
            </div>
          </div>

          {/* More options (collapsed by default) */}
          <div className="border-t border-border/50 pt-4">
            <button
              onClick={() => setShowMoreOptions(!showMoreOptions)}
              className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              <span>More options</span>
              {showMoreOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showMoreOptions && (
              <div className="mt-4 space-y-3 animate-fade-in">
                {/* Monthly */}
                <button
                  onClick={() => handleOtherPurchase('monthly')}
                  disabled={isProcessing}
                  className={cn(
                    "w-full p-4 rounded-xl border text-left transition-all",
                    "bg-card border-border/50 hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">Monthly</p>
                      <p className="text-xs text-muted-foreground">Billed monthly</p>
                    </div>
                    <span className="text-lg font-bold text-foreground">{monthlyPrice}<span className="text-sm font-normal text-muted-foreground">/mo</span></span>
                  </div>
                </button>

                {/* Annual */}
                <button
                  onClick={() => handleOtherPurchase('annual')}
                  disabled={isProcessing}
                  className={cn(
                    "w-full p-4 rounded-xl border text-left transition-all relative",
                    "bg-card border-border/50 hover:border-primary/50"
                  )}
                >
                  <div className="absolute -top-2 right-3">
                    <span className="bg-amber-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                      SAVE 58%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">Annual</p>
                      <p className="text-xs text-muted-foreground">Best value • 3-day trial</p>
                    </div>
                    <span className="text-lg font-bold text-foreground">{annualPrice}<span className="text-sm font-normal text-muted-foreground">/yr</span></span>
                  </div>
                </button>

                {/* Lifetime */}
                <button
                  onClick={() => handleOtherPurchase('lifetime')}
                  disabled={isProcessing}
                  className={cn(
                    "w-full p-4 rounded-xl border text-left transition-all",
                    "bg-card border-border/50 hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">Lifetime</p>
                      <p className="text-xs text-muted-foreground">Pay once, own forever</p>
                    </div>
                    <span className="text-lg font-bold text-foreground">{lifetimePrice}</span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Footer links */}
          <div className="mt-6 flex justify-center gap-4 text-xs text-muted-foreground">
            <button onClick={() => navigate('/terms')} className="hover:text-foreground">Terms</button>
            <span>•</span>
            <button onClick={() => navigate('/privacy')} className="hover:text-foreground">Privacy</button>
            <span>•</span>
            <button 
              onClick={handleRestore}
              disabled={isProcessing}
              className="hover:text-foreground"
            >
              Restore Purchase
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
