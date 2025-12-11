import { useEffect, useRef } from 'react';
import { useAmbient, AmbientMode } from '@/contexts/AmbientContext';
import { useUserSettings } from '@/hooks/useUserSettings';

// Audio URLs - using free ambient sounds from reliable sources
const AMBIENT_AUDIO_URLS: Record<Exclude<AmbientMode, 'off'>, string> = {
  rain: 'https://cdn.pixabay.com/audio/2022/05/16/audio_4bea1effb6.mp3', // Light rain
  sun_rays: 'https://cdn.pixabay.com/audio/2022/03/10/audio_b93ca9e12c.mp3', // Soft wind
  snow: 'https://cdn.pixabay.com/audio/2021/08/04/audio_bb630cc098.mp3', // Winter ambience
};

export function AmbientAudioPlayer() {
  const { ambientMode, soundsEnabled } = useAmbient();
  const { settings } = useUserSettings();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout>();

  // Respect global sound setting
  const globalSoundEnabled = settings?.sound_enabled ?? true;
  const shouldPlaySound = soundsEnabled && globalSoundEnabled && ambientMode !== 'off';

  useEffect(() => {
    // Clean up any existing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }

    if (!shouldPlaySound) {
      return;
    }

    const audioUrl = AMBIENT_AUDIO_URLS[ambientMode as Exclude<AmbientMode, 'off'>];
    if (!audioUrl) return;

    const audio = new Audio(audioUrl);
    audio.loop = true;
    audio.volume = 0;
    audioRef.current = audio;

    // Fade in
    const targetVolume = 0.15; // Very low volume
    let currentVolume = 0;

    const playPromise = audio.play();
    
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          fadeIntervalRef.current = setInterval(() => {
            if (currentVolume < targetVolume) {
              currentVolume = Math.min(currentVolume + 0.01, targetVolume);
              audio.volume = currentVolume;
            } else {
              clearInterval(fadeIntervalRef.current);
            }
          }, 50);
        })
        .catch((error) => {
          // Autoplay was prevented - this is expected behavior
          console.log('Audio autoplay prevented:', error.message);
        });
    }

    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
      if (audioRef.current) {
        // Fade out
        const fadeOut = setInterval(() => {
          if (audioRef.current && audioRef.current.volume > 0.01) {
            audioRef.current.volume = Math.max(0, audioRef.current.volume - 0.02);
          } else {
            clearInterval(fadeOut);
            audioRef.current?.pause();
          }
        }, 30);
      }
    };
  }, [ambientMode, shouldPlaySound]);

  // Handle visibility change - pause when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (audioRef.current) {
        if (document.hidden) {
          audioRef.current.pause();
        } else if (shouldPlaySound) {
          audioRef.current.play().catch(() => {});
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [shouldPlaySound]);

  return null; // This component doesn't render anything
}
