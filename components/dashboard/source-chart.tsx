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
      style={{ backgroundColor: "rgba(30, 41, 59, 0.5)", borderColor: "rgba(51, 65, 85, 0.2)" }}
      className="backdrop-blur-md border rounded-lg p-6"
    >
      <h3 className="text-lg font-semibold text-foreground mb-6">Threat Sources</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
          <XAxis dataKey="name" stroke="rgb(148, 163, 184)" style={{ fontSize: "12px" }} />
          <YAxis stroke="rgb(148, 163, 184)" style={{ fontSize: "12px" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(30, 41, 59, 0.9)",
              border: "1px solid rgba(51, 65, 85, 0.5)",
              borderRadius: "8px",
            }}
            labelStyle={{ color: "rgb(241, 245, 249)" }}
          />
          <Bar dataKey="value" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
