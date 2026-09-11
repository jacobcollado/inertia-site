"use client";

import { useEffect, useRef } from "react";

const VERT = `#version 300 es
in vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
out vec4 outColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = rot * p * 2.05 + vec2(17.0, 23.0);
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  uv.x *= u_resolution.x / u_resolution.y;

  float t = u_time * 0.42;
  vec2 drift = vec2(t * 0.28, t * 0.18);

  // Domain warp — soft currents that pull the field along over time.
  vec2 warp = vec2(
    fbm(uv * 1.35 + drift),
    fbm(uv * 1.35 + drift + vec2(4.2, 1.7))
  ) - 0.5;
  vec2 p = uv + warp * 0.14;

  float n = fbm(p * 2.0 + drift);
  n += fbm(p * 4.2 - drift.yx * 1.4 + vec2(t * 0.12, 0.0)) * 0.42;
  n /= 1.42;

  float blueFlow = fbm(p * 3.4 + drift * 1.15 + vec2(1.8, 4.6));
  blueFlow += fbm(p * 5.6 - drift * 0.8 + vec2(t * 0.08, 2.2)) * 0.35;
  blueFlow /= 1.35;

  // Site primary — #0a84ff
  vec3 accent = vec3(0.039, 0.518, 1.0);
  vec3 accentSoft = vec3(0.82, 0.91, 0.99);
  vec3 base = vec3(0.965, 0.968, 0.975);
  vec3 deep = vec3(0.84, 0.87, 0.92);
  vec3 ink = vec3(0.07, 0.09, 0.12);

  vec3 col = mix(base, deep, smoothstep(0.15, 0.95, n));
  col = mix(col, accentSoft, smoothstep(0.48, 0.78, blueFlow) * 0.28);
  col = mix(col, accent, smoothstep(0.68, 0.9, blueFlow) * 0.14);
  col = mix(col, ink, smoothstep(0.62, 0.92, n) * 0.06);

  outColor = vec4(col, 1.0);
}`;

function createShader(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function PricingLifeShader({
  className = "",
  embedded = false,
}: {
  className?: string;
  embedded?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gl = canvas.getContext("webgl2", { antialias: true, alpha: false });
    if (!gl) return;

    const vs = createShader(gl, gl.VERTEX_SHADER, VERT);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const posLoc = gl.getAttribLocation(program, "a_position");
    const timeLoc = gl.getUniformLocation(program, "u_time");
    const resLoc = gl.getUniformLocation(program, "u_resolution");

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    let raf = 0;
    let start = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w === 0 || h === 0) return;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const draw = (now: number) => {
      resize();
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
      gl.uniform1f(timeLoc, reduced ? 0 : (now - start) * 0.001);
      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      if (!reduced) raf = requestAnimationFrame(draw);
    };

    resize();
    draw(start);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buffer);
    };
  }, []);

  return (
    <div
      className={`relative overflow-hidden bg-[rgb(var(--surface))] ${embedded ? "h-full" : "rounded-2xl border border-[rgb(var(--line))]"} ${className}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
