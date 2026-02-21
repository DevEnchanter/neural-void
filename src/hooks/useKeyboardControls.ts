'use client';

import { useEffect } from 'react';
import { useNetworkStore } from '@/stores/networkStore';

export function useKeyboardControls() {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if (key === 'g') {
        useNetworkStore.getState().triggerGlitch();
      } else if (key === 'escape') {
        const { immersiveMode } = useNetworkStore.getState();
        if (immersiveMode) {
          useNetworkStore.getState().toggleImmersiveMode();
        }
      } else if (key === 'v') {
        useNetworkStore.getState().toggleImmersiveMode();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
