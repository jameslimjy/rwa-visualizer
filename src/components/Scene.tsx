"use client";

import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Crystal from "./Crystal";
import ParticleField from "./ParticleField";
import { Fund, FilterState } from "@/types/fund";

interface SceneProps {
  funds: Fund[];
  selectedFund: Fund | null;
  filters: FilterState;
  onSelectFund: (fund: Fund | null) => void;
}

function phyllotaxisPosition(index: number, total: number): [number, number, number] {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const t = index / total;
  const inclination = Math.acos(1 - 2 * t);
  const azimuth = goldenAngle * index;

  const radius = 7 + (index % 3) * 1.2;

  const x = radius * Math.sin(inclination) * Math.cos(azimuth);
  const y = (radius * 0.4) * Math.cos(inclination) * 0.8 + (index % 5) * 0.3 - 1;
  const z = radius * Math.sin(inclination) * Math.sin(azimuth);

  return [x, y, z];
}

function isFundFiltered(fund: Fund, filters: FilterState): boolean {
  if (filters.assetClasses.size > 0 && !filters.assetClasses.has(fund.assetClass)) {
    return true;
  }
  if (filters.chains.size > 0) {
    const hasChain = fund.chains.some((c) => filters.chains.has(c));
    if (!hasChain) return true;
  }
  if (filters.providers.size > 0 && !filters.providers.has(fund.tokenizationProvider)) {
    return true;
  }
  return false;
}

function SceneContent({
  funds,
  selectedFund,
  filters,
  onSelectFund,
}: SceneProps) {
  const positions = useMemo(
    () => funds.map((_, i) => phyllotaxisPosition(i, funds.length)),
    [funds]
  );

  return (
    <>
      <color attach="background" args={["#000000"]} />
      <ambientLight intensity={0.15} />
      <pointLight position={[10, 10, 10]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-10, -5, -10]} intensity={0.8} color="#4040ff" />
      <pointLight position={[0, 15, 0]} intensity={0.5} color="#00d4ff" />
      <pointLight position={[0, -15, 0]} intensity={0.3} color="#7c3aed" />

      <ParticleField />

      {funds.map((fund, i) => (
        <Crystal
          key={fund.id}
          fund={fund}
          position={positions[i]}
          isSelected={selectedFund?.id === fund.id}
          isFiltered={isFundFiltered(fund, filters)}
          onClick={() => {
            onSelectFund(selectedFund?.id === fund.id ? null : fund);
          }}
        />
      ))}

      <OrbitControls
        enablePan={false}
        minDistance={5}
        maxDistance={25}
        autoRotate
        autoRotateSpeed={0.4}
        enableDamping
        dampingFactor={0.05}
      />
    </>
  );
}

export default function Scene(props: SceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 3, 16], fov: 60 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: "#000000" }}
    >
      <Suspense fallback={null}>
        <SceneContent {...props} />
      </Suspense>
    </Canvas>
  );
}
