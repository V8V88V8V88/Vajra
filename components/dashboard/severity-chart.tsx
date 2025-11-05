"use client"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"

interface SeverityData {
  name: string
  value: number
  fill: string
}

interface SeverityChartProps {
  data: SeverityData[]
}

export function SeverityChart({ data }: SeverityChartProps) {
  // Map severity names to gradient IDs
  const getGradientId = (name: string) => {
    const gradientMap: Record<string, string> = {
      "Critical": "criticalGradient",
      "High": "highGradient",
      "Medium": "mediumGradient",
      "Low": "lowGradient"
    }
    return gradientMap[name] || "defaultGradient"
  }

  return (
    <div
      style={{ 
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(8, 16, 30, 0.9) 100%)",
        borderColor: "rgba(30, 58, 138, 0.3)" 
      }}
      className="backdrop-blur-md border rounded-lg p-6"
    >
      <h3 className="text-lg font-semibold text-foreground mb-6">Threat Severity</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <defs>
            <linearGradient id="criticalGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#f87171" stopOpacity={1} />
              <stop offset="50%" stopColor="#ef4444" stopOpacity={1} />
              <stop offset="100%" stopColor="#b91c1c" stopOpacity={1} />
            </linearGradient>
            <linearGradient id="highGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity={1} />
              <stop offset="50%" stopColor="#f59e0b" stopOpacity={1} />
              <stop offset="100%" stopColor="#b45309" stopOpacity={1} />
            </linearGradient>
            <linearGradient id="mediumGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity={1} />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity={1} />
              <stop offset="100%" stopColor="#0284c7" stopOpacity={1} />
            </linearGradient>
            <linearGradient id="lowGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
              <stop offset="50%" stopColor="#10b981" stopOpacity={1} />
              <stop offset="100%" stopColor="#047857" stopOpacity={1} />
            </linearGradient>
            <linearGradient id="defaultGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity={1} />
              <stop offset="50%" stopColor="#8884d8" stopOpacity={1} />
              <stop offset="100%" stopColor="#6b6b9e" stopOpacity={1} />
            </linearGradient>
          </defs>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={`url(#${getGradientId(entry.name)})`} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(30, 41, 59, 0.9)",
              border: "1px solid rgba(51, 65, 85, 0.5)",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "rgb(241, 245, 249)" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
