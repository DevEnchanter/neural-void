import { Neuron, Connection } from '@/types/neural';

const LAYER_CONFIG = [
  { count: 60, radius: 8, spread: 1.5 },   // Layer 0: outer
  { count: 50, radius: 5.5, spread: 1.2 },  // Layer 1
  { count: 40, radius: 3.5, spread: 1.0 },  // Layer 2
  { count: 30, radius: 1.8, spread: 0.7 },  // Layer 3: inner core
];

function randomSpherePoint(radius: number, spread: number): [number, number, number] {
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  const r = radius + (Math.random() - 0.5) * spread * 2;

  return [
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi),
  ];
}

function distance(a: [number, number, number], b: [number, number, number]): number {
  return Math.sqrt(
    (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2
  );
}

export function generateNetwork(densityMultiplier: number = 1): {
  neurons: Neuron[];
  connections: Connection[];
} {
  const neurons: Neuron[] = [];
  let id = 0;

  // Generate neurons in layers
  for (let layerIdx = 0; layerIdx < LAYER_CONFIG.length; layerIdx++) {
    const config = LAYER_CONFIG[layerIdx];
    const count = Math.round(config.count * densityMultiplier);

    for (let i = 0; i < count; i++) {
      neurons.push({
        id: id++,
        position: randomSpherePoint(config.radius, config.spread),
        layer: layerIdx,
        activation: Math.random() * 0.3,
        connections: [],
      });
    }
  }

  // Generate connections based on proximity + layer adjacency
  const connections: Connection[] = [];
  const maxDist = 4.5;
  const maxConnectionsPerNeuron = 6;

  for (let i = 0; i < neurons.length; i++) {
    const candidates: { idx: number; dist: number }[] = [];

    for (let j = i + 1; j < neurons.length; j++) {
      const d = distance(neurons[i].position, neurons[j].position);
      const layerDiff = Math.abs(neurons[i].layer - neurons[j].layer);

      // Connect within same layer or adjacent layers
      if (d < maxDist && layerDiff <= 1) {
        candidates.push({ idx: j, dist: d });
      }
    }

    // Sort by distance, take closest
    candidates.sort((a, b) => a.dist - b.dist);
    const limit = Math.min(
      maxConnectionsPerNeuron - neurons[i].connections.length,
      candidates.length
    );

    for (let k = 0; k < limit; k++) {
      const j = candidates[k].idx;
      if (neurons[j].connections.length >= maxConnectionsPerNeuron) continue;

      neurons[i].connections.push(j);
      neurons[j].connections.push(i);

      connections.push({
        from: i,
        to: j,
        strength: 1 - candidates[k].dist / maxDist,
      });
    }
  }

  return { neurons, connections };
}
