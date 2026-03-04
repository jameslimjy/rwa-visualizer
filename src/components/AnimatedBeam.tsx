"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface AnimatedBeamProps {
  start: THREE.Vector3;
  end: THREE.Vector3;
  color: string;
  speed?: number;
  particleCount?: number;
}

export function AnimatedBeam({
  start,
  end,
  color,
  speed = 0.4,
  particleCount = 8,
}: AnimatedBeamProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const timeRef = useRef(Math.random());

  // Static line geometry — declarative
  const linePositions = useMemo(() => {
    return new Float32Array([start.x, start.y, start.z, end.x, end.y, end.z]);
  }, [start.x, start.y, start.z, end.x, end.y, end.z]);

  // Particle positions buffer
  const particlePositions = useMemo(
    () => new Float32Array(particleCount * 3),
    [particleCount]
  );

  const offsets = useMemo(
    () => Array.from({ length: particleCount }, (_, i) => i / particleCount),
    [particleCount]
  );

  const lineCurve = useMemo(
    () => new THREE.LineCurve3(start.clone(), end.clone()),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [start.x, start.y, start.z, end.x, end.y, end.z]
  );

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    timeRef.current += delta * speed;
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    offsets.forEach((offset, i) => {
      const t = ((timeRef.current + offset) % 1 + 1) % 1;
      const pt = lineCurve.getPoint(t);
      posAttr.setXYZ(i, pt.x, pt.y, pt.z);
    });
    posAttr.needsUpdate = true;
  });

  const particleGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    return g;
  }, [particlePositions]);

  return (
    <group>
      {/* Static dim base line — fully declarative */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color={color} transparent opacity={0.18} />
      </line>
      {/* Traveling particles */}
      <points ref={pointsRef} geometry={particleGeo}>
        <pointsMaterial
          color={color}
          size={0.07}
          transparent
          opacity={0.85}
          sizeAttenuation
        />
      </points>
    </group>
  );
}
