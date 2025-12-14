import { useCallback, useRef } from 'react';

type SoundType = 'click' | 'success' | 'complete' | 'pop' | 'purr' | 'achievement' | 'button';

// Create audio context lazily to avoid autoplay restrictions
let audioContext: AudioContext | null = null;

const getAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

// Generate simple sounds programmatically
const playTone = (frequency: number, duration: number, type: OscillatorType = 'sine', gain: number = 0.1) => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    gainNode.gain.setValueAtTime(gain, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    // Silent fail for audio
  }
};

const SOUNDS: Record<SoundType, () => void> = {
  click: () => {
    playTone(800, 0.05, 'sine', 0.08);
  },
  button: () => {
    // Satisfying soft tap with subtle harmonic
    playTone(880, 0.04, 'sine', 0.12);
    setTimeout(() => playTone(1320, 0.03, 'sine', 0.06), 20);
  },
  pop: () => {
    playTone(600, 0.08, 'sine', 0.1);
    setTimeout(() => playTone(900, 0.06, 'sine', 0.08), 30);
  },
  success: () => {
    playTone(523, 0.1, 'sine', 0.1);
    setTimeout(() => playTone(659, 0.1, 'sine', 0.1), 100);
    setTimeout(() => playTone(784, 0.15, 'sine', 0.1), 200);
  },
  complete: () => {
    playTone(440, 0.1, 'triangle', 0.12);
    setTimeout(() => playTone(554, 0.1, 'triangle', 0.1), 80);
    setTimeout(() => playTone(659, 0.12, 'triangle', 0.1), 160);
    setTimeout(() => playTone(880, 0.2, 'triangle', 0.08), 240);
  },
  purr: () => {
    // Low rumbling purr sound
    playTone(80, 0.3, 'sine', 0.06);
    setTimeout(() => playTone(90, 0.3, 'sine', 0.05), 100);
    setTimeout(() => playTone(75, 0.3, 'sine', 0.06), 200);
    setTimeout(() => playTone(85, 0.4, 'sine', 0.04), 300);
  },
  achievement: () => {
    // Triumphant fanfare
    playTone(523, 0.1, 'triangle', 0.12);
    setTimeout(() => playTone(659, 0.1, 'triangle', 0.12), 80);
    setTimeout(() => playTone(784, 0.1, 'triangle', 0.12), 160);
    setTimeout(() => playTone(1047, 0.3, 'triangle', 0.15), 240);
  },
};

export function useSoundEffects() {
  const enabled = useRef(true);

  const playSound = useCallback((type: SoundType) => {
    if (enabled.current && SOUNDS[type]) {
      SOUNDS[type]();
    }
  }, []);

  const setEnabled = useCallback((value: boolean) => {
    enabled.current = value;
  }, []);

  const triggerHapticFn = useCallback((type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'medium') => {
    if ('vibrate' in navigator) {
      const patterns: Record<string, number | number[]> = {
        light: 10,
        medium: 25,
        heavy: [50, 30, 50],
        success: [10, 50, 20],
        warning: [30, 20, 30],
        error: [50, 30, 50, 30, 50],
      };
      navigator.vibrate(patterns[type]);
    }
  }, []);

  return { playSound, setEnabled, triggerHaptic: triggerHapticFn };
}

// Haptic feedback utility with more types
export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'medium') {
  if ('vibrate' in navigator) {
    const patterns: Record<string, number | number[]> = {
      light: 10,
      medium: 25,
      heavy: [50, 30, 50],
      success: [10, 50, 20],
      warning: [30, 20, 30],
      error: [50, 30, 50, 30, 50],
    };
    navigator.vibrate(patterns[type]);
  }
}
