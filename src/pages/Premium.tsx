import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePremium } from '@/contexts/PremiumContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Crown, Check, Loader2, BarChart3, Palette, Bell } from 'lucide-react';
import { toast } from 'sonner';

const features = [
  {
    icon: BarChart3,
    title: 'Weekly Stats',
    description: 'Track your completion rate and streak history over time',
  },
  {
    icon: Palette,
    title: 'Custom Colors',
    description: 'Personalize your habits with custom themes and colors',
  },
  {
    icon: Bell,
    title: 'Unlimited Reminders',
    description: 'Set multiple reminders for each habit',
  },
];

export default function Premium() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium, upgradeToPremium } = usePremium();
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    if (!user) {
      toast.error('Please sign in to upgrade');
      navigate('/auth');
      return;
    }

    setIsUpgrading(true);
    try {
      await upgradeToPremium();
      toast.success('Welcome to Premium! 🎉');
      navigate('/settings');
    } catch (error) {
      toast.error('Failed to upgrade. Please try again.');
    } finally {
      setIsUpgrading(false);
    }
  };

  if (isPremium) {
    navigate('/settings');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>

        <div className="space-y-8 animate-fade-in">
          {/* Hero */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
              <Crown className="w-10 h-10 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Go Premium</h1>
              <p className="text-muted-foreground mt-2">
                Unlock powerful features to supercharge your habits
              </p>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-4">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-card rounded-2xl p-4 border border-border/50 flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing */}
          <div className="bg-gradient-to-br from-primary/20 to-accent rounded-2xl p-6 border border-primary/30 text-center space-y-4">
            <div>
              <span className="text-4xl font-bold text-foreground">$4.99</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center justify-center gap-2 text-foreground">
                <Check className="w-4 h-4 text-primary" />
                All premium features
              </li>
              <li className="flex items-center justify-center gap-2 text-foreground">
                <Check className="w-4 h-4 text-primary" />
                Cancel anytime
              </li>
              <li className="flex items-center justify-center gap-2 text-foreground">
                <Check className="w-4 h-4 text-primary" />
                Priority support
              </li>
            </ul>
          </div>

          {/* CTA */}
          <div className="space-y-3">
            <Button
              onClick={handleUpgrade}
              disabled={isUpgrading}
              className="w-full h-12 text-base font-semibold"
            >
              {isUpgrading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Crown className="w-5 h-5 mr-2" />
                  Upgrade to Premium
                </>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              For demo purposes, this activates premium instantly
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
