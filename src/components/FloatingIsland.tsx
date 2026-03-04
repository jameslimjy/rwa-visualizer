"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { formatAUM } from "@/types/fund";

interface FloatingIslandProps {
  position: [number, number, number];
  chainName: string;
  chainAUM: number;
  index: number;
}

function createIslandGeometry(): THREE.BufferGeometry {
  const geo = new THREE.CylinderGeometry(0.9, 1.1, 0.45, 7, 3);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const isTop = y > 0.1;
    const strength = isTop ? 0.25 : 0.1;
    const disp =
      Math.sin(x * 3.1 + z * 2.3) * strength +
      Math.sin(z * 2.7 + x * 1.9) * strength * 0.7;
    pos.setXYZ(
      i,
      x + (isTop ? disp * 0.3 : 0),
      y + (isTop ? disp : 0),
      z + (isTop ? disp * 0.3 : 0)
    );
  }
  geo.computeVertexNormals();
  return geo;
}

export default function FloatingIsland({
  position,
  chainName,
  chainAUM,
  index,
}: FloatingIslandProps) {
  const bobRef = useRef<THREE.Group>(null);
  const haloRef = useRef<THREE.Group>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const bobOffset = index * 1.1;

  const scale = Math.log10(chainAUM / 1_000_000) * 0.4 + 0.8;

  const geometry = useMemo(() => createIslandGeometry(), []);

  // Seeded stalactite data — stable across re-renders
  const stalactites = useMemo(() => {
    return Array.from({ length: 4 }, (_, i) => {
      const seed = index * 7 + i * 13;
      const angle = (i / 4) * Math.PI * 2 + (seed % 50) * 0.01;
      const r = 0.3 + (seed % 5) * 0.1;
      const len = 0.2 + (seed % 4) * 0.1;
      return { angle, r, len };
    });
  }, [index]);

  // Halo particle ring
  const haloGeo = useMemo(() => {
    const count = 30;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const r = 1.6 + Math.sin(i * 2.3) * 0.35;
      const yOff = (Math.sin(i * 1.7) - 0.5) * 0.3;
      pos[i * 3] = Math.cos(angle) * r;
      pos[i * 3 + 1] = yOff;
      pos[i * 3 + 2] = Math.sin(angle) * r;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (bobRef.current) {
      bobRef.current.position.y = Math.sin(t * 0.5 + bobOffset) * 0.15;
    }
    if (haloRef.current) {
      haloRef.current.rotation.y = t * 0.15 + bobOffset;
    }
    if (lightRef.current) {
      lightRef.current.intensity = 0.5 + Math.sin(t * 1.5 + bobOffset) * 0.3;
    }
  });

  return (
    <group position={position} scale={scale}>
      {/* Pulsing underbelly light */}
      <pointLight
        ref={lightRef}
        position={[0, -0.5, 0]}
        color="#34d399"
        intensity={0.5}
        distance={4}
      />

      {/* Halo — slow-orbiting dust ring */}
      <group ref={haloRef}>
        <points geometry={haloGeo}>
          <pointsMaterial
            color="#34d399"
            size={0.04}
            transparent
            opacity={0.45}
            sizeAttenuation
          />
        </points>
      </group>

      {/* bobGroup: island body, terrain, stalactites, label */}
      <group ref={bobRef}>
        {/* Main rocky body */}
        <mesh geometry={geometry} castShadow receiveShadow>
          <meshStandardMaterial
            color="#2d3748"
            roughness={0.9}
            metalness={0.05}
            emissive="#34d399"
            emissiveIntensity={0.3}
          />
        </mesh>

        {/* Top terrain / moss layer */}
        <mesh position={[0, 0.27, 0]}>
          <cylinderGeometry args={[0.72, 0.85, 0.08, 7]} />
          <meshStandardMaterial
            color="#1a3a2a"
            roughness={0.85}
            metalness={0.0}
            emissive="#1a3a2a"
            emissiveIntensity={0.2}
          />
        </mesh>

        {/* Stalactites hanging below */}
        {stalactites.map((s, i) => (
          <mesh
            key={i}
            position={[
              Math.cos(s.angle) * s.r,
              -0.25 - s.len / 2,
              Math.sin(s.angle) * s.r,
            ]}
          >
            <coneGeometry args={[0.06, s.len, 5]} />
            <meshStandardMaterial color="#2d3748" roughness={0.95} />
          </mesh>
        ))}

        <Html position={[0, 0.8, 0]} center>
          <div style={{ textAlign: "center", pointerEvents: "none" }}>
            <div
              style={{
                color: "#34d399",
                fontSize: "11px",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {chainName}
            </div>
            <div style={{ color: "#9ca3af", fontSize: "9px" }}>
              {formatAUM(chainAUM)}
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
}
