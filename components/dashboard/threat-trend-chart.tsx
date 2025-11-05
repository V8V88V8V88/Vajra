"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface TrendData {
  date: string
  threats: number
  critical: number
  high: number
}

interface ThreatTrendChartProps {
  data: TrendData[]
}

export function ThreatTrendChart({ data }: ThreatTrendChartProps) {
  return (
    <div
      className="backdrop-blur-md border border-border bg-card dark:bg-gradient-to-br dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] rounded-lg p-6"
    >
      <h3 className="text-lg font-semibold text-foreground mb-6">Threat Trend (10 Days)</h3>
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
          <Line type="monotone" dataKey="threats" stroke="url(#threatsGradient)" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="critical" stroke="url(#criticalGradient)" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="high" stroke="url(#highGradient)" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
