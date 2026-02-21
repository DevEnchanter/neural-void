'use client';

import { useRef, useMemo, useCallback } from 'react';
import { useFrame, ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useNetworkStore } from '@/stores/networkStore';

const vertexShader = /* glsl */ `
  precision highp float;

  attribute float aActivation;
  attribute float aLayer;
  attribute float aInstanceId;

  uniform float uTime;
  uniform float uHoveredId;

  varying float vActivation;
  varying float vLayer;
  varying float vId;
  varying vec3 vNormal2;
  varying vec3 vViewPosition;

  void main() {
    vActivation = aActivation;
    vLayer = aLayer;
    vId = aInstanceId;

    float scale = 1.0 + aActivation * 0.5;
    float wobble = sin(uTime * 2.0 + aInstanceId * 0.5) * 0.02;

    float isHovered = step(abs(aInstanceId - uHoveredId), 0.5) * step(0.0, uHoveredId);
    scale += isHovered * 0.3;

    vec3 pos = position * scale + normal * wobble;

    vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
    vViewPosition = -mvPosition.xyz;
    vNormal2 = normalMatrix * mat3(instanceMatrix) * normal;

    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uHoveredId;
  uniform float uColorTheme;

  varying float vActivation;
  varying float vLayer;
  varying float vId;
  varying vec3 vNormal2;
  varying vec3 vViewPosition;

  void main() {
    vec3 n = normalize(vNormal2);
    vec3 viewDir = normalize(vViewPosition);
    float fresnel = pow(1.0 - abs(dot(n, viewDir)), 3.0);

    vec3 cyanBase = vec3(0.0, 0.9, 1.0);
    vec3 redBase = vec3(1.0, 0.15, 0.15);
    vec3 baseColor = mix(cyanBase, redBase, uColorTheme);

    vec3 dimColor = baseColor * 0.3;
    vec3 activeColor = baseColor * (1.5 + fresnel * 2.0);
    vec3 color = mix(dimColor, activeColor, vActivation);

    float isHovered = step(abs(vId - uHoveredId), 0.5) * step(0.0, uHoveredId);
    float hoverPulse = 0.5 + 0.5 * sin(uTime * 5.0);
    color += isHovered * baseColor * (0.8 + hoverPulse * 0.5);

    color += fresnel * baseColor * (0.2 + vActivation * 0.8);

    float alpha = 0.6 + vActivation * 0.4 + fresnel * 0.3 + isHovered * 0.2;
    gl_FragColor = vec4(color * alpha, alpha);
  }
`;

interface NeuronsProps {
  onNeuronClick?: (neuronId: number) => void;
}

export default function Neurons({ onNeuronClick }: NeuronsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const activationRef = useRef<Float32Array | null>(null);
  const layerRef = useRef<Float32Array | null>(null);
  const instanceIdRef = useRef<Float32Array | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const neurons = useNetworkStore((s) => s.neurons);
  const colorTheme = useNetworkStore((s) => s.colorTheme);
  const setHoveredNeuron = useNetworkStore((s) => s.setHoveredNeuron);

  const geometry = useMemo(() => new THREE.IcosahedronGeometry(0.15, 2), []);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uHoveredId: { value: -1 },
      uColorTheme: { value: 0 },
    }),
    [],
  );

  // Set up instance attributes and matrices when neurons change
  useMemo(() => {
    if (!neurons.length) return;

    const count = neurons.length;
    activationRef.current = new Float32Array(count);
    layerRef.current = new Float32Array(count);
    instanceIdRef.current = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      activationRef.current[i] = neurons[i].activation;
      layerRef.current[i] = neurons[i].layer;
      instanceIdRef.current[i] = i;
    }

    geometry.setAttribute(
      'aActivation',
      new THREE.InstancedBufferAttribute(activationRef.current, 1),
    );
    geometry.setAttribute(
      'aLayer',
      new THREE.InstancedBufferAttribute(layerRef.current, 1),
    );
    geometry.setAttribute(
      'aInstanceId',
      new THREE.InstancedBufferAttribute(instanceIdRef.current, 1),
    );
  }, [neurons, geometry]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh || !neurons.length) return;

    // Update uniforms (cheap)
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime;
      materialRef.current.uniforms.uColorTheme.value = colorTheme === 'red' ? 1 : 0;

      const hovered = useNetworkStore.getState().hoveredNeuron;
      materialRef.current.uniforms.uHoveredId.value = hovered !== null ? hovered : -1;
    }

    // Update instance matrices
    const storeNeurons = useNetworkStore.getState().neurons;
    for (let i = 0; i < storeNeurons.length; i++) {
      const n = storeNeurons[i];
      dummy.position.set(n.position[0], n.position[1], n.position[2]);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);

      // Update activation attribute
      if (activationRef.current) {
        activationRef.current[i] = n.activation;
      }
    }

    mesh.instanceMatrix.needsUpdate = true;
    const activationAttr = mesh.geometry.getAttribute('aActivation') as THREE.InstancedBufferAttribute;
    if (activationAttr) activationAttr.needsUpdate = true;
  });

  const handlePointerOver = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      if (e.instanceId !== undefined) {
        setHoveredNeuron(e.instanceId);
      }
    },
    [setHoveredNeuron],
  );

  const handlePointerOut = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      setHoveredNeuron(null);
    },
    [setHoveredNeuron],
  );

  const handleClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      if (e.instanceId !== undefined) {
        if (onNeuronClick) {
          onNeuronClick(e.instanceId);
        }
      }
    },
    [onNeuronClick],
  );

  if (!neurons.length) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, undefined, neurons.length]}
      frustumCulled={false}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      onClick={handleClick}
    >
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </instancedMesh>
  );
}
