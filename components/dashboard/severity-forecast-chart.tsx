"use client"

import { useState, useEffect } from "react"
import { getSeverityForecast } from "@/lib/api"
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { AlertTriangle, ChevronDown } from "lucide-react"

interface SeverityForecastChartProps {
  className?: string
}

const FORECAST_OPTIONS = [
  { value: 7, label: "7 Days" },
  { value: 30, label: "1 Month" },
  { value: 90, label: "3 Months" },
]

export function SeverityForecastChart({ className }: SeverityForecastChartProps) {
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
        const data = await getSeverityForecast(forecastDays)
        setForecastData(data)
      } catch (err) {
        console.error('Failed to load severity forecast:', err)
        setError('Failed to load severity forecast')
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
      <div className={`backdrop-blur-md border border-border bg-card dark:bg-gradient-to-br dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary" />
            Severity Forecast
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
      <div className={`backdrop-blur-md border border-border bg-card dark:bg-gradient-to-br dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary" />
            Severity Forecast
          </h3>
        </div>
        <div className="h-[300px] flex items-center justify-center">
          <div className="text-muted-foreground text-sm">{error || 'Insufficient data for forecasting'}</div>
        </div>
      </div>
    )
  }

  const chartData = forecastData.forecast.map((item: any) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    critical: Math.max(0, Math.round(item.critical * 10) / 10),
    high: Math.max(0, Math.round(item.high * 10) / 10),
    medium: Math.max(0, Math.round(item.medium * 10) / 10),
    low: Math.max(0, Math.round(item.low * 10) / 10),
  }))

  return (
    <div className={`backdrop-blur-md border border-border bg-card dark:bg-gradient-to-br dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-primary" />
          Severity Forecast
        </h3>
        <div className="relative forecast-dropdown">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors text-sm font-medium"
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
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-accent/10 transition-colors ${
                    forecastDays === option.value 
                      ? 'bg-primary/10 text-primary font-medium' 
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
      
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData}>
          <defs>
            <linearGradient id="criticalForecastGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="highForecastGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="mediumForecastGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="lowForecastGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
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
          
          <Area type="monotone" dataKey="critical" fill="url(#criticalForecastGradient)" stroke="none" />
          <Area type="monotone" dataKey="high" fill="url(#highForecastGradient)" stroke="none" />
          <Area type="monotone" dataKey="medium" fill="url(#mediumForecastGradient)" stroke="none" />
          <Area type="monotone" dataKey="low" fill="url(#lowForecastGradient)" stroke="none" />
          
          <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} dot={false} name="Critical" />
          <Line type="monotone" dataKey="high" stroke="#f59e0b" strokeWidth={2} dot={false} name="High" />
          <Line type="monotone" dataKey="medium" stroke="#06b6d4" strokeWidth={2} dot={false} name="Medium" />
          <Line type="monotone" dataKey="low" stroke="#10b981" strokeWidth={2} dot={false} name="Low" />
        </ComposedChart>
      </ResponsiveContainer>
      
      <div className="mt-4 text-xs text-muted-foreground">
        Forecast horizon: {selectedOption.label.toLowerCase()} • Statistical forecasting
      </div>
    </div>
  )
}


