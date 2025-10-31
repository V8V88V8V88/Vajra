"use client"

import { useState, useEffect } from "react"
import { getStats, mockTrendData, mockSeverityData, mockSourceData } from "@/lib/api"
import { StatsCard } from "@/components/dashboard/stats-card"
import { ThreatTrendChart } from "@/components/dashboard/threat-trend-chart"
import { SeverityChart } from "@/components/dashboard/severity-chart"
import { SourceChart } from "@/components/dashboard/source-chart"
import { AlertCircle, TrendingUp, Activity } from "lucide-react"

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      setIsLoading(true)
      const data = await getStats()
      setStats(data)
      setIsLoading(false)
    }
    loadStats()
  }, [])

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="fade-in">
        <h1 className="text-4xl font-bold text-foreground mb-2">Threat Intelligence Dashboard</h1>
        <p className="text-muted-foreground">Real-time AI-powered threat analysis and forecasting</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="transition-smooth hover:scale-105">
          <StatsCard
            title="Total Threats"
            value={stats?.totalThreats || 0}
            icon={AlertCircle}
            trend={12}
            color="primary"
            loading={isLoading}
          />
        </div>
        <div className="transition-smooth hover:scale-105">
          <StatsCard
            title="Critical Threats"
            value={stats?.criticalThreats || 0}
            icon={TrendingUp}
            trend={-5}
            color="destructive"
            loading={isLoading}
          />
        </div>
        <div className="transition-smooth hover:scale-105">
          <StatsCard
            title="Active Campaigns"
            value={stats?.activeCampaigns || 0}
            icon={Activity}
            trend={8}
            color="accent"
            loading={isLoading}
          />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ThreatTrendChart data={mockTrendData} />
        </div>
        <div>
          <SeverityChart data={mockSeverityData} />
        </div>
      </div>

      {/* Source Chart */}
      <div>
        <SourceChart data={mockSourceData} />
      </div>
    </div>
  )
}
