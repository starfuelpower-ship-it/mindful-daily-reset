import { useCallback } from 'react';
import { Capacitor } from '@capacitor/core';

type HapticStyle = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

export function useHaptics() {
  const trigger = useCallback(async (style: HapticStyle = 'light') => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      const { Haptics, ImpactStyle, NotificationType } = await import('@capacitor/haptics');
      
      switch (style) {
        case 'light':
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
        case 'medium':
          await Haptics.impact({ style: ImpactStyle.Medium });
          break;
        case 'heavy':
          await Haptics.impact({ style: ImpactStyle.Heavy });
          break;
        case 'success':
          await Haptics.notification({ type: NotificationType.Success });
          break;
        case 'warning':
          await Haptics.notification({ type: NotificationType.Warning });
          break;
        case 'error':
          await Haptics.notification({ type: NotificationType.Error });
          break;
      }
    } catch (error) {
      // Haptics not available, fail silently
      console.log('Haptics not available');
    }
  }, []);

  const selectionChanged = useCallback(async () => {
    if (!Capacitor.isNativePlatform()) return;
    
    try {
      const { Haptics } = await import('@capacitor/haptics');
      await Haptics.selectionChanged();
    } catch {
      // Fail silently
    }
  }, []);

  return { trigger, selectionChanged };
}
