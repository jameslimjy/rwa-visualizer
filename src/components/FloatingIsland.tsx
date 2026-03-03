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
  // bobGroup bobs up and down; outer group holds the scale
  const bobRef = useRef<THREE.Group>(null);
  const bobOffset = index * 1.1; // unique phase per island

  const scale = Math.log10(chainAUM / 1_000_000) * 0.4 + 0.8;

  const geometry = useMemo(() => createIslandGeometry(), []);

  useFrame((state) => {
    if (bobRef.current) {
      bobRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.5 + bobOffset) * 0.15;
    }
  });

  return (
    <group position={position} scale={scale}>
      {/* bobGroup: mesh + label move together */}
      <group ref={bobRef}>
        <mesh geometry={geometry} castShadow receiveShadow>
          <meshStandardMaterial
            color="#4a5568"
            roughness={0.9}
            metalness={0.05}
            emissive="#34d399"
            emissiveIntensity={0.08}
          />
        </mesh>
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
