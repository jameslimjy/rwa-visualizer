"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import * as THREE from "three"

interface SatelliteProps {
  position: THREE.Vector3
  name: string
  color: string
  isSelected: boolean
  orbitIndex: number
  onClick: () => void
}

export default function Satellite({
  position,
  name,
  color,
  isSelected,
  orbitIndex,
  onClick,
}: SatelliteProps) {
  const groupRef = useRef<THREE.Group>(null)
  const bobOffset = useMemo(() => Math.random() * Math.PI * 2, [])
  const orbitAngle = useRef(Math.atan2(position.z, position.x))
  const orbitRadius = useMemo(
    () => Math.sqrt(position.x * position.x + position.z * position.z),
    [position]
  )
  const orbitY = position.y
  const orbitSpeed = 0.02 + orbitIndex * 0.001

  useFrame((state, delta) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    orbitAngle.current += delta * orbitSpeed
    const x = Math.cos(orbitAngle.current) * orbitRadius
    const z = Math.sin(orbitAngle.current) * orbitRadius
    const y = orbitY + Math.sin(t * 0.6 + bobOffset) * 0.04
    groupRef.current.position.set(x, y, z)
    groupRef.current.lookAt(0, 0, 0)
    groupRef.current.rotateY(Math.PI)
  })

  return (
    <group
      ref={groupRef}
      position={[position.x, position.y, position.z]}
      onClick={onClick}
    >
      {/* Body — slightly squashed */}
      <mesh scale={[1, 0.85, 1]}>
        <sphereGeometry args={[0.09, 20, 20]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 0.8 : 0.4}
          roughness={0.3}
        />
      </mesh>

      {/* Left eye white */}
      <mesh position={[-0.035, 0.02, 0.075]}>
        <sphereGeometry args={[0.022, 10, 10]} />
        <meshBasicMaterial color="white" />
      </mesh>
      {/* Right eye white */}
      <mesh position={[0.035, 0.02, 0.075]}>
        <sphereGeometry args={[0.022, 10, 10]} />
        <meshBasicMaterial color="white" />
      </mesh>

      {/* Left pupil */}
      <mesh position={[-0.035, 0.02, 0.093]}>
        <sphereGeometry args={[0.01, 8, 8]} />
        <meshBasicMaterial color="#111" />
      </mesh>
      {/* Right pupil */}
      <mesh position={[0.035, 0.02, 0.093]}>
        <sphereGeometry args={[0.01, 8, 8]} />
        <meshBasicMaterial color="#111" />
      </mesh>

      {/* Antenna stem */}
      <mesh position={[0, 0.115, 0]}>
        <cylinderGeometry args={[0.004, 0.004, 0.055, 6]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* Antenna tip — glowing */}
      <mesh position={[0, 0.148, 0]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.0} />
      </mesh>

      {/* Label */}
      <Html position={[0, -0.14, 0]} center>
        <div
          style={{
            color: 'white',
            fontSize: '9px',
            whiteSpace: 'nowrap',
            textShadow: '0 1px 3px rgba(0,0,0,0.8)',
            pointerEvents: 'none',
            fontWeight: 600,
          }}
        >
          {name}
        </div>
      </Html>
    </group>
  )
}
