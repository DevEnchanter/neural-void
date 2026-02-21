'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useNetworkStore } from '@/stores/networkStore';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

export default function ControlBar() {
  const immersiveMode = useNetworkStore((s) => s.immersiveMode);
  const pulseSpeed = useNetworkStore((s) => s.pulseSpeed);
  const density = useNetworkStore((s) => s.density);
  const colorTheme = useNetworkStore((s) => s.colorTheme);
  const setPulseSpeed = useNetworkStore((s) => s.setPulseSpeed);
  const setDensity = useNetworkStore((s) => s.setDensity);
  const setColorTheme = useNetworkStore((s) => s.setColorTheme);
  const toggleImmersiveMode = useNetworkStore((s) => s.toggleImmersiveMode);

  return (
    <AnimatePresence>
      {!immersiveMode && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
        >
          <div className="pointer-events-auto bg-black/70 backdrop-blur-md border-t border-cyan-500/20">
            <div className="flex flex-col md:flex-row items-center justify-evenly gap-4 md:gap-6 px-4 md:px-8 py-3 md:py-4">
              {/* Density slider */}
              <div className="flex items-center gap-3 min-w-0">
                <label className="font-mono text-xs tracking-wider text-cyan-400 whitespace-nowrap">
                  DENSITY
                </label>
                <Slider
                  value={[density]}
                  min={0.5}
                  max={1.5}
                  step={0.1}
                  onValueChange={([v]) => setDensity(v)}
                  className="w-24 md:w-32 [&_[data-slot=slider-track]]:bg-cyan-900/40 [&_[data-slot=slider-range]]:bg-cyan-400 [&_[data-slot=slider-thumb]]:border-cyan-400 [&_[data-slot=slider-thumb]]:bg-cyan-400 [&_[data-slot=slider-thumb]]:size-3"
                />
                <span className="font-mono text-[10px] text-cyan-400/60 w-8">
                  {density.toFixed(1)}
                </span>
              </div>

              {/* Pulse Speed slider */}
              <div className="flex items-center gap-3 min-w-0">
                <label className="font-mono text-xs tracking-wider text-cyan-400 whitespace-nowrap">
                  PULSE SPEED
                </label>
                <Slider
                  value={[pulseSpeed]}
                  min={0.5}
                  max={3}
                  step={0.1}
                  onValueChange={([v]) => setPulseSpeed(v)}
                  className="w-24 md:w-32 [&_[data-slot=slider-track]]:bg-cyan-900/40 [&_[data-slot=slider-range]]:bg-cyan-400 [&_[data-slot=slider-thumb]]:border-cyan-400 [&_[data-slot=slider-thumb]]:bg-cyan-400 [&_[data-slot=slider-thumb]]:size-3"
                />
                <span className="font-mono text-[10px] text-cyan-400/60 w-8">
                  {pulseSpeed.toFixed(1)}x
                </span>
              </div>

              {/* Color theme toggle */}
              <div className="flex items-center gap-2">
                <label className="font-mono text-xs tracking-wider text-cyan-400 whitespace-nowrap">
                  THEME
                </label>
                <div className="flex gap-1">
                  <Button
                    size="xs"
                    variant={colorTheme === 'cyan' ? 'default' : 'outline'}
                    onClick={() => setColorTheme('cyan')}
                    className={
                      colorTheme === 'cyan'
                        ? 'font-mono text-[10px] bg-cyan-500 text-black hover:bg-cyan-400 border-none rounded-sm'
                        : 'font-mono text-[10px] border-cyan-500/30 text-cyan-400/60 bg-transparent hover:bg-cyan-500/10 hover:text-cyan-400 rounded-sm'
                    }
                  >
                    CYAN
                  </Button>
                  <Button
                    size="xs"
                    variant={colorTheme === 'red' ? 'default' : 'outline'}
                    onClick={() => setColorTheme('red')}
                    className={
                      colorTheme === 'red'
                        ? 'font-mono text-[10px] bg-red-500 text-black hover:bg-red-400 border-none rounded-sm'
                        : 'font-mono text-[10px] border-red-500/30 text-red-400/60 bg-transparent hover:bg-red-500/10 hover:text-red-400 rounded-sm'
                    }
                  >
                    RED
                  </Button>
                </div>
              </div>

              {/* Enter the Void button */}
              <button
                onClick={toggleImmersiveMode}
                className="relative font-mono text-xs tracking-[0.2em] text-cyan-400 px-5 py-2 border border-cyan-400/60 bg-transparent hover:bg-cyan-400/10 transition-colors rounded-sm void-button-glow"
              >
                <span className="relative z-10" style={{ textShadow: '0 0 10px rgba(0,224,255,0.6)' }}>
                  ENTER THE VOID
                </span>
              </button>
            </div>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
