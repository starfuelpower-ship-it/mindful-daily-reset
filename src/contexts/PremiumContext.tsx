import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { Capacitor } from '@capacitor/core';
import { revenueCatService, PREMIUM_ENTITLEMENT } from '@/services/revenueCatService';

type Platform = 'apple' | 'google' | 'web';

interface PremiumContextType {
  isPremium: boolean;
  isLoading: boolean;
  isFinalizing: boolean;
  activatePremium: (
    planId: string, 
    transactionId: string, 
    receipt?: string,
    purchaseToken?: string,
    platform?: Platform
  ) => Promise<boolean>;
  refreshPremiumStatus: () => Promise<void>;
  restorePurchases: () => Promise<boolean>;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

// Maximum retry attempts for checking entitlement after purchase
const MAX_ENTITLEMENT_RETRIES = 5;
const RETRY_DELAY_MS = 2000;

export function PremiumProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const isNative = Capacitor.isNativePlatform();
  const initialized = useRef(false);

  /**
   * Check premium status from RevenueCat (native) or database (web/fallback)
   * This is the source of truth for premium status.
   */
  const fetchPremiumStatus = useCallback(async (): Promise<boolean> => {
    if (!user) {
      setIsPremium(false);
      setIsLoading(false);
      return false;
    }
    
    try {
      // On native platforms, ALWAYS check RevenueCat first (source of truth)
      if (isNative) {
        // Initialize RevenueCat with user ID
        await revenueCatService.initialize(user.id);
        await revenueCatService.logIn(user.id);
        
        const customerInfo = await revenueCatService.getCustomerInfo();
        const hasRevenueCatPremium = revenueCatService.isPremiumActive(customerInfo);
        
        console.log('[Premium] RevenueCat premium status:', hasRevenueCatPremium);
        
        setIsPremium(hasRevenueCatPremium);
        
        // Sync to database if premium is active
        if (hasRevenueCatPremium) {
          await supabase
            .from('profiles')
            .update({ is_premium: true })
            .eq('id', user.id);
        }
          
        setIsLoading(false);
        return hasRevenueCatPremium;
      }
      
      // Fallback: Check database (for web only)
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
        setIsLoading(false);
        return isActive;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Error fetching premium status:', error);
      setIsLoading(false);
      return false;
    }
  }, [user, isNative]);

  // Initialize on mount
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
   * Retry checking entitlement after purchase with exponential backoff
   */
  const checkEntitlementWithRetry = useCallback(async (retries = 0): Promise<boolean> => {
    if (!isNative || !user) return false;
    
    const customerInfo = await revenueCatService.getCustomerInfo();
    const hasEntitlement = revenueCatService.isPremiumActive(customerInfo);
    
    if (hasEntitlement) {
      console.log('[Premium] Entitlement confirmed after', retries, 'retries');
      return true;
    }
    
    if (retries < MAX_ENTITLEMENT_RETRIES) {
      console.log('[Premium] Entitlement not yet active, retrying in', RETRY_DELAY_MS, 'ms...');
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      return checkEntitlementWithRetry(retries + 1);
    }
    
    console.log('[Premium] Max retries reached, entitlement not active');
    return false;
  }, [isNative, user]);

  /**
   * Activates premium status via secure server-side verification.
   * Premium ONLY unlocks when RevenueCat confirms the entitlement is active.
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
      // For RevenueCat purchases, verify entitlement is actually active
      if (isNative) {
        setIsFinalizing(true);
        
        // Check entitlement with retry logic
        const hasEntitlement = await checkEntitlementWithRetry();
        
        if (hasEntitlement) {
          // Sync to database
          await supabase
            .from('profiles')
            .update({ is_premium: true })
            .eq('id', user.id);
            
          setIsPremium(true);
          setIsFinalizing(false);
          return true;
        }
        
        // Entitlement not found after retries
        setIsFinalizing(false);
        console.error('[Premium] Purchase completed but entitlement not active');
        return false;
      }

      // Web fallback: Call edge function for verification (legacy flow)
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
      setIsFinalizing(false);
      return false;
    }
  }, [user, isNative, checkEntitlementWithRetry]);

  /**
   * Restore purchases - checks RevenueCat for existing entitlements
   */
  const restorePurchases = useCallback(async (): Promise<boolean> => {
    if (!user || !isNative) {
      return false;
    }

    try {
      setIsLoading(true);
      const result = await revenueCatService.restorePurchases();
      
      if (result.success && result.customerInfo) {
        const hasPremium = revenueCatService.isPremiumActive(result.customerInfo);
        
        if (hasPremium) {
          // Sync to database
          await supabase
            .from('profiles')
            .update({ is_premium: true })
            .eq('id', user.id);
            
          setIsPremium(true);
          setIsLoading(false);
          return true;
        }
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Error restoring purchases:', error);
      setIsLoading(false);
      return false;
    }
  }, [user, isNative]);

  const refreshPremiumStatus = useCallback(async () => {
    await fetchPremiumStatus();
  }, [fetchPremiumStatus]);

  return (
    <PremiumContext.Provider value={{ 
      isPremium, 
      isLoading, 
      isFinalizing,
      activatePremium, 
      refreshPremiumStatus,
      restorePurchases,
    }}>
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
