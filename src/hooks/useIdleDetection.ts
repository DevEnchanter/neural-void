'use client';

import { useEffect, useRef, useState } from 'react';

const IDLE_TIMEOUT = 5000;

export function useIdleDetection() {
  const [isIdle, setIsIdle] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const resetTimer = () => {
      if (isIdle) setIsIdle(false);

      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = window.setTimeout(() => {
        setIsIdle(true);
      }, IDLE_TIMEOUT);
    };

    // Start initial timer
    resetTimer();

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('pointerdown', resetTimer);
    window.addEventListener('scroll', resetTimer);

    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('pointerdown', resetTimer);
      window.removeEventListener('scroll', resetTimer);
    };
  }, [isIdle]);

  return { isIdle };
}
