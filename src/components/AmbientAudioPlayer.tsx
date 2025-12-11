import { useEffect, useRef } from 'react';
import { useAmbient, AmbientMode } from '@/contexts/AmbientContext';
import { useUserSettings } from '@/hooks/useUserSettings';

// High-quality ambient sound loops (30-120 seconds, seamless)
const AMBIENT_AUDIO_URLS: Record<Exclude<AmbientMode, 'off'>, string> = {
  // Soft, low-frequency natural rain - no harsh transients
  rain: 'https://cdn.pixabay.com/audio/2022/08/04/audio_2dde668d05.mp3',
  // Warm outdoor ambience with very soft wind
  sun_rays: 'https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3',
  // Quiet winter wind ambience - no chimes or bells
  snow: 'https://cdn.pixabay.com/audio/2022/10/30/audio_69a61cd6d6.mp3',
};

// Fade durations in milliseconds
const FADE_IN_DURATION = 2000;
const FADE_OUT_DURATION = 1500;
const TARGET_VOLUME = 0.18; // Low volume (18%)

export function AmbientAudioPlayer() {
  const { ambientMode, soundsEnabled } = useAmbient();
  const { settings } = useUserSettings();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<NodeJS.Timeout>();
  const isFadingOutRef = useRef(false);

  // Respect global sound setting
  const globalSoundEnabled = settings?.sound_enabled ?? true;
  const shouldPlaySound = soundsEnabled && globalSoundEnabled && ambientMode !== 'off';

  useEffect(() => {
    // Clear any existing fade interval
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = undefined;
    }

    // Fade out existing audio before switching
    if (audioRef.current && !isFadingOutRef.current) {
      isFadingOutRef.current = true;
      const oldAudio = audioRef.current;
      const fadeOutStep = oldAudio.volume / (FADE_OUT_DURATION / 30);
      
      const fadeOut = setInterval(() => {
        if (oldAudio.volume > fadeOutStep) {
          oldAudio.volume = Math.max(0, oldAudio.volume - fadeOutStep);
        } else {
          clearInterval(fadeOut);
          oldAudio.pause();
          oldAudio.src = '';
          isFadingOutRef.current = false;
        }
      }, 30);
      
      audioRef.current = null;
    }

    if (!shouldPlaySound) {
      return;
    }

    const audioUrl = AMBIENT_AUDIO_URLS[ambientMode as Exclude<AmbientMode, 'off'>];
    if (!audioUrl) return;

    // Small delay to allow fade out to complete
    const startTimeout = setTimeout(() => {
      const audio = new Audio(audioUrl);
      audio.loop = true;
      audio.volume = 0;
      audio.preload = 'auto';
      audioRef.current = audio;

      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            // Smooth fade in
            const fadeInStep = TARGET_VOLUME / (FADE_IN_DURATION / 50);
            let currentVolume = 0;
            
            fadeIntervalRef.current = setInterval(() => {
              if (currentVolume < TARGET_VOLUME) {
                currentVolume = Math.min(currentVolume + fadeInStep, TARGET_VOLUME);
                if (audioRef.current) {
                  audioRef.current.volume = currentVolume;
                }
              } else {
                if (fadeIntervalRef.current) {
                  clearInterval(fadeIntervalRef.current);
                  fadeIntervalRef.current = undefined;
                }
              }
            }, 50);
          })
          .catch((error) => {
            // Autoplay was prevented - this is expected behavior
            console.log('Audio autoplay prevented:', error.message);
          });
      }
    }, isFadingOutRef.current ? FADE_OUT_DURATION : 100);

    return () => {
      clearTimeout(startTimeout);
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
      if (audioRef.current && !isFadingOutRef.current) {
        // Smooth fade out on cleanup
        isFadingOutRef.current = true;
        const fadeOutStep = audioRef.current.volume / (FADE_OUT_DURATION / 30);
        const audio = audioRef.current;
        
        const fadeOut = setInterval(() => {
          if (audio.volume > fadeOutStep) {
            audio.volume = Math.max(0, audio.volume - fadeOutStep);
          } else {
            clearInterval(fadeOut);
            audio.pause();
            audio.src = '';
            isFadingOutRef.current = false;
          }
        }, 30);
      }
    };
  }, [ambientMode, shouldPlaySound]);

  // Handle visibility change - fade out when tab is hidden, fade in when visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (audioRef.current) {
        if (document.hidden) {
          // Fade out when tab hidden
          const audio = audioRef.current;
          const fadeOutStep = audio.volume / 500; // Quick fade
          const fadeOut = setInterval(() => {
            if (audio.volume > fadeOutStep) {
              audio.volume = Math.max(0, audio.volume - fadeOutStep);
            } else {
              clearInterval(fadeOut);
              audio.pause();
            }
          }, 10);
        } else if (shouldPlaySound) {
          // Fade in when tab visible
          const audio = audioRef.current;
          audio.play().then(() => {
            const fadeInStep = TARGET_VOLUME / 1000;
            const fadeIn = setInterval(() => {
              if (audio.volume < TARGET_VOLUME) {
                audio.volume = Math.min(TARGET_VOLUME, audio.volume + fadeInStep);
              } else {
                clearInterval(fadeIn);
              }
            }, 10);
          }).catch(() => {});
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
