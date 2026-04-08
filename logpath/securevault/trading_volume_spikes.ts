export interface VolumePoint {
  timestamp: number
  volumeUsd: number
}

export interface SpikeEvent {
  timestamp: number
  volume: number
  spikeRatio: number
  avgWindow: number
  windowStart: number
  windowEnd: number
}

/**
 * Detects spikes in trading volume compared to a rolling average window.
 * Adds contextual info: avgWindow, windowStart, windowEnd.
 */
export function detectVolumeSpikes(
  points: VolumePoint[],
  windowSize: number = 10,
  spikeThreshold: number = 2.0,
  minVolumeUsd: number = 0
): SpikeEvent[] {
  const events: SpikeEvent[] = []
  if (points.length < windowSize) return events

  const volumes = points.map(p => p.volumeUsd)
  for (let i = windowSize; i < volumes.length; i++) {
    const window = volumes.slice(i - windowSize, i)
    const avg = window.reduce((sum, v) => sum + v, 0) / window.length
    const curr = volumes[i]
    if (curr < minVolumeUsd) continue

    const ratio = avg > 0 ? curr / avg : Infinity
    if (ratio >= spikeThreshold) {
      const startTs = points[i - windowSize].timestamp
      const endTs = points[i - 1].timestamp
      events.push({
        timestamp: points[i].timestamp,
        volume: curr,
        spikeRatio: Math.round(ratio * 100) / 100,
        avgWindow: Math.round(avg * 100) / 100,
        windowStart: startTs,
        windowEnd: endTs,
      })
    }
  }
  return events
}
