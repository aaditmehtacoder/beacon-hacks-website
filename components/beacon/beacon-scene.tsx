"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer, ToneMapping } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import * as THREE from "three";

/* ============================================================
   The beacon.

   A Fresnel lighthouse lens, built from the parts a real one has: a lamp in
   the middle, two bullseye panels that focus it into beams, dioptric rings
   around each bullseye, glass barrel arcs above and below, and brass
   astragals holding it together. The cage turns; the lamp does not. Dust
   in the air lights up only where a beam passes through it, which is what
   makes the beam read as light rather than as a shape.

   Everything the page needs from the scene comes out through two
   callbacks: onReady, once there is something worth showing, and onFacing,
   a 0..1 for how squarely a beam is pointed at the visitor.

   Every object the frame loop touches is declared in JSX and reached
   through a ref, so nothing created during render is mutated afterwards.
   ============================================================ */

export type Pointer = { x: number; y: number; active: boolean };

export type BeaconSceneProps = {
  /** False while off screen or the tab is hidden: the loop stops entirely. */
  running: boolean;
  /** prefers-reduced-motion: render one still frame and leave it. */
  reduced: boolean;
  tier: "low" | "high";
  /** Normalised pointer, written by the wrapper from anywhere on the page. */
  pointer: RefObject<Pointer>;
  /** Page scroll, written by the wrapper. Scrolling turns the lens. */
  scroll: RefObject<Scroll>;
  onReady?: () => void;
  onFacing?: (facing: number) => void;
  /** The scene cannot be trusted any more: show the CSS lamp instead. */
  onFail?: () => void;
};

/** Page scroll, plus how far through the pinned hero stage we are (0..1). */
export type Scroll = { y: number; p: number };

type Caps = { halfFloat: boolean };

/* ------------------------------------------------------------ timing */

const TURN_SECONDS = 10;
const SPEED = (Math.PI * 2) / TURN_SECONDS;
const FIRST_FLASH_AT = 2.6;

/* Beam A leaves along +X and is swung by the cage's rotation, which maps +X
   to (cos φ, 0, −sin φ). It faces a camera on +Z when φ = 3π/2, so solve
   backwards for the phase at ignition and the first flash lands right after
   the headline has settled. */
const PHASE0 = Math.PI * 1.5 - SPEED * FIRST_FLASH_AT;
const STILL_PHASE = Math.PI * 1.5 - 0.62;

/* Radians of lens per pixel scrolled. On a desktop the hero leaves the
   viewport after roughly 900px, which is a turn and a quarter. */
const SCROLL_TURN = 0.0045;

const BEAM_LENGTH = 9;
const BEAM_RADIUS = 1.45;
const BEAM_HALF_ANGLE = Math.atan(BEAM_RADIUS / BEAM_LENGTH) * 1.25;

const CORE = new THREE.Color(7.5, 4.4, 1.15);
const AMBER = "#ffb228";

/** A real lamp does not simply switch on. Two quick strikes, then it holds. */
function ignition(t: number) {
  if (t < 0.22) return 0;
  if (t < 0.32) return 0.55;
  if (t < 0.4) return 0.1;
  if (t < 0.54) return 0.85;
  if (t < 0.62) return 0.28;
  const u = Math.min(1, (t - 0.62) / 0.9);
  return 0.28 + 0.72 * (1 - Math.pow(1 - u, 3));
}

function smoothstep(e0: number, e1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
}

/** Deterministic, so the dust is the same on every visit and pure in render. */
function mulberry32(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildMotes(count: number) {
  const rand = mulberry32(1867);
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const r = 0.95 + Math.pow(rand(), 0.7) * 3.4;
    const a = rand() * Math.PI * 2;
    positions[i * 3] = Math.cos(a) * r;
    positions[i * 3 + 1] = (rand() - 0.45) * 4.6;
    positions[i * 3 + 2] = Math.sin(a) * r;
    seeds[i] = rand();
  }
  return { positions, seeds };
}

/* ------------------------------------------------------------ shaders */

const BEAM_VERT = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

/* Brightest along the centre line, where the cone's surface faces us, and
   fading to nothing at its silhouette. Both faces draw additively, so the
   far wall of the cone thickens the middle the way real haze does. */
const BEAM_FRAG = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float along = 1.0 - vUv.y;
    float reach = pow(1.0 - along, 2.6);
    float body = pow(abs(dot(vNormal, vView)), 0.9);
    float clear = smoothstep(0.0, 0.09, along);
    float a = reach * body * clear * uIntensity;
    gl_FragColor = vec4(uColor * 1.35, a);
  }
`;

const MOTE_VERT = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  uniform vec3 uBeamA;
  uniform vec3 uBeamB;
  uniform float uCos;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uIgnite;
  varying float vLight;
  void main() {
    vec3 p = position;
    p.x += sin(uTime * 0.23 + aSeed * 6.2831) * 0.2;
    p.y += sin(uTime * 0.17 + aSeed * 12.0) * 0.16;
    p.z += cos(uTime * 0.2 + aSeed * 9.0) * 0.2;
    vec3 d = normalize(p);
    float inA = smoothstep(uCos, 1.0, dot(d, uBeamA));
    float inB = smoothstep(uCos, 1.0, dot(d, uBeamB)) * 0.8;
    float lit = max(inA, inB) * uIgnite * smoothstep(6.5, 1.2, length(p));
    vLight = 0.05 + 1.25 * lit;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * uPixelRatio * (1.0 + lit * 1.6) / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;

const MOTE_FRAG = /* glsl */ `
  uniform vec3 uColor;
  varying float vLight;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.06, d) * vLight;
    gl_FragColor = vec4(uColor, a);
  }
`;

const BACKDROP_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/* Night sky into warm haze, with a soft glow where the beam meets the fog
   behind the lamp. It moves with the beam, so the backdrop is part of the
   light rather than a painted card. */
const BACKDROP_FRAG = /* glsl */ `
  uniform vec3 uTop;
  uniform vec3 uBottom;
  uniform vec3 uGlow;
  uniform vec3 uBeam;
  uniform float uIgnite;
  varying vec2 vUv;
  void main() {
    vec3 c = mix(uBottom, uTop, smoothstep(0.0, 1.0, vUv.y));
    float band = exp(-pow((vUv.y - 0.42) * 3.0, 2.0));
    float behind = smoothstep(0.05, 0.75, -uBeam.z);
    float gx = exp(-pow((vUv.x - (0.5 + uBeam.x * 0.26)) * 3.2, 2.0));
    c += uGlow * band * (0.025 + 0.34 * behind * gx) * uIgnite;
    float v = smoothstep(1.15, 0.3, length(vUv - 0.5) * 1.45);
    c *= mix(0.5, 1.0, v);
    gl_FragColor = vec4(c, 1.0);
  }
`;

/* ------------------------------------------------------------ helpers */

/** A small studio built from light panels, baked into an environment map.
    Warm key above, soft fill, a cool rim behind, and amber bounce below. */
function makeEnvironment(gl: THREE.WebGLRenderer) {
  const room = new THREE.Scene();
  const panel = (
    hex: string,
    power: number,
    position: [number, number, number],
    size: [number, number],
  ) => {
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(size[0], size[1]),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(hex).multiplyScalar(power),
        side: THREE.DoubleSide,
      }),
    );
    mesh.position.set(...position);
    mesh.lookAt(0, 0, 0);
    room.add(mesh);
  };
  panel("#ffd9a3", 3, [0, 5, 2.5], [8, 4]);
  panel("#fff3e2", 1.4, [-6, 1.5, 3], [3, 6]);
  panel("#b4c3ff", 1.1, [5, 0.5, -4], [4, 6]);
  panel(AMBER, 0.9, [0, -5, 0], [10, 10]);

  const pmrem = new THREE.PMREMGenerator(gl);
  const target = pmrem.fromScene(room, 0.04);
  pmrem.dispose();
  room.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.geometry.dispose();
      (o.material as THREE.Material).dispose();
    }
  });
  return target;
}

/** Radial glare for the sprites, drawn once on a 2D canvas. */
function makeGlareTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,244,220,1)");
  g.addColorStop(0.16, "rgba(255,196,90,0.8)");
  g.addColorStop(0.45, "rgba(255,172,40,0.2)");
  g.addColorStop(1, "rgba(255,160,30,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function beamParameters(): THREE.ShaderMaterialParameters {
  return {
    uniforms: {
      uColor: { value: new THREE.Color(AMBER) },
      uIntensity: { value: 0 },
    },
    vertexShader: BEAM_VERT,
    fragmentShader: BEAM_FRAG,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
    side: THREE.DoubleSide,
  };
}

/* ------------------------------------------------------------ parts */

function Glass() {
  return (
    <meshPhysicalMaterial
      color="#fff6e6"
      transmission={1}
      thickness={0.7}
      roughness={0.06}
      ior={1.46}
      attenuationColor={AMBER}
      attenuationDistance={1.2}
      specularColor="#ffe2b0"
      clearcoat={1}
      clearcoatRoughness={0.12}
      envMapIntensity={0.55}
    />
  );
}

function Brass() {
  return <meshStandardMaterial color="#7a5a22" metalness={1} roughness={0.38} />;
}

function Iron() {
  return <meshStandardMaterial color="#2a2118" metalness={0.7} roughness={0.55} />;
}

/* ------------------------------------------------------------ scene */

function Scene({
  reduced,
  tier,
  pointer,
  scroll,
  caps,
  onReady,
  onFacing,
  onFail,
}: Omit<BeaconSceneProps, "running"> & { caps: Caps }) {
  const invalidate = useThree((s) => s.invalidate);
  const canvas = useThree((s) => s.gl.domElement);

  const lamp = useRef<THREE.Group>(null);
  const cage = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);
  const core = useRef<THREE.MeshBasicMaterial>(null);
  const beamA = useRef<THREE.ShaderMaterial>(null);
  const beamB = useRef<THREE.ShaderMaterial>(null);
  const motes = useRef<THREE.ShaderMaterial>(null);
  const backdrop = useRef<THREE.ShaderMaterial>(null);
  const glare = useRef<THREE.Sprite>(null);
  const streak = useRef<THREE.Sprite>(null);
  const glareMaterial = useRef<THREE.SpriteMaterial>(null);
  const streakMaterial = useRef<THREE.SpriteMaterial>(null);

  const start = useRef<number | null>(null);
  const frames = useRef(0);
  const lastFacing = useRef(-1);
  const target = useRef<THREE.Vector3 | null>(null);
  const scrollPhase = useRef(0);
  const probe = useRef({ buffer: null as Uint8Array | null, next: 0, samples: 0, dark: 0, done: false });

  const beams = useMemo(() => [beamParameters(), beamParameters()], []);

  const moteParameters = useMemo<THREE.ShaderMaterialParameters>(
    () => ({
      uniforms: {
        uTime: { value: 0 },
        uBeamA: { value: new THREE.Vector3(1, 0, 0) },
        uBeamB: { value: new THREE.Vector3(-1, 0, 0) },
        uCos: { value: Math.cos(BEAM_HALF_ANGLE) },
        uSize: { value: tier === "low" ? 38 : 34 },
        uPixelRatio: { value: 1 },
        uIgnite: { value: 0 },
        uColor: { value: new THREE.Color("#ffd28a") },
      },
      vertexShader: MOTE_VERT,
      fragmentShader: MOTE_FRAG,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
    [tier],
  );

  const backdropParameters = useMemo<THREE.ShaderMaterialParameters>(
    () => ({
      uniforms: {
        uTop: { value: new THREE.Color("#050508") },
        uBottom: { value: new THREE.Color("#110c07") },
        uGlow: { value: new THREE.Color(AMBER) },
        uBeam: { value: new THREE.Vector3(1, 0, 0) },
        uIgnite: { value: 0 },
      },
      vertexShader: BACKDROP_VERT,
      fragmentShader: BACKDROP_FRAG,
      depthWrite: false,
    }),
    [],
  );

  const moteCount = tier === "low" ? 240 : 520;
  const moteData = useMemo(() => buildMotes(moteCount), [moteCount]);

  /* The glare texture is drawn on a 2D canvas, which is a side effect, so
     it happens here rather than during render. */
  useEffect(() => {
    const texture = makeGlareTexture();
    for (const material of [glareMaterial.current, streakMaterial.current]) {
      if (!material) continue;
      material.map = texture;
      material.needsUpdate = true;
    }
    return () => texture.dispose();
  }, []);

  /* A lost context never comes back on its own here; hand over to the CSS lamp. */
  useEffect(() => {
    const onLost = (event: Event) => {
      event.preventDefault();
      onFail?.();
    };
    canvas.addEventListener("webglcontextlost", onLost);
    return () => canvas.removeEventListener("webglcontextlost", onLost);
  }, [canvas, onFail]);

  /* Reduced motion renders on demand: a handful of frames so the environment
     and transmission settle, then nothing until the page resizes. */
  useEffect(() => {
    if (!reduced) return;
    let n = 0;
    let raf = 0;
    const tick = () => {
      invalidate();
      if (++n < 8) raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [reduced, invalidate]);

  /* One loop moves everything, so the parts stay in step. */
  useFrame((state, delta) => {
    const now = performance.now() / 1000;
    if (start.current === null) start.current = now;
    const t = reduced ? 4 : now - start.current;

    const ig = ignition(t);

    /* The lens turns on its own, and scrolling turns it further. Only the
       scroll part is smoothed, so the ignition flash keeps its timing. */
    const wanted = reduced ? 0 : (scroll.current?.y ?? 0) * SCROLL_TURN;
    scrollPhase.current += (wanted - scrollPhase.current) * (1 - Math.exp(-delta * 7));
    const phase = (reduced ? STILL_PHASE : PHASE0 + SPEED * t) + scrollPhase.current;

    /* Progress through the pinned stage drives the camera: it rises, pushes
       in, and ends looking down on the lamp as the page lets go. */
    const stage = reduced ? 0 : (scroll.current?.p ?? 0);
    const scrolled = stage * stage * (3 - 2 * stage);
    const wide = state.viewport.aspect >= 1.1;

    /* rise and settle as it lights */
    const settle = 1 - Math.pow(1 - Math.min(1, t / 1.6), 3);
    if (lamp.current) {
      lamp.current.position.y = -0.14 * (1 - settle);
      lamp.current.scale.setScalar(0.94 + 0.06 * settle);
    }
    if (cage.current) cage.current.rotation.y = phase;

    /* how squarely each beam points at the camera */
    const bx = Math.cos(phase);
    const bz = -Math.sin(phase);
    const cam = state.camera.position;
    const len = Math.hypot(cam.x, cam.z) || 1;
    const dot = (bx * cam.x + bz * cam.z) / len;
    const fa = Math.pow(smoothstep(0.55, 1, dot), 1.7);
    const fb = Math.pow(smoothstep(0.55, 1, -dot), 1.7) * 0.8;
    const facing = Math.max(fa, fb) * ig;

    const flicker = reduced ? 1 : 0.965 + 0.035 * Math.sin(t * 37) * Math.sin(t * 23);
    if (core.current) core.current.color.copy(CORE).multiplyScalar(ig * flicker * (1 + 1.4 * facing));
    if (light.current) light.current.intensity = 26 * ig * (1 + 0.6 * facing);

    if (beamA.current) beamA.current.uniforms.uIntensity.value = ig * flicker;
    if (beamB.current) beamB.current.uniforms.uIntensity.value = ig * flicker * 0.8;

    if (motes.current) {
      const u = motes.current.uniforms;
      u.uTime.value = t;
      (u.uBeamA.value as THREE.Vector3).set(bx, 0, bz);
      (u.uBeamB.value as THREE.Vector3).set(-bx, 0, -bz);
      u.uIgnite.value = ig;
      u.uPixelRatio.value = state.viewport.dpr;
    }

    if (backdrop.current) {
      const u = backdrop.current.uniforms;
      (u.uBeam.value as THREE.Vector3).set(bx, 0, bz);
      u.uIgnite.value = ig;
    }

    /* the flash: a bloom of glare and an anamorphic streak when a beam hits us */
    if (glare.current) glare.current.scale.setScalar(0.9 + 2.4 * Math.pow(facing, 1.4));
    if (glareMaterial.current) glareMaterial.current.opacity = ig * (0.3 + 0.7 * facing);
    if (streak.current) streak.current.scale.set(2.5 + 9 * facing, 0.1 + 0.32 * facing, 1);
    if (streakMaterial.current) streakMaterial.current.opacity = Math.pow(facing, 2) * 0.9;

    /* camera: follows the pointer when there is one, drifts when there is not */
    if (target.current === null) target.current = new THREE.Vector3();
    const p = pointer.current;
    const drift = reduced ? 0 : Math.sin(now * 0.12) * 0.22;
    const tx = p?.active ? p.x * 0.5 : drift;
    const ty = (p?.active ? -0.3 + p.y * 0.26 : -0.3 + (reduced ? 0 : Math.sin(now * 0.09) * 0.08)) + scrolled * 1.5;
    target.current.set(tx, ty, 7 - scrolled * 0.9);
    if (reduced) state.camera.position.copy(target.current);
    else state.camera.position.lerp(target.current, 1 - Math.exp(-delta * 2.6));
    state.camera.lookAt(wide ? -1.35 : 0, (wide ? 0.05 : 0.95) - scrolled * 0.5, 0);

    if (Math.abs(facing - lastFacing.current) > 0.004) {
      lastFacing.current = facing;
      onFacing?.(facing);
    }

    if (frames.current < 3) {
      frames.current += 1;
      if (frames.current === 3) onReady?.();
    }
  });

  /* Without half-float targets there is no bloom, and no composer to draw the
     frame either, so draw it here. */
  useFrame(({ gl, scene, camera }) => {
    if (!caps.halfFloat) gl.render(scene, camera);
  }, 1);

  /* The watchdog. A running loop is not proof of a visible lamp: a broken
     framebuffer or a hot-reloaded canvas can present black while every
     callback still fires. Once lit, read the centre pixel a few times; the
     lamp sits there, so if it stays dark the scene is handed back to CSS. */
  useFrame(({ gl }) => {
    if (reduced) return;
    const pr = probe.current;
    if (pr.done || start.current === null) return;
    const now = performance.now() / 1000;
    if (now - start.current < 1.6 || now < pr.next) return;
    pr.next = now + 0.35;
    const ctx = gl.getContext();
    if (!pr.buffer) pr.buffer = new Uint8Array(4);
    ctx.readPixels(ctx.drawingBufferWidth >> 1, ctx.drawingBufferHeight >> 1, 1, 1, ctx.RGBA, ctx.UNSIGNED_BYTE, pr.buffer);
    pr.samples += 1;
    if (pr.buffer[0] + pr.buffer[1] + pr.buffer[2] < 24) pr.dark += 1;
    if (pr.samples >= 5) {
      pr.done = true;
      if (pr.dark >= 4) onFail?.();
    }
  }, 2);

  return (
    <>
      <mesh position={[0, 0.3, -7.5]}>
        <planeGeometry args={[18, 18]} />
        <shaderMaterial ref={backdrop} args={[backdropParameters]} />
      </mesh>

      <ambientLight intensity={0.22} />
      <hemisphereLight args={["#2a2c3e", "#1a120a", 0.35]} />

      <group ref={lamp}>
        {/* the lantern room: pedestal and roof stay put */}
        <mesh position={[0, -1.04, 0]}>
          <cylinderGeometry args={[0.74, 0.82, 0.12, 48]} />
          <Iron />
        </mesh>
        <mesh position={[0, 1.04, 0]}>
          <cylinderGeometry args={[0.56, 0.74, 0.12, 48]} />
          <Iron />
        </mesh>

        {/* the lens turns around the lamp */}
        <group ref={cage}>
          {[0, Math.PI].map((ry, i) => (
            <group key={ry} rotation={[0, ry, 0]}>
              {/* bullseye: a convex lens that gathers the lamp into a beam */}
              <mesh position={[0.84, 0, 0]} rotation={[0, Math.PI / 2, 0]} scale={[1, 1, 0.16]}>
                <sphereGeometry args={[0.58, 48, 32]} />
                <Glass />
              </mesh>
              {/* dioptric rings around it */}
              {[0.67, 0.79].map((r) => (
                <mesh key={r} position={[0.84, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
                  <torusGeometry args={[r, 0.03, 10, 64]} />
                  <Glass />
                </mesh>
              ))}
              {/* the beam: apex at the lamp, running out along +X */}
              <mesh position={[BEAM_LENGTH / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]} renderOrder={10} frustumCulled={false}>
                <coneGeometry args={[BEAM_RADIUS, BEAM_LENGTH, 48, 1, true]} />
                <shaderMaterial ref={i === 0 ? beamA : beamB} args={[beams[i]]} />
              </mesh>
            </group>
          ))}

          {/* barrel arcs, above and below, with gaps where the astragals sit */}
          {[
            [-0.86, 0.46],
            [-0.56, 0.74],
            [0.56, 0.74],
            [0.86, 0.46],
          ].map(([y, r]) =>
            [0, 1, 2, 3].map((q) => {
              const start = Math.PI / 4 + (q * Math.PI) / 2 + 0.16;
              return (
                <group key={`${y}-${q}`} rotation={[0, -start, 0]}>
                  <mesh position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[r, 0.024, 10, 48, Math.PI / 2 - 0.32]} />
                    <Glass />
                  </mesh>
                </group>
              );
            }),
          )}

          {/* brass astragals */}
          {[0, 1, 2, 3].map((q) => {
            const a = Math.PI / 4 + (q * Math.PI) / 2;
            return (
              <mesh key={q} position={[Math.cos(a) * 0.8, 0, Math.sin(a) * 0.8]}>
                <cylinderGeometry args={[0.018, 0.018, 1.92, 10]} />
                <Brass />
              </mesh>
            );
          })}
        </group>

        {/* the lamp itself, and its light on the brass */}
        <mesh>
          <sphereGeometry args={[0.15, 32, 32]} />
          <meshBasicMaterial ref={core} color="#000000" toneMapped={false} />
        </mesh>
        <pointLight ref={light} color={AMBER} intensity={0} distance={7} decay={2} />
        <sprite ref={glare} renderOrder={20}>
          <spriteMaterial ref={glareMaterial} color="#ffc766" blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false} transparent opacity={0} />
        </sprite>
        <sprite ref={streak} renderOrder={21}>
          <spriteMaterial ref={streakMaterial} color="#ffc766" blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false} transparent opacity={0} />
        </sprite>
      </group>

      <points frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[moteData.positions, 3]} />
          <bufferAttribute attach="attributes-aSeed" args={[moteData.seeds, 1]} />
        </bufferGeometry>
        <shaderMaterial ref={motes} args={[moteParameters]} />
      </points>

      {caps.halfFloat ? (
        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={1} luminanceSmoothing={0.2} mipmapBlur intensity={tier === "low" ? 1.05 : 1.3} radius={0.72} levels={tier === "low" ? 5 : 7} />
          <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
        </EffectComposer>
      ) : null}
    </>
  );
}

/* ------------------------------------------------------------ canvas */

export function BeaconScene({ running, reduced, tier, pointer, scroll, onReady, onFacing, onFail }: BeaconSceneProps) {
  const environment = useRef<THREE.WebGLRenderTarget | null>(null);
  const [caps, setCaps] = useState<Caps | null>(null);

  useEffect(
    () => () => {
      environment.current?.dispose();
      environment.current = null;
    },
    [],
  );

  const frameloop = !running ? "never" : reduced ? "demand" : "always";

  return (
    <Canvas
      flat
      frameloop={frameloop}
      dpr={tier === "low" ? [1, 1.25] : [1, 1.5]}
      gl={{ antialias: false, alpha: false, stencil: false, powerPreference: "high-performance" }}
      camera={{ fov: 32, near: 0.1, far: 60, position: [0, -0.3, 7] }}
      onCreated={({ gl, scene }) => {
        gl.setClearColor(0x050508, 1);
        gl.transmissionResolutionScale = tier === "low" ? 0.35 : 0.5;
        const env = makeEnvironment(gl);
        environment.current = env;
        scene.environment = env.texture;
        scene.environmentIntensity = 0.6;
        /* Bloom needs a half-float framebuffer; without one the lamp still
           lights, it just does not glow. */
        const ctx = gl.getContext();
        setCaps({
          halfFloat: !!(
            ctx.getExtension("EXT_color_buffer_half_float") ||
            ctx.getExtension("EXT_color_buffer_float")
          ),
        });
      }}
      style={{ position: "absolute", inset: 0 }}
    >
      {caps ? (
        <Scene
          reduced={reduced}
          tier={tier}
          pointer={pointer}
          scroll={scroll}
          caps={caps}
          onReady={onReady}
          onFacing={onFacing}
          onFail={onFail}
        />
      ) : null}
    </Canvas>
  );
}
