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
  return (
    <div
      style={{ backgroundColor: "rgba(30, 41, 59, 0.5)", borderColor: "rgba(51, 65, 85, 0.2)" }}
      className="backdrop-blur-md border rounded-lg p-6"
    >
      <h3 className="text-lg font-semibold text-foreground mb-6">Threat Severity</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
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
              <Cell key={`cell-${index}`} fill={entry.fill} />
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
