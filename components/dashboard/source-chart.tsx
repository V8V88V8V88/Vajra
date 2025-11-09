"use client"

import { useState, useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts"
import { BarChart3, TrendingUp } from "lucide-react"
import { DateRangeSelector, type DateRangeType } from "@/components/ui/date-range-selector"

interface SourceData {
  name: string
  value: number
}

interface SourceChartProps {
  data: SourceData[]
  onDateRangeChange?: (range: DateRangeType, startDate?: string, endDate?: string) => void
}

// Custom tooltip with percentage
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    const total = data.total || 0
    const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : 0
    
    return (
      <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
        <p className="font-semibold text-foreground mb-1">{label}</p>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{data.value.toLocaleString()}</span> threats
        </p>
        <p className="text-xs text-muted-foreground">
          {percentage}% of total
        </p>
      </div>
    )
  }
  return null
}

// Custom label component for showing values on bars
const CustomLabel = ({ x, y, width, value }: any) => {
  // Show label for all values including 0
  if (value === undefined || value === null) return null
  
  return (
    <text
      x={x + width / 2}
      y={value === 0 ? y - 15 : y - 5}
      fill="var(--muted-foreground)"
      textAnchor="middle"
      fontSize={11}
      opacity={value === 0 ? 0.55 : 0.9}
    >
      {value === 0 ? "0" : value > 0 && value < 10 ? value : value > 1000 ? `${(value / 1000).toFixed(1)}k` : value}
    </text>
  )
}

export function SourceChart({ data, onDateRangeChange }: SourceChartProps) {
  const [useLogScale, setUseLogScale] = useState(false)
  const [dateRange, setDateRange] = useState<DateRangeType>("6months")
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")

  const handleDateRangeChange = (range: DateRangeType, startDate?: string, endDate?: string) => {
    setDateRange(range)
    if (startDate) setCustomStartDate(startDate)
    if (endDate) setCustomEndDate(endDate)
    onDateRangeChange?.(range, startDate, endDate)
  }
  
  // Calculate total and percentages
  const chartData = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    return data.map(item => ({
      ...item,
      total,
      percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : 0,
      // For log scale, use log value (add 1 to avoid log(0))
      logValue: Math.log10(item.value + 1)
    }))
  }, [data])
  
  // Calculate max value for Y-axis
  const maxValue = useMemo(() => {
    if (useLogScale) {
      const maxLog = Math.max(...chartData.map(d => d.logValue))
      return Math.ceil(maxLog * 1.1) // Add 10% padding
    }
    const max = Math.max(...chartData.map(d => d.value))
    return Math.ceil(max * 1.1) // Add 10% padding
  }, [chartData, useLogScale])
  
  // Y-axis domain
  const yAxisDomain = useLogScale ? [0, maxValue] : [0, 'auto']
  
  return (
    <div
      className="backdrop-blur-md border border-border bg-card/95 dark:bg-card/95 rounded-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Threat Sources</h3>
        <div className="flex items-center gap-2">
          {onDateRangeChange && (
            <DateRangeSelector
              value={dateRange}
              customStartDate={customStartDate}
              customEndDate={customEndDate}
              onChange={handleDateRangeChange}
            />
          )}
          <button
            onClick={() => setUseLogScale(!useLogScale)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-lg border border-border bg-background hover:bg-muted/60 transition-colors"
            title={useLogScale ? "Switch to linear scale (accurate)" : "Switch to logarithmic scale (better visualization)"}
          >
            {useLogScale ? (
              <>
                <BarChart3 className="w-4 h-4" />
                <span>Linear</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4" />
                <span>Log Scale</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      {useLogScale && (
        <div className="mb-2 text-xs text-muted-foreground bg-yellow-500/10 border border-yellow-500/20 rounded px-2 py-1 inline-block">
          ⚠️ Logarithmic scale: Better visualization, but values are compressed. Hover for accurate counts.
        </div>
      )}
      
      <ResponsiveContainer width="100%" height={300}>
        <BarChart 
          data={chartData} 
          barCategoryGap="8%"
          margin={{ top: 20, right: 10, left: 10, bottom: 5 }}
        >
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.9} />
              <stop offset="55%" stopColor="#ea580c" stopOpacity={0.95} />
              <stop offset="100%" stopColor="#7c2d12" stopOpacity={1} />
            </linearGradient>
            <filter id="barShadow">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
              <feOffset dx="0" dy="2" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.35} />
          <XAxis 
            dataKey="name" 
            className="text-muted-foreground"
            style={{ fontSize: "12px" }}
            tick={{ fill: "var(--muted-foreground)" }}
            axisLine={{ stroke: "var(--border)", opacity: 0.2 }}
            angle={-15}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            className="text-muted-foreground"
            style={{ fontSize: "12px" }}
            tick={{ fill: "var(--muted-foreground)" }}
            axisLine={{ stroke: "var(--border)", opacity: 0.2 }}
            domain={yAxisDomain}
            tickFormatter={(value) => {
              if (useLogScale) {
                // Convert log value back to approximate count for display
                const approxValue = Math.pow(10, value) - 1
                if (approxValue < 10) return Math.round(approxValue).toString()
                if (approxValue < 1000) return Math.round(approxValue).toString()
                return `${(approxValue / 1000).toFixed(1)}k`
              }
              if (value >= 1000) return `${(value / 1000).toFixed(1)}k`
              return value.toString()
            }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(249, 115, 22, 0.08)" }} />
          <Bar 
            dataKey={useLogScale ? "logValue" : "value"} 
            fill="url(#barGradient)" 
            radius={[6, 6, 0, 0]} 
            barSize={45}
            filter="url(#barShadow)"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                opacity={entry.value === 0 ? 0.4 : 1} // Make 0-value bars semi-transparent if they render
              />
            ))}
            <LabelList 
              content={<CustomLabel />} 
              dataKey={useLogScale ? undefined : "value"}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      <div className="mt-4 text-xs text-muted-foreground flex items-center justify-between">
        <span>Total: {chartData[0]?.total?.toLocaleString() || 0} threats</span>
        <span className="text-muted-foreground">
          {useLogScale ? "Logarithmic scale" : "Linear scale (accurate)"}
        </span>
      </div>
    </div>
  )
}
