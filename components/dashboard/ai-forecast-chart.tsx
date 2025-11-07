"use client"

import { useState, useEffect } from "react"
import { getAIForecast } from "@/lib/api"
import { ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Brain, TrendingUp, TrendingDown, Minus, ChevronDown } from "lucide-react"

interface AIForecastChartProps {
  className?: string
}

const FORECAST_OPTIONS = [
  { value: 7, label: "7 Days" },
  { value: 30, label: "1 Month" },
  { value: 90, label: "3 Months" },
]

export function AIForecastChart({ className }: AIForecastChartProps) {
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
        const data = await getAIForecast(forecastDays)
        setForecastData(data)
      } catch (err) {
        console.error('Failed to load AI forecast:', err)
        setError('Failed to load AI forecast')
      } finally {
        setIsLoading(false)
      }
    }
    loadForecast()
  }, [forecastDays])

  // Close dropdown when clicking outside
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

  const handleForecastPeriodChange = (days: number) => {
    setForecastDays(days)
    setShowDropdown(false)
  }

  if (isLoading) {
    return (
      <div className={`backdrop-blur-md border border-border bg-card dark:bg-gradient-to-br dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI Threat Forecast
          </h3>
        </div>
        <div className="h-[300px] flex items-center justify-center">
          <div className="text-muted-foreground">Loading forecast...</div>
        </div>
      </div>
    )
  }

  if (error || !forecastData || forecastData.status !== 'success') {
    const errorMessage = error || forecastData?.message || 'Insufficient data for forecasting. Crawl more threats to enable AI predictions.'
    const isPyTorchError = errorMessage.toLowerCase().includes('torch') || errorMessage.toLowerCase().includes('pytorch')
    
    return (
      <div className={`backdrop-blur-md border border-border bg-card dark:bg-gradient-to-br dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] rounded-lg p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI Threat Forecast
          </h3>
        </div>
        <div className="h-[300px] flex flex-col items-center justify-center gap-3">
          <div className="text-muted-foreground text-sm text-center">
            {errorMessage}
          </div>
          {isPyTorchError && (
            <div className="text-xs text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 max-w-md">
              <strong>Install PyTorch:</strong> Run <code className="bg-black/20 px-2 py-1 rounded">pip install torch</code> in your backend virtual environment
            </div>
          )}
        </div>
      </div>
    )
  }

  const chartData = forecastData.forecast.map((item: any) => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    predicted: Math.max(0, Math.round(item.predicted_value))
  }))

  const trendIcon = forecastData.trend === 'increasing' 
    ? <TrendingUp className="w-4 h-4 text-red-500" />
    : forecastData.trend === 'decreasing'
    ? <TrendingDown className="w-4 h-4 text-green-500" />
    : <Minus className="w-4 h-4 text-blue-500" />

  const trendColor = forecastData.trend === 'increasing' 
    ? 'text-red-500'
    : forecastData.trend === 'decreasing'
    ? 'text-green-500'
    : 'text-blue-500'

  return (
    <div className={`backdrop-blur-md border border-border bg-card dark:bg-gradient-to-br dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          AI Threat Forecast ({selectedOption.label})
        </h3>
        <div className="flex items-center gap-3">
          {forecastData.trend && (
            <div className={`flex items-center gap-2 text-sm font-medium ${trendColor}`}>
              {trendIcon}
              <span className="capitalize">{forecastData.trend} Trend</span>
              {forecastData.risk_level && (
                <span className="ml-2 px-2 py-1 rounded text-xs bg-primary/10 text-primary capitalize">
                  {forecastData.risk_level} Risk
                </span>
              )}
            </div>
          )}
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
                    onClick={() => handleForecastPeriodChange(option.value)}
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
      </div>
      
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={chartData}>
          <defs>
            {/* Line gradient (horizontal) */}
            <linearGradient id="forecastGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
              <stop offset="50%" stopColor="#7c3aed" stopOpacity={1} />
              <stop offset="100%" stopColor="#6d28d9" stopOpacity={1} />
            </linearGradient>
            
            {/* Area fill gradient (vertical - from line color to transparent) */}
            <linearGradient id="forecastAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
              <stop offset="30%" stopColor="#7c3aed" stopOpacity={0.25} />
              <stop offset="70%" stopColor="#6d28d9" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#6d28d9" stopOpacity={0} />
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
          
          {/* Gradient fill underneath line */}
          <Area
            type="monotone"
            dataKey="predicted"
            fill="url(#forecastAreaGradient)"
            stroke="none"
            connectNulls={true}
            isAnimationActive={true}
          />
          
          {/* Line on top */}
          <Line 
            type="monotone" 
            dataKey="predicted" 
            stroke="url(#forecastGradient)" 
            strokeWidth={3} 
            dot={{ r: 4, fill: "#8b5cf6" }}
            activeDot={{ r: 6 }}
            name="Predicted Threats"
            connectNulls={true}
            isAnimationActive={true}
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      <div className="mt-4 text-xs text-muted-foreground">
        Powered by {forecastData.note ? 'Statistical Forecasting' : 'LSTM Neural Network'} • Forecast horizon: {selectedOption.label.toLowerCase()} • Risk level: {forecastData.risk_level || 'unknown'}
      </div>
    </div>
  )
}

