"use client"

import type { Threat } from "@/lib/api"
import { AlertCircle, Clock, Tag, Brain, AlertTriangle } from "lucide-react"

interface ThreatCardProps {
  threat: Threat
  onClick: () => void
}

const severityColors = {
  critical: "#ef4444",
  high: "#f59e0b",
  medium: "#06b6d4",
  low: "#10b981",
}

const severityBgColors = {
  critical: "rgb(239 68 68 / 0.1)",
  high: "rgb(245 158 11 / 0.1)",
  medium: "rgb(6 182 212 / 0.1)",
  low: "rgb(16 185 129 / 0.1)",
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
      className="w-full text-left p-6 rounded-lg cursor-pointer group transition-all duration-300 bg-card dark:bg-gradient-to-r dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] border border-border hover:bg-accent dark:hover:bg-[rgba(15,23,42,0.95)] hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-5 h-5" style={{ color: severityColors[threat.severity] }} />
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
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
            <Brain className="w-4 h-4 text-primary" />
            <span className="text-primary font-medium">
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
