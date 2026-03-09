"use client"

import { useRef, Suspense } from "react"
import { useLoader, useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { Html } from "@react-three/drei"
import { GLOBE_RADIUS, CHAIN_DATA, chainCentroids, getChainScale } from "./globeConstants"

// Local texture in /public — no CORS issues, loads reliably
const EARTH_TEXTURE_URL = '/earth-color.jpg'

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

function GlobeInner({ chainTVL }: { chainTVL: Record<string, number> }) {
  const colorMap = useLoader(THREE.TextureLoader, EARTH_TEXTURE_URL)

  return (
    <>
      {/* Main Earth sphere — meshBasicMaterial renders texture at full brightness, unaffected by scene lighting */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshBasicMaterial map={colorMap} />
      </mesh>

      {/* Atmosphere glow — outer ring only (BackSide) */}
      <mesh scale={1.025}>
        <sphereGeometry args={[GLOBE_RADIUS, 32, 32]} />
        <meshStandardMaterial color="#3366cc" transparent opacity={0.12} side={THREE.BackSide} depthWrite={false} />
      </mesh>

      {/* Chain markers at real geographic positions */}
      {Object.entries(CHAIN_DATA).map(([name, data]) => {
        const pos = chainCentroids[name]
        if (!pos) return null
        return (
          <ChainMarker
            key={name}
            position={pos}
            color={data.color}
            name={name}
            tvl={chainTVL[name] || data.aum}
          />
        )
      })}
    </>
  )
}

interface GlobeProps {
  chainTVL?: Record<string, number>
}

export default function Globe({ chainTVL = {} }: GlobeProps) {
  return (
    <Suspense fallback={
      // Blue-ish sphere shown while textures load
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, 32, 32]} />
        <meshStandardMaterial color="#0d2044" roughness={0.8} />
      </mesh>
    }>
      <GlobeInner chainTVL={chainTVL} />
    </Suspense>
  )
}
