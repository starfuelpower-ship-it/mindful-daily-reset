/**
 * React hook for RevenueCat subscriptions
 * 
 * Provides access to RevenueCat functionality with proper state management.
 * Used by the Premium page to handle subscription purchases.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { 
  revenueCatService, 
  PLAN_TO_PRODUCT,
  PREMIUM_ENTITLEMENT,
  type RevenueCatOffering,
  type RevenueCatPackage,
  type CustomerInfo,
} from '@/services/revenueCatService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useRevenueCat() {
  const { user } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [offering, setOffering] = useState<RevenueCatOffering | null>(null);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const initRef = useRef(false);
  const isNative = Capacitor.isNativePlatform();

  // Initialize RevenueCat when the hook mounts
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const init = async () => {
      // Pass user ID if authenticated
      const success = await revenueCatService.initialize(user?.id);
      setIsInitialized(success);

      if (success && isNative) {
        // If user is logged in, log them into RevenueCat too
        if (user?.id) {
          await revenueCatService.logIn(user.id);
        }

        // Fetch offerings
        const fetchedOffering = await revenueCatService.getOfferings();
        setOffering(fetchedOffering);

        // Get customer info to check premium status
        const info = await revenueCatService.getCustomerInfo();
        setCustomerInfo(info);
        setIsPremium(revenueCatService.isPremiumActive(info));
      }
    };

    init();
  }, [user?.id, isNative]);

  // Sync user with RevenueCat when auth changes
  useEffect(() => {
    if (!isInitialized || !isNative) return;

    const syncUser = async () => {
      if (user?.id) {
        await revenueCatService.logIn(user.id);
        const info = await revenueCatService.getCustomerInfo();
        setCustomerInfo(info);
        setIsPremium(revenueCatService.isPremiumActive(info));
      }
    };

    syncUser();
  }, [user?.id, isInitialized, isNative]);

  /**
   * Get a package by plan ID from current offering
   */
  const getPackageForPlan = useCallback((planId: 'weekly' | 'monthly' | 'annual' | 'lifetime'): RevenueCatPackage | null => {
    if (!offering) return null;

    const productId = PLAN_TO_PRODUCT[planId];
    
    // Try to find by package identifier first
    const packageByIdentifier = offering.packages.find(pkg => 
      pkg.identifier === `$rc_${planId}` || 
      pkg.identifier === planId ||
      pkg.product.identifier === productId
    );
    
    if (packageByIdentifier) return packageByIdentifier;

    // Fallback: find by product identifier
    return offering.packages.find(pkg => pkg.product.identifier === productId) || null;
  }, [offering]);

  /**
   * Purchase a subscription by plan ID
   */
  const purchaseSubscription = useCallback(async (planId: 'weekly' | 'monthly' | 'annual' | 'lifetime'): Promise<boolean> => {
    setIsLoading(true);

    try {
      // Try to purchase via package from offering
      const pkg = getPackageForPlan(planId);
      
      let result;
      if (pkg) {
        result = await revenueCatService.purchasePackage(pkg);
      } else {
        // Fallback: purchase by product ID directly
        const productId = PLAN_TO_PRODUCT[planId];
        if (!productId) {
          toast.error('Invalid subscription plan');
          return false;
        }
        result = await revenueCatService.purchaseProduct(productId);
      }

      if (result.success) {
        // Update local state
        if (result.customerInfo) {
          setCustomerInfo(result.customerInfo);
          setIsPremium(revenueCatService.isPremiumActive(result.customerInfo));
        } else {
          // Web mode simulation - assume success
          setIsPremium(true);
        }
        
        toast.success('Welcome to Premium! 🎉');
        return true;
      } else {
        if (result.error !== 'cancelled') {
          toast.error(result.error || 'Purchase failed. Please try again.');
        }
        return false;
      }
    } catch (error) {
      console.error('[useRevenueCat] Purchase error:', error);
      toast.error('Something went wrong. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [getPackageForPlan]);

  /**
   * Restore purchases
   */
  const restorePurchases = useCallback(async (): Promise<boolean> => {
    if (!isNative) {
      toast.info('Restore is only available in the app');
      return false;
    }

    setIsLoading(true);

    try {
      const result = await revenueCatService.restorePurchases();

      if (result.success && result.customerInfo) {
        setCustomerInfo(result.customerInfo);
        const hasPremium = revenueCatService.isPremiumActive(result.customerInfo);
        setIsPremium(hasPremium);

        if (hasPremium) {
          toast.success('Premium restored successfully!');
          return true;
        } else {
          toast.info('No active subscriptions found');
          return false;
        }
      } else {
        toast.error(result.error || 'Failed to restore purchases');
        return false;
      }
    } catch (error) {
      console.error('[useRevenueCat] Restore error:', error);
      toast.error('Failed to restore purchases');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isNative]);

  /**
   * Refresh customer info and premium status
   */
  const refreshPremiumStatus = useCallback(async () => {
    if (!isNative) return;

    const info = await revenueCatService.getCustomerInfo();
    setCustomerInfo(info);
    setIsPremium(revenueCatService.isPremiumActive(info));
  }, [isNative]);

  /**
   * Get price string for a plan from offerings
   */
  const getPriceForPlan = useCallback((planId: 'weekly' | 'monthly' | 'annual' | 'lifetime'): string | null => {
    const pkg = getPackageForPlan(planId);
    return pkg?.product.priceString || null;
  }, [getPackageForPlan]);

  return {
    isInitialized,
    isLoading,
    isPremium,
    isNativePlatform: isNative,
    offering,
    customerInfo,
    purchaseSubscription,
    restorePurchases,
    refreshPremiumStatus,
    getPriceForPlan,
    getPackageForPlan,
  };
}
