import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const FRAG = `
precision highp float;

uniform float iTime;
uniform vec2 iResolution;
uniform float uSpeed;
uniform float uDensity;
uniform float uWarp;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec4 iMouse;

varying vec2 vUv;

float hash21(vec2 p){
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 19.19);
  return fract(p.x * p.y);
}

float star(vec2 uv, float t) {
  float id = floor(uv.x) + floor(uv.y) * 137.0;
  vec2 lv = fract(uv) - 0.5;
  float h = hash21(vec2(id, t * 0.001));
  float size = 0.02 + h * 0.08;
  float d = length(lv);
  float bright = smoothstep(size, 0.0, d);
  float twinkle = sin(t * (2.0 + h * 5.0) + id) * 0.5 + 0.5;
  return bright * (0.5 + twinkle * 0.5);
}

float starfield(vec2 uv, float t) {
  float s = 0.0;
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    vec2 grid = vec2(20.0 - fi * 4.0, 20.0 - fi * 3.0);
    float layerTime = t * (0.5 + fi * 0.3);
    vec2 suv = uv * grid + layerTime * 0.1;
    s += star(suv, t + fi * 100.0) * (1.0 - fi * 0.25);
  }
  return s * 0.6;
}

float warpLine(vec2 uv, float t, float index) {
  float ang = atan(uv.y, uv.x);
  float rad = length(uv);
  float spiral = ang + rad * 3.0 - t * uSpeed * (0.5 + index * 0.2);
  float line = sin(spiral * 20.0 + index * 2.0);
  float dist = abs(line);
  float w = smoothstep(0.15, 0.0, dist);
  float radFade = exp(-rad * 1.5);
  float centerFade = smoothstep(0.1, 0.3, rad);
  return w * radFade * centerFade * (0.3 + hash21(vec2(index, t * 0.01)) * 0.7);
}

float warpField(vec2 uv, float t) {
  float w = 0.0;
  for (int i = 0; i < 8; i++) {
    float fi = float(i);
    w += warpLine(uv, t, fi) * (0.15 + fi * 0.02);
  }
  return w * uWarp;
}

vec3 tunnelGlow(vec2 uv, float t) {
  float rad = length(uv);
  float inner = smoothstep(0.4, 0.0, rad);
  float mid = smoothstep(0.8, 0.3, rad);
  vec3 col1 = uColor1 * inner;
  vec3 col2 = uColor2 * mid * (sin(t * 0.5) * 0.5 + 0.5);
  return col1 + col2;
}

float streak(vec2 uv, float t) {
  float rad = length(uv);
  vec2 dir = normalize(uv);
  float s = 0.0;
  for (int i = 0; i < 5; i++) {
    float fi = float(i);
    float offset = fi * 0.02;
    vec2 p = uv + dir * (t * uSpeed * 2.0 + offset);
    float h = hash21(vec2(floor(p.x * 200.0), floor(p.y * 200.0 + fi * 50.0)));
    float streakLen = 0.01 + h * 0.03;
    float d = abs(dot(p - dir * offset, dir));
    float bright = smoothstep(streakLen, 0.0, d);
    float rFade = smoothstep(0.1, 0.3, rad);
    float edge = smoothstep(1.2, 0.5, rad);
    s += bright * h * rFade * edge * 0.3;
  }
  return s;
}

void main() {
  vec2 uv = (vUv - 0.5) * 2.0;
  float ar = iResolution.x / iResolution.y;
  uv.x *= ar;

  float t = iTime;

  float mouseX = iMouse.x / iResolution.x;
  float mouseY = iMouse.y / iResolution.y;
  vec2 mouseOffset = (vec2(mouseX, mouseY) - 0.5) * 0.3;
  uv += mouseOffset;

  vec3 color = vec3(0.0);

  float s = starfield(uv, t);
  float w = warpField(uv, t);
  float st = streak(uv, t);
  vec3 glow = tunnelGlow(uv, t);

  vec3 starColor = mix(uColor1, uColor2, sin(t * 0.1) * 0.5 + 0.5);
  color += starColor * s;
  color += uColor3 * w;
  color += mix(uColor1, uColor2, 0.5) * st;
  color += glow;

  float vignette = 1.0 - length(uv - mouseOffset) * 0.5;
  color *= vignette * 1.2;

  float centerHole = smoothstep(0.08, 0.01, length(uv));
  color = mix(color, vec3(0.0), centerHole * 0.5);

  gl_FragColor = vec4(color, 1.0);
}
`;

const VERT = `
precision highp float;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

export default function Hyperspeed({
  className,
  style,
  speed = 0.3,
  density = 1.0,
  warp = 1.0,
  color1 = '#4ade80',
  color2 = '#6366f1',
  color3 = '#f472b6'
}) {
  const mountRef = useRef(null);
  const uniformsRef = useRef(null);

  const hexToVec3 = (hex) => {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const n = parseInt(c, 16);
    return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
  };

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 1);
    mount.appendChild(renderer.domElement);

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 3, -1, -1, 3]), 2));

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector2(1, 1) },
      iMouse: { value: new THREE.Vector4(99999, 99999, 0, 0) },
      uSpeed: { value: speed },
      uDensity: { value: density },
      uWarp: { value: warp },
      uColor1: { value: hexToVec3(color1) },
      uColor2: { value: hexToVec3(color2) },
      uColor3: { value: hexToVec3(color3) }
    };
    uniformsRef.current = uniforms;

    const material = new THREE.RawShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms,
      depthTest: false,
      depthWrite: false
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    scene.add(mesh);

    const resize = () => {
      const w = mount.clientWidth || 1;
      const h = mount.clientHeight || 1;
      renderer.setSize(w, h);
      uniforms.iResolution.value.set(w, h);
    };
    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(mount);

    const onMouse = (e) => {
      const rect = mount.getBoundingClientRect();
      uniforms.iMouse.value.set(e.clientX - rect.left, e.clientY - rect.top, 0, 0);
    };
    mount.addEventListener('mousemove', onMouse);
    mount.addEventListener('mouseleave', () => uniforms.iMouse.value.set(99999, 99999, 0, 0));

    let raf;
    const clock = new THREE.Clock();
    const animate = () => {
      raf = requestAnimationFrame(animate);
      uniforms.iTime.value = clock.getElapsedTime();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      mount.removeEventListener('mousemove', onMouse);
      mount.removeEventListener('mouseleave', () => {});
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  useEffect(() => {
    const u = uniformsRef.current;
    if (!u) return;
    u.uSpeed.value = speed;
    u.uDensity.value = density;
    u.uWarp.value = warp;
    u.uColor1.value = hexToVec3(color1);
    u.uColor2.value = hexToVec3(color2);
    u.uColor3.value = hexToVec3(color3);
  }, [speed, density, warp, color1, color2, color3]);

  return <div ref={mountRef} className={`w-full h-full ${className || ''}`} style={style} />;
}
