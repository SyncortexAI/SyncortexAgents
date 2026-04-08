export interface PricePoint {
  timestamp: number
  priceUsd: number
}

export interface TrendResult {
  startTime: number
  endTime: number
  trend: "upward" | "downward" | "neutral"
  changePct: number
  duration: number
  startPrice: number
  endPrice: number
}

/**
 * Analyze a series of price points to determine overall trend segments
 * Adds duration, start/end price, and filters small/noise moves.
 */
export function analyzePriceTrends(
  points: PricePoint[],
  minSegmentLength: number = 5,
  minChangePct: number = 0.1
): TrendResult[] {
  const results: TrendResult[] = []
  if (points.length < minSegmentLength) return results

  let segStart = 0
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1].priceUsd
    const curr = points[i].priceUsd
    const direction = curr > prev ? 1 : curr < prev ? -1 : 0

    const isLast = i === points.length - 1
    const nextTurn =
      (direction === 1 && points[i + 1]?.priceUsd < curr) ||
      (direction === -1 && points[i + 1]?.priceUsd > curr)

    if (i - segStart >= minSegmentLength && (isLast || nextTurn)) {
      const start = points[segStart]
      const end = points[i]
      const rawChange = ((end.priceUsd - start.priceUsd) / start.priceUsd) * 100
      const changePct = Math.round(rawChange * 100) / 100

      if (Math.abs(changePct) >= minChangePct) {
        results.push({
          startTime: start.timestamp,
          endTime: end.timestamp,
          trend: changePct > 0 ? "upward" : changePct < 0 ? "downward" : "neutral",
          changePct,
          duration: end.timestamp - start.timestamp,
          startPrice: start.priceUsd,
          endPrice: end.priceUsd,
        })
      }

      segStart = i
    }
  }
  return results
}
