"use client";

import { useMemo } from "react";
import * as THREE from "three";

interface ConnectionLineProps {
  start: THREE.Vector3;
  end: THREE.Vector3;
  color: string;
}

export default function ConnectionLine({
  start,
  end,
  color,
}: ConnectionLineProps) {
  // Depend on primitive coordinates so geometry only rebuilds when values change,
  // not when parent creates new Vector3 references on re-render.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const lineObject = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints([start, end]);
    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.35,
    });
    return new THREE.Line(geo, mat);
  }, [start.x, start.y, start.z, end.x, end.y, end.z, color]);

  return <primitive object={lineObject} />;
}
