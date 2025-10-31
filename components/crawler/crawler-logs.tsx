"use client"

import type { CrawlerLog } from "@/lib/api"
import { CheckCircle, AlertCircle, Info } from "lucide-react"
import { motion } from "framer-motion"

interface CrawlerLogsProps {
  logs: CrawlerLog[]
  isRunning: boolean
}

const logIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  error: AlertCircle,
}

const logColors = {
  info: "#06b6d4",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
}

export function CrawlerLogs({ logs, isRunning }: CrawlerLogsProps) {
  return (
    <div
      className="p-6 rounded-lg"
      style={{
        backgroundColor: "rgb(30 41 59 / 0.5)",
        borderColor: "rgb(51 65 85 / 0.2)",
        borderWidth: "1px",
      }}
    >
      <h3 className="text-lg font-semibold text-foreground mb-6">Crawler Logs</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {logs.length === 0 && !isRunning && (
          <p className="text-center py-8" style={{ color: "#94a3b8" }}>
            No logs yet. Start the crawler to begin.
          </p>
        )}
        {logs.map((log, index) => {
          const Icon = logIcons[log.type]
          return (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-start gap-3 p-3 rounded-lg border"
              style={{
                backgroundColor: "rgb(30 41 59 / 0.5)",
                borderColor: "rgb(51 65 85 / 0.2)",
              }}
            >
              <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: logColors[log.type] }} />
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm">{log.message}</p>
                <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>
                  {log.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          )
        })}
        {isRunning && (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            className="flex items-center gap-3 p-3 rounded-lg border"
            style={{
              backgroundColor: "rgb(14 165 233 / 0.1)",
              borderColor: "rgb(14 165 233 / 0.2)",
            }}
          >
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#0ea5e9" }} />
            <p className="text-sm" style={{ color: "#0ea5e9" }}>
              Crawler running...
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
