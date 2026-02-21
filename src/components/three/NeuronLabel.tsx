'use client';

import { useMemo } from 'react';
import { Html } from '@react-three/drei';
import { useNetworkStore } from '@/stores/networkStore';

const labelStyle: React.CSSProperties = {
  fontFamily: '"JetBrains Mono", "Fira Code", monospace',
  fontSize: '11px',
  color: '#00e5ff',
  background: 'rgba(0, 0, 0, 0.85)',
  border: '1px solid rgba(0, 229, 255, 0.4)',
  padding: '6px 10px',
  whiteSpace: 'nowrap',
  pointerEvents: 'none',
  userSelect: 'none',
  animation: 'neuron-label-glitch 0.3s ease-out',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  backdropFilter: 'blur(4px)',
};

const glitchKeyframes = `
@keyframes neuron-label-glitch {
  0% { opacity: 0; transform: translate(2px, -2px) skewX(5deg); clip-path: inset(40% 0 20% 0); }
  20% { opacity: 1; transform: translate(-1px, 1px) skewX(-3deg); clip-path: inset(10% 0 60% 0); }
  40% { transform: translate(1px, 0px) skewX(2deg); clip-path: inset(0 0 0 0); }
  60% { transform: translate(-1px, 1px) skewX(0deg); }
  100% { opacity: 1; transform: translate(0, 0) skewX(0deg); }
}
`;

export default function NeuronLabel() {
  const hoveredNeuron = useNetworkStore((s) => s.hoveredNeuron);
  const neurons = useNetworkStore((s) => s.neurons);

  const neuron = useMemo(() => {
    if (hoveredNeuron === null || !neurons.length) return null;
    return neurons[hoveredNeuron] ?? null;
  }, [hoveredNeuron, neurons]);

  if (!neuron) return null;

  return (
    <Html
      position={[neuron.position[0], neuron.position[1] + 0.4, neuron.position[2]]}
      center
      zIndexRange={[100, 0]}
      style={{ pointerEvents: 'none' }}
    >
      <style>{glitchKeyframes}</style>
      <div key={neuron.id} style={labelStyle}>
        NEURON {neuron.id} &mdash; ACTIVATION {neuron.activation.toFixed(2)}
      </div>
    </Html>
  );
}
