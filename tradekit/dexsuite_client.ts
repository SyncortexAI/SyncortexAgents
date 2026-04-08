export interface PairInfo {
  exchange: string
  pairAddress: string
  baseSymbol: string
  quoteSymbol: string
  liquidityUsd: number
  volume24hUsd: number
  priceUsd: number
}

export interface DexSuiteConfig {
  apis: Array<{ name: string; baseUrl: string; apiKey?: string }>
  timeoutMs?: number
  enableLogging?: boolean
}

export interface PairComparison {
  bestVolume?: PairInfo
  bestLiquidity?: PairInfo
  allExchanges: PairInfo[]
  failedExchanges: string[]
}

export class DexSuite {
  constructor(private config: DexSuiteConfig) {}

  private log(message: string, ...args: any[]): void {
    if (this.config.enableLogging) {
      console.log(`[DexSuite] ${message}`, ...args)
    }
  }

  private async fetchFromApi<T>(
    api: { name: string; baseUrl: string; apiKey?: string },
    path: string
  ): Promise<T> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.config.timeoutMs ?? 10000)

    try {
      const res = await fetch(`${api.baseUrl}${path}`, {
        headers: api.apiKey ? { Authorization: `Bearer ${api.apiKey}` } : {},
        signal: controller.signal,
      })
      if (!res.ok) {
        throw new Error(`${api.name} ${path} ${res.status}`)
      }
      return (await res.json()) as T
    } finally {
      clearTimeout(timer)
    }
  }

  /**
   * Retrieve aggregated pair info across all configured DEX APIs.
   */
  async getPairInfo(pairAddress: string): Promise<{ results: PairInfo[]; failed: string[] }> {
    const results: PairInfo[] = []
    const failed: string[] = []

    const tasks = this.config.apis.map(async api => {
      try {
        const data = await this.fetchFromApi<any>(api, `/pair/${pairAddress}`)
        const info: PairInfo = {
          exchange: api.name,
          pairAddress,
          baseSymbol: data.token0.symbol,
          quoteSymbol: data.token1.symbol,
          liquidityUsd: Number(data.liquidityUsd),
          volume24hUsd: Number(data.volume24hUsd),
          priceUsd: Number(data.priceUsd),
        }
        results.push(info)
      } catch (err: any) {
        failed.push(api.name)
        this.log(`API failed for ${api.name}: ${err.message}`)
      }
    })

    await Promise.all(tasks)
    return { results, failed }
  }

  /**
   * Compare pairs across all exchanges and return best volume & liquidity.
   */
  async comparePairs(
    pairs: string[]
  ): Promise<Record<string, PairComparison>> {
    const comparison: Record<string, PairComparison> = {}

    for (const addr of pairs) {
      const { results, failed } = await this.getPairInfo(addr)

      if (!results.length) {
        comparison[addr] = {
          bestVolume: undefined,
          bestLiquidity: undefined,
          allExchanges: [],
          failedExchanges: failed,
        }
        continue
      }

      const bestVolume = results.reduce((a, b) =>
        b.volume24hUsd > a.volume24hUsd ? b : a
      )
      const bestLiquidity = results.reduce((a, b) =>
        b.liquidityUsd > a.liquidityUsd ? b : a
      )

      comparison[addr] = {
        bestVolume,
        bestLiquidity,
        allExchanges: results,
        failedExchanges: failed,
      }
    }

    return comparison
  }
}
