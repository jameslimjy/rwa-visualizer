"use client"

import { useRef, useMemo, useState, useEffect } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"
import { Fund, ASSET_CLASS_COLORS } from "@/types/fund"

interface ArcBeamProps {
  fund: Fund
  chain: string
  satellitePos: THREE.Vector3
  chainPos: THREE.Vector3
  onHover: (data: { fund: Fund; chain: string } | null) => void
  onClick: () => void
}

function makeArc(from: THREE.Vector3, to: THREE.Vector3): THREE.QuadraticBezierCurve3 {
  const mid = from.clone().add(to).multiplyScalar(0.5)
  const elevation = Math.max(from.length(), to.length()) * 0.6
  mid.normalize().multiplyScalar(mid.length() + elevation)
  return new THREE.QuadraticBezierCurve3(from, mid, to)
}

const PARTICLE_COUNT = 4

export default function ArcBeam({
  fund,
  chain,
  satellitePos,
  chainPos,
  onHover,
  onClick,
}: ArcBeamProps) {
  const [hovered, setHovered] = useState(false)
  const color = ASSET_CLASS_COLORS[fund.assetClass]
  const thickness = Math.log10(fund.aum / 1_000_000) * 0.004 + 0.003

  const curve = useMemo(
    () => makeArc(satellitePos, chainPos),
    [satellitePos, chainPos]
  )

  const tubeGeo = useMemo(
    () => new THREE.TubeGeometry(curve, 40, thickness, 5, false),
    [curve, thickness]
  )

  // Imperative particle geometry — updated in useFrame
  const particleGeo = useMemo(() => {
    const g = new THREE.BufferGeometry()
    const arr = new Float32Array(PARTICLE_COUNT * 3)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const p = curve.getPoint(i / PARTICLE_COUNT)
      arr[i * 3] = p.x
      arr[i * 3 + 1] = p.y
      arr[i * 3 + 2] = p.z
    }
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3))
    return g
  }, [curve])

  // Dispose geometries on unmount
  useEffect(() => {
    return () => {
      tubeGeo.dispose()
      particleGeo.dispose()
    }
  }, [tubeGeo, particleGeo])

  const particleTs = useRef(
    Array.from({ length: PARTICLE_COUNT }, (_, i) => i / PARTICLE_COUNT)
  )

  useFrame((_, delta) => {
    const attr = particleGeo.getAttribute('position') as THREE.BufferAttribute
    if (!attr) return
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particleTs.current[i] = (particleTs.current[i] + delta * 0.3) % 1
      const p = curve.getPoint(particleTs.current[i])
      attr.setXYZ(i, p.x, p.y, p.z)
    }
    attr.needsUpdate = true
  })

  return (
    <group>
      <mesh
        geometry={tubeGeo}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHovered(true)
          onHover({ fund, chain })
        }}
        onPointerOut={() => {
          setHovered(false)
          onHover(null)
        }}
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
      >
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={hovered ? 2.0 : 0.7}
          transparent
          opacity={hovered ? 1.0 : 0.75}
        />
      </mesh>

      {/* Traveling particles */}
      <points geometry={particleGeo}>
        <pointsMaterial
          color={color}
          size={0.025}
          transparent
          opacity={0.9}
          sizeAttenuation
        />
      </points>
    </group>
  )
}
