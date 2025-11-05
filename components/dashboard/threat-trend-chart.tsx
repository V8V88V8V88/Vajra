"use client"

import { useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Calendar, X } from "lucide-react"

interface TrendData {
  date: string
  threats: number
  critical: number
  high: number
}

interface ThreatTrendChartProps {
  data: TrendData[]
  onDateRangeChange?: (startDate: string, endDate: string) => void
}

export function ThreatTrendChart({ data, onDateRangeChange }: ThreatTrendChartProps) {
  const [showDateRange, setShowDateRange] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  
  // Debug: Log data to console
  if (data && data.length > 0) {
    const hasCritical = data.some(d => d.critical > 0)
    const hasHigh = data.some(d => d.high > 0)
    console.log('Trend chart data:', {
      totalPoints: data.length,
      hasCritical,
      hasHigh,
      sampleData: data.slice(0, 3),
      criticalValues: data.map(d => d.critical).filter(v => v > 0),
      highValues: data.map(d => d.high).filter(v => v > 0)
    })
  }
  
  const handleApplyDateRange = () => {
    if (startDate && endDate && new Date(startDate) <= new Date(endDate)) {
      onDateRangeChange?.(startDate, endDate)
      setShowDateRange(false)
    }
  }
  
  const handleClearDateRange = () => {
    setStartDate("")
    setEndDate("")
    onDateRangeChange?.("", "")
    setShowDateRange(false)
  }
  
  return (
    <div
      className="backdrop-blur-md border border-border bg-card dark:bg-gradient-to-br dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] rounded-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Threat Trend</h3>
        <div className="relative">
          <button
            onClick={() => setShowDateRange(!showDateRange)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors text-sm font-medium"
          >
            <Calendar className="w-4 h-4" />
            {startDate && endDate ? "Custom Range" : "Date Range"}
          </button>
          
          {showDateRange && (
            <div className="absolute right-0 top-full mt-2 z-10 bg-card border border-border rounded-lg p-4 shadow-lg min-w-[300px]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-foreground">Select Date Range</span>
                <button
                  onClick={() => setShowDateRange(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleApplyDateRange}
                    disabled={!startDate || !endDate || new Date(startDate) > new Date(endDate)}
                    className="flex-1 px-3 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Apply
                  </button>
                  {(startDate || endDate) && (
                    <button
                      onClick={handleClearDateRange}
                      className="px-3 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-accent/10 transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <defs>
            <linearGradient id="threatsGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity={1} />
              <stop offset="50%" stopColor="#0ea5e9" stopOpacity={1} />
              <stop offset="100%" stopColor="#0284c7" stopOpacity={1} />
            </linearGradient>
            <linearGradient id="criticalGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f87171" stopOpacity={1} />
              <stop offset="50%" stopColor="#ef4444" stopOpacity={1} />
              <stop offset="100%" stopColor="#b91c1c" stopOpacity={1} />
            </linearGradient>
            <linearGradient id="highGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity={1} />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity={1} />
              <stop offset="100%" stopColor="#b45309" stopOpacity={1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-300 dark:stroke-slate-700" />
          <XAxis 
            dataKey="date" 
            className="text-slate-600 dark:text-slate-400" 
            style={{ fontSize: "12px" }}
            tick={{ fill: "currentColor" }}
          />
          <YAxis 
            className="text-slate-600 dark:text-slate-400" 
            style={{ fontSize: "12px" }}
            tick={{ fill: "currentColor" }}
            domain={[0, 'auto']}
            allowDataOverflow={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "hsl(var(--popover-foreground))" }}
            itemStyle={{ color: "hsl(var(--popover-foreground))" }}
          />
          <Legend wrapperStyle={{ color: "hsl(var(--foreground))" }} />
          <Line 
            type="monotone" 
            dataKey="threats" 
            stroke="url(#threatsGradient)" 
            strokeWidth={3} 
            dot={false}
            connectNulls={true}
            isAnimationActive={true}
            strokeOpacity={1}
          />
          <Line 
            type="monotone" 
            dataKey="critical" 
            stroke="#ef4444" 
            strokeWidth={2} 
            dot={false}
            connectNulls={true}
            isAnimationActive={true}
            strokeOpacity={1}
            name="critical"
            activeDot={{ r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="high" 
            stroke="#f59e0b" 
            strokeWidth={2} 
            dot={false}
            connectNulls={true}
            isAnimationActive={true}
            strokeOpacity={1}
            name="high"
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
