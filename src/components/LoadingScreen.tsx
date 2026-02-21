'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNetworkStore } from '@/stores/networkStore';

const LOADING_TEXT = 'INITIALIZING NEURAL VOID...';
const CHAR_DELAY = 50;

const nodes = [
  { cx: 100, cy: 60 },
  { cx: 60, cy: 100 },
  { cx: 140, cy: 100 },
  { cx: 40, cy: 150 },
  { cx: 100, cy: 140 },
  { cx: 160, cy: 150 },
  { cx: 100, cy: 190 },
];

const edges = [
  [0, 1], [0, 2], [0, 4],
  [1, 3], [1, 4],
  [2, 4], [2, 5],
  [3, 6], [4, 6], [5, 6],
];

export default function LoadingScreen() {
  const [typedText, setTypedText] = useState('');
  const [progress, setProgress] = useState(0);
  const isLoaded = useNetworkStore((s) => s.isLoaded);

  // Typing effect
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTypedText(LOADING_TEXT.slice(0, i));
      if (i >= LOADING_TEXT.length) clearInterval(interval);
    }, CHAR_DELAY);
    return () => clearInterval(interval);
  }, []);

  // Progress bar
  useEffect(() => {
    const start = Date.now();
    const duration = 3000;
    const tick = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(1, elapsed / duration);
      setProgress(p);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  return (
    <motion.div
      key="loading-screen"
      initial={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black"
    >
      {/* Neural connection SVG */}
      <svg
        width={200}
        height={250}
        viewBox="0 0 200 250"
        className="mb-8"
      >
        {/* Edges */}
        {edges.map(([a, b], i) => {
          const from = nodes[a];
          const to = nodes[b];
          const length = Math.hypot(to.cx - from.cx, to.cy - from.cy);
          return (
            <line
              key={`edge-${i}`}
              x1={from.cx}
              y1={from.cy}
              x2={to.cx}
              y2={to.cy}
              stroke="#00E0FF"
              strokeWidth={1}
              strokeOpacity={0.4}
              strokeDasharray={length}
              strokeDashoffset={length}
              style={{
                animation: `drawLine 0.6s ease forwards ${i * 0.15}s`,
              }}
            />
          );
        })}
        {/* Nodes */}
        {nodes.map((node, i) => (
          <circle
            key={`node-${i}`}
            cx={node.cx}
            cy={node.cy}
            r={4}
            fill="#00E0FF"
            opacity={0}
            style={{
              animation: `nodeAppear 0.4s ease forwards ${i * 0.12}s`,
              filter: 'drop-shadow(0 0 6px rgba(0, 224, 255, 0.8))',
            }}
          />
        ))}

        <style>{`
          @keyframes drawLine {
            to { stroke-dashoffset: 0; }
          }
          @keyframes nodeAppear {
            0% { opacity: 0; r: 0; }
            60% { opacity: 1; r: 5; }
            100% { opacity: 1; r: 4; }
          }
          @keyframes nodePulse {
            0%, 100% { filter: drop-shadow(0 0 4px rgba(0, 224, 255, 0.5)); }
            50% { filter: drop-shadow(0 0 10px rgba(0, 224, 255, 1)); }
          }
        `}</style>
      </svg>

      {/* Typing text */}
      <div className="mb-6 font-mono text-sm tracking-[0.2em] text-[#00E0FF]">
        <span className="text-glow-cyan">{typedText}</span>
        <span className="typing-cursor">_</span>
      </div>

      {/* Progress bar */}
      <div className="relative h-[2px] w-[200px] overflow-hidden bg-[#00E0FF15] rounded-full">
        <motion.div
          className="absolute inset-y-0 left-0 bg-[#00E0FF] rounded-full"
          style={{
            width: `${progress * 100}%`,
            boxShadow: '0 0 8px rgba(0, 224, 255, 0.6), 0 0 16px rgba(0, 224, 255, 0.3)',
          }}
        />
      </div>

      {/* Subtle version text */}
      <div className="absolute bottom-8 font-mono text-[10px] tracking-widest text-[#00E0FF33]">
        v1.0.0 // NEURAL VOID
      </div>
    </motion.div>
  );
}
