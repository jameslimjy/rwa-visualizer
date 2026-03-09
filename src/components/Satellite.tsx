"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import { Html } from "@react-three/drei"
import * as THREE from "three"

// Shared edge geometry (created once, reused across instances)
const PANEL_EDGES_GEOM = new THREE.EdgesGeometry(new THREE.BoxGeometry(0.14, 0.001, 0.08))

interface SatelliteProps {
  position: THREE.Vector3
  name: string
  color: string
  isSelected: boolean
  orbitIndex: number
  onClick: () => void
}

export default function Satellite({ position, name, color, isSelected, orbitIndex, onClick }: SatelliteProps) {
  const groupRef = useRef<THREE.Group>(null)
  const panelRef1 = useRef<THREE.Mesh>(null)
  const panelRef2 = useRef<THREE.Mesh>(null)
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
    const y = orbitY + Math.sin(t * 0.5 + bobOffset) * 0.05
    groupRef.current.position.set(x, y, z)
    groupRef.current.lookAt(0, 0, 0)
    groupRef.current.rotateY(Math.PI)
    // Slow solar panel tracking rotation
    if (panelRef1.current) panelRef1.current.rotation.y = t * 0.3
    if (panelRef2.current) panelRef2.current.rotation.y = t * 0.3
  })

  const bodyColor = isSelected ? '#ffffff' : color
  const emissiveIntensity = isSelected ? 1.0 : 0.4

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]} onClick={onClick}>
      {/* Main satellite body — rectangular bus */}
      <mesh>
        <boxGeometry args={[0.08, 0.06, 0.12]} />
        <meshStandardMaterial
          color={bodyColor}
          emissive={bodyColor}
          emissiveIntensity={emissiveIntensity}
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>

      {/* Solar panel left — flat rectangular panel */}
      <group position={[-0.16, 0, 0]}>
        <mesh ref={panelRef1}>
          <boxGeometry args={[0.14, 0.001, 0.08]} />
          <meshStandardMaterial color="#1a3a6e" emissive="#003399" emissiveIntensity={0.5} roughness={0.1} metalness={0.9} />
        </mesh>
        {/* Panel frame */}
        <lineSegments geometry={PANEL_EDGES_GEOM}>
          <lineBasicMaterial color="#4488ff" transparent opacity={0.6} />
        </lineSegments>
      </group>

      {/* Panel connecting strut left — rotated group so cylinder lies along X */}
      <group position={[-0.09, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh>
          <cylinderGeometry args={[0.003, 0.003, 0.14, 4]} />
          <meshStandardMaterial color="#888" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* Solar panel right */}
      <group position={[0.16, 0, 0]}>
        <mesh ref={panelRef2}>
          <boxGeometry args={[0.14, 0.001, 0.08]} />
          <meshStandardMaterial color="#1a3a6e" emissive="#003399" emissiveIntensity={0.5} roughness={0.1} metalness={0.9} />
        </mesh>
        <lineSegments geometry={PANEL_EDGES_GEOM}>
          <lineBasicMaterial color="#4488ff" transparent opacity={0.6} />
        </lineSegments>
      </group>

      {/* Panel connecting strut right */}
      <group position={[0.09, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <mesh>
          <cylinderGeometry args={[0.003, 0.003, 0.14, 4]} />
          <meshStandardMaterial color="#888" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* Dish antenna group — pointing toward globe (+Z after lookAt+rotateY) */}
      <group position={[0, 0, 0.08]}>
        {/* Dish bowl — cone rotated to open forward */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.04, 0.025, 12, 1, true]} />
          <meshStandardMaterial color="#cccccc" metalness={0.9} roughness={0.1} side={THREE.DoubleSide} />
        </mesh>
        {/* Dish stem */}
        <group rotation={[Math.PI / 2, 0, 0]}>
          <mesh position={[0, -0.02, 0]}>
            <cylinderGeometry args={[0.003, 0.003, 0.03, 6]} />
            <meshStandardMaterial color="#aaa" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      </group>

      {/* Antenna rod on top */}
      <mesh position={[0, 0.055, 0]}>
        <cylinderGeometry args={[0.002, 0.002, 0.04, 4]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.0} />
      </mesh>
      {/* Antenna tip blinker */}
      <mesh position={[0, 0.078, 0]}>
        <sphereGeometry args={[0.007, 6, 6]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.0} />
      </mesh>

      {/* Label */}
      <Html position={[0, 0.14, 0]} center>
        <div style={{
          color: isSelected ? '#ffffff' : color,
          fontSize: '9px',
          fontWeight: 700,
          whiteSpace: 'nowrap',
          textShadow: '0 1px 4px rgba(0,0,0,0.9)',
          pointerEvents: 'none',
          letterSpacing: '0.5px',
        }}>
          {name}
        </div>
      </Html>
    </group>
  )
}
