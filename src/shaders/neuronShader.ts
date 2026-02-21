export const neuronVertexShader = /* glsl */ `
uniform float uTime;
uniform float uHoveredId;
uniform float uGlitchIntensity;

attribute float instanceActivation;
attribute float instanceLayer;

varying float vActivation;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vViewPosition;
varying float vFresnel;

void main() {
  vActivation = instanceActivation;
  vNormal = normalize(normalMatrix * normal);
  vPosition = position;

  // Organic pulsing distortion
  float pulse = sin(uTime * 2.0 + position.x * 3.0) * 0.03 * (1.0 + instanceActivation);
  vec3 displaced = position + normal * pulse;

  // Scale up with activation (1.0 -> 1.6)
  float scale = 1.0 + instanceActivation * 0.6;
  displaced *= scale;

  // Glitch jitter
  displaced += normal * uGlitchIntensity * sin(uTime * 40.0 + position.y * 20.0) * 0.05;

  vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(displaced, 1.0);
  vViewPosition = -mvPosition.xyz;

  // Fresnel in vertex for performance
  vec3 viewDir = normalize(vViewPosition);
  vec3 worldNormal = normalize((modelViewMatrix * instanceMatrix * vec4(normal, 0.0)).xyz);
  vFresnel = pow(1.0 - abs(dot(viewDir, worldNormal)), 3.0);

  gl_Position = projectionMatrix * mvPosition;
}
`;

export const neuronFragmentShader = /* glsl */ `
uniform float uTime;
uniform float uHoveredId;
uniform float uGlitchIntensity;

varying float vActivation;
varying vec3 vNormal;
varying vec3 vPosition;
varying vec3 vViewPosition;
varying float vFresnel;

void main() {
  // Core bioluminescent colors
  vec3 cyanCore = vec3(0.0, 0.88, 1.0);
  vec3 redActive = vec3(1.0, 0.1, 0.1);
  vec3 baseColor = mix(cyanCore, redActive, vActivation);

  // Inner glow pulsing
  float innerPulse = 0.5 + 0.5 * sin(uTime * 3.0 + vPosition.x * 5.0 + vPosition.y * 4.0);
  float glowStrength = 0.4 + 0.6 * innerPulse * (0.3 + vActivation * 0.7);

  // Fresnel rim glow (deep-sea bioluminescence)
  vec3 rimColor = mix(vec3(0.1, 0.5, 1.0), vec3(1.0, 0.3, 0.5), vActivation);
  vec3 rim = rimColor * vFresnel * 2.5;

  // Combine: core emission + rim
  vec3 color = baseColor * glowStrength + rim;

  // Emissive boost so bloom picks it up (values > 1.0)
  color *= 1.0 + vActivation * 1.5;

  // Hover highlight
  // Note: hover detection is typically done per-instance on CPU side
  // and fed through instanceActivation. Extra brightness for highly active neurons.
  float isHighlyActive = smoothstep(0.8, 1.0, vActivation);
  color += vec3(0.3, 0.3, 0.5) * isHighlyActive * (0.5 + 0.5 * sin(uTime * 8.0));

  // Glitch color distortion
  color.r += uGlitchIntensity * sin(uTime * 30.0 + vPosition.y * 10.0) * 0.3;
  color.b += uGlitchIntensity * cos(uTime * 25.0 + vPosition.x * 10.0) * 0.2;

  // Depth-based alpha fade
  float depth = length(vViewPosition);
  float alpha = smoothstep(50.0, 10.0, depth);
  alpha = max(alpha, 0.3 + vActivation * 0.7);

  gl_FragColor = vec4(color, alpha);
}
`;
