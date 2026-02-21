export interface Neuron {
  id: number;
  position: [number, number, number];
  layer: number;
  activation: number;
  connections: number[];
}

export interface Connection {
  from: number;
  to: number;
  strength: number;
}

export interface EnergyPulse {
  id: string;
  sourceNeuron: number;
  currentNeurons: number[];
  visitedNeurons: Set<number>;
  startTime: number;
  speed: number;
}

export interface NetworkState {
  neurons: Neuron[];
  connections: Connection[];
  hoveredNeuron: number | null;
  activeNeurons: Set<number>;
  energyLevel: number;
  pulseSpeed: number;
  density: number;
  immersiveMode: boolean;
  glitchActive: boolean;
  colorTheme: 'cyan' | 'red';
}
