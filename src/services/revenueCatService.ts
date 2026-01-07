/**
 * RevenueCat Service for Google Play Billing
 * 
 * Handles subscription and one-time purchase flows using RevenueCat SDK.
 * 
 * RevenueCat Product IDs:
 * - cozy_premium_monthly
 * - cozy_premium_annual  
 * - lifetime
 */

import { Capacitor } from '@capacitor/core';

// RevenueCat Google Public SDK Key
const REVENUECAT_API_KEY = 'goog_fCUALTIbZQPTABfOdWRySqfcaH';

// Entitlement identifier
export const PREMIUM_ENTITLEMENT = 'premium';

// Google Play product IDs (must match RevenueCat dashboard)
export const REVENUECAT_PRODUCT_IDS = {
  PREMIUM_MONTHLY: 'cozy_premium_monthly',
  PREMIUM_ANNUAL: 'cozy_premium_annual',
  PREMIUM_LIFETIME: 'lifetime',
} as const;

// Map UI plan IDs to RevenueCat product IDs
export const PLAN_TO_PRODUCT: Record<string, string> = {
  'monthly': REVENUECAT_PRODUCT_IDS.PREMIUM_MONTHLY,
  'annual': REVENUECAT_PRODUCT_IDS.PREMIUM_ANNUAL,
  'lifetime': REVENUECAT_PRODUCT_IDS.PREMIUM_LIFETIME,
};

export interface RevenueCatProduct {
  identifier: string;
  priceString: string;
  price: number;
  currencyCode: string;
  title: string;
  description: string;
}

export interface RevenueCatOffering {
  identifier: string;
  packages: RevenueCatPackage[];
}

export interface RevenueCatPackage {
  identifier: string;
  product: RevenueCatProduct;
}

export interface CustomerInfo {
  entitlements: {
    active: Record<string, {
      identifier: string;
      isActive: boolean;
      willRenew: boolean;
      expirationDate: string | null;
    }>;
  };
  activeSubscriptions: string[];
  allPurchasedProductIdentifiers: string[];
  originalAppUserId: string;
}

class RevenueCatService {
  private initialized = false;
  private isNative = Capacitor.isNativePlatform();
  private Purchases: any = null;
  private cachedCustomerInfo: CustomerInfo | null = null;
  private appUserId: string | null = null;

  /**
   * Initialize RevenueCat SDK once at app startup
   */
  async initialize(userId?: string): Promise<boolean> {
    if (this.initialized) {
      console.log('[RevenueCat] Already configured');
      return true;
    }

    if (!this.isNative) {
      console.log('[RevenueCat] Running in web mode - SDK disabled');
      this.initialized = true;
      return true;
    }

    try {
      const { Purchases } = await import('@revenuecat/purchases-capacitor');
      this.Purchases = Purchases;

      // Configure RevenueCat with user ID if available
      const config: any = {
        apiKey: REVENUECAT_API_KEY,
      };

      if (userId) {
        config.appUserID = userId;
      }

      await Purchases.configure(config);
      
      // Get the app user ID that RevenueCat is using
      const appUserInfo = await Purchases.getAppUserID();
      this.appUserId = appUserInfo.appUserID;
      
      console.log('[RevenueCat] Configured');
      console.log('[RevenueCat] appUserID:', this.appUserId);

      this.initialized = true;
      return true;
    } catch (error) {
      console.error('[RevenueCat] Failed to initialize:', error);
      return false;
    }
  }

  /**
   * Check if RevenueCat is available (native platform)
   */
  isAvailable(): boolean {
    return this.isNative && this.initialized;
  }

  /**
   * Get current app user ID
   */
  getAppUserId(): string | null {
    return this.appUserId;
  }

  /**
   * Log in a user (associate purchases with their account)
   */
  async logIn(userId: string): Promise<CustomerInfo | null> {
    if (!this.isNative || !this.Purchases) {
      return null;
    }

    try {
      const result = await this.Purchases.logIn({ appUserID: userId });
      this.appUserId = userId;
      this.cachedCustomerInfo = result.customerInfo;
      console.log('[RevenueCat] Logged in user:', userId);
      return result.customerInfo;
    } catch (error) {
      console.error('[RevenueCat] Login failed:', error);
      return null;
    }
  }

  /**
   * Log out current user
   */
  async logOut(): Promise<void> {
    if (!this.isNative || !this.Purchases) {
      return;
    }

    try {
      await this.Purchases.logOut();
      this.cachedCustomerInfo = null;
      console.log('[RevenueCat] Logged out');
    } catch (error) {
      console.error('[RevenueCat] Logout failed:', error);
    }
  }

  /**
   * Fetch offerings from RevenueCat
   */
  async getOfferings(): Promise<RevenueCatOffering | null> {
    if (!this.isNative || !this.Purchases) {
      console.log('[RevenueCat] Web mode - returning null offerings');
      return null;
    }

    try {
      const offerings = await this.Purchases.getOfferings();
      
      if (offerings.current) {
        console.log('[RevenueCat] Offerings loaded:', offerings.current.identifier);
        return offerings.current;
      }
      
      console.log('[RevenueCat] No current offering available');
      return null;
    } catch (error) {
      console.error('[RevenueCat] Failed to fetch offerings:', error);
      return null;
    }
  }

  /**
   * Get customer info (entitlements, subscriptions)
   */
  async getCustomerInfo(): Promise<CustomerInfo | null> {
    if (!this.isNative || !this.Purchases) {
      return null;
    }

    try {
      const result = await this.Purchases.getCustomerInfo();
      this.cachedCustomerInfo = result.customerInfo;
      
      const isPremium = this.isPremiumActive(result.customerInfo);
      console.log('[RevenueCat] Premium entitlement active:', isPremium);
      
      return result.customerInfo;
    } catch (error) {
      console.error('[RevenueCat] Failed to get customer info:', error);
      return null;
    }
  }

  /**
   * Check if premium entitlement is active
   */
  isPremiumActive(customerInfo?: CustomerInfo | null): boolean {
    const info = customerInfo || this.cachedCustomerInfo;
    if (!info) return false;
    
    return !!info.entitlements?.active?.[PREMIUM_ENTITLEMENT]?.isActive;
  }

  /**
   * Purchase a package
   */
  async purchasePackage(packageToPurchase: RevenueCatPackage): Promise<{
    success: boolean;
    customerInfo?: CustomerInfo;
    error?: string;
  }> {
    if (!this.isNative || !this.Purchases) {
      return { success: false, error: 'Not available on web' };
    }

    try {
      const result = await this.Purchases.purchasePackage({ aPackage: packageToPurchase });
      this.cachedCustomerInfo = result.customerInfo;
      
      const isPremium = this.isPremiumActive(result.customerInfo);
      console.log('[RevenueCat] Purchase complete, premium active:', isPremium);
      
      return { success: true, customerInfo: result.customerInfo };
    } catch (error: any) {
      console.error('[RevenueCat] Purchase failed:', error);
      
      // Handle user cancellation
      if (error?.code === 1 || error?.message?.includes('cancelled') || error?.message?.includes('canceled')) {
        return { success: false, error: 'cancelled' };
      }
      
      return { success: false, error: error?.message || 'Purchase failed' };
    }
  }

  /**
   * Fetch products from the store
   */
  async getProducts(productIds: string[]): Promise<any[]> {
    if (!this.isNative || !this.Purchases) {
      return [];
    }

    try {
      const result = await this.Purchases.getProducts({ productIdentifiers: productIds });
      console.log('[RevenueCat] Fetched products:', result.products?.length || 0);
      return result.products || [];
    } catch (error) {
      console.error('[RevenueCat] Failed to fetch products:', error);
      return [];
    }
  }

  /**
   * Purchase a product by ID directly (fallback if no offerings)
   * First fetches the actual product from the store, then purchases it
   */
  async purchaseProduct(productId: string): Promise<{
    success: boolean;
    customerInfo?: CustomerInfo;
    error?: string;
  }> {
    if (!this.isNative || !this.Purchases) {
      // Simulate success in web for testing
      console.log('[RevenueCat] Web mode - simulating purchase for:', productId);
      return { success: true };
    }

    try {
      console.log('[RevenueCat] Fetching product from store:', productId);
      
      // First, fetch the actual product from the store
      const products = await this.getProducts([productId]);
      
      if (!products || products.length === 0) {
        console.error('[RevenueCat] Product not found in store:', productId);
        return { success: false, error: 'The product is not available for purchase.' };
      }
      
      const product = products[0];
      console.log('[RevenueCat] Found product:', product.identifier, 'price:', product.priceString);
      
      // Purchase the actual store product
      const result = await this.Purchases.purchaseStoreProduct({ product });
      
      this.cachedCustomerInfo = result.customerInfo;
      
      const isPremium = this.isPremiumActive(result.customerInfo);
      console.log('[RevenueCat] Purchase complete, premium active:', isPremium);
      
      return { success: true, customerInfo: result.customerInfo };
    } catch (error: any) {
      console.error('[RevenueCat] Purchase failed:', error);
      
      if (error?.code === 1 || error?.message?.includes('cancelled') || error?.message?.includes('canceled')) {
        return { success: false, error: 'cancelled' };
      }
      
      return { success: false, error: error?.message || 'Purchase failed' };
    }
  }

  /**
   * Restore purchases
   */
  async restorePurchases(): Promise<{
    success: boolean;
    customerInfo?: CustomerInfo;
    error?: string;
  }> {
    if (!this.isNative || !this.Purchases) {
      return { success: false, error: 'Not available on web' };
    }

    try {
      const result = await this.Purchases.restorePurchases();
      this.cachedCustomerInfo = result.customerInfo;
      
      const isPremium = this.isPremiumActive(result.customerInfo);
      console.log('[RevenueCat] Restore complete, premium active:', isPremium);
      
      return { success: true, customerInfo: result.customerInfo };
    } catch (error: any) {
      console.error('[RevenueCat] Restore failed:', error);
      return { success: false, error: error?.message || 'Restore failed' };
    }
  }
}

// Export singleton instance
export const revenueCatService = new RevenueCatService();
