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
      style={{ 
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(8, 16, 30, 0.9) 100%)",
        borderColor: "rgba(30, 58, 138, 0.3)" 
      }}
      className="backdrop-blur-md border rounded-lg p-6"
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
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
          <XAxis 
            dataKey="name" 
            stroke="rgb(148, 163, 184)" 
            style={{ fontSize: "12px" }}
            tick={{ fill: "rgb(148, 163, 184)" }}
            axisLine={{ stroke: "rgba(148, 163, 184, 0.2)" }}
          />
          <YAxis 
            stroke="rgb(148, 163, 184)" 
            style={{ fontSize: "12px" }}
            tick={{ fill: "rgb(148, 163, 184)" }}
            axisLine={{ stroke: "rgba(148, 163, 184, 0.2)" }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(30, 41, 59, 0.95)",
              border: "1px solid rgba(30, 58, 138, 0.5)",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
            }}
            labelStyle={{ color: "rgb(241, 245, 249)", fontWeight: "600" }}
            itemStyle={{ color: "rgb(241, 245, 249)" }}
            cursor={{ fill: "rgba(14, 165, 233, 0.1)" }}
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
