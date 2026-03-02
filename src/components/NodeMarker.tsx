"use client";

import { Html } from "@react-three/drei";

interface NodeMarkerProps {
  position: [number, number, number];
  name: string;
  color: string;
}

export default function NodeMarker({ position, name, color }: NodeMarkerProps) {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
        />
      </mesh>
      <Html center position={[0, 0.38, 0]} style={{ pointerEvents: "none" }}>
        <div
          style={{
            color: "#ffffff",
            fontSize: "9px",
            whiteSpace: "nowrap",
            textAlign: "center",
            textShadow: "0 0 6px rgba(0,0,0,1), 0 0 12px rgba(0,0,0,0.8)",
            opacity: 0.9,
            userSelect: "none",
          }}
        >
          {name}
        </div>
      </Html>
    </group>
  );
}
