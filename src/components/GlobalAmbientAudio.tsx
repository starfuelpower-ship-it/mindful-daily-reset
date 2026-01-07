/**
 * Global Ambient Audio Component
 * 
 * This component handles ambient sound playback at the app level,
 * ensuring sounds persist across all screens and navigation.
 */

import { useAmbient } from '@/contexts/AmbientContext';
import { useAmbientAudio } from '@/hooks/useAmbientAudio';

export function GlobalAmbientAudio() {
  const { ambientMode, soundsEnabled, soundVolume } = useAmbient();
  
  // This hook will manage audio playback globally
  useAmbientAudio(ambientMode, soundsEnabled, soundVolume / 100);
  
  // This component renders nothing - it just manages audio
  return null;
}
