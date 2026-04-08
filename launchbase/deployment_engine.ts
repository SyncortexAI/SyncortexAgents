export interface LaunchConfig {
  contractName: string
  parameters: Record<string, any>
  deployEndpoint: string
  apiKey?: string
  retries?: number
  timeoutMs?: number
}

export interface LaunchResult {
  success: boolean
  address?: string
  transactionHash?: string
  error?: string
  elapsedMs?: number
  attempt?: number
}

export class LaunchNode {
  constructor(private config: LaunchConfig) {}

  private async fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    try {
      return await fetch(url, { ...options, signal: controller.signal })
    } finally {
      clearTimeout(timer)
    }
  }

  async deploy(): Promise<LaunchResult> {
    const { deployEndpoint, apiKey, contractName, parameters } = this.config
    const retries = this.config.retries ?? 1
    const timeoutMs = this.config.timeoutMs ?? 15000

    for (let attempt = 1; attempt <= retries; attempt++) {
      const start = Date.now()
      try {
        const res = await this.fetchWithTimeout(
          deployEndpoint,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
            },
            body: JSON.stringify({ contractName, parameters }),
          },
          timeoutMs
        )
        if (!res.ok) {
          const text = await res.text()
          return {
            success: false,
            error: `HTTP ${res.status}: ${text}`,
            attempt,
            elapsedMs: Date.now() - start,
          }
        }
        const json = await res.json()
        return {
          success: true,
          address: json.contractAddress,
          transactionHash: json.txHash,
          attempt,
          elapsedMs: Date.now() - start,
        }
      } catch (err: any) {
        if (attempt >= retries) {
          return {
            success: false,
            error: err.message,
            attempt,
            elapsedMs: Date.now() - start,
          }
        }
      }
    }

    return { success: false, error: "Unknown error after retries" }
  }
}
