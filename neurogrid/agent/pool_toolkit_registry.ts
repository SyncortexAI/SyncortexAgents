import { toolkitBuilder } from "@/ai/core"
import { FETCH_POOL_DATA_KEY } from "@/ai/modules/liquidity/pool-fetcher/key"
import { ANALYZE_POOL_HEALTH_KEY } from "@/ai/modules/liquidity/health-checker/key"
import { FetchPoolDataAction } from "@/ai/modules/liquidity/pool-fetcher/action"
import { AnalyzePoolHealthAction } from "@/ai/modules/liquidity/health-checker/action"

type Toolkit = ReturnType<typeof toolkitBuilder>

/**
 * Toolkit exposing liquidity-related actions:
 * – fetch raw pool data
 * – run health / risk analysis on a liquidity pool
 * – extended with retry & logging wrappers
 */
function withRetryAndLogging<T extends object>(action: T, id: string): Toolkit {
  const wrapped = toolkitBuilder(action)
  return {
    ...wrapped,
    async execute(args: any) {
      let attempt = 0
      const maxRetries = 2
      while (true) {
        try {
          const start = Date.now()
          const result = await (wrapped as any).execute(args)
          console.debug(`[${id}] executed in ${Date.now() - start}ms`)
          return result
        } catch (err) {
          attempt++
          console.warn(`[${id}] failed attempt ${attempt}`, (err as Error).message)
          if (attempt >= maxRetries) throw err
        }
      }
    },
  } as Toolkit
}

export const LIQUIDITY_ANALYSIS_TOOLS: Record<string, Toolkit> = Object.freeze({
  [`liquidityscan-${FETCH_POOL_DATA_KEY}`]: withRetryAndLogging(
    new FetchPoolDataAction(),
    `liquidityscan-${FETCH_POOL_DATA_KEY}`
  ),
  [`poolhealth-${ANALYZE_POOL_HEALTH_KEY}`]: withRetryAndLogging(
    new AnalyzePoolHealthAction(),
    `poolhealth-${ANALYZE_POOL_HEALTH_KEY}`
  ),
})

export function listLiquidityToolKeys(): string[] {
  return Object.keys(LIQUIDITY_ANALYSIS_TOOLS)
}
