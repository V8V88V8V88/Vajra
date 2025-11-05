"use client"

import type { CrawlerLog } from "@/lib/api"
import { useEffect, useRef } from "react"
import { CheckCircle, AlertCircle, Info } from "lucide-react"
import { motion } from "framer-motion"

interface CrawlerLogsProps {
  logs: CrawlerLog[]
  isRunning: boolean
}

const typeLabels: Record<CrawlerLog["type"], string> = {
  info: "INFO",
  success: "SUCCESS",
  warning: "WARN",
  error: "ERROR",
}

const typeColors: Record<CrawlerLog["type"], string> = {
  info: "text-sky-400",
  success: "text-emerald-400",
  warning: "text-amber-400",
  error: "text-rose-400",
}

const typeIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertCircle,
  error: AlertCircle,
}

export function CrawlerLogs({ logs, isRunning }: CrawlerLogsProps) {
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logs, isRunning])

  return (
    <div className="rounded-lg border border-border bg-card dark:bg-slate-950/70 shadow-lg shadow-black/40">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <p className="font-mono text-xs uppercase tracking-wider text-foreground">Crawler Output</p>
        {isRunning && (
          <span className="flex items-center gap-2 font-mono text-xs text-sky-400">
            <span className="h-2 w-2 animate-ping rounded-full bg-sky-400" />
            running...
          </span>
        )}
      </div>
      <div className="h-72 overflow-y-auto bg-muted/30 dark:bg-slate-950/80 px-4 py-3 font-mono text-xs text-foreground">
        {logs.length === 0 && !isRunning && (
          <p className="text-center text-muted-foreground">No logs yet. Start the crawler to begin.</p>
        )}
        {logs
          .filter((log) => log && log.type && log.id) // Filter out undefined/null logs
          .map((log, index) => {
            const Icon = typeIcons[log.type]
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className="flex items-start gap-3 rounded border border-border bg-accent/50 dark:bg-slate-900/30 px-3 py-2 mb-2"
              >
                <Icon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${typeColors[log.type]}`} />
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-muted-foreground">{log.timestamp.toLocaleTimeString()}</span>
                    <span className={`font-semibold ${typeColors[log.type]}`}>[{typeLabels[log.type]}]</span>
                  </div>
                  <p className="text-foreground leading-snug">{log.message}</p>
                </div>
              </motion.div>
            )
          })}
        {isRunning && (
          <div className="flex items-center gap-2 rounded border border-sky-500/20 bg-sky-500/5 px-3 py-2 text-sky-300">
            <div className="h-2 w-2 animate-pulse rounded-full bg-sky-400" />
            waiting for output...
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
