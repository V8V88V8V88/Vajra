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
      style={{ backgroundColor: "rgba(30, 41, 59, 0.5)", borderColor: "rgba(51, 65, 85, 0.2)" }}
      className="backdrop-blur-md border rounded-lg p-6"
    >
      <h3 className="text-lg font-semibold text-foreground mb-6">Threat Trend (10 Days)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
          <XAxis dataKey="date" stroke="rgb(148, 163, 184)" style={{ fontSize: "12px" }} />
          <YAxis stroke="rgb(148, 163, 184)" style={{ fontSize: "12px" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(30, 41, 59, 0.9)",
              border: "1px solid rgba(51, 65, 85, 0.5)",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "rgb(241, 245, 249)" }}
          />
          <Legend />
          <Line type="monotone" dataKey="threats" stroke="#0ea5e9" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="high" stroke="#f59e0b" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
