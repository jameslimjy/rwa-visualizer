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

const chainNames = Object.keys(CHAIN_DATA)
export const chainCentroids: Record<string, THREE.Vector3> = {}
chainNames.forEach((name, i) => {
  chainCentroids[name] = fibonacciPoint(i, chainNames.length, GLOBE_RADIUS)
})
