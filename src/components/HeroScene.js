"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, Sparkles, useTexture } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const BODY_LIGHT = new THREE.Color("#e5e5ee");
const BODY_GLOW_LIGHT = new THREE.Color("#6e3dbb");
const TRIM_LIGHT = new THREE.Color("#6322c0");
const LIGHT_DIRECTIONAL = new THREE.Color("#fff9ee");
const DARK_DIRECTIONAL = new THREE.Color("#ffffff");
const LIGHT_VIOLET = new THREE.Color("#6d28d9");
const DARK_VIOLET = new THREE.Color("#8b5cf6");
const LIGHT_GOLD = new THREE.Color("#edb62c");
const DARK_GOLD = new THREE.Color("#fff1d1");

function ThemeLighting({ dark }) {
  const ambient = useRef(null);
  const directional = useRef(null);
  const violet = useRef(null);
  const gold = useRef(null);

  useFrame((_, delta) => {
    const blend = 1 - Math.exp(-3.2 * delta);
    if (ambient.current) ambient.current.intensity += ((dark ? 1.75 : 2.35) - ambient.current.intensity) * blend;
    if (directional.current) {
      directional.current.color.lerp(dark ? DARK_DIRECTIONAL : LIGHT_DIRECTIONAL, blend);
      directional.current.intensity += ((dark ? 6.4 : 5.2) - directional.current.intensity) * blend;
    }
    if (violet.current) {
      violet.current.color.lerp(dark ? DARK_VIOLET : LIGHT_VIOLET, blend);
      violet.current.intensity += ((dark ? 14 : 22) - violet.current.intensity) * blend;
    }
    if (gold.current) {
      gold.current.color.lerp(dark ? DARK_GOLD : LIGHT_GOLD, blend);
      gold.current.intensity += ((dark ? 14 : 26) - gold.current.intensity) * blend;
    }
  });

  return (
    <>
      <ambientLight ref={ambient} intensity={2.35} />
      <directionalLight ref={directional} position={[3, 4, 5]} intensity={5.2} color={LIGHT_DIRECTIONAL} />
      <pointLight ref={violet} position={[-3, -1.5, 2]} intensity={22} color={LIGHT_VIOLET} />
      <pointLight ref={gold} position={[3, 2, -2]} intensity={26} color={LIGHT_GOLD} />
    </>
  );
}

function HeroParticles({ dark, reducedMotion }) {
  const speed = reducedMotion ? 0 : 1;
  return (
    <group>
      <Sparkles count={22} scale={[3.8, 4.2, 2.8]} size={3.1} speed={0.42 * speed} opacity={0.95} color={dark ? "#d8c4ff" : "#4c1d95"} noise={0.8} />
      <Sparkles count={14} scale={[3.7, 4.1, 2.5]} size={2.7} speed={0.58 * speed} opacity={0.9} color={dark ? "#ffe2a6" : "#ffb000"} noise={1.15} />
      <Sparkles count={16} scale={[3.9, 4.3, 2.6]} size={2.35} speed={0.34 * speed} opacity={0.88} color={dark ? "#b8a5ff" : "#4338ca"} noise={0.65} />
    </group>
  );
}

function LuxuryShoppingBag({ reducedMotion }) {
  const product = useRef(null);
  const elapsedTime = useRef(0);
  const bodyMaterial = useRef(null);
  const goldMaterial = useRef(null);
  const upperLeftTrimMaterial = useRef(null);
  const upperRightTrimMaterial = useRef(null);
  const lowerTrimMaterial = useRef(null);
  const lowerLeftStudMaterial = useRef(null);
  const lowerRightStudMaterial = useRef(null);
  const loadedLogoTexture = useTexture("/asian-store-light.webp");
  const logoTexture = useMemo(() => {
    const texture = loadedLogoTexture.clone();
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 8;
    texture.needsUpdate = true;
    return texture;
  }, [loadedLogoTexture]);
  const bodyGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-0.72, 0.72);
    shape.lineTo(0.72, 0.72);
    shape.lineTo(0.57, -0.7);
    shape.lineTo(-0.57, -0.7);
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, {
      depth: 0.42,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.045,
      bevelThickness: 0.045,
      curveSegments: 8,
    });
  }, []);

  useFrame((state, delta) => {
    if (!product.current) return;
    elapsedTime.current += delta;
    const pointerX = reducedMotion ? 0 : state.pointer.x;
    const pointerY = reducedMotion ? 0 : state.pointer.y;
    const time = elapsedTime.current;
    const damping = 1 - Math.exp(-4.5 * delta);
    product.current.rotation.y += (pointerX * 0.38 + (reducedMotion ? 0 : Math.sin(time * 0.42) * 0.075) - product.current.rotation.y) * damping;
    product.current.rotation.x += (-pointerY * 0.24 - product.current.rotation.x) * damping;
    product.current.rotation.z += ((reducedMotion ? 0 : Math.sin(time * 0.56) * 0.045) - product.current.rotation.z) * damping;
    product.current.position.y += ((reducedMotion ? 0 : Math.sin(time * 1.18) * 0.13 + pointerY * 0.08) - product.current.position.y) * damping;

    const blend = 1 - Math.exp(-3.2 * delta);
    if (bodyMaterial.current) {
      bodyMaterial.current.color.lerp(BODY_LIGHT, blend);
      bodyMaterial.current.emissive.lerp(BODY_GLOW_LIGHT, blend);
      bodyMaterial.current.emissiveIntensity += (0.08 - bodyMaterial.current.emissiveIntensity) * blend;
    }
    if (goldMaterial.current) {
      goldMaterial.current.color.lerp(TRIM_LIGHT, blend);
      goldMaterial.current.emissive.lerp(TRIM_LIGHT, blend);
      goldMaterial.current.emissiveIntensity += (0.16 - goldMaterial.current.emissiveIntensity) * blend;
    }
    [upperLeftTrimMaterial, upperRightTrimMaterial].forEach((material) => {
      if (!material.current) return;
      material.current.color.lerp(TRIM_LIGHT, blend);
      material.current.emissive.lerp(TRIM_LIGHT, blend);
      material.current.emissiveIntensity += (0.18 - material.current.emissiveIntensity) * blend;
    });
    [lowerTrimMaterial, lowerLeftStudMaterial, lowerRightStudMaterial].forEach((material) => {
      if (material.current) material.current.color.lerp(TRIM_LIGHT, blend);
    });
  });

  return (
    <group ref={product} scale={1.08}>
      <mesh castShadow geometry={bodyGeometry} position={[0, -0.08, -0.23]}>
        <meshPhysicalMaterial ref={bodyMaterial} color="#e5e5ee" roughness={0.32} metalness={0.42} clearcoat={1} clearcoatRoughness={0.18} emissive="#6e3dbb" emissiveIntensity={0.08} />
      </mesh>
      <mesh position={[0, 0.67, 0.22]}>
        <torusGeometry args={[0.3, 0.038, 12, 56, Math.PI]} />
        <meshPhysicalMaterial ref={goldMaterial} color="#6322c0" metalness={0.84} roughness={0.2} clearcoat={1} emissive="#6322c0" emissiveIntensity={0.16} />
      </mesh>
      <mesh position={[-0.28, 0.61, 0.22]}>
        <sphereGeometry args={[0.055, 18, 18]} />
        <meshStandardMaterial ref={upperLeftTrimMaterial} color="#6322c0" metalness={0.78} roughness={0.2} emissive="#6322c0" emissiveIntensity={0.18} />
      </mesh>
      <mesh position={[0.28, 0.61, 0.22]}>
        <sphereGeometry args={[0.055, 18, 18]} />
        <meshStandardMaterial ref={upperRightTrimMaterial} color="#6322c0" metalness={0.78} roughness={0.2} emissive="#6322c0" emissiveIntensity={0.18} />
      </mesh>
      <mesh position={[0, -0.06, 0.263]}>
        <planeGeometry args={[0.9, 0.9]} />
        <meshBasicMaterial map={logoTexture} transparent toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh position={[0, -0.73, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.54, 0.018, 8, 64]} />
        <meshStandardMaterial ref={lowerTrimMaterial} color="#6322c0" metalness={0.9} roughness={0.18} />
      </mesh>
      <mesh position={[-0.28, -0.74, 0.08]}><sphereGeometry args={[0.035, 12, 12]} /><meshStandardMaterial ref={lowerLeftStudMaterial} color="#6322c0" metalness={0.85} roughness={0.2} /></mesh>
      <mesh position={[0.28, -0.74, 0.08]}><sphereGeometry args={[0.035, 12, 12]} /><meshStandardMaterial ref={lowerRightStudMaterial} color="#6322c0" metalness={0.85} roughness={0.2} /></mesh>
    </group>
  );
}

export default function HeroScene({ reducedMotion = false, theme = "light", frameloop = "always" }) {
  const dark = theme === "dark";
  return (
    <div className="hero-scene hero-scene-canvas" aria-hidden="true">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0, 5], fov: 36 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        frameloop={frameloop}
      >
        <Environment resolution={256} environmentIntensity={1.55}>
          <Lightformer form="rect" intensity={5} position={[0, 4, -4]} scale={[8, 5, 1]} color="#fff8ee" />
          <Lightformer form="rect" intensity={5.5} position={[-4, 1, 1]} rotation={[0, Math.PI / 2, 0]} scale={[5, 3, 1]} color="#d8c4ff" />
          <Lightformer form="rect" intensity={4.5} position={[4, 0, 2]} rotation={[0, -Math.PI / 2, 0]} scale={[4, 5, 1]} color="#ffe2ad" />
        </Environment>
        <ThemeLighting dark={dark} />
        <LuxuryShoppingBag reducedMotion={reducedMotion} />
        <HeroParticles dark={dark} reducedMotion={reducedMotion} />
        <ContactShadows position={[0, -1.38, 0]} opacity={0.3} scale={4.2} blur={2.3} far={3.2} resolution={256} color={dark ? "#170b29" : "#41345e"} />
      </Canvas>
    </div>
  );
}
