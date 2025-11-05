"use client"

import type { LucideIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface StatsCardProps {
  title: string
  value: number
  icon: LucideIcon
  trend: number
  color: "primary" | "danger" | "accent"
  loading?: boolean
}

export function StatsCard({ title, value, icon: Icon, trend, color, loading }: StatsCardProps) {
  const colorClasses = {
    primary: "text-primary",
    danger: "text-danger",
    accent: "text-accent",
  }

  const bgClasses = {
    primary: "bg-primary/10",
    danger: "bg-danger/10",
    accent: "bg-accent/10",
  }

  if (loading) {
    return (
      <div
        style={{ 
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(8, 16, 30, 0.9) 100%)",
          borderColor: "rgba(30, 58, 138, 0.3)" 
        }}
        className="backdrop-blur-md border rounded-lg p-6"
      >
        <Skeleton className="h-4 w-24 mb-4" />
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-4 w-20" />
      </div>
    )
  }

  return (
    <div
      style={{ 
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(8, 16, 30, 0.9) 100%)",
        borderColor: "rgba(30, 58, 138, 0.3)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      }}
      className="backdrop-blur-md border rounded-lg p-6 group relative overflow-hidden"
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(14, 165, 233, 0.5)"
        e.currentTarget.style.transform = "translateY(-2px)"
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(14, 165, 233, 0.15)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(30, 58, 138, 0.3)"
        e.currentTarget.style.transform = "translateY(0)"
        e.currentTarget.style.boxShadow = "none"
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-muted font-medium">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-2">{value.toLocaleString()}</p>
        </div>
        <div className={`${bgClasses[color]} p-3 rounded-lg`}>
          <Icon className={`w-6 h-6 ${colorClasses[color]}`} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-semibold ${trend > 0 ? "text-red-500" : "text-green-500"}`}>
          {trend > 0 ? "+" : ""}
          {trend}%
        </span>
        <span className="text-xs text-muted">vs last 24h</span>
      </div>
    </div>
  )
}
