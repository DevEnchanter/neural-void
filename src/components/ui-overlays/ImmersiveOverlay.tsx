'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNetworkStore } from '@/stores/networkStore';

export default function ImmersiveOverlay() {
  const immersiveMode = useNetworkStore((s) => s.immersiveMode);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!immersiveMode) {
      setVisible(false);
      return;
    }

    const showTimer = setTimeout(() => setVisible(true), 3000);
    const hideTimer = setTimeout(() => setVisible(false), 8000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [immersiveMode]);

  return (
    <AnimatePresence>
      {immersiveMode && visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 pointer-events-none select-none"
        >
          <span className="font-mono text-xs tracking-[0.3em] text-white/15">
            ESC TO EXIT
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
