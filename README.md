# **NEURAL VOID**

### Interactive 3D Neural Network Visualization

---

> _Step into a living cyber-noir AI brain. Observe. Interact. Propagate._

---

## Overview

**Neural Void** is an immersive, real-time 3D neural network explorer rendered entirely in the browser. Built on a foundation of custom GLSL shaders, instanced geometry, and a reactive state architecture, it presents a dark, bioluminescent network of neurons and synaptic connections suspended in void space.

Users can click individual neurons to trigger energy propagation waves that ripple outward through the network via breadth-first traversal. The interface supports dual color themes (Cyan and Red), an immersive mode that strips the HUD and intensifies post-processing, and keyboard-triggered glitch effects. A cinematic loading sequence with animated SVG neural graphs sets the tone before the scene is revealed.

Every visual element -- from the fresnel rim glow on each neuron to the gaussian pulse traveling along connections -- is driven by hand-written GLSL running on the GPU.

---

## Features

| Feature | Description |
|---|---|
| **Instanced 3D Neural Network** | Hundreds of neurons rendered as instanced icosahedron meshes with per-instance activation attributes, connected by dynamically colored line segments |
| **Energy Propagation System** | Click any neuron to fire a BFS wave that activates connected nodes outward through the network graph |
| **Dual Color Themes** | Toggle between Cyan (cold, clinical) and Red (alert, hostile) palettes -- applied across shaders, HUD, and post-processing |
| **Immersive Mode** | Strip the UI overlay, boost bloom intensity to 3.5, and widen chromatic aberration for a pure visual experience |
| **Custom GLSL Shaders** | Three hand-written shader programs: neuron vertex/fragment, connection fragment, and glitch post-processing |
| **HUD Overlay with Live Stats** | Real-time ASCII bar readouts for energy level, active node count, cursor coordinates, pulse speed, and network density |
| **Cinematic Loading Screen** | Animated SVG neural graph with sequential edge drawing and node appearance, typing text effect, and glowing progress bar |
| **Scanline and Film Grain** | CRT-style scanline scrolling and fractal noise grain overlays composited above the 3D scene |
| **Keyboard Controls** | `G` triggers glitch, `V` toggles immersive mode, `Escape` exits immersive mode |
| **Auto-Rotate with Idle Detection** | Camera auto-rotates when idle; manual orbit interaction pauses rotation with a 3-second resume timer |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 |
| Language | TypeScript 5 |
| UI Library | React 19 |
| 3D Engine | Three.js 0.183 |
| React Three Fiber | @react-three/fiber 9 |
| Shader Utilities | @react-three/drei 10 |
| Post-Processing | @react-three/postprocessing 3 |
| State Management | Zustand 5 |
| Animation | Framer Motion 12, GSAP 3 |
| Styling | Tailwind CSS 4 |
| UI Primitives | shadcn/ui, Radix UI |
| Icons | Lucide React |
| Smooth Scroll | @studio-freight/lenis |
| Font | Geist Mono |

---

## Shader System

Neural Void uses three custom GLSL shader programs, all written inline as tagged template literals and compiled at runtime by Three.js.

### Neuron Shader

The neuron vertex shader applies organic pulse distortion along normals, scales geometry based on activation level (1.0x to 1.6x), and computes a fresnel term in vertex space for performance:

```glsl
// Organic pulsing distortion
float pulse = sin(uTime * 2.0 + position.x * 3.0) * 0.03 * (1.0 + instanceActivation);
vec3 displaced = position + normal * pulse;

// Fresnel rim glow (computed in vertex shader)
vec3 viewDir = normalize(vViewPosition);
vec3 worldNormal = normalize((modelViewMatrix * instanceMatrix * vec4(normal, 0.0)).xyz);
vFresnel = pow(1.0 - abs(dot(viewDir, worldNormal)), 3.0);
```

The fragment shader mixes between cyan and red based on activation, applies bioluminescent inner glow pulsing, adds fresnel rim lighting, and boosts emissive values above 1.0 for bloom pickup. A secondary shader in `Neurons.tsx` handles the instanced rendering path with per-instance hover detection and color theme switching via the `uColorTheme` uniform.

### Connection Shader

Connections render energy pulses as gaussian falloff functions traveling along UV space. Up to 8 simultaneous pulse positions are supported via a uniform array. Two ambient auto-pulses travel in opposite directions to give the network a sense of constant life:

```glsl
// Gaussian falloff for energy pulse
float dist = abs(vUv.x - pulsePos);
float intensity = exp(-dist * dist * 50.0);

// Auto-traveling ambient pulse
float autoPos = fract(uTime * 0.3);
float autoDist = abs(vUv.x - autoPos);
float autoIntensity = exp(-autoDist * autoDist * 50.0) * 0.4;
```

Edge fade is applied via smoothstep across the v-axis to thin the line at its borders.

### Glitch Post-Processing Shader

The glitch shader operates as a fullscreen post-processing pass. It combines three distinct distortion layers:

```glsl
// Scanline displacement: shift entire rows horizontally
float rowId = floor(uv.y * 50.0);
float scanlineDisplace = step(0.99, rowRand) * uIntensity * 0.1;

// Block noise: random rectangular blocks displaced
vec2 blockCoord = floor(uv * 10.0 + floor(uTime * 3.0));
float blockNoise = step(0.98, random2d(blockCoord)) * uIntensity;

// RGB channel splitting
float rgbOffset = uIntensity * 0.02 * sin(uTime * 10.0);
float r = texture2D(tDiffuse, vec2(uv.x + rgbOffset, uv.y)).r;
float g = texture2D(tDiffuse, uv).g;
float b = texture2D(tDiffuse, vec2(uv.x - rgbOffset, uv.y + rgbOffset * 0.5)).b;
```

---

## Controls

### Keyboard

| Key | Action |
|---|---|
| `G` | Trigger glitch effect (1.5s burst) |
| `V` | Toggle immersive mode |
| `Escape` | Exit immersive mode |

### Mouse

| Input | Action |
|---|---|
| **Left Click** (on neuron) | Fire energy propagation wave from clicked neuron |
| **Hover** (on neuron) | Highlight neuron with pulsing glow and display label |
| **Left Drag** | Orbit camera around the network |
| **Scroll Wheel** | Zoom in/out (clamped 5 -- 30 units) |

### Control Bar

| Control | Description |
|---|---|
| **DENSITY** slider | Adjust network density (0.5 -- 1.5) |
| **PULSE SPEED** slider | Control energy propagation speed (0.5x -- 3.0x) |
| **THEME** toggle | Switch between CYAN and RED color palettes |
| **ENTER THE VOID** | Activate immersive mode |

---

## Project Structure

```
neural-void/
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Main page: orchestrates scene + overlays
│   │   ├── layout.tsx                # Root layout: metadata, Geist Mono font
│   │   └── globals.css               # Animations: scanline, grain, glitch, glow
│   ├── components/
│   │   ├── three/
│   │   │   ├── NeuralScene.tsx       # Canvas setup, camera, lights, fog
│   │   │   ├── Neurons.tsx           # Instanced mesh + inline GLSL shaders
│   │   │   ├── Connections.tsx       # Line segments with per-vertex coloring
│   │   │   └── NeuronLabel.tsx       # Hover label for individual neurons
│   │   ├── effects/
│   │   │   ├── PostProcessing.tsx    # Bloom, ChromaticAberration, Vignette, Glitch
│   │   │   └── ScanlineOverlay.tsx   # CSS scanline + film grain overlay
│   │   ├── ui-overlays/
│   │   │   ├── HudHeader.tsx         # Top-left HUD: title, version, live indicator
│   │   │   ├── ControlBar.tsx        # Bottom control bar: sliders, theme, immersive
│   │   │   ├── StatsSidebar.tsx      # Top-right stats: ASCII bars, live readouts
│   │   │   ├── ImmersiveOverlay.tsx  # Immersive mode exit prompt
│   │   │   └── TypingText.tsx        # Character-by-character typing animation
│   │   ├── ui/                       # shadcn/ui primitives (badge, button, slider)
│   │   └── LoadingScreen.tsx         # Cinematic boot sequence with SVG animation
│   ├── shaders/
│   │   ├── neuronShader.ts           # Neuron vertex + fragment GLSL
│   │   ├── connectionShader.ts       # Connection vertex + fragment GLSL
│   │   └── glitchShader.ts           # Fullscreen glitch post-process GLSL
│   ├── hooks/
│   │   ├── useKeyboardControls.ts    # G, V, Escape key bindings
│   │   ├── useEnergyPropagation.ts   # BFS energy wave logic
│   │   ├── useNeuronInteraction.ts   # Hover and click handling
│   │   ├── useIdleDetection.ts       # Auto-rotate idle timer
│   │   └── usePerformanceMonitor.ts  # FPS and render budget tracking
│   ├── stores/
│   │   └── networkStore.ts           # Zustand store: neurons, connections, state
│   ├── lib/
│   │   ├── generateNetwork.ts        # Procedural network graph generation
│   │   └── utils.ts                  # Shared utilities
│   └── types/
│       └── neural.ts                 # TypeScript types: Neuron, Connection
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** or **pnpm**

### Installation

```bash
git clone https://github.com/mintun-a/neural-void.git
cd neural-void
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a WebGL-capable browser.

### Production Build

```bash
npm run build
npm start
```

---

## Post-Processing Pipeline

The rendering pipeline applies four post-processing effects in sequence via `@react-three/postprocessing` and the `EffectComposer`:

| Pass | Configuration | Immersive Mode |
|---|---|---|
| **Bloom** | Threshold 0.2, smoothing 0.9, intensity 2.0, mipmap blur | Intensity increased to 3.5 |
| **Chromatic Aberration** | Offset (0.002, 0.002), no radial modulation | Offset widened to (0.005, 0.005) |
| **Vignette** | Offset 0.3, darkness 0.9 | Unchanged |
| **Glitch** | Sporadic mode, strength 0.2--0.4, triggered via keyboard | Active only during `G` key burst |

The glitch effect is controlled by Zustand state. When `triggerGlitch()` fires, `glitchActive` is set to `true` for 1.5 seconds, enabling the postprocessing Glitch pass with sporadic displacement. The custom GLSL glitch shader in `src/shaders/glitchShader.ts` provides an alternative fullscreen implementation with scanline displacement, block noise, and RGB splitting.

---

## Connected Projects

| Project | Description |
|---|---|
| [**Void Protocol**](https://github.com/mintun-a/void-protocol) | Dark-themed developer portfolio with terminal aesthetics |
| [**Echo Chamber Pro**](https://github.com/mintun-a/echo-chamber-pro) | Real-time audio visualization and analysis platform |

---

<br>

<p align="center">
  <sub>Built by <strong>Min Tun</strong></sub>
  <br>
  <sub>Built with <strong>Claude Code</strong></sub>
</p>
