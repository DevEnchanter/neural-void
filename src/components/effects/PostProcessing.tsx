'use client';

import { useMemo } from 'react';
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
  Glitch,
} from '@react-three/postprocessing';
import { GlitchMode } from 'postprocessing';
import { Vector2 } from 'three';
import { useNetworkStore } from '@/stores/networkStore';

export default function PostProcessing() {
  const immersiveMode = useNetworkStore((s) => s.immersiveMode);
  const glitchActive = useNetworkStore((s) => s.glitchActive);

  const chromaticOffset = useMemo(() => {
    const val = immersiveMode ? 0.005 : 0.002;
    return new Vector2(val, val);
  }, [immersiveMode]);

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        luminanceThreshold={0.2}
        luminanceSmoothing={0.9}
        intensity={immersiveMode ? 3.5 : 2.0}
        mipmapBlur
      />
      <ChromaticAberration
        offset={chromaticOffset}
        radialModulation={false}
        modulationOffset={0.0}
      />
      <Vignette offset={0.3} darkness={0.9} />
      <Glitch
        delay={new Vector2(0, 0)}
        duration={new Vector2(0.1, 0.3)}
        strength={new Vector2(glitchActive ? 0.2 : 0, glitchActive ? 0.4 : 0)}
        mode={GlitchMode.SPORADIC}
        active={glitchActive}
        ratio={0.85}
      />
    </EffectComposer>
  );
}
