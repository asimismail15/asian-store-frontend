"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import { Float } from "@react-three/drei";
import * as THREE from "three";
import { useStore } from "@/components/StoreProvider";

const PARTICLE_LIGHT = new THREE.Color("#6d28d9");
const PARTICLE_DARK = new THREE.Color("#a78bfa");
const RING_LIGHT = [new THREE.Color("#5b21b6"), new THREE.Color("#b77905"), new THREE.Color("#8b5cf6")];
const RING_DARK = [new THREE.Color("#a78bfa"), new THREE.Color("#c4b5fd"), new THREE.Color("#8b5cf6")];
function DriftField({ dark, count, route }) {
  const group = useRef(null);
  const pointer = useRef(new THREE.Vector2());
  const target = useRef(new THREE.Vector2());
  const particles = useRef(null);
  const violetRingMaterial = useRef(null);
  const goldRingMaterial = useRef(null);
  const accentRingMaterial = useRef(null);
  const positions = useMemo(() => {
    const values = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      values[i * 3] = (((i * 37) % 101) / 100 - 0.5) * 16;
      values[i * 3 + 1] = (((i * 61 + 13) % 97) / 96 - 0.5) * 11;
      values[i * 3 + 2] = -2 - ((i * 29) % 80) / 10;
    }
    return values;
  }, [count]);

  useEffect(() => {
    const move = (event) => {
      target.current.set((event.clientX / window.innerWidth - 0.5) * 0.7, (event.clientY / window.innerHeight - 0.5) * -0.45);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  useFrame((_, delta) => {
    const blend = 1 - Math.exp(-2.8 * delta);
    particles.current?.color.lerp(dark ? PARTICLE_DARK : PARTICLE_LIGHT, blend);
    if (particles.current) particles.current.opacity += ((dark ? 0.68 : 0.7) - particles.current.opacity) * blend;
    [violetRingMaterial, goldRingMaterial, accentRingMaterial].forEach((material, index) => {
      if (!material.current) return;
      material.current.color.lerp(dark ? RING_DARK[index] : RING_LIGHT[index], blend);
      const opacity = dark ? [0.28, 0.22, 0.25][index] : [0.52, 0.44, 0.46][index];
      material.current.opacity += (opacity - material.current.opacity) * blend;
    });
    if (!group.current) return;
    pointer.current.lerp(target.current, Math.min(delta * 1.8, 1));
    group.current.rotation.y = pointer.current.x;
    group.current.rotation.x = pointer.current.y;
    group.current.rotation.z += delta * 0.018;
  });

  const page = route.toLowerCase();
  const routeHue = Array.from(page).reduce((sum, character) => sum + character.charCodeAt(0), 0) % 360;
  const routeColor = dark ? "#9b5de5" : new THREE.Color().setHSL(routeHue / 360, 0.68, 0.4).getStyle();
  const routeOpacity = dark ? 0.2 : 0.27;
  let motif;
  if (page.startsWith("/cart")) {
    motif = <group>
      <mesh position={[-4.4, 1.1, -5]}><boxGeometry args={[1.15, 1.15, 1.15]} /><meshBasicMaterial color={routeColor} wireframe transparent opacity={routeOpacity} /></mesh>
      <mesh position={[4.6, -1, -6]} rotation={[0.3, 0.4, 0.2]}><boxGeometry args={[1.5, 1.5, 1.5]} /><meshBasicMaterial color={routeColor} wireframe transparent opacity={routeOpacity} /></mesh>
      <mesh position={[-3.1, -2.3, -4]} rotation={[0.2, 0.7, 0.1]}><boxGeometry args={[0.55, 0.55, 0.55]} /><meshBasicMaterial color={routeColor} wireframe transparent opacity={routeOpacity * 1.5} /></mesh>
    </group>;
  } else if (page.startsWith("/checkout")) {
    motif = <group>
      <mesh position={[-4.2, 0.8, -5]}><torusKnotGeometry args={[0.8, 0.014, 72, 6, 2, 3]} /><meshBasicMaterial color={routeColor} transparent opacity={routeOpacity} /></mesh>
      <mesh position={[4.3, -1.4, -6]} rotation={[1.2, 0.4, 0]}><torusGeometry args={[1.1, 0.012, 6, 64]} /><meshBasicMaterial color={dark ? "#e9a8ff" : "#d0ae74"} transparent opacity={routeOpacity * 1.6} /></mesh>
    </group>;
  } else if (page.startsWith("/wishlist")) {
    motif = <group>
      <Float speed={0.5} rotationIntensity={0.18} floatIntensity={0.28}>
        <mesh position={[-4.1, 0.9, -5]} rotation={[0.2, 0.3, 0]}><dodecahedronGeometry args={[1.05, 1]} /><meshBasicMaterial color={dark ? "#fb7185" : "#c85f8b"} wireframe transparent opacity={routeOpacity * 1.7} /></mesh>
      </Float>
      <mesh position={[4.3, -1.2, -6]} rotation={[1.1, 0.2, 0]}><torusGeometry args={[1.1, 0.018, 8, 72]} /><meshBasicMaterial color={dark ? "#e9a8ff" : "#bb8b7a"} transparent opacity={routeOpacity * 1.8} /></mesh>
      <mesh position={[3.2, 1.7, -5]}><octahedronGeometry args={[0.34, 0]} /><meshBasicMaterial color={dark ? "#fb7185" : "#cf7896"} wireframe transparent opacity={routeOpacity * 2} /></mesh>
    </group>;
  } else if (page.startsWith("/shop") || page.startsWith("/category") || page.startsWith("/collection")) {
    motif = <group>
      <Float speed={0.42} rotationIntensity={0.1} floatIntensity={0.22}><mesh position={[-4.2, 1.1, -5]}><octahedronGeometry args={[1.05, 1]} /><meshBasicMaterial color={routeColor} wireframe transparent opacity={routeOpacity * 1.7} /></mesh></Float>
      <mesh position={[4.35, -1.25, -6]} rotation={[0.35, 0.6, 0.2]}><torusKnotGeometry args={[0.82, 0.014, 72, 6, 2, 3]} /><meshBasicMaterial color={dark ? "#d7b4ff" : "#d0ad6f"} transparent opacity={routeOpacity * 1.6} /></mesh>
      <mesh position={[3.1, 1.7, -5]} rotation={[0.3, 0.2, 0]}><icosahedronGeometry args={[0.36, 0]} /><meshBasicMaterial color={routeColor} wireframe transparent opacity={routeOpacity * 2} /></mesh>
    </group>;
  } else if (page.startsWith("/products/")) {
    motif = <group>
      <mesh position={[-4.3, 1.2, -5]}><icosahedronGeometry args={[1.15, 1]} /><meshBasicMaterial color={routeColor} wireframe transparent opacity={routeOpacity * 1.4} /></mesh>
      <mesh position={[4.5, -1.5, -6]} rotation={[0.4, 0.6, 0.2]}><torusGeometry args={[1, 0.016, 8, 72]} /><meshBasicMaterial color={dark ? "#d8b4fe" : "#ccb982"} transparent opacity={routeOpacity * 1.7} /></mesh>
    </group>;
  } else if (page.startsWith("/new-arrivals")) {
    motif = <group>
      <Float speed={0.65} rotationIntensity={0.12} floatIntensity={0.2}><mesh position={[-4.2, 1, -5]}><octahedronGeometry args={[1.25, 0]} /><meshBasicMaterial color={routeColor} wireframe transparent opacity={routeOpacity * 1.5} /></mesh></Float>
      <mesh position={[4.2, -1.4, -6]}><torusGeometry args={[1.15, 0.012, 8, 80]} /><meshBasicMaterial color={dark ? "#d7b4ff" : "#d0ad6f"} transparent opacity={routeOpacity * 1.8} /></mesh>
    </group>;
  } else if (page.startsWith("/search")) {
    motif = <group>
      <Float speed={0.55} rotationIntensity={0.16} floatIntensity={0.26}><mesh position={[-4.3, 1.2, -5]}><tetrahedronGeometry args={[1.08, 1]} /><meshBasicMaterial color={routeColor} wireframe transparent opacity={routeOpacity * 1.7} /></mesh></Float>
      <mesh position={[4.2, -1.3, -6]} rotation={[0.6, 0.2, 0.4]}><torusKnotGeometry args={[0.72, 0.014, 72, 6, 3, 5]} /><meshBasicMaterial color={dark ? "#d7b4ff" : routeColor} transparent opacity={routeOpacity * 1.6} /></mesh>
    </group>;
  } else if (page.startsWith("/profile") || page.startsWith("/orders") || page.startsWith("/track-order")) {
    motif = <group>
      <Float speed={0.38} rotationIntensity={0.12} floatIntensity={0.2}><mesh position={[-4.2, 1.1, -5]}><octahedronGeometry args={[1.05, 0]} /><meshBasicMaterial color={routeColor} wireframe transparent opacity={routeOpacity * 1.6} /></mesh></Float>
      <mesh position={[4.3, -1.3, -6]} rotation={[0.4, 0.8, 0]}><torusGeometry args={[1.05, 0.016, 8, 64]} /><meshBasicMaterial color={routeColor} transparent opacity={routeOpacity * 1.4} /></mesh>
    </group>;
  } else {
    motif = <group>
      <mesh position={[-4.2, 1.2, -5]} scale={1.35}><icosahedronGeometry args={[1, 1]} /><meshBasicMaterial color={routeColor} wireframe transparent opacity={routeOpacity} /></mesh>
      <mesh position={[4.4, -1.6, -6]} scale={1.8}><torusGeometry args={[1, 0.008, 6, 72]} /><meshBasicMaterial color={dark ? "#c084fc" : "#c9b17a"} transparent opacity={routeOpacity * 1.3} /></mesh>
    </group>;
  }

  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
      <pointsMaterial ref={particles} color="#6d28d9" size={0.068} transparent opacity={0.7} sizeAttenuation depthWrite={false} />
      </points>
      <mesh position={[-2.65, 1.15, -4.2]} rotation={[0.72, 0.25, 0.42]}>
        <torusGeometry args={[0.82, 0.018, 8, 96]} />
        <meshBasicMaterial ref={violetRingMaterial} color="#5b21b6" transparent opacity={0.52} toneMapped={false} />
      </mesh>
      <mesh position={[2.72, -1.1, -4.8]} rotation={[0.35, 0.84, 0.16]}>
        <torusGeometry args={[1.02, 0.015, 8, 96]} />
        <meshBasicMaterial ref={goldRingMaterial} color="#b77905" transparent opacity={0.44} toneMapped={false} />
      </mesh>
      <mesh position={[2.2, 1.55, -5]} rotation={[0.8, 0.1, 0.65]}>
        <torusGeometry args={[0.44, 0.012, 8, 72]} />
        <meshBasicMaterial ref={accentRingMaterial} color="#8b5cf6" transparent opacity={0.46} toneMapped={false} />
      </mesh>
      {motif}
    </group>
  );
}

export default function AmbientScene({ route = "/" }) {
  const { theme } = useStore();
  const dark = theme === "dark";
  const [compact] = useState(() => typeof window !== "undefined" && window.matchMedia("(max-width: 640px)").matches);
  const count = compact ? 64 : 150;
  return (
    <div className="ambient-scene" aria-hidden="true">
      <Canvas dpr={compact ? [1, 1.25] : [1, 1.5]} camera={{ position: [0, 0, 5], fov: 48 }} gl={{ alpha: true, antialias: true, powerPreference: "low-power" }}>
        <DriftField dark={dark} count={count} route={route} />
      </Canvas>
    </div>
  );
}
