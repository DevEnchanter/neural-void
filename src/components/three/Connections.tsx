'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useNetworkStore } from '@/stores/networkStore';

const vertexShader = /* glsl */ `
  precision highp float;

  attribute float aConnectionIndex;
  attribute float aEndpoint;

  uniform float uTime;

  varying float vConnectionIndex;
  varying float vEndpoint;

  void main() {
    vConnectionIndex = aConnectionIndex;
    vEndpoint = aEndpoint;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uColorTheme;
  uniform float uActiveConnections[200];
  uniform int uActiveCount;

  varying float vConnectionIndex;
  varying float vEndpoint;

  void main() {
    vec3 cyanBase = vec3(0.0, 0.9, 1.0);
    vec3 redBase = vec3(1.0, 0.15, 0.15);
    vec3 baseColor = mix(cyanBase, redBase, uColorTheme);

    float active = 0.0;
    for (int i = 0; i < 200; i++) {
      if (i >= uActiveCount) break;
      if (abs(uActiveConnections[i] - vConnectionIndex) < 0.5) {
        active = 1.0;
        break;
      }
    }

    float pulse = 0.5 + 0.5 * sin(uTime * 4.0 - vEndpoint * 3.14159);
    float activeAlpha = active * smoothstep(0.0, 0.5, pulse) * 0.6;

    float baseAlpha = 0.08;
    float alpha = baseAlpha + activeAlpha;
    vec3 color = baseColor * (0.3 + active * pulse * 1.5);

    gl_FragColor = vec4(color * alpha, alpha);
  }
`;

export default function Connections() {
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const neurons = useNetworkStore((s) => s.neurons);
  const connections = useNetworkStore((s) => s.connections);
  const colorTheme = useNetworkStore((s) => s.colorTheme);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorTheme: { value: 0 },
      uActiveConnections: { value: new Float32Array(200) },
      uActiveCount: { value: 0 },
    }),
    [],
  );

  // Build buffers when connections change
  const { positions, connectionIndices, endpoints } = useMemo(() => {
    if (!connections.length || !neurons.length) {
      return { positions: new Float32Array(0), connectionIndices: new Float32Array(0), endpoints: new Float32Array(0) };
    }

    const posArr = new Float32Array(connections.length * 6);
    const idxArr = new Float32Array(connections.length * 2);
    const endArr = new Float32Array(connections.length * 2);

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

      idxArr[i * 2] = i;
      idxArr[i * 2 + 1] = i;

      endArr[i * 2] = 0;
      endArr[i * 2 + 1] = 1;
    }

    return { positions: posArr, connectionIndices: idxArr, endpoints: endArr };
  }, [connections, neurons]);

  useFrame(({ clock }) => {
    if (!materialRef.current) return;

    materialRef.current.uniforms.uTime.value = clock.elapsedTime;
    materialRef.current.uniforms.uColorTheme.value = colorTheme === 'red' ? 1 : 0;

    // Find active connections (connections touching active neurons)
    const state = useNetworkStore.getState();
    const activeSet = state.activeNeurons;
    const activeArr = materialRef.current.uniforms.uActiveConnections.value as Float32Array;
    let count = 0;

    if (activeSet.size > 0) {
      for (let i = 0; i < state.connections.length && count < 200; i++) {
        const c = state.connections[i];
        if (activeSet.has(c.from) || activeSet.has(c.to)) {
          activeArr[count++] = i;
        }
      }
    }

    materialRef.current.uniforms.uActiveCount.value = count;
  });

  if (!positions.length) return null;

  return (
    <lineSegments frustumCulled={false}>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-aConnectionIndex"
          args={[connectionIndices, 1]}
        />
        <bufferAttribute
          attach="attributes-aEndpoint"
          args={[endpoints, 1]}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
}
