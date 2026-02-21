'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';
import { useNetworkStore } from '@/stores/networkStore';
import LoadingScreen from '@/components/LoadingScreen';
import HudHeader from '@/components/ui-overlays/HudHeader';
import ImmersiveOverlay from '@/components/ui-overlays/ImmersiveOverlay';
import ScanlineOverlay from '@/components/effects/ScanlineOverlay';
import { useKeyboardControls } from '@/hooks/useKeyboardControls';

const NeuralScene = dynamic(
  () => import('@/components/three/NeuralScene'),
  { ssr: false }
);

// Lazy-load components that may not exist yet
const ControlBar = dynamic(
  () => import('@/components/ui-overlays/ControlBar').catch(() => () => null),
  { ssr: false }
);
const StatsSidebar = dynamic(
  () => import('@/components/ui-overlays/StatsSidebar').catch(() => () => null),
  { ssr: false }
);

export default function Home() {
  const isLoaded = useNetworkStore((s) => s.isLoaded);
  const [showLoading, setShowLoading] = useState(true);

  useKeyboardControls();

  useEffect(() => {
    if (!isLoaded) return;
    const timer = setTimeout(() => setShowLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [isLoaded]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        {showLoading && <LoadingScreen key="loading" />}
      </AnimatePresence>

      <NeuralScene />

      <AnimatePresence>
        {!showLoading && (
          <>
            <HudHeader key="hud" />
            <ControlBar key="controls" />
            <StatsSidebar key="stats" />
            <ImmersiveOverlay key="immersive" />
            <ScanlineOverlay key="scanline" />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
