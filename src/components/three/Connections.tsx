'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useNetworkStore } from '@/stores/networkStore';

export default function Connections() {
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const materialRef = useRef<THREE.LineBasicMaterial>(null);
  const colorsRef = useRef<Float32Array | null>(null);

  const neurons = useNetworkStore((s) => s.neurons);
  const connections = useNetworkStore((s) => s.connections);
  const colorTheme = useNetworkStore((s) => s.colorTheme);

  // Build position buffer when connections change
  const positions = useMemo(() => {
    if (!connections.length || !neurons.length) return new Float32Array(0);

    const posArr = new Float32Array(connections.length * 6);
    for (let i = 0; i < connections.length; i++) {
      const conn = connections[i];
      const fromN = neurons[conn.from];
      const toN = neurons[conn.to];
      if (!fromN || !toN) continue;

      const offset = i * 6;
      posArr[offset] = fromN.position[0];
      posArr[offset + 1] = fromN.position[1];
      posArr[offset + 2] = fromN.position[2];
      posArr[offset + 3] = toN.position[0];
      posArr[offset + 4] = toN.position[1];
      posArr[offset + 5] = toN.position[2];
    }
    return posArr;
  }, [connections, neurons]);

  // Initialize color buffer
  useMemo(() => {
    if (!connections.length) return;
    colorsRef.current = new Float32Array(connections.length * 6); // 2 vertices * 3 color components
  }, [connections]);

  useFrame(({ clock }) => {
    if (!colorsRef.current || !connections.length) return;

    const state = useNetworkStore.getState();
    const activeSet = state.activeNeurons;
    const time = clock.elapsedTime;
    const isRed = state.colorTheme === 'red';

    // Base color
    const br = isRed ? 1.0 : 0.0;
    const bg = isRed ? 0.05 : 0.3;
    const bb = isRed ? 0.05 : 0.4;

    // Active color
    const ar = isRed ? 1.0 : 0.0;
    const ag = isRed ? 0.15 : 0.9;
    const ab = isRed ? 0.15 : 1.0;

    for (let i = 0; i < state.connections.length; i++) {
      const c = state.connections[i];
      const isActive = activeSet.has(c.from) || activeSet.has(c.to);
      const pulse = isActive ? 0.5 + 0.5 * Math.sin(time * 4.0) : 0;
      const intensity = isActive ? 0.3 + pulse * 0.7 : 0.08;

      const offset = i * 6;
      const r = isActive ? ar * intensity : br * intensity;
      const g = isActive ? ag * intensity : bg * intensity;
      const b = isActive ? ab * intensity : bb * intensity;

      colorsRef.current[offset] = r;
      colorsRef.current[offset + 1] = g;
      colorsRef.current[offset + 2] = b;
      colorsRef.current[offset + 3] = r;
      colorsRef.current[offset + 4] = g;
      colorsRef.current[offset + 5] = b;
    }

    if (geometryRef.current) {
      const colorAttr = geometryRef.current.getAttribute('color') as THREE.BufferAttribute;
      if (colorAttr) colorAttr.needsUpdate = true;
    }
  });

  if (!positions.length || !colorsRef.current) return null;

  return (
    <lineSegments frustumCulled={false}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colorsRef.current, 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial
        ref={materialRef}
        vertexColors
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
}
