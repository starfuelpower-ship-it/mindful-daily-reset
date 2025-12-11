import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { BottomTabBar } from '@/components/BottomTabBar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { ArrowLeft, Check, ShoppingBag, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Costume {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
}

const CatCustomize = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { resolvedTheme } = useTheme();
  const { playSound } = useSoundEffects();
  const [ownedCostumes, setOwnedCostumes] = useState<Costume[]>([]);
  const [equippedCostume, setEquippedCostume] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [catAnimation, setCatAnimation] = useState<'idle' | 'happy' | 'stretch' | 'sleep'>('idle');

  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchData();
  }, [user]);

  // Cycle cat animations
  useEffect(() => {
    const animations: ('idle' | 'happy' | 'stretch' | 'sleep')[] = ['idle', 'happy', 'stretch', 'sleep'];
    let index = 0;

    const interval = setInterval(() => {
      index = (index + 1) % animations.length;
      setCatAnimation(animations[index]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    if (!user) return;

    try {
      // Fetch owned costumes
      const { data: ownedData } = await supabase
        .from('user_costumes')
        .select('costume_id, cat_costumes(*)')
        .eq('user_id', user.id);

      if (ownedData) {
        const costumes = ownedData
          .map((c: any) => c.cat_costumes)
          .filter(Boolean);
        setOwnedCostumes(costumes);
      }

      // Fetch equipped costume
      const { data: equippedData } = await supabase
        .from('user_equipped_costume')
        .select('costume_id')
        .eq('user_id', user.id)
        .single();

      if (equippedData?.costume_id) {
        setEquippedCostume(equippedData.costume_id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEquip = async (costumeId: string | null) => {
    if (!user) return;

    playSound('click');

    try {
      const { data: existing } = await supabase
        .from('user_equipped_costume')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existing) {
        await supabase
          .from('user_equipped_costume')
          .update({ costume_id: costumeId, updated_at: new Date().toISOString() })
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('user_equipped_costume')
          .insert({ user_id: user.id, costume_id: costumeId });
      }

      setEquippedCostume(costumeId);
      
      if (costumeId) {
        const costume = ownedCostumes.find((c) => c.id === costumeId);
        toast.success(`Equipped ${costume?.name}!`, { icon: '✨' });
      } else {
        toast.success('Costume removed');
      }
      
      playSound('success');
      setCatAnimation('happy');
    } catch (error) {
      console.error('Error equipping costume:', error);
      toast.error('Failed to equip costume');
    }
  };

  const currentCostume = ownedCostumes.find((c) => c.id === equippedCostume);

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
            <h1 className="text-2xl font-bold text-foreground">My Cat</h1>
            <p className="text-sm text-muted-foreground">Customize your companion</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/rewards')}
          >
            <ShoppingBag className="w-4 h-4 mr-1" />
            Store
          </Button>
        </header>

        {/* Cat Preview */}
        <div className="ios-card p-6 mb-6 flex flex-col items-center">
          <div className="relative mb-4">
            {/* Large Cat SVG */}
            <svg
              viewBox="0 0 64 64"
              className="w-32 h-32"
              style={{
                filter: isDark ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' : 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
              }}
            >
              <g className={cn(
                'origin-center transition-transform duration-500',
                catAnimation === 'stretch' && 'scale-x-110 scale-y-90',
                catAnimation === 'sleep' && 'translate-y-2'
              )}>
                {/* Body */}
                <ellipse
                  cx="32"
                  cy="42"
                  rx="14"
                  ry="10"
                  className={cn(isDark ? 'fill-gray-400' : 'fill-amber-200')}
                />
                
                {/* Head */}
                <circle
                  cx="32"
                  cy="28"
                  r="12"
                  className={cn(isDark ? 'fill-gray-400' : 'fill-amber-200')}
                />
                
                {/* Ears */}
                <polygon
                  points="22,20 26,28 18,28"
                  className={cn(isDark ? 'fill-gray-400' : 'fill-amber-200')}
                />
                <polygon points="23,22 25,26 20,26" className={isDark ? 'fill-gray-500' : 'fill-pink-200'} />
                <polygon
                  points="42,20 46,28 38,28"
                  className={cn(isDark ? 'fill-gray-400' : 'fill-amber-200')}
                />
                <polygon points="41,22 44,26 39,26" className={isDark ? 'fill-gray-500' : 'fill-pink-200'} />
                
                {/* Eyes */}
                {catAnimation === 'sleep' ? (
                  <g>
                    <path d="M24 26 Q27 28 30 26" stroke={isDark ? '#374151' : '#1f2937'} strokeWidth="1.5" fill="none" />
                    <path d="M34 26 Q37 28 40 26" stroke={isDark ? '#374151' : '#1f2937'} strokeWidth="1.5" fill="none" />
                  </g>
                ) : (
                  <g>
                    <ellipse cx="27" cy="26" rx="2.5" ry={catAnimation === 'happy' ? '1' : '3'} className="fill-gray-800" />
                    <ellipse cx="37" cy="26" rx="2.5" ry={catAnimation === 'happy' ? '1' : '3'} className="fill-gray-800" />
                    {catAnimation !== 'happy' && (
                      <>
                        <circle cx="26" cy="25" r="1" className="fill-white opacity-80" />
                        <circle cx="36" cy="25" r="1" className="fill-white opacity-80" />
                      </>
                    )}
                  </g>
                )}
                
                {/* Nose */}
                <ellipse cx="32" cy="31" rx="1.5" ry="1" className="fill-pink-400" />
                
                {/* Mouth */}
                <path
                  d="M30 33 Q32 35 34 33"
                  stroke={isDark ? '#374151' : '#92400e'}
                  strokeWidth="1"
                  fill="none"
                />
                
                {/* Whiskers */}
                <g className={isDark ? 'stroke-gray-500' : 'stroke-amber-400'} strokeWidth="0.5">
                  <line x1="18" y1="30" x2="26" y2="31" />
                  <line x1="18" y1="32" x2="26" y2="32" />
                  <line x1="46" y1="30" x2="38" y2="31" />
                  <line x1="46" y1="32" x2="38" y2="32" />
                </g>
                
                {/* Paws */}
                <ellipse cx="26" cy="50" rx="4" ry="3" className={isDark ? 'fill-gray-400' : 'fill-amber-200'} />
                <ellipse cx="38" cy="50" rx="4" ry="3" className={isDark ? 'fill-gray-400' : 'fill-amber-200'} />
                
                {/* Tail */}
                <path
                  d="M46 42 Q56 38 54 30"
                  stroke={isDark ? '#9ca3af' : '#fbbf24'}
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                  className={cn(catAnimation === 'happy' && 'animate-wag')}
                />
              </g>
            </svg>

            {/* Costume overlay */}
            {currentCostume && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 text-4xl animate-bounce-in">
                {currentCostume.icon}
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              {currentCostume ? `Wearing: ${currentCostume.name}` : 'No costume equipped'}
            </p>
            <div className="flex items-center justify-center gap-1 mt-1 text-xs text-muted-foreground">
              <Sparkles className="w-3 h-3" />
              {catAnimation === 'sleep' ? 'Sleeping...' : catAnimation === 'stretch' ? 'Stretching!' : catAnimation === 'happy' ? 'Happy!' : 'Chilling...'}
            </div>
          </div>
        </div>

        {/* Owned Costumes */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Your Costumes</h2>
          
          {ownedCostumes.length === 0 ? (
            <div className="ios-card p-6 text-center">
              <p className="text-muted-foreground mb-3">No costumes yet!</p>
              <Button onClick={() => navigate('/rewards')}>
                <ShoppingBag className="w-4 h-4 mr-2" />
                Visit Store
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {/* No costume option */}
              <button
                onClick={() => handleEquip(null)}
                className={cn(
                  'p-3 rounded-xl border transition-all flex flex-col items-center gap-2',
                  !equippedCostume
                    ? 'bg-primary/10 border-primary ring-2 ring-primary/20'
                    : 'bg-card border-border hover:border-primary/50'
                )}
              >
                <div className="text-2xl">🐱</div>
                <span className="text-xs font-medium">None</span>
                {!equippedCostume && <Check className="w-3 h-3 text-primary" />}
              </button>

              {ownedCostumes.map((costume) => (
                <button
                  key={costume.id}
                  onClick={() => handleEquip(costume.id)}
                  className={cn(
                    'p-3 rounded-xl border transition-all flex flex-col items-center gap-2',
                    equippedCostume === costume.id
                      ? 'bg-primary/10 border-primary ring-2 ring-primary/20'
                      : 'bg-card border-border hover:border-primary/50'
                  )}
                >
                  <div className="text-2xl">{costume.icon}</div>
                  <span className="text-xs font-medium line-clamp-1">{costume.name}</span>
                  {equippedCostume === costume.id && <Check className="w-3 h-3 text-primary" />}
                </button>
              ))}
            </div>
          )}
        </section>
      </div>

      <BottomTabBar />

      <style>{`
        @keyframes wag {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(15deg); }
          75% { transform: rotate(-15deg); }
        }
        .animate-wag {
          animation: wag 0.5s ease-in-out infinite;
          transform-origin: 46px 42px;
        }
        @keyframes bounce-in {
          0% { transform: translateX(-50%) scale(0); }
          50% { transform: translateX(-50%) scale(1.2); }
          100% { transform: translateX(-50%) scale(1); }
        }
        .animate-bounce-in {
          animation: bounce-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default CatCustomize;
