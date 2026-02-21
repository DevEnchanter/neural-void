'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNetworkStore } from '@/stores/networkStore';

function AnimatedNumber({ value, decimals = 1 }: { value: number; decimals?: number }) {
  return <span>{value.toFixed(decimals)}</span>;
}

function AsciiBar({ value, max = 1, width = 10 }: { value: number; max?: number; width?: number }) {
  const filled = Math.round((value / max) * width);
  const empty = width - filled;
  return (
    <span className="text-cyan-400">
      [<span className="text-cyan-300">{'█'.repeat(filled)}</span>
      <span className="text-cyan-900">{'░'.repeat(empty)}</span>]
    </span>
  );
}

export function StatsSidebar() {
  const immersiveMode = useNetworkStore((s) => s.immersiveMode);
  const neurons = useNetworkStore((s) => s.neurons);
  const activeNeurons = useNetworkStore((s) => s.activeNeurons);
  const energyLevel = useNetworkStore((s) => s.energyLevel);
  const cursorPosition = useNetworkStore((s) => s.cursorPosition);
  const pulseSpeed = useNetworkStore((s) => s.pulseSpeed);
  const density = useNetworkStore((s) => s.density);
  const colorTheme = useNetworkStore((s) => s.colorTheme);

  const activeCount = useMemo(() => activeNeurons.size, [activeNeurons]);
  const totalCount = neurons.length;
  const energyPercent = Math.round(energyLevel * 100);

  return (
    <AnimatePresence>
      {!immersiveMode && (
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 20, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
          className="fixed top-4 right-4 z-50 pointer-events-none select-none md:top-6 md:right-6"
        >
          <div className="bg-black/60 backdrop-blur-md border border-cyan-500/20 rounded-sm p-3 md:p-4 min-w-[200px]">
            {/* Header */}
            <div className="font-mono text-[9px] tracking-[0.3em] text-cyan-500/40 mb-3 border-b border-cyan-500/10 pb-2">
              SYS.READOUT
            </div>

            <div className="space-y-2 font-mono text-xs">
              {/* Active nodes */}
              <div>
                <span className="text-cyan-500/50">ACTIVE NODES: </span>
                <span className="text-cyan-400">
                  <AnimatedNumber value={activeCount} decimals={0} />/{totalCount}
                </span>
              </div>

              {/* Energy level */}
              <div>
                <span className="text-cyan-500/50">ENERGY LEVEL: </span>
                <AsciiBar value={energyLevel} />
                <span className="text-cyan-400 ml-1">{energyPercent}%</span>
              </div>

              {/* Cursor position */}
              <div>
                <span className="text-cyan-500/50">CURSOR: </span>
                <span className="text-cyan-400">
                  X:<AnimatedNumber value={cursorPosition[0]} />{' '}
                  Y:<AnimatedNumber value={cursorPosition[1]} />{' '}
                  Z:<AnimatedNumber value={cursorPosition[2]} />
                </span>
              </div>

              {/* Pulse speed */}
              <div>
                <span className="text-cyan-500/50">PULSE SPEED: </span>
                <span className="text-cyan-400">
                  <AnimatedNumber value={pulseSpeed} />x
                </span>
              </div>

              {/* Network density */}
              <div>
                <span className="text-cyan-500/50">NETWORK DENSITY: </span>
                <span className="text-cyan-400">
                  <AnimatedNumber value={density} />
                </span>
              </div>

              {/* Theme */}
              <div>
                <span className="text-cyan-500/50">THEME: </span>
                <span className={colorTheme === 'cyan' ? 'text-cyan-400' : 'text-red-500'}>
                  {colorTheme.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Bottom decorative line */}
            <motion.div
              className="mt-3 h-px bg-cyan-500/20"
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
