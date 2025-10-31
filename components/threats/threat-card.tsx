"use client"

import type { Threat } from "@/lib/api"
import { AlertCircle, Clock, Tag } from "lucide-react"

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
  const formattedTime = new Date(threat.timestamp).toLocaleString()

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-6 rounded-lg cursor-pointer group transition-all duration-300"
      style={{
        backgroundColor: "rgb(30 41 59 / 0.5)",
        borderColor: "rgb(51 65 85 / 0.2)",
        borderWidth: "1px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "rgb(30 41 59 / 0.7)"
        e.currentTarget.style.borderColor = "rgb(14 165 233 / 0.3)"
        e.currentTarget.style.boxShadow = "0 20px 25px -5px rgb(14 165 233 / 0.1)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "rgb(30 41 59 / 0.5)"
        e.currentTarget.style.borderColor = "rgb(51 65 85 / 0.2)"
        e.currentTarget.style.boxShadow = "none"
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-5 h-5" style={{ color: severityColors[threat.severity] }} />
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {threat.title}
            </h3>
          </div>
          <p style={{ color: "#94a3b8", fontSize: "0.875rem" }}>{threat.summary}</p>
        </div>
        <div className="ml-4 px-3 py-1 rounded-full" style={{ backgroundColor: severityBgColors[threat.severity] }}>
          <span className="text-xs font-semibold uppercase" style={{ color: severityColors[threat.severity] }}>
            {threat.severity}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-6 text-sm" style={{ color: "#94a3b8" }}>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{formattedTime}</span>
        </div>
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4" />
          <span>{threat.source}</span>
        </div>
      </div>
    </button>
  )
}
