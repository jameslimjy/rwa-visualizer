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

  // Unique rotation speed per fund based on id hash
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

    // Gentle rotation
    meshRef.current.rotation.y = t * rotationSpeed * 60 + rotationOffset * 0.01;
    meshRef.current.rotation.x = Math.sin(t * 0.3 + rotationOffset) * 0.15;

    // Floating bob
    meshRef.current.position.y =
      position[1] + Math.sin(t * 0.8 + rotationOffset) * 0.12;

    // Scale animation
    const targetScale = hovered ? baseScale * 1.1 : isSelected ? baseScale * 1.05 : baseScale;
    const currentScale = meshRef.current.scale.x;
    const newScale = currentScale + (targetScale - currentScale) * 0.1;
    meshRef.current.scale.set(newScale, newScale * 2.2, newScale);

    // Opacity
    const targetOpacity = isFiltered ? 0.18 : 1;
    materialRef.current.opacity += (targetOpacity - materialRef.current.opacity) * 0.08;

    // Emissive intensity
    const targetEmissive = isSelected ? 0.7 : hovered ? 0.5 : 0.25;
    materialRef.current.emissiveIntensity +=
      (targetEmissive - materialRef.current.emissiveIntensity) * 0.1;
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={[baseScale, baseScale * 2.2, baseScale]}
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
      <octahedronGeometry args={[0.5, 0]} />
      <meshStandardMaterial
        ref={materialRef}
        color={color}
        emissive={color}
        emissiveIntensity={0.25}
        roughness={0.1}
        metalness={0.8}
        transparent
        opacity={1}
      />
    </mesh>
  );
}
