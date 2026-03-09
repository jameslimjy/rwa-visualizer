import * as THREE from 'three'

export const GLOBE_RADIUS = 1.8

export const CHAIN_DATA: Record<string, { color: string; aum: number }> = {
  'Ethereum':  { color: '#627EEA', aum: 1_800_000_000 },
  'Polygon':   { color: '#8247E5', aum: 250_000_000 },
  'Stellar':   { color: '#00B4D8', aum: 420_000_000 },
  'Solana':    { color: '#9945FF', aum: 80_000_000 },
  'Avalanche': { color: '#E84142', aum: 180_000_000 },
  'Arbitrum':  { color: '#28A0F0', aum: 120_000_000 },
  'Optimism':  { color: '#FF0420', aum: 90_000_000 },
  'Base':      { color: '#0052FF', aum: 110_000_000 },
  'Aptos':     { color: '#00D4AA', aum: 70_000_000 },
  'Hedera':    { color: '#00A67E', aum: 30_000_000 },
  'Tron':      { color: '#FF060A', aum: 60_000_000 },
}

export function getChainScale(tvl: number): number {
  if (!tvl || tvl <= 0) return 0.5
  return Math.log10(tvl / 1_000_000) * 0.15 + 0.4
}

// Keep fibonacciPoint for satellite orbit placement
export function fibonacciPoint(i: number, n: number, radius: number): THREE.Vector3 {
  const golden = (1 + Math.sqrt(5)) / 2
  const theta = Math.acos(1 - (2 * i) / n)
  const phi = (2 * Math.PI * i) / golden
  return new THREE.Vector3(
    radius * Math.sin(theta) * Math.cos(phi),
    radius * Math.cos(theta),
    radius * Math.sin(theta) * Math.sin(phi)
  )
}

// Convert lat/lng to 3D position on sphere
export function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}

// Real geographic locations for each blockchain (HQ/founding team location)
export const CHAIN_LOCATIONS: Record<string, { lat: number; lng: number }> = {
  'Ethereum':  { lat: 47.1,   lng: 8.5    }, // Zug, Switzerland (Ethereum Foundation)
  'Polygon':   { lat: 12.97,  lng: 77.59  }, // Bangalore, India
  'Avalanche': { lat: 40.71,  lng: -74.01 }, // New York, USA (Ava Labs)
  'Solana':    { lat: 37.77,  lng: -122.42 }, // San Francisco, USA
  'Arbitrum':  { lat: 41.88,  lng: -87.63 }, // Chicago, USA (Offchain Labs)
  'Optimism':  { lat: 37.77,  lng: -122.42 }, // San Francisco, USA
  'Stellar':   { lat: 37.77,  lng: -122.42 }, // San Francisco, USA (SDF)
  'Base':      { lat: 37.77,  lng: -122.42 }, // San Francisco, USA (Coinbase)
  'Aptos':     { lat: 37.33,  lng: -121.89 }, // Santa Clara, USA
  'Hedera':    { lat: 32.78,  lng: -96.80  }, // Dallas, USA
  'Tron':      { lat: 22.32,  lng: 114.17  }, // Hong Kong
}

export const chainCentroids: Record<string, THREE.Vector3> = {}
Object.entries(CHAIN_LOCATIONS).forEach(([name, { lat, lng }]) => {
  chainCentroids[name] = latLngToVector3(lat, lng, GLOBE_RADIUS)
})
