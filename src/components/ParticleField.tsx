"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface LayerProps {
  count: number;
  size: number;
  speed: number;
  color: string;
  axis: "y" | "x" | "z";
  driftPhase: number;
}

function ParticleLayer({ count, size, speed, color, axis, driftPhase }: LayerProps) {
  const ref = useRef<THREE.Points>(null);

  const { geo, mat } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 70;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const m = new THREE.PointsMaterial({
      size,
      color,
      transparent: true,
      opacity: 0.4,
      sizeAttenuation: true,
    });
    return { geo: g, mat: m };
  }, [count, size, color]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    if (axis === "y") {
      ref.current.rotation.y = t * speed;
      ref.current.rotation.x = Math.sin(t * 0.07 + driftPhase) * 0.08;
    } else if (axis === "x") {
      ref.current.rotation.x = t * speed;
      ref.current.rotation.z = Math.sin(t * 0.05 + driftPhase) * 0.06;
    } else {
      ref.current.rotation.z = t * speed;
      ref.current.rotation.y = Math.sin(t * 0.06 + driftPhase) * 0.07;
    }
  });

  return <points ref={ref} geometry={geo} material={mat} />;
}

export default function ParticleField() {
  return (
    <>
      {/* Large slow purple particles */}
      <ParticleLayer
        count={1000}
        size={0.04}
        speed={0.03}
        color="#7c3aed"
        axis="y"
        driftPhase={0}
      />
      {/* Medium-speed blue particles */}
      <ParticleLayer
        count={1500}
        size={0.025}
        speed={0.06}
        color="#93c5fd"
        axis="x"
        driftPhase={1.2}
      />
      {/* Small fast near-white particles */}
      <ParticleLayer
        count={500}
        size={0.06}
        speed={0.015}
        color="#e2e8f0"
        axis="z"
        driftPhase={2.5}
      />
    </>
  );
}
