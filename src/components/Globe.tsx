"use client"

import { useRef } from "react"
import { useLoader, useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { Html } from "@react-three/drei"
import { GLOBE_RADIUS, CHAIN_DATA, chainCentroids, getChainScale } from "./globeConstants"

function ChainMarker({ position, color, name, tvl }: { position: THREE.Vector3; color: string; name: string; tvl: number }) {
  const ringRef = useRef<THREE.Mesh>(null)
  const scale = getChainScale(tvl)
  useFrame((state) => {
    if (!ringRef.current) return
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.3
    ringRef.current.scale.set(pulse, pulse, pulse)
    // Always face outward from globe center
    ringRef.current.lookAt(position.clone().multiplyScalar(2))
  })
  return (
    <group position={[position.x, position.y, position.z]}>
      {/* Pulsing ring */}
      <mesh ref={ringRef} scale={scale}>
        <ringGeometry args={[0.03, 0.05, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>
      {/* Center dot */}
      <mesh scale={scale}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.5} />
      </mesh>
      {/* Label */}
      <Html position={[0, 0.12 * scale, 0]} center>
        <div style={{ color, fontSize: '9px', fontWeight: 700, whiteSpace: 'nowrap',
                      textShadow: '0 0 6px rgba(0,0,0,0.9)', pointerEvents: 'none' }}>
          {name}
        </div>
      </Html>
    </group>
  )
}

interface GlobeProps {
  chainTVL?: Record<string, number>
}

export default function Globe({ chainTVL = {} }: GlobeProps) {
  const earthTexture = useLoader(THREE.TextureLoader, 'https://unpkg.com/three-globe/example/img/earth-dark.jpg')
  const bumpMap = useLoader(THREE.TextureLoader, 'https://unpkg.com/three-globe/example/img/earth-topology.png')

  return (
    <group>
      {/* Earth sphere with real texture */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshStandardMaterial
          map={earthTexture}
          bumpMap={bumpMap}
          bumpScale={0.05}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>

      {/* Atmosphere glow */}
      <mesh scale={1.02}>
        <sphereGeometry args={[GLOBE_RADIUS, 32, 32]} />
        <meshStandardMaterial color="#4488ff" transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>

      {/* Chain markers at real geographic positions */}
      {Object.entries(chainCentroids).map(([name, pos]) => (
        <ChainMarker
          key={name}
          position={pos}
          color={CHAIN_DATA[name].color}
          name={name}
          tvl={chainTVL[name] ?? CHAIN_DATA[name].aum}
        />
      ))}
    </group>
  )
}
