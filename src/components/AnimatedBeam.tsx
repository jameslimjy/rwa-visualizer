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

  const { positions, offsets } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const offsets = Array.from(
      { length: particleCount },
      (_, i) => i / particleCount
    );
    return { positions, offsets };
  }, [particleCount]);

  const lineCurve = useMemo(
    () => new THREE.LineCurve3(start, end),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [start, end]
  );

  const staticLine = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints([start, end]);
    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.15,
    });
    return new THREE.Line(geo, mat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start.x, start.y, start.z, end.x, end.y, end.z, color]);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  useFrame((_, delta) => {
    timeRef.current += delta * speed;
    if (pointsRef.current) {
      const pos = pointsRef.current.geometry.attributes
        .position as THREE.BufferAttribute;
      offsets.forEach((offset, i) => {
        const t = ((timeRef.current + offset) % 1 + 1) % 1;
        const point = lineCurve.getPoint(t);
        pos.setXYZ(i, point.x, point.y, point.z);
      });
      pos.needsUpdate = true;
    }
  });

  return (
    <group>
      {/* Static dim base line */}
      <primitive object={staticLine} />
      {/* Traveling particles */}
      <points ref={pointsRef} geometry={geo}>
        <pointsMaterial
          color={color}
          size={0.06}
          transparent
          opacity={0.9}
          sizeAttenuation
        />
      </points>
    </group>
  );
}
