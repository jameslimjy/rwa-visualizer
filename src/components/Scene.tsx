"use client"

import { Suspense, useMemo } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import Globe from "./Globe"
import Satellite from "./Satellite"
import ArcBeam from "./ArcBeam"
import { chainCentroids, fibonacciPoint } from "./globeConstants"
import { Fund, FilterState } from "@/types/fund"

const SATELLITE_ORBIT_RADIUS = 2.8

const INSTITUTION_COLORS = [
  '#FFB347', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE',
  '#85C1E9', '#F1948A', '#82E0AA', '#F8C471', '#AED6F1',
  '#A9DFBF', '#F9E79F', '#D7BDE2', '#A3E4D7', '#FAD7A0',
]

const SHORT_NAMES: Record<string, string> = {
  "UBS Asset Management": "UBS",
  "Apollo Global Management": "Apollo",
  "JPMorgan Chase": "JPMorgan",
  "Paxos Trust": "Paxos",
  "Backed Finance": "Backed",
  "Franklin Templeton": "Franklin T.",
  "Ondo Finance": "Ondo",
  "Hamilton Lane": "Hamilton L.",
  "Societe Generale": "SocGen",
}

function shortName(name: string): string {
  return SHORT_NAMES[name] ?? name
}

function isFundFiltered(fund: Fund, filters: FilterState): boolean {
  if (filters.assetClasses.size > 0 && !filters.assetClasses.has(fund.assetClass)) return true
  if (filters.chains.size > 0 && !fund.chains.some(c => filters.chains.has(c))) return true
  if (filters.providers.size > 0 && !filters.providers.has(fund.tokenizationProvider)) return true
  return false
}

interface SceneContentProps {
  funds: Fund[]
  filters: FilterState
  onSelectFund: (fund: Fund | null) => void
  onHoverFund: (data: { fund: Fund; chain: string } | null) => void
}

function SceneContent({ funds, filters, onSelectFund, onHoverFund }: SceneContentProps) {
  const uniqueIssuers = useMemo(() => {
    const seen = new Set<string>()
    funds.forEach(f => seen.add(f.issuer))
    return Array.from(seen)
  }, [funds])

  const issuerIndex = useMemo<Record<string, number>>(
    () => Object.fromEntries(uniqueIssuers.map((name, i) => [name, i])),
    [uniqueIssuers]
  )

  const satellitePositions = useMemo(
    () => uniqueIssuers.map((_, i) => fibonacciPoint(i, uniqueIssuers.length, SATELLITE_ORBIT_RADIUS)),
    [uniqueIssuers]
  )

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[5, 5, 5]} intensity={2} color="#4466ff" />
      <pointLight position={[-5, -3, -5]} intensity={1.5} color="#220044" />
      <pointLight position={[0, 8, 0]} intensity={1} color="#ffffff" />

      <Globe />

      {uniqueIssuers.map((issuer, i) => (
        <Satellite
          key={issuer}
          position={satellitePositions[i]}
          name={shortName(issuer)}
          color={INSTITUTION_COLORS[i % 20]}
          isSelected={false}
          orbitIndex={i}
          onClick={() => {}}
        />
      ))}

      {funds.flatMap(fund =>
        fund.chains.map(chain => {
          if (!chainCentroids[chain]) return null
          if (isFundFiltered(fund, filters)) return null
          const idx = issuerIndex[fund.issuer]
          if (idx === undefined || !satellitePositions[idx]) return null
          return (
            <ArcBeam
              key={`${fund.id}-${chain}`}
              fund={fund}
              chain={chain}
              satellitePos={satellitePositions[idx]}
              chainPos={chainCentroids[chain]}
              onHover={onHoverFund}
              onClick={() => onSelectFund(fund)}
            />
          )
        })
      )}

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        autoRotate
        autoRotateSpeed={0.3}
      />
      <Stars radius={100} depth={50} count={3000} factor={4} fade />
    </>
  )
}

interface SceneProps {
  funds: Fund[]
  selectedFund: Fund | null
  filters: FilterState
  onSelectFund: (fund: Fund | null) => void
  onHoverFund: (data: { fund: Fund; chain: string } | null) => void
}

export default function Scene({ funds, filters, onSelectFund, onHoverFund }: SceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 50 }}
      gl={{ antialias: true, alpha: false }}
      onCreated={({ gl }) => gl.setClearColor('#010a1a', 1)}
    >
      <Suspense fallback={null}>
        <SceneContent
          funds={funds}
          filters={filters}
          onSelectFund={onSelectFund}
          onHoverFund={onHoverFund}
        />
      </Suspense>
    </Canvas>
  )
}
