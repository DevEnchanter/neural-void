import { create } from 'zustand';
import { Neuron, Connection } from '@/types/neural';
import { generateNetwork } from '@/lib/generateNetwork';

interface NetworkStore {
  neurons: Neuron[];
  connections: Connection[];
  hoveredNeuron: number | null;
  activeNeurons: Set<number>;
  energyLevel: number;
  pulseSpeed: number;
  density: number;
  immersiveMode: boolean;
  glitchActive: boolean;
  glitchIntensity: number;
  colorTheme: 'cyan' | 'red';
  isLoaded: boolean;
  cursorPosition: [number, number, number];

  // Actions
  initialize: () => void;
  setHoveredNeuron: (id: number | null) => void;
  activateNeuron: (id: number) => void;
  deactivateNeuron: (id: number) => void;
  setEnergyLevel: (level: number) => void;
  setPulseSpeed: (speed: number) => void;
  setDensity: (density: number) => void;
  toggleImmersiveMode: () => void;
  triggerGlitch: () => void;
  setColorTheme: (theme: 'cyan' | 'red') => void;
  setLoaded: (loaded: boolean) => void;
  setCursorPosition: (pos: [number, number, number]) => void;
}

export const useNetworkStore = create<NetworkStore>((set, get) => ({
  neurons: [],
  connections: [],
  hoveredNeuron: null,
  activeNeurons: new Set(),
  energyLevel: 0,
  pulseSpeed: 1,
  density: 1,
  immersiveMode: false,
  glitchActive: false,
  glitchIntensity: 0,
  colorTheme: 'cyan',
  isLoaded: false,
  cursorPosition: [0, 0, 0],

  initialize: () => {
    const { neurons, connections } = generateNetwork(get().density);
    set({ neurons, connections, isLoaded: true });
  },

  setHoveredNeuron: (id) => set({ hoveredNeuron: id }),

  activateNeuron: (id) => {
    const activeNeurons = new Set(get().activeNeurons);
    activeNeurons.add(id);
    const neurons = [...get().neurons];
    const neuron = neurons.find((n) => n.id === id);
    if (neuron) neuron.activation = 1;
    set({ activeNeurons, neurons, energyLevel: Math.min(1, get().energyLevel + 0.05) });
  },

  deactivateNeuron: (id) => {
    const activeNeurons = new Set(get().activeNeurons);
    activeNeurons.delete(id);
    const neurons = [...get().neurons];
    const neuron = neurons.find((n) => n.id === id);
    if (neuron) neuron.activation = Math.random() * 0.3;
    set({ activeNeurons, neurons });
  },

  setEnergyLevel: (level) => set({ energyLevel: Math.max(0, Math.min(1, level)) }),
  setPulseSpeed: (speed) => set({ pulseSpeed: speed }),
  setDensity: (density) => set({ density }),

  toggleImmersiveMode: () => set({ immersiveMode: !get().immersiveMode }),

  triggerGlitch: () => {
    set({ glitchActive: true, glitchIntensity: 1 });
    setTimeout(() => set({ glitchActive: false, glitchIntensity: 0 }), 1500);
  },

  setColorTheme: (theme) => set({ colorTheme: theme }),
  setLoaded: (loaded) => set({ isLoaded: loaded }),
  setCursorPosition: (pos) => set({ cursorPosition: pos }),
}));
