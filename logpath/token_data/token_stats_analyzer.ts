export interface TokenDataPoint {
  timestamp: number
  priceUsd: number
  volumeUsd: number
  marketCapUsd: number
}

export interface TokenStatsSummary {
  symbol: string
  count: number
  avgPrice: number
  avgVolume: number
  avgMarketCap: number
  minPrice: number
  maxPrice: number
}

export class TokenDataFetcher {
  constructor(private apiBase: string, private timeoutMs: number = 10000) {}

  private async fetchWithTimeout(url: string): Promise<Response> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.timeoutMs)
    try {
      return await fetch(url, { signal: controller.signal })
    } finally {
      clearTimeout(timer)
    }
  }

  /**
   * Fetches an array of TokenDataPoint for the given token symbol.
   * Expects endpoint: `${apiBase}/tokens/${symbol}/history`
   */
  async fetchHistory(symbol: string): Promise<TokenDataPoint[]> {
    const url = `${this.apiBase}/tokens/${encodeURIComponent(symbol)}/history`
    const res = await this.fetchWithTimeout(url)
    if (!res.ok) throw new Error(`Failed to fetch history for ${symbol}: ${res.status}`)
    const raw = (await res.json()) as any[]
    return raw.map(r => ({
      timestamp: r.time * 1000,
      priceUsd: Number(r.priceUsd),
      volumeUsd: Number(r.volumeUsd),
      marketCapUsd: Number(r.marketCapUsd),
    }))
  }

  /**
   * Compute a statistical summary for a token symbol
   */
  async fetchSummary(symbol: string): Promise<TokenStatsSummary> {
    const data = await this.fetchHistory(symbol)
    if (!data.length) {
      return {
        symbol,
        count: 0,
        avgPrice: 0,
        avgVolume: 0,
        avgMarketCap: 0,
        minPrice: 0,
        maxPrice: 0,
      }
    }
    const sumPrice = data.reduce((s, d) => s + d.priceUsd, 0)
    const sumVolume = data.reduce((s, d) => s + d.volumeUsd, 0)
    const sumMcap = data.reduce((s, d) => s + d.marketCapUsd, 0)
    return {
      symbol,
      count: data.length,
      avgPrice: Math.round((sumPrice / data.length) * 100) / 100,
      avgVolume: Math.round((sumVolume / data.length) * 100) / 100,
      avgMarketCap: Math.round((sumMcap / data.length) * 100) / 100,
      minPrice: Math.min(...data.map(d => d.priceUsd)),
      maxPrice: Math.max(...data.map(d => d.priceUsd)),
    }
  }
}
