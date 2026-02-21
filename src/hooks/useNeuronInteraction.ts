'use client';

import { useCallback, useRef } from 'react';
import * as THREE from 'three';
import { useNetworkStore } from '@/stores/networkStore';

interface UseNeuronInteractionOptions {
  meshRef: React.RefObject<THREE.InstancedMesh | null>;
  camera: THREE.Camera;
  neurons: { position: [number, number, number] }[];
  propagateEnergy: (neuronId: number) => void;
}

export function useNeuronInteraction({
  meshRef,
  camera,
  neurons,
  propagateEnergy,
}: UseNeuronInteractionOptions) {
  const raycaster = useRef(new THREE.Raycaster());
  const pointer = useRef(new THREE.Vector2());
  const lastRaycastTime = useRef(0);
  const throttleMs = 50;

  const handlePointerMove = useCallback(
    (event: PointerEvent | { clientX: number; clientY: number }) => {
      const now = performance.now();
      if (now - lastRaycastTime.current < throttleMs) return;
      lastRaycastTime.current = now;

      const mesh = meshRef.current;
      if (!mesh || !camera) return;

      // Convert to NDC
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.current.setFromCamera(pointer.current, camera);
      const intersects = raycaster.current.intersectObject(mesh);

      if (intersects.length > 0 && intersects[0].instanceId !== undefined) {
        const instanceId = intersects[0].instanceId;
        useNetworkStore.getState().setHoveredNeuron(instanceId);

        // Update cursor position from intersection point
        const point = intersects[0].point;
        useNetworkStore.getState().setCursorPosition([point.x, point.y, point.z]);
      } else {
        useNetworkStore.getState().setHoveredNeuron(null);

        // Project cursor position along ray direction
        const dir = raycaster.current.ray.direction;
        const origin = raycaster.current.ray.origin;
        const dist = 10;
        useNetworkStore.getState().setCursorPosition([
          origin.x + dir.x * dist,
          origin.y + dir.y * dist,
          origin.z + dir.z * dist,
        ]);
      }
    },
    [meshRef, camera]
  );

  const handleClick = useCallback(() => {
    const hovered = useNetworkStore.getState().hoveredNeuron;
    if (hovered !== null) {
      propagateEnergy(hovered);
    }
  }, [propagateEnergy]);

  return { handlePointerMove, handleClick };
}
