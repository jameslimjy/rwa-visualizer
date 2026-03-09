import { NextResponse } from 'next/server'

// Real TVL from RWA.xyz league table (March 2026)
const CHAIN_TVL: Record<string, number> = {
  'Ethereum':  15300000000,
  'Solana':    1700000000,
  'Stellar':   1300000000,
  'Arbitrum':  822000000,
  'Avalanche': 587000000,
  'Polygon':   469000000,
  'Base':      350000000,
  'Aptos':     330000000,
  'Hedera':    80000000,
  'Tron':      60000000,
  'Optimism':  70000000,
}

export async function GET() {
  return NextResponse.json(CHAIN_TVL)
}
