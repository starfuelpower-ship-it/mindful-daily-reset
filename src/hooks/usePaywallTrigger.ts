/**
 * Hook to manage paywall triggers for free users
 * 
 * Triggers:
 * - Every 3rd Settings visit
 * - Every Stats page visit
 * - Every Groups page visit  
 * - Every Journal page visit
 */

import { useState, useCallback, useEffect } from 'react';
import { usePremium } from '@/contexts/PremiumContext';

const STORAGE_KEY = 'cozy_paywall_triggers';

interface PaywallTriggerData {
  settingsVisits: number;
  lastSettingsPaywall: number; // timestamp
}

function getStoredData(): PaywallTriggerData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return {
    settingsVisits: 0,
    lastSettingsPaywall: 0,
  };
}

function saveData(data: PaywallTriggerData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function usePaywallTrigger() {
  const { isPremium } = usePremium();
  const [showPaywall, setShowPaywall] = useState(false);

  // Check if settings visit should show paywall (every 3rd visit)
  const checkSettingsPaywall = useCallback(() => {
    if (isPremium) return false;
    
    const data = getStoredData();
    const newCount = data.settingsVisits + 1;
    
    // Save the new visit count
    saveData({ ...data, settingsVisits: newCount });
    
    // Show paywall on every 3rd visit (3, 6, 9, etc.)
    if (newCount % 3 === 0) {
      setShowPaywall(true);
      return true;
    }
    
    return false;
  }, [isPremium]);

  // Always show paywall for premium feature pages (stats, groups, journal)
  const checkPremiumPagePaywall = useCallback(() => {
    if (isPremium) return false;
    setShowPaywall(true);
    return true;
  }, [isPremium]);

  const dismissPaywall = useCallback(() => {
    setShowPaywall(false);
  }, []);

  return {
    showPaywall,
    checkSettingsPaywall,
    checkPremiumPagePaywall,
    dismissPaywall,
  };
}
