"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, MeshDistortMaterial } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

function Wellbeing({ still }: { still: boolean }) {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const { pointer } = useThree();

  useFrame((state, delta) => {
    if (!group.current || !core.current || still) return;
    const t = state.clock.elapsedTime;
    // cursor-responsive parallax (eased)
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, pointer.x * 0.45, 2.2, delta);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -pointer.y * 0.3, 2.2, delta);
    group.current.position.y = Math.sin(t * 0.6) * 0.08; // gentle float
    core.current.rotation.y += delta * 0.12; // slow continuous rotation
    const breath = 1 + Math.sin(t * 0.9) * 0.025; // ~7s breathing cycle
    core.current.scale.setScalar(breath);
  });

  return (
    <group ref={group}>
      <mesh ref={core}>
        <icosahedronGeometry args={[1.12, 64]} />
        <MeshDistortMaterial
          color="#C4B2FB"
          emissive="#7770C9"
          emissiveIntensity={0.14}
          distort={still ? 0.16 : 0.22}
          speed={still ? 0 : 1.1}
          roughness={0.2}
          metalness={0.05}
          clearcoat={1}
          clearcoatRoughness={0.15}
          iridescence={1}
          iridescenceIOR={1.3}
          iridescenceThicknessRange={[120, 480]}
          envMapIntensity={1.15}
        />
      </mesh>
      <Orbiters still={still} />
    </group>
  );
}

function Orbiters({ still }: { still: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const items = useMemo(
    () =>
      Array.from({ length: 11 }, (_, i) => {
        const a = (i / 11) * Math.PI * 2;
        const r = 1.62 + (i % 3) * 0.2;
        return {
          pos: [Math.cos(a) * r, Math.sin(a * 2) * 0.45, Math.sin(a) * r] as [number, number, number],
          s: 0.05 + ((i * 37) % 7) * 0.014,
          c: ["#FFFFFF", "#E6DDFB", "#F1BBAA", "#A7C9B4"][i % 4],
        };
      }),
    [],
  );
  useFrame((_, d) => {
    if (ref.current && !still) {
      ref.current.rotation.y += d * 0.16;
      ref.current.rotation.z = Math.sin(ref.current.rotation.y * 0.5) * 0.12;
    }
  });
  return (
    <group ref={ref} rotation={[0.35, 0, 0.12]}>
      {items.map((it, i) => (
        <mesh key={i} position={it.pos}>
          <sphereGeometry args={[it.s, 24, 24]} />
          <meshPhysicalMaterial color={it.c} roughness={0.05} clearcoat={1} transmission={0.35} thickness={0.4} ior={1.4} envMapIntensity={1.4} />
        </mesh>
      ))}
    </group>
  );
}

export default function Orb3D({ still = false, onReady }: { still?: boolean; onReady?: () => void }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 6.2], fov: 38 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      frameloop={still ? "demand" : "always"}
      onCreated={() => onReady?.()}
      aria-hidden
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} color="#FFFFFF" />
      <pointLight position={[-4, -2, 2]} intensity={18} color="#F1BBAA" />
      <pointLight position={[4, -3, -1]} intensity={14} color="#A7C9B4" />
      {/* Procedural studio lighting: no HDR download needed */}
      <Environment resolution={128}>
        <Lightformer form="circle" intensity={1.6} color="#FFFFFF" position={[-2, 3, 4]} scale={5} />
        <Lightformer form="circle" intensity={1.1} color="#E6DDFB" position={[-5, 0, 0]} scale={8} />
        <Lightformer form="circle" intensity={0.9} color="#F1BBAA" position={[5, -1, 1]} scale={7} />
        <Lightformer form="circle" intensity={1.0} color="#A7C9B4" position={[0, -5, 2]} scale={8} />
        <Lightformer form="circle" intensity={0.8} color="#FFFFFF" position={[0, 0, -6]} scale={10} />
      </Environment>
      <Wellbeing still={still} />
    </Canvas>
  );
}
