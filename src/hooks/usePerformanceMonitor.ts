'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

const SAMPLE_SIZE = 60;
const LOW_FPS_THRESHOLD = 30;

export function usePerformanceMonitor() {
  const frameTimes = useRef<number[]>([]);
  const fpsRef = useRef(60);
  const shouldReduceQualityRef = useRef(false);
  const lastTime = useRef(performance.now());

  useFrame(() => {
    const now = performance.now();
    const delta = now - lastTime.current;
    lastTime.current = now;

    if (delta <= 0) return;

    frameTimes.current.push(delta);
    if (frameTimes.current.length > SAMPLE_SIZE) {
      frameTimes.current.shift();
    }

    // Calculate rolling average FPS
    if (frameTimes.current.length >= 10) {
      const avgDelta =
        frameTimes.current.reduce((sum, t) => sum + t, 0) /
        frameTimes.current.length;
      fpsRef.current = 1000 / avgDelta;
      shouldReduceQualityRef.current = fpsRef.current < LOW_FPS_THRESHOLD;
    }
  });

  return {
    fpsRef,
    shouldReduceQualityRef,
  };
}
