'use client';

import { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useNetworkStore } from '@/stores/networkStore';
import Neurons from './Neurons';
import Connections from './Connections';
import NeuronLabel from './NeuronLabel';
import PostProcessing from '../effects/PostProcessing';

function SceneContent() {
  const controlsRef = useRef<React.ComponentRef<typeof OrbitControls>>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isIdle = useRef(true);

  const handleInteractionStart = () => {
    isIdle.current = false;
    if (controlsRef.current) {
      (controlsRef.current as unknown as { autoRotate: boolean }).autoRotate = false;
    }
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      isIdle.current = true;
      if (controlsRef.current) {
        (controlsRef.current as unknown as { autoRotate: boolean }).autoRotate = true;
      }
    }, 3000);
  };

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={60} />
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        autoRotate
        autoRotateSpeed={0.3}
        maxDistance={30}
        minDistance={5}
        onStart={handleInteractionStart}
      />
      <ambientLight intensity={0.1} />
      <pointLight position={[10, 10, 10]} color="#00e5ff" intensity={1.5} />
      <pointLight position={[-10, -5, -10]} color="#ff2020" intensity={1.0} />
      <fog attach="fog" args={['#000000', 15, 35]} />
      <Connections />
      <Neurons />
      <NeuronLabel />
      <PostProcessing />
    </>
  );
}

export default function NeuralScene() {
  const initialize = useNetworkStore((s) => s.initialize);
  const isLoaded = useNetworkStore((s) => s.isLoaded);

  useEffect(() => {
    if (!isLoaded) {
      initialize();
    }
  }, [initialize, isLoaded]);

  return (
    <Canvas
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        toneMapping: THREE.NoToneMapping,
      }}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      onCreated={({ gl }) => {
        gl.setClearColor('#000000');
      }}
    >
      <SceneContent />
    </Canvas>
  );
}
