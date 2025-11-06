"use client"

import { useState, useEffect } from "react"
import { getStats, getTrendData, getSeverityData, getSourceData } from "@/lib/api"
import { StatsCard } from "@/components/dashboard/stats-card"
import { ThreatTrendChart } from "@/components/dashboard/threat-trend-chart"
import { SeverityChart } from "@/components/dashboard/severity-chart"
import { SourceChart } from "@/components/dashboard/source-chart"
import { AIForecastChart } from "@/components/dashboard/ai-forecast-chart"
import { AlertCircle, TrendingUp, Activity } from "lucide-react"

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [trendData, setTrendData] = useState([])
  const [severityData, setSeverityData] = useState([])
  const [sourceData, setSourceData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [trendDateRange, setTrendDateRange] = useState<{startDate?: string, endDate?: string}>({})

  const loadTrendData = async (startDate?: string, endDate?: string) => {
    try {
      if (startDate && endDate) {
        // Calculate days between dates
        const start = new Date(startDate)
        const end = new Date(endDate)
        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
        const trend = await getTrendData(days, startDate, endDate)
        setTrendData(trend)
      } else {
        // Default to 180 days (6 months)
        const trend = await getTrendData(180)
        setTrendData(trend)
      }
    } catch (error) {
      console.error('Failed to load trend data:', error)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        // Load all data in parallel
        const [statsData, severity, sources] = await Promise.all([
          getStats(),
          getSeverityData(),
          getSourceData()
        ])
        setStats(statsData)
        setSeverityData(severity)
        setSourceData(sources)
        
        // Load trend data separately with date range support
        await loadTrendData(trendDateRange.startDate, trendDateRange.endDate)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
        setError('Backend is not running. Please start the backend server on port 8000.')
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  // Reload trend data when date range changes
  useEffect(() => {
    if (trendDateRange.startDate && trendDateRange.endDate) {
      loadTrendData(trendDateRange.startDate, trendDateRange.endDate)
    } else if (!trendDateRange.startDate && !trendDateRange.endDate && Object.keys(trendDateRange).length > 0) {
      // Reset to default when cleared (only if it was previously set)
      loadTrendData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trendDateRange.startDate, trendDateRange.endDate])

  const handleTrendDateRangeChange = (startDate: string, endDate: string) => {
    if (startDate && endDate) {
      setTrendDateRange({ startDate, endDate })
    } else {
      setTrendDateRange({})
    }
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="fade-in">
        <h1 className="text-4xl font-bold text-foreground mb-2">Threat Intelligence Dashboard</h1>
        <p className="text-muted-foreground">Real-time AI-powered threat analysis and forecasting</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
          <p className="font-semibold">⚠️ Backend Connection Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

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
          <ThreatTrendChart data={trendData} onDateRangeChange={handleTrendDateRangeChange} />
        </div>
        <div>
          <SeverityChart data={severityData} />
        </div>
      </div>

      {/* Source Chart */}
      <div>
        <SourceChart data={sourceData} />
      </div>

      {/* AI Forecast Chart */}
      <div>
        <AIForecastChart />
      </div>
    </div>
  )
}
