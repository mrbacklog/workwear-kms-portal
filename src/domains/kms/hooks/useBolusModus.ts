import { useState, useRef, useCallback, useEffect } from 'react';
import { translations } from '../lib/kms-translations';
import type { TranslationKey } from '../lib/kms-translations';

type BolusModeState = 'idle' | 'pressing' | 'countdown' | 'active';

interface UseBolusModus {
  isActive: boolean;
  state: BolusModeState;
  pressProgress: number;
  countdownNumber: number | null;
  flashActive: boolean;
  handlers: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerUp: () => void;
    onPointerLeave: () => void;
  };
  t: (key: TranslationKey) => string;
  deactivate: () => void;
}

const PRESS_DURATION_MS = 3000;
const TICK_INTERVAL_MS = 50;

export function useBolusModus(): UseBolusModus {
  const [modeState, setModeState] = useState<BolusModeState>(() => {
    const stored = sessionStorage.getItem('bolus_modus');
    return stored === 'active' ? 'active' : 'idle';
  });
  const [pressProgress, setPressProgress] = useState(0);
  const [countdownNumber, setCountdownNumber] = useState<number | null>(null);
  const [flashActive, setFlashActive] = useState(false);

  const pressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pressStartRef = useRef<number | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelPress = useCallback(() => {
    if (pressTimerRef.current !== null) {
      clearInterval(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    pressStartRef.current = null;
    setPressProgress(0);
    setModeState((prev) => (prev === 'pressing' ? 'idle' : prev));
  }, []);

  const startCountdown = useCallback(() => {
    setModeState('countdown');
    setCountdownNumber(3);

    const step2 = setTimeout(() => {
      setCountdownNumber(2);
      const step1 = setTimeout(() => {
        setCountdownNumber(1);
        const flash = setTimeout(() => {
          // Flash phase: number disappears, brief white flash
          setCountdownNumber(null);
          setFlashActive(true);
          const finish = setTimeout(() => {
            setFlashActive(false);
            setModeState('active');
            sessionStorage.setItem('bolus_modus', 'active');
          }, 150);
          countdownTimerRef.current = finish;
        }, 1000);
        countdownTimerRef.current = flash;
      }, 1000);
      countdownTimerRef.current = step1;
    }, 1000);
    countdownTimerRef.current = step2;
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (modeState === 'active' || modeState === 'countdown') return;
      // Only trigger on left button or touch
      if (e.pointerType === 'mouse' && e.button !== 0) return;

      pressStartRef.current = Date.now();
      setModeState('pressing');
      setPressProgress(0);

      pressTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - (pressStartRef.current ?? Date.now());
        const progress = Math.min(elapsed / PRESS_DURATION_MS, 1);
        setPressProgress(progress);

        if (progress >= 1) {
          if (pressTimerRef.current !== null) {
            clearInterval(pressTimerRef.current);
            pressTimerRef.current = null;
          }
          pressStartRef.current = null;
          setPressProgress(0);
          startCountdown();
        }
      }, TICK_INTERVAL_MS);
    },
    [modeState, startCountdown],
  );

  const onPointerUp = useCallback(() => {
    cancelPress();
  }, [cancelPress]);

  const onPointerLeave = useCallback(() => {
    cancelPress();
  }, [cancelPress]);

  const deactivate = useCallback(() => {
    sessionStorage.removeItem('bolus_modus');
    setModeState('idle');
    setPressProgress(0);
    setCountdownNumber(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pressTimerRef.current !== null) clearInterval(pressTimerRef.current);
      if (countdownTimerRef.current !== null) clearTimeout(countdownTimerRef.current);
    };
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      const locale = modeState === 'active' ? 'nl-ZB' : 'nl';
      return translations[locale][key];
    },
    [modeState],
  );

  return {
    isActive: modeState === 'active',
    state: modeState,
    pressProgress,
    countdownNumber,
    flashActive,
    handlers: { onPointerDown, onPointerUp, onPointerLeave },
    t,
    deactivate,
  };
}
