"use client"

import { useState, useMemo } from "react"
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Calendar, X } from "lucide-react"

interface TrendData {
  date: string
  threats: number
  critical: number
  high: number
  medium: number
  low: number
}

interface ThreatTrendChartProps {
  data: TrendData[]
  onDateRangeChange?: (startDate: string, endDate: string) => void
}

export function ThreatTrendChart({ data, onDateRangeChange }: ThreatTrendChartProps) {
  const [showDateRange, setShowDateRange] = useState(false)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  
  // Calculate max values for scaling - use single scale for all metrics
  const { maxValue } = useMemo(() => {
    const threats = Math.max(...(data.map(d => d.threats || 0)), 1)
    const critical = Math.max(...(data.map(d => d.critical || 0)), 1)
    const high = Math.max(...(data.map(d => d.high || 0)), 1)
    const medium = Math.max(...(data.map(d => d.medium || 0)), 1)
    const low = Math.max(...(data.map(d => d.low || 0)), 1)
    // Use the maximum of all metrics for a single unified scale
    const maxValue = Math.max(threats, critical, high, medium, low, 1)
    return {
      maxValue: Math.ceil(maxValue * 1.2) // Add 20% padding for better visibility
    }
  }, [data])
  
  // Debug: Log data to console
  if (data && data.length > 0) {
    const hasCritical = data.some(d => d.critical > 0)
    const hasHigh = data.some(d => d.high > 0)
    console.log('Trend chart data:', {
      totalPoints: data.length,
      hasCritical,
      hasHigh,
      maxValue,
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
        <ComposedChart data={data}>
          <defs>
            {/* Line gradients (horizontal) */}
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
            
            {/* Area fill gradients (vertical - from line color to transparent) */}
            <linearGradient id="threatsAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.4} />
              <stop offset="30%" stopColor="#0ea5e9" stopOpacity={0.25} />
              <stop offset="70%" stopColor="#0284c7" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#0284c7" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="criticalAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
              <stop offset="30%" stopColor="#ef4444" stopOpacity={0.25} />
              <stop offset="70%" stopColor="#b91c1c" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#b91c1c" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="highAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
              <stop offset="30%" stopColor="#f59e0b" stopOpacity={0.25} />
              <stop offset="70%" stopColor="#b45309" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#b45309" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="mediumAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="30%" stopColor="#3b82f6" stopOpacity={0.25} />
              <stop offset="70%" stopColor="#1e40af" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#1e40af" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="lowAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="30%" stopColor="#10b981" stopOpacity={0.25} />
              <stop offset="70%" stopColor="#047857" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#047857" stopOpacity={0} />
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
            domain={[0, maxValue]}
            allowDataOverflow={false}
            label={{ value: 'Number of Threats', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'currentColor' } }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload || payload.length === 0) return null
              
              // Filter to only show Line components - check for stroke property and exclude Area components
              const linePayloads = payload.filter((item: any) => {
                // Line components have stroke property, Area components have stroke="none" or no stroke
                return item.stroke !== undefined && item.stroke !== null && item.stroke !== 'none' && item.stroke !== ''
              })
              
              // Remove duplicates by dataKey using Map
              const uniquePayloads = new Map<string, any>()
              linePayloads.forEach((item: any) => {
                const key = item.dataKey || item.name || 'unknown'
                if (!uniquePayloads.has(key)) {
                  uniquePayloads.set(key, item)
                }
              })
              
              const finalPayloads = Array.from(uniquePayloads.values())
              
              if (finalPayloads.length === 0) return null
              
              return (
                <div style={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  padding: "12px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
                }}>
                  <p style={{ 
                    color: "hsl(var(--popover-foreground))", 
                    fontWeight: "bold", 
                    marginBottom: "8px",
                    fontSize: "14px"
                  }}>
                    {label}
                  </p>
                  {finalPayloads.map((entry: any, index: number) => {
                    const numValue = typeof entry.value === 'number' ? entry.value : parseFloat(entry.value) || 0
                    const displayName = entry.name || entry.dataKey || 'Unknown'
                    return (
                      <p key={`${entry.dataKey}-${index}`} style={{ 
                        color: entry.color || "hsl(var(--popover-foreground))",
                        margin: "4px 0",
                        fontSize: "13px",
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{ 
                          display: 'inline-block',
                          width: '10px',
                          height: '10px',
                          backgroundColor: entry.color || '#000',
                          borderRadius: '2px'
                        }}></span>
                        <span style={{ fontWeight: "600" }}>
                          {displayName.charAt(0).toUpperCase() + displayName.slice(1)}:
                        </span> 
                        <span>{numValue.toFixed(0)}</span>
                      </p>
                    )
                  })}
                </div>
              )
            }}
          />
          <Legend 
            wrapperStyle={{ color: "hsl(var(--foreground))" }}
            content={({ payload }) => {
              // Filter to only show Line components (exclude Area components)
              const lineItems = payload?.filter((item: any) => item.stroke !== undefined) || []
              return (
                <ul style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '16px', listStyle: 'none', padding: 0 }}>
                  {lineItems.map((entry: any, index: number) => (
                    <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ 
                        display: 'inline-block', 
                        width: '12px', 
                        height: '3px', 
                        backgroundColor: entry.color || '#000',
                        borderRadius: '2px'
                      }}></span>
                      <span style={{ fontSize: '12px', color: 'hsl(var(--foreground))' }}>
                        {entry.value}
                      </span>
                    </li>
                  ))}
                </ul>
              )
            }}
          />
          
          {/* Gradient fills underneath lines - visible but hidden from tooltip and legend */}
          <Area
            type="monotone"
            dataKey="threats"
            fill="url(#threatsAreaGradient)"
            stroke="none"
            connectNulls={true}
            isAnimationActive={true}
            legendType="none"
          />
          <Area
            type="monotone"
            dataKey="critical"
            fill="url(#criticalAreaGradient)"
            stroke="none"
            connectNulls={true}
            isAnimationActive={true}
            legendType="none"
          />
          <Area
            type="monotone"
            dataKey="high"
            fill="url(#highAreaGradient)"
            stroke="none"
            connectNulls={true}
            isAnimationActive={true}
            legendType="none"
          />
          <Area
            type="monotone"
            dataKey="medium"
            fill="url(#mediumAreaGradient)"
            stroke="none"
            connectNulls={true}
            isAnimationActive={true}
            legendType="none"
          />
          <Area
            type="monotone"
            dataKey="low"
            fill="url(#lowAreaGradient)"
            stroke="none"
            connectNulls={true}
            isAnimationActive={true}
            legendType="none"
          />
          
          {/* Lines on top */}
          <Line 
            type="monotone" 
            dataKey="threats" 
            stroke="url(#threatsGradient)" 
            strokeWidth={3} 
            dot={false}
            connectNulls={true}
            isAnimationActive={true}
            strokeOpacity={1}
            name="threats"
          />
          <Line 
            type="monotone" 
            dataKey="critical" 
            stroke="#ef4444" 
            strokeWidth={3} 
            dot={{ r: 4, fill: "#ef4444", strokeWidth: 2, stroke: "#fff" }}
            connectNulls={true}
            isAnimationActive={true}
            strokeOpacity={1}
            name="critical"
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="high" 
            stroke="#f59e0b" 
            strokeWidth={3} 
            dot={{ r: 4, fill: "#f59e0b", strokeWidth: 2, stroke: "#fff" }}
            connectNulls={true}
            isAnimationActive={true}
            strokeOpacity={1}
            name="high"
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="medium" 
            stroke="#3b82f6" 
            strokeWidth={2} 
            dot={{ r: 3, fill: "#3b82f6", strokeWidth: 1, stroke: "#fff" }}
            connectNulls={true}
            isAnimationActive={true}
            strokeOpacity={0.8}
            name="medium"
            activeDot={{ r: 5 }}
          />
          <Line 
            type="monotone" 
            dataKey="low" 
            stroke="#10b981" 
            strokeWidth={2} 
            dot={{ r: 3, fill: "#10b981", strokeWidth: 1, stroke: "#fff" }}
            connectNulls={true}
            isAnimationActive={true}
            strokeOpacity={0.8}
            name="low"
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
