"use client"

import type { Threat } from "@/lib/api"
import { AlertCircle, Clock, Tag, Brain, AlertTriangle } from "lucide-react"

interface ThreatCardProps {
  threat: Threat
  onClick: () => void
}

const severityColors = {
  critical: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#22c55e",
}

const severityBgColors = {
  critical: "rgb(239 68 68 / 0.1)",
  high: "rgb(249 115 22 / 0.1)",
  medium: "rgb(234 179 8 / 0.1)",
  low: "rgb(34 197 94 / 0.1)",
}

export function ThreatCard({ threat, onClick }: ThreatCardProps) {
  // Safely format timestamp
  let formattedTime = 'Unknown'
  try {
    if (threat.timestamp && threat.timestamp instanceof Date) {
      formattedTime = threat.timestamp.toLocaleString()
    } else if (threat.timestamp) {
      formattedTime = new Date(threat.timestamp).toLocaleString()
    }
  } catch (e) {
    formattedTime = 'Unknown'
  }

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-6 rounded-lg cursor-pointer group transition-all duration-300 bg-card/95 dark:bg-card/95 border border-border hover:bg-muted/60 dark:hover:bg-muted/40 hover:border-foreground/30 hover:shadow-[0_16px_36px_rgba(0,0,0,0.18)]"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-5 h-5" style={{ color: severityColors[threat.severity] }} />
            <h3 className="text-lg font-semibold text-foreground group-hover:text-foreground/70 transition-colors">
              {threat.title}
            </h3>
          </div>
          <p className="text-muted-foreground text-sm">{threat.summary || threat.description || 'No description available'}</p>
        </div>
        <div className="ml-4 px-3 py-1 rounded-full" style={{ backgroundColor: severityBgColors[threat.severity] }}>
          <span className="text-xs font-semibold uppercase" style={{ color: severityColors[threat.severity] }}>
            {threat.severity}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{formattedTime}</span>
        </div>
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4" />
          <span>{threat.source}</span>
        </div>
        {threat.ai_risk_score !== undefined && (
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground font-medium">
              AI Risk: {(threat.ai_risk_score * 100).toFixed(0)}%
            </span>
          </div>
        )}
        {threat.is_anomaly && (
          <div className="flex items-center gap-2 px-2 py-1 rounded bg-yellow-500/10 border border-yellow-500/20">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span className="text-yellow-500 font-semibold text-xs">ZERO-DAY</span>
          </div>
        )}
      </div>
    </button>
  )
}
