"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import Crystal from "./Crystal";
import NodeMarker from "./NodeMarker";
import FloatingIsland from "./FloatingIsland";
import { AnimatedBeam } from "./AnimatedBeam";
import ParticleField from "./ParticleField";
import { Fund, FilterState, ASSET_CLASS_COLORS } from "@/types/fund";

// ── Plane Y levels ────────────────────────────────────────────────────────────
const Y_ISSUER = 0;
const Y_CRYSTAL = 3.5;
const Y_PROVIDER = 7;
const Y_CHAIN = 14;

// ── Circle radii ─────────────────────────────────────────────────────────────
const R_ISSUER = 8;
const R_PROVIDER = 4;
const R_CHAIN = 6;

// ── Plane accent colours ──────────────────────────────────────────────────────
const COLOR_ISSUER = "#60a5fa";
const COLOR_PROVIDER = "#a78bfa";
const COLOR_CHAIN = "#34d399";

// ── Helpers ───────────────────────────────────────────────────────────────────
function circlePositions(n: number, radius: number, y: number): THREE.Vector3[] {
  return Array.from({ length: n }, (_, i) => {
    const angle = (i / n) * Math.PI * 2;
    return new THREE.Vector3(
      Math.cos(angle) * radius,
      y,
      Math.sin(angle) * radius
    );
  });
}

// Short display labels for long issuer names
const ISSUER_SHORT: Record<string, string> = {
  "UBS Asset Management": "UBS",
  "Apollo Global Management": "Apollo",
  "JPMorgan Chase": "JPMorgan",
  "Paxos Trust": "Paxos",
  "Backed Finance": "Backed",
  "Franklin Templeton": "Franklin T.",
  "Ondo Finance": "Ondo",
  "Hamilton Lane": "Hamilton L.",
  "Societe Generale": "SocGen",
};
function shortIssuer(name: string): string {
  return ISSUER_SHORT[name] ?? name;
}

function isFundFiltered(fund: Fund, filters: FilterState): boolean {
  if (filters.assetClasses.size > 0 && !filters.assetClasses.has(fund.assetClass))
    return true;
  if (
    filters.chains.size > 0 &&
    !fund.chains.some((c) => filters.chains.has(c))
  )
    return true;
  if (
    filters.providers.size > 0 &&
    !filters.providers.has(fund.tokenizationProvider)
  )
    return true;
  return false;
}

// ── Sweeping spotlight ────────────────────────────────────────────────────────
function SpotlightSweep() {
  const lightRef = useRef<THREE.SpotLight>(null);
  useFrame((state) => {
    if (lightRef.current) {
      lightRef.current.position.x =
        Math.sin(state.clock.elapsedTime * 0.2) * 20;
      lightRef.current.position.z =
        Math.cos(state.clock.elapsedTime * 0.2) * 20;
    }
  });
  return (
    <spotLight
      ref={lightRef}
      position={[20, 20, 20]}
      color="#ffffff"
      intensity={1.5}
      angle={0.3}
      penumbra={1}
      distance={60}
    />
  );
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface SceneProps {
  funds: Fund[];
  selectedFund: Fund | null;
  filters: FilterState;
  onSelectFund: (fund: Fund | null) => void;
}

interface Connection {
  start: THREE.Vector3;
  end: THREE.Vector3;
  color: string;
}

// ── Main 3D content ───────────────────────────────────────────────────────────
function SceneContent({ funds, selectedFund, filters, onSelectFund }: SceneProps) {
  // Extract unique names preserving insertion order
  const issuers = useMemo(() => {
    const seen = new Set<string>();
    funds.forEach((f) => seen.add(f.issuer));
    return Array.from(seen);
  }, [funds]);

  const providers = useMemo(() => {
    const seen = new Set<string>();
    funds.forEach((f) => seen.add(f.tokenizationProvider));
    return Array.from(seen);
  }, [funds]);

  const chains = useMemo(() => {
    const seen = new Set<string>();
    funds.forEach((f) => f.chains.forEach((c) => seen.add(c)));
    return Array.from(seen);
  }, [funds]);

  // Per-chain AUM totals
  const chainAUM = useMemo<Record<string, number>>(() => {
    const totals: Record<string, number> = {};
    funds.forEach((fund) => {
      fund.chains.forEach((chain) => {
        totals[chain] = (totals[chain] || 0) + fund.aum;
      });
    });
    return totals;
  }, [funds]);

  // Circle positions for each plane
  const issuerPositions = useMemo<Record<string, THREE.Vector3>>(() => {
    const positions = circlePositions(issuers.length, R_ISSUER, Y_ISSUER);
    return Object.fromEntries(issuers.map((name, i) => [name, positions[i]]));
  }, [issuers]);

  const providerPositions = useMemo<Record<string, THREE.Vector3>>(() => {
    const positions = circlePositions(providers.length, R_PROVIDER, Y_PROVIDER);
    return Object.fromEntries(providers.map((name, i) => [name, positions[i]]));
  }, [providers]);

  const chainPositions = useMemo<Record<string, THREE.Vector3>>(() => {
    const positions = circlePositions(chains.length, R_CHAIN, Y_CHAIN);
    return Object.fromEntries(chains.map((name, i) => [name, positions[i]]));
  }, [chains]);

  // Crystal positions — near issuer XZ, fanned if multiple funds per issuer
  const crystalPositions = useMemo<THREE.Vector3[]>(() => {
    const fundsByIssuer: Record<string, Fund[]> = {};
    funds.forEach((f) => {
      if (!fundsByIssuer[f.issuer]) fundsByIssuer[f.issuer] = [];
      fundsByIssuer[f.issuer].push(f);
    });

    return funds.map((fund) => {
      const issuerPos = issuerPositions[fund.issuer];
      const issuerAngle = Math.atan2(issuerPos.z, issuerPos.x);
      const group = fundsByIssuer[fund.issuer];
      const idx = group.indexOf(fund);
      const total = group.length;

      const fanOffset = total > 1 ? (idx / (total - 1)) * 1.6 - 0.8 : 0;
      const perpAngle = issuerAngle + Math.PI / 2;

      const baseRadius = R_ISSUER * 0.6;
      const cx =
        Math.cos(issuerAngle) * baseRadius +
        Math.cos(perpAngle) * fanOffset;
      const cz =
        Math.sin(issuerAngle) * baseRadius +
        Math.sin(perpAngle) * fanOffset;

      return new THREE.Vector3(cx, Y_CRYSTAL, cz);
    });
  }, [funds, issuerPositions]);

  // All connection lines: issuer→crystal, crystal→provider, provider→chain(s)
  const connections = useMemo<Connection[]>(() => {
    return funds.flatMap((fund, i) => {
      const crystal = crystalPositions[i];
      const issuerPos = issuerPositions[fund.issuer];
      const providerPos = providerPositions[fund.tokenizationProvider];
      const color = ASSET_CLASS_COLORS[fund.assetClass];

      const lines: Connection[] = [
        { start: issuerPos, end: crystal, color },
        { start: crystal, end: providerPos, color },
      ];

      fund.chains.forEach((chain) => {
        const chainPos = chainPositions[chain];
        if (chainPos) lines.push({ start: providerPos, end: chainPos, color });
      });

      return lines;
    });
  }, [funds, crystalPositions, issuerPositions, providerPositions, chainPositions]);

  return (
    <>
      <color attach="background" args={["#00010a"]} />
      {/* Atmospheric fog */}
      <fog attach="fog" args={["#00010a", 30, 100]} />

      {/* Background sky sphere */}
      <mesh scale={[-120, -120, -120]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#00010a" side={THREE.BackSide} />
      </mesh>

      {/* ── Dramatic lighting ──────────────────────────────────────────────── */}
      <ambientLight intensity={0.15} />
      {/* Deep blue from below */}
      <pointLight position={[0, -5, 0]} color="#1e40af" intensity={3} distance={25} />
      {/* Purple from mid */}
      <pointLight position={[0, 7, 0]} color="#7c3aed" intensity={2} distance={20} />
      {/* Green from top — chain plane */}
      <pointLight position={[0, 18, 0]} color="#065f46" intensity={3} distance={25} />
      {/* Sweeping spotlight */}
      <SpotlightSweep />

      <ParticleField />

      {/* ── Issuer nodes ──────────────────────────────────────────────────── */}
      {issuers.map((name) => {
        const p = issuerPositions[name];
        return (
          <NodeMarker
            key={`issuer-${name}`}
            position={[p.x, p.y, p.z]}
            name={shortIssuer(name)}
            color={COLOR_ISSUER}
          />
        );
      })}

      {/* ── Provider nodes ────────────────────────────────────────────────── */}
      {providers.map((name) => {
        const p = providerPositions[name];
        return (
          <NodeMarker
            key={`provider-${name}`}
            position={[p.x, p.y, p.z]}
            name={name}
            color={COLOR_PROVIDER}
          />
        );
      })}

      {/* ── Chain islands ─────────────────────────────────────────────────── */}
      {chains.map((name, i) => {
        const p = chainPositions[name];
        return (
          <FloatingIsland
            key={`chain-${name}`}
            position={[p.x, p.y, p.z]}
            chainName={name}
            chainAUM={chainAUM[name] || 0}
            index={i}
          />
        );
      })}

      {/* ── Animated particle beams ───────────────────────────────────────── */}
      {connections.map((conn, i) => (
        <AnimatedBeam
          key={i}
          start={conn.start}
          end={conn.end}
          color={conn.color}
        />
      ))}

      {/* ── Fund crystals ─────────────────────────────────────────────────── */}
      {funds.map((fund, i) => {
        const cp = crystalPositions[i];
        return (
          <Crystal
            key={fund.id}
            fund={fund}
            position={[cp.x, cp.y, cp.z]}
            isSelected={selectedFund?.id === fund.id}
            isFiltered={isFundFiltered(fund, filters)}
            onClick={() => {
              onSelectFund(selectedFund?.id === fund.id ? null : fund);
            }}
          />
        );
      })}

      <OrbitControls
        target={[0, 7, 0]}
        enablePan={false}
        minDistance={8}
        maxDistance={45}
        autoRotate
        autoRotateSpeed={0.4}
        enableDamping
        dampingFactor={0.05}
      />

      {/* ── Post-processing ───────────────────────────────────────────────── */}
      <EffectComposer>
        <Bloom
          intensity={1.5}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.3} darkness={0.6} />
      </EffectComposer>
    </>
  );
}

// ── Canvas wrapper ────────────────────────────────────────────────────────────
export default function Scene(props: SceneProps) {
  return (
    <Canvas
      camera={{ position: [15, 10, 15], fov: 60 }}
      gl={{ antialias: true, alpha: false }}
      style={{ background: "#00010a" }}
    >
      <Suspense fallback={null}>
        <SceneContent {...props} />
      </Suspense>
    </Canvas>
  );
}
