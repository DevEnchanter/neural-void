export const connectionVertexShader = /* glsl */ `
uniform float uTime;

varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vPosition = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const connectionFragmentShader = /* glsl */ `
uniform float uTime;
uniform float uPulsePositions[8];
uniform float uPulseCount;

varying vec2 vUv;
varying vec3 vPosition;

void main() {
  // Base: very dim cyan line
  vec3 baseColor = vec3(0.0, 0.4, 0.5);
  float baseAlpha = 0.06;

  // Accumulate energy pulses
  vec3 pulseColor = vec3(0.0);
  float pulseAlpha = 0.0;

  for (int i = 0; i < 8; i++) {
    if (float(i) >= uPulseCount) break;

    float pulsePos = uPulsePositions[i];

    // Distance from this fragment to the pulse center along the connection
    float dist = abs(vUv.x - pulsePos);

    // Gaussian falloff
    float intensity = exp(-dist * dist * 50.0);

    // Color transition: cyan -> white -> red based on pulse position
    vec3 cyan = vec3(0.0, 0.88, 1.0);
    vec3 white = vec3(1.5, 1.5, 1.5);
    vec3 red = vec3(1.0, 0.1, 0.1);

    vec3 pColor;
    if (pulsePos < 0.5) {
      pColor = mix(cyan, white, pulsePos * 2.0);
    } else {
      pColor = mix(white, red, (pulsePos - 0.5) * 2.0);
    }

    pulseColor += pColor * intensity;
    pulseAlpha += intensity;
  }

  // Auto-traveling pulse (always active, ambient life)
  float autoPos = fract(uTime * 0.3);
  float autoDist = abs(vUv.x - autoPos);
  float autoIntensity = exp(-autoDist * autoDist * 50.0) * 0.4;
  vec3 autoPulseColor = vec3(0.0, 0.6, 0.8) * autoIntensity;

  // Second ambient pulse going opposite direction
  float autoPos2 = fract(-uTime * 0.2 + 0.5);
  float autoDist2 = abs(vUv.x - autoPos2);
  float autoIntensity2 = exp(-autoDist2 * autoDist2 * 50.0) * 0.2;
  vec3 autoPulseColor2 = vec3(0.0, 0.3, 0.6) * autoIntensity2;

  // Combine
  vec3 finalColor = baseColor * baseAlpha + pulseColor + autoPulseColor + autoPulseColor2;
  float finalAlpha = baseAlpha + pulseAlpha * 0.8 + autoIntensity + autoIntensity2;

  // Edge fade (thinner at edges of the line)
  float edgeFade = 1.0 - abs(vUv.y - 0.5) * 2.0;
  edgeFade = smoothstep(0.0, 0.3, edgeFade);
  finalAlpha *= edgeFade;

  gl_FragColor = vec4(finalColor, clamp(finalAlpha, 0.0, 1.0));
}
`;
