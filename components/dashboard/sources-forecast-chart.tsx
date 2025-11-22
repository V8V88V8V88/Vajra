"use client"

import { useState, useEffect } from "react"
import { getSourcesForecast } from "@/lib/api"
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Globe, ChevronDown } from "lucide-react"

interface SourcesForecastChartProps {
  className?: string
}

const FORECAST_OPTIONS = [
  { value: 7, label: "7 Days" },
  { value: 30, label: "1 Month" },
  { value: 90, label: "3 Months" },
]

const COLORS = [
  { line: "#ef4444", area: "rgba(239, 68, 68, 0.3)" },
  { line: "#f97316", area: "rgba(249, 115, 22, 0.3)" },
  { line: "#eab308", area: "rgba(234, 179, 8, 0.3)" },
  { line: "#22c55e", area: "rgba(34, 197, 94, 0.3)" },
  { line: "#14b8a6", area: "rgba(20, 184, 166, 0.3)" },
]

export function SourcesForecastChart({ className }: SourcesForecastChartProps) {
  const [forecastData, setForecastData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [forecastDays, setForecastDays] = useState(7)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    const loadForecast = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await getSourcesForecast(forecastDays)
        setForecastData(data)
      } catch (err) {
        console.error('Failed to load sources forecast:', err)
        setError('Failed to load sources forecast')
      } finally {
        setIsLoading(false)
      }
    }
    loadForecast()
  }, [forecastDays])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDropdown && !(event.target as Element).closest('.forecast-dropdown')) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showDropdown])

  const selectedOption = FORECAST_OPTIONS.find(opt => opt.value === forecastDays) || FORECAST_OPTIONS[0]

  if (isLoading) {
    return (
      <div className={`backdrop-blur-md border border-border bg-card/95 dark:bg-card/95 rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Globe className="w-5 h-5 text-foreground" />
            Source Activity Forecast
          </h3>
        </div>
        <div className="h-[300px] flex items-center justify-center">
          <div className="text-muted-foreground">Loading forecast...</div>
        </div>
      </div>
    )
  }

  if (error || !forecastData || forecastData.status !== 'success') {
    return (
      <div className={`backdrop-blur-md border border-border bg-card/95 dark:bg-card/95 rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Globe className="w-5 h-5 text-foreground" />
            Source Activity Forecast
          </h3>
        </div>
        <div className="h-[300px] flex items-center justify-center">
          <div className="text-muted-foreground text-sm">{error || 'Insufficient data for forecasting'}</div>
        </div>
      </div>
    )
  }

  const chartData = forecastData.forecast.map((item: any) => {
    const entry: any = {
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }
    forecastData.sources.forEach((source: string) => {
      entry[source] = Math.max(0, Math.round((item[source] || 0) * 10) / 10)
    })
    return entry
  })

  return (
    <div className={`backdrop-blur-md border border-border bg-card/95 dark:bg-card/95 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Globe className="w-5 h-5 text-foreground" />
          Source Activity Forecast
        </h3>
        <div className="relative forecast-dropdown">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/60 text-foreground hover:bg-muted/80 transition-colors text-sm font-medium"
          >
            <span>{selectedOption.label}</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 z-10 bg-card border border-border rounded-lg shadow-lg min-w-[120px] overflow-hidden">
              {FORECAST_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setForecastDays(option.value)
                    setShowDropdown(false)
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-muted/60 transition-colors ${
                    forecastDays === option.value 
                      ? 'bg-foreground/10 text-foreground font-medium' 
                      : 'text-foreground'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={300} debounce={200}>
        <ComposedChart data={chartData}>
          <defs>
            {forecastData.sources.map((source: string, index: number) => (
              <linearGradient key={source} id={`sourceForecastGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS[index % COLORS.length].line} stopOpacity={0.35} />
                <stop offset="100%" stopColor={COLORS[index % COLORS.length].line} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.35} />
          <XAxis 
            dataKey="date" 
            className="text-muted-foreground" 
            style={{ fontSize: "12px" }}
            tick={{ fill: "var(--muted-foreground)" }}
          />
          <YAxis 
            className="text-muted-foreground"
            style={{ fontSize: "12px" }}
            tick={{ fill: "var(--muted-foreground)" }}
            domain={[0, 'auto']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--popover)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "var(--popover-foreground)" }}
            itemStyle={{ color: "var(--popover-foreground)" }}
          />
          <Legend wrapperStyle={{ color: "var(--foreground)" }} />
          
          {forecastData.sources.map((source: string, index: number) => (
            <Area
              key={`area-${source}`}
              type="monotone"
              dataKey={source}
              fill={`url(#sourceForecastGradient${index})`}
              stroke="none"
              legendType="none"
            />
          ))}
          
          {forecastData.sources.map((source: string, index: number) => (
            <Line
              key={`line-${source}`}
              type="monotone"
              dataKey={source}
              stroke={COLORS[index % COLORS.length].line}
              strokeWidth={2}
              dot={false}
              name={source}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
      
      <div className="mt-4 text-xs text-muted-foreground">
        Forecast horizon: {selectedOption.label.toLowerCase()} • Top {forecastData.sources.length} sources • Statistical forecasting
      </div>
    </div>
  )
}


