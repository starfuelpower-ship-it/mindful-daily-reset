import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePoints } from '@/contexts/PointsContext';
import { usePremium } from '@/contexts/PremiumContext';
import { supabase } from '@/integrations/supabase/client';
import { BottomTabBar } from '@/components/BottomTabBar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { ArrowLeft, Coins, Crown, Sparkles, Check, Lock, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Costume {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  is_premium_only: boolean;
  category: string;
}

const Rewards = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance, spendPoints } = usePoints();
  const { isPremium } = usePremium();
  const { playSound } = useSoundEffects();
  const [costumes, setCostumes] = useState<Costume[]>([]);
  const [ownedCostumes, setOwnedCostumes] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      // Fetch all costumes
      const { data: costumesData } = await supabase
        .from('cat_costumes')
        .select('*')
        .order('sort_order');

      if (costumesData) {
        setCostumes(costumesData);
      }

      // Fetch owned costumes
      if (user) {
        const { data: ownedData } = await supabase
          .from('user_costumes')
          .select('costume_id')
          .eq('user_id', user.id);

        if (ownedData) {
          setOwnedCostumes(new Set(ownedData.map((c) => c.costume_id)));
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePurchase = async (costume: Costume) => {
    if (!user) return;

    if (costume.is_premium_only && !isPremium) {
      toast.error('This costume requires Premium!');
      navigate('/premium');
      return;
    }

    if (balance < costume.price) {
      toast.error('Not enough points!');
      return;
    }

    setPurchasing(costume.id);
    playSound('click');

    const success = await spendPoints(costume.price, `Purchased ${costume.name}`);

    if (success) {
      await supabase.from('user_costumes').insert({
        user_id: user.id,
        costume_id: costume.id,
      });

      setOwnedCostumes((prev) => new Set([...prev, costume.id]));
      toast.success(`You unlocked ${costume.name}!`, { icon: '🎉' });
      playSound('success');
    }

    setPurchasing(null);
  };

  const categories = ['all', 'hat', 'accessory', 'outfit'];
  const filteredCostumes = selectedCategory === 'all'
    ? costumes
    : costumes.filter((c) => c.category === selectedCategory);

  const regularCostumes = filteredCostumes.filter((c) => !c.is_premium_only);
  const premiumCostumes = filteredCostumes.filter((c) => c.is_premium_only);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-lg mx-auto px-4 pt-6">
        {/* Header */}
        <header className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-muted-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">Rewards Store</h1>
            <p className="text-sm text-muted-foreground">Unlock adorable costumes for your cat!</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30">
            <Coins className="w-4 h-4 text-amber-600" />
            <span className="font-bold text-amber-700 dark:text-amber-300">{balance}</span>
          </div>
        </header>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted hover:bg-muted/80 text-muted-foreground'
              )}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}s
            </button>
          ))}
        </div>

        {/* Regular Costumes */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Available Costumes</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {regularCostumes.map((costume) => {
              const owned = ownedCostumes.has(costume.id);
              const canAfford = balance >= costume.price;

              return (
                <div
                  key={costume.id}
                  className={cn(
                    'relative p-4 rounded-2xl border transition-all',
                    owned
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-card border-border hover:border-primary/50 hover:shadow-md'
                  )}
                >
                  <div className="text-4xl mb-2 text-center">{costume.icon}</div>
                  <h3 className="font-semibold text-sm text-center mb-1">{costume.name}</h3>
                  <p className="text-xs text-muted-foreground text-center mb-3 line-clamp-2">
                    {costume.description}
                  </p>

                  {owned ? (
                    <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400">
                      <Check className="w-4 h-4" />
                      <span className="text-sm font-medium">Owned</span>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      className="w-full"
                      disabled={!canAfford || purchasing === costume.id}
                      onClick={() => handlePurchase(costume)}
                    >
                      <Coins className="w-3 h-3 mr-1" />
                      {costume.price}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Premium Costumes */}
        {premiumCostumes.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-semibold">Premium Exclusive</h2>
              {!isPremium && (
                <Badge variant="secondary" className="text-xs">
                  <Lock className="w-3 h-3 mr-1" />
                  Premium Only
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {premiumCostumes.map((costume) => {
                const owned = ownedCostumes.has(costume.id);
                const canAfford = balance >= costume.price;
                const canPurchase = isPremium && canAfford && !owned;

                return (
                  <div
                    key={costume.id}
                    className={cn(
                      'relative p-4 rounded-2xl border transition-all',
                      owned
                        ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
                        : 'bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/10 dark:to-yellow-900/10 border-amber-200/50 dark:border-amber-800/50',
                      !isPremium && 'opacity-75'
                    )}
                  >
                    <Sparkles className="absolute top-2 right-2 w-4 h-4 text-amber-500" />
                    <div className="text-4xl mb-2 text-center">{costume.icon}</div>
                    <h3 className="font-semibold text-sm text-center mb-1">{costume.name}</h3>
                    <p className="text-xs text-muted-foreground text-center mb-3 line-clamp-2">
                      {costume.description}
                    </p>

                    {owned ? (
                      <div className="flex items-center justify-center gap-1 text-amber-600 dark:text-amber-400">
                        <Check className="w-4 h-4" />
                        <span className="text-sm font-medium">Owned</span>
                      </div>
                    ) : !isPremium ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate('/premium')}
                      >
                        <Lock className="w-3 h-3 mr-1" />
                        Unlock Premium
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600"
                        disabled={!canAfford || purchasing === costume.id}
                        onClick={() => handlePurchase(costume)}
                      >
                        <Coins className="w-3 h-3 mr-1" />
                        {costume.price}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* How to Earn Points */}
        <section className="ios-card p-4 mb-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            How to Earn Points
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Complete a habit</span>
              <span className="font-medium text-green-600">+10 pts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Complete all daily habits</span>
              <span className="font-medium text-green-600">+25 pts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Daily check-in</span>
              <span className="font-medium text-green-600">+5 pts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">7-day streak bonus</span>
              <span className="font-medium text-green-600">+30 pts</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Weekly dedication bonus</span>
              <span className="font-medium text-green-600">+50 pts</span>
            </div>
          </div>
        </section>
      </div>

      <BottomTabBar />
    </div>
  );
};

export default Rewards;
