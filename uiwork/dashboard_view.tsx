import React from "react"
import SentimentGauge from "./SentimentGauge"
import AssetOverviewPanel from "./AssetOverviewPanel"

interface DashboardCardProps {
  title: string
  children: React.ReactNode
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, children }) => (
  <div className="p-4 bg-white rounded shadow flex flex-col">
    <h2 className="text-lg font-semibold mb-3">{title}</h2>
    <div className="flex-1">{children}</div>
  </div>
)

// Temporary stub for whale tracking until implemented
const WhaleTrackerCard: React.FC = () => (
  <DashboardCard title="Whale Tracker">
    <p className="text-gray-600 text-sm">Tracking large wallet movements...</p>
  </DashboardCard>
)

export const AnalyticsDashboard: React.FC = () => {
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <header className="mb-8">
        <h1 className="text-4xl font-bold">Analytics Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Real-time insights across sentiment, assets, and whale activity
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardCard title="Sentiment Gauge">
          <SentimentGauge symbol="SOL" />
        </DashboardCard>

        <DashboardCard title="Asset Overview">
          <AssetOverviewPanel assetId="SOL-01" />
        </DashboardCard>

        <WhaleTrackerCard />
      </div>
    </div>
  )
}

export default AnalyticsDashboard
