"use client"

import type { Threat } from "@/lib/api"
import { X, AlertCircle, Shield, Zap, Brain, AlertTriangle, TrendingUp } from "lucide-react"
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

          {/* AI Analysis Section */}
          {(threat.ai_risk_score !== undefined || threat.is_anomaly) && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                <Brain className="w-5 h-5" style={{ color: "#8b5cf6" }} />
                AI Analysis
              </h3>
              
              {/* Risk Score */}
              {threat.ai_risk_score !== undefined && (
                <div
                  className="rounded-lg p-4 border"
                  style={{
                    backgroundColor: threat.ai_risk_score > 0.7 
                      ? "rgb(239 68 68 / 0.1)" 
                      : threat.ai_risk_score > 0.4 
                      ? "rgb(245 158 11 / 0.1)" 
                      : "rgb(6 182 212 / 0.1)",
                    borderColor: threat.ai_risk_score > 0.7 
                      ? "rgb(239 68 68 / 0.2)" 
                      : threat.ai_risk_score > 0.4 
                      ? "rgb(245 158 11 / 0.2)" 
                      : "rgb(6 182 212 / 0.2)",
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: "#94a3b8" }}>AI Risk Score</span>
                    <span 
                      className="text-lg font-bold"
                      style={{
                        color: threat.ai_risk_score > 0.7 
                          ? "#ef4444" 
                          : threat.ai_risk_score > 0.4 
                          ? "#f59e0b" 
                          : "#06b6d4"
                      }}
                    >
                      {(threat.ai_risk_score * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${threat.ai_risk_score * 100}%`,
                        backgroundColor: threat.ai_risk_score > 0.7 
                          ? "#ef4444" 
                          : threat.ai_risk_score > 0.4 
                          ? "#f59e0b" 
                          : "#06b6d4"
                      }}
                    />
                  </div>
                  {threat.ai_sentiment && (
                    <p className="text-xs" style={{ color: "#94a3b8" }}>
                      Sentiment: <span className="font-medium capitalize">{threat.ai_sentiment}</span>
                    </p>
                  )}
                </div>
              )}
              
              {/* Anomaly Detection */}
              {threat.is_anomaly && (
                <div
                  className="rounded-lg p-4 border"
                  style={{
                    backgroundColor: "rgb(234 179 8 / 0.1)",
                    borderColor: "rgb(234 179 8 / 0.3)",
                  }}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: "#fbbf24" }} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-yellow-400">Zero-Day Threat Detected</span>
                        {threat.anomaly_score !== undefined && (
                          <span className="text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">
                            Score: {threat.anomaly_score.toFixed(2)}
                          </span>
                        )}
                      </div>
                      {threat.anomaly_explanation && (
                        <p className="text-sm" style={{ color: "#94a3b8" }}>
                          {threat.anomaly_explanation}
                        </p>
                      )}
                      <p className="text-xs mt-2 font-medium text-yellow-400">
                        ⚠️ This threat exhibits unusual patterns and may require immediate investigation.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* AI Entities & Intents */}
              {threat.ai_analysis && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {threat.ai_analysis.ai_entities && Array.isArray(threat.ai_analysis.ai_entities) && threat.ai_analysis.ai_entities.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2" style={{ color: "#94a3b8" }}>Detected Entities</h4>
                      <div className="flex flex-wrap gap-2">
                        {threat.ai_analysis.ai_entities.slice(0, 5).map((entity: any, i: number) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-1 rounded"
                            style={{
                              backgroundColor: "rgb(51 65 85 / 0.5)",
                              color: "#06b6d4",
                            }}
                          >
                            {entity.text} ({entity.type})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {threat.ai_analysis.ai_intents && Array.isArray(threat.ai_analysis.ai_intents) && threat.ai_analysis.ai_intents.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2" style={{ color: "#94a3b8" }}>Detected Intents</h4>
                      <div className="flex flex-wrap gap-2">
                        {threat.ai_analysis.ai_intents.slice(0, 3).map((intent: any, i: number) => (
                          <span
                            key={i}
                            className="text-xs px-2 py-1 rounded capitalize"
                            style={{
                              backgroundColor: "rgb(51 65 85 / 0.5)",
                              color: "#f59e0b",
                            }}
                          >
                            {intent.type}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

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
