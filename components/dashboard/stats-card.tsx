"use client"

import type { LucideIcon } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface StatsCardProps {
  title: string
  value: number
  icon: LucideIcon
  trend: number
  color: "primary" | "destructive" | "accent"
  loading?: boolean
}

export function StatsCard({ title, value, icon: Icon, trend, color, loading }: StatsCardProps) {
  const colorClasses = {
    primary: "text-foreground",
    destructive: "text-destructive",
    accent: "text-muted-foreground",
  }

  const bgClasses = {
    primary: "bg-foreground/10",
    destructive: "bg-destructive/10",
    accent: "bg-muted/60",
  }

  if (loading) {
    return (
      <div
        className="backdrop-blur-md border border-border bg-card/95 dark:bg-card/95 rounded-lg p-6"
      >
        <Skeleton className="h-4 w-24 mb-4" />
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-4 w-20" />
      </div>
    )
  }

  return (
    <div
      className="backdrop-blur-md border border-border bg-card/95 dark:bg-card/95 rounded-lg p-6 group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-foreground/20 hover:shadow-[0_16px_36px_rgba(0,0,0,0.15)]"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold text-foreground mt-2">{value.toLocaleString()}</p>
        </div>
        <div className={`${bgClasses[color]} p-3 rounded-lg`}>
          <Icon className={`w-6 h-6 ${colorClasses[color]}`} />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-semibold ${trend > 0 ? "text-destructive" : "text-emerald-500"}`}>
          {trend > 0 ? "+" : ""}
          {trend}%
        </span>
        <span className="text-xs text-muted-foreground">vs last 24h</span>
      </div>
    </div>
  )
}
