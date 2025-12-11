/**
 * Apple In-App Purchases Service
 * 
 * This service handles all IAP functionality for iOS.
 * Uses @capgo/capacitor-purchases (RevenueCat) for cross-platform IAP.
 * 
 * IMPORTANT: Before deploying to App Store:
 * 1. Create products in App Store Connect
 * 2. Configure RevenueCat dashboard with your App Store Connect API key
 * 3. Replace REVENUECAT_API_KEY with your actual key
 */

import { Capacitor } from '@capacitor/core';

// ============================================
// PRODUCT IDS - Configure in App Store Connect
// ============================================
// These must match the product IDs you create in App Store Connect

export const IAP_PRODUCT_IDS = {
  // Subscriptions
  PREMIUM_MONTHLY: 'com.cozyhabits.premium.monthly',
  PREMIUM_ANNUAL: 'com.cozyhabits.premium.annual',
  PREMIUM_LIFETIME: 'com.cozyhabits.premium.lifetime',
  
  // Point Bundles (Consumables)
  POINTS_SMALL: 'com.cozyhabits.points.500',
  POINTS_MEDIUM: 'com.cozyhabits.points.1500',
  POINTS_LARGE: 'com.cozyhabits.points.5000',
  POINTS_MEGA: 'com.cozyhabits.points.12000',
} as const;

export type ProductId = typeof IAP_PRODUCT_IDS[keyof typeof IAP_PRODUCT_IDS];

// Map frontend bundle IDs to IAP product IDs
export const POINT_BUNDLE_TO_IAP: Record<string, ProductId> = {
  'small': IAP_PRODUCT_IDS.POINTS_SMALL,
  'medium': IAP_PRODUCT_IDS.POINTS_MEDIUM,
  'large': IAP_PRODUCT_IDS.POINTS_LARGE,
  'mega': IAP_PRODUCT_IDS.POINTS_MEGA,
};

export const SUBSCRIPTION_TO_IAP: Record<string, ProductId> = {
  'monthly': IAP_PRODUCT_IDS.PREMIUM_MONTHLY,
  'annual': IAP_PRODUCT_IDS.PREMIUM_ANNUAL,
  'lifetime': IAP_PRODUCT_IDS.PREMIUM_LIFETIME,
};

// ============================================
// TYPES
// ============================================

export interface IAPProduct {
  productId: string;
  title: string;
  description: string;
  price: string;
  priceAmount: number;
  currency: string;
}

export interface PurchaseResult {
  success: boolean;
  productId?: string;
  transactionId?: string;
  error?: string;
}

// ============================================
// IAP SERVICE CLASS
// ============================================

class AppleIAPService {
  private initialized = false;
  private products: Map<string, IAPProduct> = new Map();
  private isNative = Capacitor.isNativePlatform();

  /**
   * Initialize the IAP service
   * Call this early in app startup
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) return true;
    
    if (!this.isNative) {
      console.log('[IAP] Running in web mode - IAP disabled');
      this.initialized = true;
      return true;
    }

    try {
      // TODO: Initialize RevenueCat with your API key
      // const { Purchases } = await import('@capgo/capacitor-purchases');
      // await Purchases.configure({ apiKey: 'YOUR_REVENUECAT_API_KEY' });
      
      console.log('[IAP] Service initialized');
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('[IAP] Failed to initialize:', error);
      return false;
    }
  }

  /**
   * Check if IAP is available (native platform)
   */
  isAvailable(): boolean {
    return this.isNative;
  }

  /**
   * Fetch products from App Store
   */
  async fetchProducts(productIds: ProductId[]): Promise<IAPProduct[]> {
    if (!this.isNative) {
      // Return mock products for web
      return productIds.map(id => this.getMockProduct(id));
    }

    try {
      // TODO: Implement real product fetching
      // const { Purchases } = await import('@capgo/capacitor-purchases');
      // const offerings = await Purchases.getOfferings();
      // Map offerings to IAPProduct format
      
      return productIds.map(id => this.getMockProduct(id));
    } catch (error) {
      console.error('[IAP] Failed to fetch products:', error);
      return [];
    }
  }

  /**
   * Purchase a product
   */
  async purchase(productId: ProductId): Promise<PurchaseResult> {
    if (!this.isNative) {
      // Simulate purchase for web/demo
      console.log('[IAP] Web mode - simulating purchase for:', productId);
      return {
        success: true,
        productId,
        transactionId: `demo_${Date.now()}`,
      };
    }

    try {
      // TODO: Implement real purchase flow
      // const { Purchases } = await import('@capgo/capacitor-purchases');
      // const result = await Purchases.purchaseProduct({ productIdentifier: productId });
      
      // For now, return simulated success
      return {
        success: true,
        productId,
        transactionId: `native_${Date.now()}`,
      };
    } catch (error: any) {
      console.error('[IAP] Purchase failed:', error);
      
      // Handle specific error cases
      if (error?.code === 'USER_CANCELLED') {
        return { success: false, error: 'Purchase cancelled' };
      }
      
      return { 
        success: false, 
        error: error?.message || 'Purchase failed. Please try again.' 
      };
    }
  }

  /**
   * Restore previous purchases
   */
  async restorePurchases(): Promise<{ restored: ProductId[]; error?: string }> {
    if (!this.isNative) {
      console.log('[IAP] Web mode - restore not available');
      return { restored: [], error: 'Restore is only available on iOS' };
    }

    try {
      // TODO: Implement real restore
      // const { Purchases } = await import('@capgo/capacitor-purchases');
      // const customerInfo = await Purchases.restorePurchases();
      // Extract purchased product IDs from customerInfo
      
      return { restored: [] };
    } catch (error: any) {
      console.error('[IAP] Restore failed:', error);
      return { 
        restored: [], 
        error: error?.message || 'Failed to restore purchases' 
      };
    }
  }

  /**
   * Check if user has active premium subscription
   */
  async checkPremiumStatus(): Promise<boolean> {
    if (!this.isNative) {
      return false;
    }

    try {
      // TODO: Implement real subscription check
      // const { Purchases } = await import('@capgo/capacitor-purchases');
      // const customerInfo = await Purchases.getCustomerInfo();
      // return customerInfo.entitlements.active['premium'] !== undefined;
      
      return false;
    } catch (error) {
      console.error('[IAP] Failed to check premium status:', error);
      return false;
    }
  }

  /**
   * Get mock product data for development/web
   */
  private getMockProduct(productId: ProductId): IAPProduct {
    const mockData: Record<ProductId, Omit<IAPProduct, 'productId'>> = {
      [IAP_PRODUCT_IDS.PREMIUM_MONTHLY]: {
        title: 'Premium Monthly',
        description: 'Unlock all premium features',
        price: '$4.99',
        priceAmount: 4.99,
        currency: 'USD',
      },
      [IAP_PRODUCT_IDS.PREMIUM_ANNUAL]: {
        title: 'Premium Annual',
        description: 'Save 50% with annual subscription',
        price: '$29.99',
        priceAmount: 29.99,
        currency: 'USD',
      },
      [IAP_PRODUCT_IDS.PREMIUM_LIFETIME]: {
        title: 'Premium Lifetime',
        description: 'One-time purchase, forever access',
        price: '$79.99',
        priceAmount: 79.99,
        currency: 'USD',
      },
      [IAP_PRODUCT_IDS.POINTS_SMALL]: {
        title: 'Starter Pack',
        description: '500 points',
        price: '$0.99',
        priceAmount: 0.99,
        currency: 'USD',
      },
      [IAP_PRODUCT_IDS.POINTS_MEDIUM]: {
        title: 'Value Bundle',
        description: '1,500 points + 150 bonus',
        price: '$2.49',
        priceAmount: 2.49,
        currency: 'USD',
      },
      [IAP_PRODUCT_IDS.POINTS_LARGE]: {
        title: 'Super Pack',
        description: '5,000 points + 750 bonus',
        price: '$6.99',
        priceAmount: 6.99,
        currency: 'USD',
      },
      [IAP_PRODUCT_IDS.POINTS_MEGA]: {
        title: 'Mega Bundle',
        description: '12,000 points + 2,000 bonus',
        price: '$14.99',
        priceAmount: 14.99,
        currency: 'USD',
      },
    };

    return {
      productId,
      ...mockData[productId],
    };
  }
}

// Export singleton instance
export const appleIAP = new AppleIAPService();
