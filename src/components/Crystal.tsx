"use client";

import { useRef, useState, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Fund, ASSET_CLASS_COLORS, getCrystalScale } from "@/types/fund";

interface CrystalProps {
  fund: Fund;
  position: [number, number, number];
  isSelected: boolean;
  isFiltered: boolean;
  onClick: () => void;
}

function createRockyCrystalGeometry(): THREE.BufferGeometry {
  const geo = new THREE.IcosahedronGeometry(1, 1);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const noise = (x: number, y: number, z: number) => {
    return (
      Math.sin(x * 2.3 + y * 1.7) * 0.08 +
      Math.sin(y * 3.1 + z * 2.0) * 0.06 +
      Math.sin(z * 1.9 + x * 2.8) * 0.07
    );
  };
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const d = noise(x, y, z);
    pos.setXYZ(i, x * (1 + d), y * (1 + d) * 1.4, z * (1 + d));
  }
  geo.computeVertexNormals();
  return geo;
}

export default function Crystal({
  fund,
  position,
  isSelected,
  isFiltered,
  onClick,
}: CrystalProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);

  const color = ASSET_CLASS_COLORS[fund.assetClass];
  const baseScale = getCrystalScale(fund.aum);

  const geometry = useMemo(() => createRockyCrystalGeometry(), []);

  const rotationSpeed = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < fund.id.length; i++) {
      hash = (hash << 5) - hash + fund.id.charCodeAt(i);
      hash |= 0;
    }
    return 0.003 + (Math.abs(hash) % 100) * 0.00005;
  }, [fund.id]);

  const rotationOffset = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < fund.id.length; i++) {
      hash = (hash << 5) - hash + fund.id.charCodeAt(i) * 31;
      hash |= 0;
    }
    return Math.abs(hash) % 628;
  }, [fund.id]);

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;
    const t = state.clock.elapsedTime;

    meshRef.current.rotation.y = t * rotationSpeed * 60 + rotationOffset * 0.01;
    meshRef.current.rotation.x = Math.sin(t * 0.3 + rotationOffset) * 0.15;

    // Floating bob
    meshRef.current.position.y =
      position[1] + Math.sin(t * 0.8 + rotationOffset) * 0.12;

    // Scale animation
    const targetScale = hovered
      ? baseScale * 1.1
      : isSelected
      ? baseScale * 1.05
      : baseScale;
    const currentScale = meshRef.current.scale.x;
    const newScale = currentScale + (targetScale - currentScale) * 0.1;
    meshRef.current.scale.set(newScale, newScale, newScale);

    // Opacity
    const targetOpacity = isFiltered ? 0.15 : 1;
    materialRef.current.opacity +=
      (targetOpacity - materialRef.current.opacity) * 0.08;

    // Emissive intensity
    const targetEmissive = isSelected ? 0.7 : hovered ? 0.5 : 0.25;
    materialRef.current.emissiveIntensity +=
      (targetEmissive - materialRef.current.emissiveIntensity) * 0.1;
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={[baseScale, baseScale, baseScale]}
      geometry={geometry}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "default";
      }}
    >
      <meshStandardMaterial
        ref={materialRef}
        color={color}
        emissive={color}
        emissiveIntensity={0.25}
        roughness={0.35}
        metalness={0.55}
        transparent
        opacity={1}
      />
    </mesh>
  );
}
