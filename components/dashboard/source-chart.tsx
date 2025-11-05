"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface SourceData {
  name: string
  value: number
}

interface SourceChartProps {
  data: SourceData[]
}

export function SourceChart({ data }: SourceChartProps) {
  return (
    <div
      className="backdrop-blur-md border border-border bg-card dark:bg-gradient-to-br dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] rounded-lg p-6"
    >
      <h3 className="text-lg font-semibold text-foreground mb-6">Threat Sources</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart 
          data={data} 
          barCategoryGap="8%"
          margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
        >
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity={1} />
              <stop offset="30%" stopColor="#0ea5e9" stopOpacity={1} />
              <stop offset="70%" stopColor="#06b6d4" stopOpacity={1} />
              <stop offset="100%" stopColor="#0284c7" stopOpacity={1} />
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
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-300 dark:stroke-slate-700" />
          <XAxis 
            dataKey="name" 
            className="text-slate-600 dark:text-slate-400"
            style={{ fontSize: "12px" }}
            tick={{ fill: "currentColor" }}
            axisLine={{ stroke: "currentColor", opacity: 0.2 }}
          />
          <YAxis 
            className="text-slate-600 dark:text-slate-400"
            style={{ fontSize: "12px" }}
            tick={{ fill: "currentColor" }}
            axisLine={{ stroke: "currentColor", opacity: 0.2 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            }}
            labelStyle={{ color: "hsl(var(--popover-foreground))", fontWeight: "600" }}
            itemStyle={{ color: "hsl(var(--popover-foreground))" }}
            cursor={{ fill: "transparent" }}
          />
          <Bar 
            dataKey="value" 
            fill="url(#barGradient)" 
            radius={[6, 6, 0, 0]} 
            barSize={45}
            filter="url(#barShadow)"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
