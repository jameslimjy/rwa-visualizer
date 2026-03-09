import { NextResponse } from 'next/server'
import fundsStatic from '@/data/funds.json'

// Map our fund IDs to RWA.xyz tickers
const FUND_TICKER_MAP: Record<string, string> = {
  'buidl':    'BUIDL',
  'benji':    'BENJI',
  'ousg':     'OUSG',
  'fobxx':    'FDIT',
  'wtgov':    'WTGXX',
  'ustb':     'USTB',
  'stbt':     'STBT',
  'paxg':     'PAXG',
  'xaut':     'XAUT',
  'hamilton-lane-scope': 'HLSCOPE',
  'apollo':   'ACRED',
}

const RWA_CATEGORIES = ['treasuries', 'institutional-funds', 'commodities', 'credit', 'government-bonds']

export async function GET() {
  try {
    // Step 1: get build ID from homepage
    const homeHtml = await fetch('https://app.rwa.xyz', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      next: { revalidate: 3600 },
    }).then(r => r.text())

    const buildMatch = homeHtml.match(/\/_next\/data\/([^/]+)\//)
    if (!buildMatch) throw new Error('Could not extract build ID')
    const buildId = buildMatch[1]

    // Step 2: fetch all category data
    const allFunds: Record<string, number> = {}
    await Promise.all(RWA_CATEGORIES.map(async (cat) => {
      try {
        const url = `https://app.rwa.xyz/_next/data/${buildId}/${cat}.json`
        const data = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          next: { revalidate: 3600 },
        }).then(r => r.json())
        const results = data?.pageProps?.listQueryResponse?.results || []
        results.forEach((f: { ticker?: string; total_asset_value_dollar?: { val?: number } }) => {
          const aum = f.total_asset_value_dollar?.val
          if (f.ticker && aum && aum > 0) {
            allFunds[f.ticker.toUpperCase()] = Math.round(aum)
          }
        })
      } catch (_) {}
    }))

    // Step 3: merge into our static fund data
    const funds = (fundsStatic as { id: string; name?: string; aum: number }[]).map(fund => {
      const ticker = FUND_TICKER_MAP[fund.id] || fund.name?.toUpperCase()
      const liveAum = ticker ? allFunds[ticker] : undefined
      return {
        ...fund,
        aum: liveAum && liveAum > 0 ? liveAum : fund.aum,
        dataSource: liveAum && liveAum > 0 ? 'rwa.xyz' : 'static',
      }
    })

    return NextResponse.json({ funds, fetchedAt: new Date().toISOString() })
  } catch (_e) {
    // Fallback to static
    return NextResponse.json({ funds: fundsStatic, fetchedAt: null })
  }
}
