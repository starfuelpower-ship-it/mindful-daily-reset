import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { Capacitor } from '@capacitor/core';
import { revenueCatService, PREMIUM_ENTITLEMENT } from '@/services/revenueCatService';

type Platform = 'apple' | 'google' | 'web';

interface PremiumContextType {
  isPremium: boolean;
  isLoading: boolean;
  activatePremium: (
    planId: string, 
    transactionId: string, 
    receipt?: string,
    purchaseToken?: string,
    platform?: Platform
  ) => Promise<boolean>;
  refreshPremiumStatus: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export function PremiumProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isNative = Capacitor.isNativePlatform();
  const initialized = useRef(false);

  /**
   * Check premium status from RevenueCat (native) or database (web/fallback)
   */
  const fetchPremiumStatus = useCallback(async () => {
    if (!user) {
      setIsPremium(false);
      setIsLoading(false);
      return;
    }
    
    try {
      // On native platforms, check RevenueCat first (source of truth)
      if (isNative) {
        // Initialize RevenueCat with user ID
        await revenueCatService.initialize(user.id);
        await revenueCatService.logIn(user.id);
        
        const customerInfo = await revenueCatService.getCustomerInfo();
        const hasRevenueCatPremium = revenueCatService.isPremiumActive(customerInfo);
        
        console.log('[Premium] RevenueCat premium status:', hasRevenueCatPremium);
        
        if (hasRevenueCatPremium) {
          setIsPremium(true);
          
          // Sync to database if not already synced
          await supabase
            .from('profiles')
            .update({ is_premium: true })
            .eq('id', user.id);
            
          setIsLoading(false);
          return;
        }
      }
      
      // Fallback: Check database (for web or if RevenueCat returns false)
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
  }, [user, isNative]);

  useEffect(() => {
    if (!initialized.current) {
      fetchPremiumStatus();
      initialized.current = true;
    }
  }, [fetchPremiumStatus]);

  // Re-check when user changes
  useEffect(() => {
    if (user) {
      fetchPremiumStatus();
    } else {
      setIsPremium(false);
      setIsLoading(false);
      initialized.current = false;
    }
  }, [user?.id]);

  /**
   * Activates premium status via secure server-side verification.
   * This function calls the edge function which verifies the purchase
   * and updates the database with service role permissions.
   */
  const activatePremium = useCallback(async (
    planId: string, 
    transactionId: string, 
    receipt?: string,
    purchaseToken?: string,
    platform?: Platform
  ): Promise<boolean> => {
    if (!user) {
      console.error('Cannot activate premium: no user logged in');
      return false;
    }

    try {
      // For RevenueCat purchases, we trust the SDK's customer info
      // Just sync the status to our database
      if (isNative) {
        const customerInfo = await revenueCatService.getCustomerInfo();
        const hasRevenueCatPremium = revenueCatService.isPremiumActive(customerInfo);
        
        if (hasRevenueCatPremium) {
          // Update database
          await supabase
            .from('profiles')
            .update({ 
              is_premium: true,
              // For subscriptions, we could set expiry from customerInfo
            })
            .eq('id', user.id);
            
          setIsPremium(true);
          return true;
        }
      }

      // Fallback: Call edge function for verification (legacy flow)
      const { data, error } = await supabase.functions.invoke('verify-premium-purchase', {
        body: { planId, transactionId, receipt, purchaseToken, platform }
      });

      if (error) {
        console.error('Premium activation error:', error);
        return false;
      }

      if (data?.success) {
        setIsPremium(true);
        return true;
      }

      console.error('Premium activation failed:', data?.error);
      return false;
    } catch (error) {
      console.error('Error activating premium:', error);
      return false;
    }
  }, [user, isNative]);

  const refreshPremiumStatus = useCallback(async () => {
    await fetchPremiumStatus();
  }, [fetchPremiumStatus]);

  return (
    <PremiumContext.Provider value={{ isPremium, isLoading, activatePremium, refreshPremiumStatus }}>
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
