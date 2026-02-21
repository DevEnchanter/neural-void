export const glitchVertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const glitchFragmentShader = /* glsl */ `
uniform sampler2D tDiffuse;
uniform float uTime;
uniform float uIntensity;

varying vec2 vUv;

// Pseudo-random based on input
float random(float s) {
  return fract(sin(s * 12.9898) * 43758.5453);
}

float random2d(vec2 co) {
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 uv = vUv;

  // Scanline displacement: shift entire rows horizontally
  float rowId = floor(uv.y * 50.0);
  float rowRand = random(rowId + floor(uTime * 5.0));
  float scanlineDisplace = step(0.99, rowRand) * uIntensity * 0.1;
  uv.x += scanlineDisplace * (rowRand - 0.5) * 2.0;

  // Block noise: random rectangular blocks displaced
  vec2 blockCoord = floor(uv * 10.0 + floor(uTime * 3.0));
  float blockNoise = step(0.98, random2d(blockCoord)) * uIntensity;
  uv.x += blockNoise * 0.05 * (random2d(blockCoord + 0.5) - 0.5);
  uv.y += blockNoise * 0.02 * (random2d(blockCoord + 1.0) - 0.5);

  // RGB channel splitting
  float rgbOffset = uIntensity * 0.02 * sin(uTime * 10.0);
  float r = texture2D(tDiffuse, vec2(uv.x + rgbOffset, uv.y)).r;
  float g = texture2D(tDiffuse, uv).g;
  float b = texture2D(tDiffuse, vec2(uv.x - rgbOffset, uv.y + rgbOffset * 0.5)).b;

  vec3 color = vec3(r, g, b);

  // Scanlines overlay
  float scanline = sin(vUv.y * 800.0) * 0.04 * uIntensity;
  color -= scanline;

  // Occasional white flash in glitch blocks
  color += vec3(blockNoise * 0.3);

  gl_FragColor = vec4(color, 1.0);
}
`;
