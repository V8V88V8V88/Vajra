"use client"

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { useTheme } from "next-themes"

interface SeverityData {
  name: string
  value: number
  fill: string
}

interface SeverityChartProps {
  data: SeverityData[]
}

export function SeverityChart({ data }: SeverityChartProps) {
  const { theme } = useTheme()
  const textColor = theme === "dark" ? "#f1f5f9" : "#0f172a"
  
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
      className="backdrop-blur-md border border-border bg-card dark:bg-gradient-to-br dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] rounded-lg p-6"
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
            label={({ name, value, cx, cy, midAngle, innerRadius, outerRadius }) => {
              const RADIAN = Math.PI / 180
              const radius = outerRadius + 20 // Position labels outside the pie
              const x = cx + radius * Math.cos(-midAngle * RADIAN)
              const y = cy + radius * Math.sin(-midAngle * RADIAN)
              
              return (
                <text
                  x={x}
                  y={y}
                  fill={textColor}
                  textAnchor={x > cx ? 'start' : 'end'}
                  dominantBaseline="central"
                  fontSize="12"
                  fontWeight="500"
                  style={{ userSelect: 'none' }}
                >
                  {`${name}: ${value}`}
                </text>
              )
            }}
            outerRadius={80}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={`url(#${getGradientId(entry.name)})`}
                style={{ fontSize: "12px" }}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "hsl(var(--popover-foreground))", fontSize: "12px" }}
            itemStyle={{ color: "hsl(var(--popover-foreground))", fontSize: "12px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
