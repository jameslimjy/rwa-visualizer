"use client"

import { useMemo } from "react"
import * as THREE from "three"
import { Html } from "@react-three/drei"
import { GLOBE_RADIUS, CHAIN_DATA, chainCentroids } from "./globeConstants"

function generateCountryDots(
  centroid: THREE.Vector3,
  dotCount: number,
  spreadAngle: number,
  radius: number
): THREE.Vector3[] {
  const dots: THREE.Vector3[] = []
  const up = centroid.clone().normalize()
  const perp1 = new THREE.Vector3(1, 0, 0)
  if (Math.abs(up.dot(perp1)) > 0.9) perp1.set(0, 1, 0)
  const tangent1 = up.clone().cross(perp1).normalize()
  const tangent2 = up.clone().cross(tangent1).normalize()

  // Deterministic pseudo-random (no Math.random so clusters are stable)
  const rng = (seed: number) => {
    const x = Math.sin(seed) * 43758.5453123
    return x - Math.floor(x)
  }

  for (let i = 0; i < dotCount; i++) {
    const r = Math.sqrt(rng(i * 2.3 + dotCount)) * spreadAngle
    const angle = rng(i * 5.7 + dotCount * 0.3) * Math.PI * 2
    const offset = tangent1.clone()
      .multiplyScalar(Math.sin(r) * Math.cos(angle))
      .add(tangent2.clone().multiplyScalar(Math.sin(r) * Math.sin(angle)))
    const dir = up.clone().add(offset).normalize()
    dots.push(dir.multiplyScalar(radius * 1.001))
  }
  return dots
}

export default function Globe() {
  const { dotsGeo } = useMemo(() => {
    const positions: number[] = []
    const colors: number[] = []

    for (const [name, { color, aum }] of Object.entries(CHAIN_DATA)) {
      const centroid = chainCentroids[name]
      const dotCount = Math.floor(Math.log10(aum / 1_000_000) * 30 + 20)
      const spreadAngle = 0.3 + Math.log10(aum / 10_000_000) * 0.08
      const dots = generateCountryDots(centroid, dotCount, spreadAngle, GLOBE_RADIUS)
      const c = new THREE.Color(color)
      for (const dot of dots) {
        positions.push(dot.x, dot.y, dot.z)
        colors.push(c.r, c.g, c.b)
      }
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
    geo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3))
    return { dotsGeo: geo }
  }, [])

  return (
    <group>
      {/* Dark base sphere */}
      <mesh>
        <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
        <meshStandardMaterial color="#050a1a" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Atmosphere glow — slightly larger, additive blue */}
      <mesh scale={1.04}>
        <sphereGeometry args={[GLOBE_RADIUS, 32, 32]} />
        <meshStandardMaterial
          color="#1a3a6e"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Country dot clusters */}
      <points geometry={dotsGeo}>
        <pointsMaterial
          size={0.018}
          vertexColors
          transparent
          opacity={0.9}
          sizeAttenuation
        />
      </points>

      {/* Chain name labels */}
      {Object.entries(chainCentroids).map(([name, pos]) => {
        const lp = pos.clone().normalize().multiplyScalar(GLOBE_RADIUS * 1.12)
        return (
          <Html key={name} position={[lp.x, lp.y, lp.z]} center>
            <div
              style={{
                color: CHAIN_DATA[name].color,
                fontSize: '10px',
                fontWeight: 700,
                textShadow: '0 0 6px currentColor',
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {name}
            </div>
          </Html>
        )
      })}
    </group>
  )
}
