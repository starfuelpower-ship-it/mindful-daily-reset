import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

interface PremiumContextType {
  isPremium: boolean;
  isLoading: boolean;
  upgradeToPremium: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export function PremiumProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchPremiumStatus();
    } else {
      setIsPremium(false);
      setIsLoading(false);
    }
  }, [user]);

  const fetchPremiumStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_premium, premium_expires_at')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        const isActive = data.is_premium && 
          (!data.premium_expires_at || new Date(data.premium_expires_at) > new Date());
        setIsPremium(isActive);
      }
    } catch (error) {
      console.error('Error fetching premium status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const upgradeToPremium = async () => {
    if (!user) return;

    // For demo purposes, this sets premium for 1 year
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          is_premium: true, 
          premium_expires_at: expiresAt.toISOString() 
        })
        .eq('id', user.id);

      if (error) throw error;
      setIsPremium(true);
    } catch (error) {
      console.error('Error upgrading to premium:', error);
      throw error;
    }
  };

  return (
    <PremiumContext.Provider value={{ isPremium, isLoading, upgradeToPremium }}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
}
