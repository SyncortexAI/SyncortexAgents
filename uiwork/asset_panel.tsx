import React, { useEffect, useState } from "react"

interface AssetOverviewPanelProps {
  assetId: string
}

interface AssetOverview {
  name: string
  priceUsd: number
  supply: number
  holders: number
}

type FetchState =
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "ready"; data: AssetOverview }

export const AssetOverviewPanel: React.FC<AssetOverviewPanelProps> = ({ assetId }) => {
  const [state, setState] = useState<FetchState>({ status: "loading" })

  async function fetchInfo() {
    try {
      const res = await fetch(`/api/assets/${assetId}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json: AssetOverview = await res.json()
      setState({ status: "ready", data: json })
    } catch (err: any) {
      setState({ status: "error", error: err.message })
    }
  }

  useEffect(() => {
    setState({ status: "loading" })
    fetchInfo()
  }, [assetId])

  if (state.status === "loading") {
    return <div className="p-4 text-gray-500">Loading asset overview...</div>
  }

  if (state.status === "error") {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded">
        <p className="font-semibold">Failed to load asset {assetId}</p>
        <p className="text-sm">{state.error}</p>
        <button
          onClick={fetchInfo}
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  const { name, priceUsd, supply, holders } = state.data

  return (
    <div className="p-4 bg-white rounded shadow space-y-1">
      <h2 className="text-xl font-semibold mb-3">Asset Overview</h2>
      <p><strong>ID:</strong> {assetId}</p>
      <p><strong>Name:</strong> {name}</p>
      <p><strong>Price (USD):</strong> ${priceUsd.toFixed(2)}</p>
      <p><strong>Circulating Supply:</strong> {supply.toLocaleString()}</p>
      <p><strong>Holders:</strong> {holders.toLocaleString()}</p>
    </div>
  )
}

export default AssetOverviewPanel
