"use client"

import { useState, useEffect } from "react"
import { getStats, getTrendData, getSeverityData, getSourceData } from "@/lib/api"
import { StatsCard } from "@/components/dashboard/stats-card"
import { ThreatTrendChart } from "@/components/dashboard/threat-trend-chart"
import { SeverityChart } from "@/components/dashboard/severity-chart"
import { SourceChart } from "@/components/dashboard/source-chart"
import { AIForecastChart } from "@/components/dashboard/ai-forecast-chart"
import { SeverityForecastChart } from "@/components/dashboard/severity-forecast-chart"
import { SourcesForecastChart } from "@/components/dashboard/sources-forecast-chart"
import { AlertCircle, TrendingUp, Activity } from "lucide-react"
import type { DateRangeType } from "@/components/ui/date-range-selector"

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [trendData, setTrendData] = useState([])
  const [severityData, setSeverityData] = useState([])
  const [sourceData, setSourceData] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [trendDateRange, setTrendDateRange] = useState<DateRangeType>("6months")
  const [trendCustomStart, setTrendCustomStart] = useState<string>("")
  const [trendCustomEnd, setTrendCustomEnd] = useState<string>("")
  const [sourceDateRange, setSourceDateRange] = useState<DateRangeType>("6months")
  const [sourceCustomStart, setSourceCustomStart] = useState<string>("")
  const [sourceCustomEnd, setSourceCustomEnd] = useState<string>("")

  const loadTrendData = async (range: DateRangeType, startDate?: string, endDate?: string) => {
    try {
      let days = 180 // Default 6 months
      let customStart: string | undefined = undefined
      let customEnd: string | undefined = undefined

      if (range === "custom" && startDate && endDate) {
        customStart = startDate
        customEnd = endDate
        const start = new Date(startDate)
        const end = new Date(endDate)
        days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      } else {
        // Calculate days based on preset
        const end = new Date()
        const start = new Date()
        switch (range) {
          case "1month":
            start.setMonth(start.getMonth() - 1)
            days = 30
            break
          case "3months":
            start.setMonth(start.getMonth() - 3)
            days = 90
            break
          case "6months":
            start.setMonth(start.getMonth() - 6)
            days = 180
            break
          case "12months":
            start.setMonth(start.getMonth() - 12)
            days = 365
            break
        }
        customStart = start.toISOString().split('T')[0]
        customEnd = end.toISOString().split('T')[0]
      }

      const trend = await getTrendData(days, customStart, customEnd)
      setTrendData(trend)
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
        await loadTrendData(trendDateRange, trendCustomStart || undefined, trendCustomEnd || undefined)
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
    loadTrendData(trendDateRange, trendCustomStart || undefined, trendCustomEnd || undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trendDateRange, trendCustomStart, trendCustomEnd])

  const handleTrendDateRangeChange = (range: DateRangeType, startDate?: string, endDate?: string) => {
    setTrendDateRange(range)
    setTrendCustomStart(startDate || "")
    setTrendCustomEnd(endDate || "")
  }

  const handleSourceDateRangeChange = (range: DateRangeType, startDate?: string, endDate?: string) => {
    setSourceDateRange(range)
    setSourceCustomStart(startDate || "")
    setSourceCustomEnd(endDate || "")
    // TODO: Reload source data with date range filter when backend supports it
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="fade-in">
        <h1 className="text-4xl font-bold text-foreground mb-2">VAJRA Threat Intelligence Dashboard</h1>
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
        <SourceChart data={sourceData} onDateRangeChange={handleSourceDateRangeChange} />
      </div>

      {/* AI Forecast Charts */}
      <div className="space-y-6">
        <AIForecastChart />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SeverityForecastChart />
          <SourcesForecastChart />
        </div>
      </div>
    </div>
  )
}
