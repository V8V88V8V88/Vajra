"use client"

import type { Threat } from "@/lib/api"
import { X, AlertCircle, Shield, Zap } from "lucide-react"
import { motion } from "framer-motion"

interface ThreatDetailModalProps {
  threat: Threat
  onClose: () => void
}

const severityColors = {
  critical: "#ef4444",
  high: "#f59e0b",
  medium: "#06b6d4",
  low: "#10b981",
}

export function ThreatDetailModal({ threat, onClose }: ThreatDetailModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg"
        style={{
          backgroundColor: "rgb(30 41 59 / 0.95)",
          borderColor: "rgb(51 65 85 / 0.2)",
          borderWidth: "1px",
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b" style={{ borderColor: "rgb(51 65 85 / 0.2)" }}>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-6 h-6" style={{ color: severityColors[threat.severity] }} />
              <h2 className="text-2xl font-bold text-foreground">{threat.title}</h2>
            </div>
            <p style={{ color: "#94a3b8" }}>{threat.summary}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ backgroundColor: "rgb(51 65 85 / 0.2)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "rgb(51 65 85 / 0.4)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "rgb(51 65 85 / 0.2)"
            }}
          >
            <X className="w-6 h-6" style={{ color: "#94a3b8" }} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Description</h3>
            <p style={{ color: "#94a3b8", lineHeight: "1.625" }}>{threat.description}</p>
          </div>

          {/* Indicators */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Zap className="w-5 h-5" style={{ color: "#06b6d4" }} />
              Indicators of Compromise
            </h3>
            <div className="space-y-2">
              {threat.indicators.map((indicator, i) => (
                <div
                  key={i}
                  className="px-4 py-2 rounded-lg border"
                  style={{
                    backgroundColor: "rgb(30 41 59 / 0.5)",
                    borderColor: "rgb(51 65 85 / 0.2)",
                  }}
                >
                  <code className="text-sm font-mono" style={{ color: "#06b6d4" }}>
                    {indicator}
                  </code>
                </div>
              ))}
            </div>
          </div>

          {/* Affected Systems */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5" style={{ color: "#f59e0b" }} />
              Affected Systems
            </h3>
            <div className="flex flex-wrap gap-2">
              {threat.affectedSystems.map((system, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: "rgb(245 158 11 / 0.1)",
                    color: "#f59e0b",
                  }}
                >
                  {system}
                </span>
              ))}
            </div>
          </div>

          {/* Recommendation */}
          <div
            className="rounded-lg p-4 border"
            style={{
              backgroundColor: "rgb(16 185 129 / 0.1)",
              borderColor: "rgb(16 185 129 / 0.2)",
            }}
          >
            <h3 className="text-lg font-semibold mb-2" style={{ color: "#10b981" }}>
              Recommendation
            </h3>
            <p style={{ color: "#94a3b8" }}>{threat.recommendation}</p>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t" style={{ borderColor: "rgb(51 65 85 / 0.2)" }}>
            <div>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#94a3b8" }}>
                Source
              </p>
              <p className="text-foreground font-medium">{threat.source}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider mb-1" style={{ color: "#94a3b8" }}>
                Timestamp
              </p>
              <p className="text-foreground font-medium">{new Date(threat.timestamp).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
