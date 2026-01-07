import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Check, ArrowLeft, Sparkles } from 'lucide-react';
import { usePremium } from '@/contexts/PremiumContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRevenueCat } from '@/hooks/useRevenueCat';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const UPGRADE_PLANS = [
  {
    id: 'monthly' as const,
    name: 'Monthly',
    price: '$7.99',
    period: '/month',
    description: 'Billed monthly',
  },
  {
    id: 'annual' as const,
    name: 'Annual',
    price: '$39.99',
    period: '/year',
    description: 'Save 58%',
    popular: true,
  },
  {
    id: 'lifetime' as const,
    name: 'Lifetime',
    price: '$99.99',
    period: 'one-time',
    description: 'Pay once, own forever',
  },
];

export default function ManagePremium() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium, isLoading: premiumLoading, refreshPremiumStatus } = usePremium();
  const { 
    purchaseSubscription, 
    isLoading, 
    isNativePlatform,
    getPriceForPlan,
  } = useRevenueCat();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual' | 'lifetime' | null>(null);

  const handleUpgrade = async () => {
    if (!selectedPlan) {
      toast.error('Please select a plan to upgrade to');
      return;
    }

    if (!user) {
      toast.error('Please sign in to upgrade');
      navigate('/auth');
      return;
    }

    const success = await purchaseSubscription(selectedPlan);
    if (success) {
      await refreshPremiumStatus();
      toast.success('Subscription updated successfully!');
      navigate('/settings');
    }
  };

  const getDisplayPrice = (planId: 'monthly' | 'annual' | 'lifetime'): string => {
    const dynamicPrice = getPriceForPlan(planId);
    if (dynamicPrice) return dynamicPrice;
    
    const fallback = UPGRADE_PLANS.find(p => p.id === planId);
    return fallback?.price || '';
  };

  if (premiumLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isPremium) {
    navigate('/premium');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/settings')}
            className="rounded-xl"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-foreground">Manage Premium</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Current Status */}
        <div className="bg-gradient-to-r from-primary/20 to-accent rounded-2xl p-6 border border-primary/30">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
              <Crown className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Premium Active</h2>
              <p className="text-sm text-muted-foreground">You have access to all premium features</p>
            </div>
          </div>
        </div>

        {/* Upgrade Options */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-medium text-muted-foreground">Change Plan</h2>
          </div>
          
          <p className="text-sm text-muted-foreground px-1">
            Upgrade or switch your subscription at any time. Your current benefits will continue.
          </p>

          {UPGRADE_PLANS.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={cn(
                'w-full bg-card rounded-2xl border p-4 text-left transition-all relative overflow-hidden',
                selectedPlan === plan.id
                  ? 'border-primary ring-2 ring-primary/20 shadow-lg'
                  : 'border-border/50 hover:border-border hover:shadow-md'
              )}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-bl-xl">
                  BEST VALUE
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className={cn('flex items-center gap-3', selectedPlan === plan.id && 'pl-8')}>
                  <div>
                    <p className="font-semibold text-foreground">{plan.name}</p>
                    <p className="text-xs text-muted-foreground">{plan.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-foreground">{getDisplayPrice(plan.id)}</span>
                  <span className="text-sm text-muted-foreground">{plan.period}</span>
                </div>
              </div>
              {selectedPlan === plan.id && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Upgrade Button */}
        {selectedPlan && (
          <div className="space-y-4 pt-4">
            <Button
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full h-14 text-lg font-semibold rounded-2xl shadow-lg shadow-primary/30"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Processing...
                </span>
              ) : (
                <>
                  <Crown className="w-5 h-5 mr-2" />
                  Switch to {UPGRADE_PLANS.find(p => p.id === selectedPlan)?.name}
                </>
              )}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground px-4">
              {isNativePlatform ? (
                <>
                  Changes to your subscription will be processed through the App Store or Google Play.
                  Your current subscription will be replaced with the new plan.
                </>
              ) : (
                'Subscription changes are available in the mobile app.'
              )}
            </p>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-card rounded-2xl border border-border/50 p-4 space-y-3">
          <h3 className="font-medium text-foreground">About Your Subscription</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span>Your premium benefits remain active at all times</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span>Upgrade to lifetime for one-time payment with no renewals</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span>Manage or cancel through your app store settings</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}
