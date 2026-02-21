'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';
import { useNetworkStore } from '@/stores/networkStore';
import LoadingScreen from '@/components/LoadingScreen';
import HudHeader from '@/components/ui-overlays/HudHeader';
import ControlBar from '@/components/ui-overlays/ControlBar';
import StatsSidebar from '@/components/ui-overlays/StatsSidebar';
import ImmersiveOverlay from '@/components/ui-overlays/ImmersiveOverlay';
import ScanlineOverlay from '@/components/effects/ScanlineOverlay';
import { useKeyboardControls } from '@/hooks/useKeyboardControls';

const NeuralScene = dynamic(
  () => import('@/components/three/NeuralScene'),
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

      {!showLoading && (
        <>
          <HudHeader />
          <ControlBar />
          <StatsSidebar />
          <ImmersiveOverlay />
          <ScanlineOverlay />
        </>
      )}
    </div>
  );
}
