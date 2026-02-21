'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { TypingText } from './TypingText';

export default function HudHeader() {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="fixed top-4 left-4 z-50 pointer-events-none select-none md:top-6 md:left-6"
    >
      {/* Title row */}
      <div className="flex items-center gap-3">
        <h1
          className="font-mono text-lg font-bold tracking-widest text-cyan-400"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
          }}
        >
          NEURAL VOID
        </h1>
        <Badge
          variant="outline"
          className="font-mono text-[10px] border-cyan-500/40 text-cyan-500/70 bg-transparent rounded-sm px-1.5 py-0"
        >
          v0.8.4
        </Badge>
      </div>

      {/* Subtitle */}
      <div className="mt-1 font-mono text-[10px] tracking-[0.25em] text-cyan-500/30">
        <TypingText text="DEEP SYNAPSE PROTOCOL" speed={40} className="text-cyan-500/30" />
      </div>

      {/* Pulsing line */}
      <motion.div
        className="mt-2 h-px w-32 bg-cyan-400"
        animate={{ opacity: [0.2, 0.8, 0.2] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Live indicator */}
      <div className="mt-2 flex items-center gap-2">
        <motion.div
          className="h-1.5 w-1.5 rounded-full bg-cyan-400"
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <span className="font-mono text-[9px] tracking-widest text-cyan-400/60">LIVE</span>
      </div>
    </motion.div>
  );
}
