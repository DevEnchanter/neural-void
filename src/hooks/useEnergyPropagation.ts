'use client';

import { useRef, useCallback, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useNetworkStore } from '@/stores/networkStore';

interface PulseInfo {
  progress: number;
  startTime: number;
}

export function useEnergyPropagation() {
  const activeConnectionsRef = useRef<Set<string>>(new Set());
  const pulseDataRef = useRef<Map<string, PulseInfo>>(new Map());
  const pendingTimers = useRef<number[]>([]);
  const lastDecayTime = useRef(performance.now());
  const isPropagating = useRef(false);

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      pendingTimers.current.forEach((t) => clearTimeout(t));
      pendingTimers.current = [];
    };
  }, []);

  const propagateEnergy = useCallback((neuronId: number) => {
    const store = useNetworkStore.getState();
    const { neurons, pulseSpeed } = store;
    if (!neurons.length) return;

    isPropagating.current = true;
    const stepDelay = pulseSpeed * 300;
    const fadeDuration = 500;

    // BFS setup
    const visited = new Set<number>();
    let currentWave = [neuronId];
    visited.add(neuronId);

    const processWave = (wave: number[], waveIndex: number) => {
      const delay = waveIndex * stepDelay;

      const timerId = window.setTimeout(() => {
        const now = performance.now();
        const nextWave: number[] = [];

        for (const nId of wave) {
          // Activate neuron
          useNetworkStore.getState().activateNeuron(nId);

          // Mark connections as active and store pulse data
          const neuron = neurons[nId];
          if (neuron) {
            for (const connIdx of neuron.connections) {
              const key = nId < connIdx ? `${nId}-${connIdx}` : `${connIdx}-${nId}`;
              activeConnectionsRef.current.add(key);
              pulseDataRef.current.set(key, {
                progress: 0,
                startTime: now,
              });

              if (!visited.has(connIdx)) {
                visited.add(connIdx);
                nextWave.push(connIdx);
              }
            }
          }

          // Schedule fade-out for this neuron
          const fadeTimer = window.setTimeout(() => {
            useNetworkStore.getState().deactivateNeuron(nId);
          }, fadeDuration);
          pendingTimers.current.push(fadeTimer);
        }

        // Schedule connection cleanup
        const connCleanTimer = window.setTimeout(() => {
          for (const nId of wave) {
            const neuron = neurons[nId];
            if (neuron) {
              for (const connIdx of neuron.connections) {
                const key = nId < connIdx ? `${nId}-${connIdx}` : `${connIdx}-${nId}`;
                activeConnectionsRef.current.delete(key);
                pulseDataRef.current.delete(key);
              }
            }
          }
        }, fadeDuration + 100);
        pendingTimers.current.push(connCleanTimer);

        // Continue BFS to next wave
        if (nextWave.length > 0 && waveIndex < 4) {
          processWave(nextWave, waveIndex + 1);
        } else if (waveIndex >= 4 || nextWave.length === 0) {
          // Mark propagation complete after last wave fades
          const doneTimer = window.setTimeout(() => {
            isPropagating.current = false;
          }, fadeDuration + 200);
          pendingTimers.current.push(doneTimer);
        }
      }, delay);

      pendingTimers.current.push(timerId);
    };

    processWave(currentWave, 0);
  }, []);

  // Per-frame updates: pulse progress + energy decay
  useFrame(() => {
    const now = performance.now();

    // Update pulse progress for active connections
    pulseDataRef.current.forEach((info, key) => {
      const elapsed = now - info.startTime;
      info.progress = Math.min(1, elapsed / 500);
    });

    // Energy decay when idle
    if (!isPropagating.current) {
      const dt = (now - lastDecayTime.current) / 1000;
      if (dt > 0.05) {
        const currentEnergy = useNetworkStore.getState().energyLevel;
        if (currentEnergy > 0) {
          useNetworkStore.getState().setEnergyLevel(currentEnergy - 0.01 * dt);
        }
        lastDecayTime.current = now;
      }
    } else {
      lastDecayTime.current = now;
    }
  });

  return {
    propagateEnergy,
    activeConnectionsRef,
    pulseDataRef,
  };
}
