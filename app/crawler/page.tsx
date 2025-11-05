"use client"

import type React from "react"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  startCrawler,
  type CrawlerLog,
  type CrawlerRecord,
  type CrawlerResult,
  type CrawlerStats,
} from "@/lib/api"
import { CrawlerLogs } from "@/components/crawler/crawler-logs"
import { Play, Search, X } from "lucide-react"

function deriveSourceSummary(records: CrawlerRecord[]) {
  const bySource = new Map<string, { count: number; latest?: Date | null }>()
  records.forEach((record) => {
    const entry = bySource.get(record.source) ?? { count: 0, latest: null }
    entry.count += 1
    if (record.published && (!entry.latest || record.published > entry.latest)) {
      entry.latest = record.published
    }
    bySource.set(record.source, entry)
  })
  return Array.from(bySource.entries()).map(([source, value]) => ({
    source,
    count: value.count,
    latest: value.latest ?? null,
  }))
}

function CrawlerSummary({ records, logs }: { records: CrawlerRecord[]; logs: CrawlerLog[] }) {
  const summary = useMemo(() => deriveSourceSummary(records), [records])
  const errors = useMemo(() => logs.filter((log) => log.type === "error"), [logs])

  if (records.length === 0) {
    return null
  }

  return (
    <div className="fade-in" style={{ animationDelay: "0.55s" }}>
        <div
        className="backdrop-blur-md border border-border bg-card dark:bg-gradient-to-br dark:from-[rgba(15,26,46,0.6)] dark:to-[rgba(30,41,59,0.3)] rounded-lg p-6 space-y-6"
      >
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">Source Summary</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {summary.map((entry) => (
              <div
                key={entry.source}
                className="rounded-lg border border-border bg-accent/50 dark:bg-slate-900/40 px-4 py-3"
              >
                <p className="text-sm font-semibold text-primary uppercase tracking-wide">{entry.source}</p>
                <p className="text-foreground text-lg font-bold">{entry.count} findings</p>
                {entry.latest && (
                  <p className="text-xs mt-1 text-muted-foreground">Latest: {entry.latest.toLocaleString()}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-foreground mb-3">Latest Findings</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {records.slice(0, 20).map((item) => (
              <a
                key={`${item.source}-${item.id}`}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-lg border border-border bg-accent/50 dark:bg-slate-900/40 p-4 hover:border-primary/60 transition-colors"
              >
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">{item.source}</p>
                <p className="text-foreground font-medium">{item.title}</p>
                {item.published && (
                  <p className="text-xs mt-1 text-muted-foreground">Published: {item.published.toLocaleString()}</p>
                )}
                {item.summary && (
                  <p className="text-sm mt-2 text-muted-foreground">{item.summary}</p>
                )}
              </a>
            ))}
          </div>
        </div>

        {errors.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-3">Errors Encountered</h3>
            <ul className="space-y-2 font-mono text-xs text-red-300/90">
              {errors.map((log) => (
                <li key={log.id} className="rounded border border-red-500/30 bg-red-500/5 px-3 py-2">
                  [{log.timestamp.toLocaleTimeString()}] {log.message}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default function CrawlerPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [isPlayback, setIsPlayback] = useState(false)
  const [logs, setLogs] = useState<CrawlerLog[]>([])
  const [results, setResults] = useState<CrawlerRecord[]>([])
  const [stats, setStats] = useState<CrawlerStats | null>(null)
  const [lastRunAt, setLastRunAt] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [customSite, setCustomSite] = useState("")
  const [customThreat, setCustomThreat] = useState("")
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [abortController, setAbortController] = useState<AbortController | null>(null)

  const logPlaybackRef = useRef<NodeJS.Timeout | null>(null)

  const stopLogPlayback = useCallback(() => {
    if (logPlaybackRef.current) {
      clearInterval(logPlaybackRef.current)
      logPlaybackRef.current = null
    }
  }, [])

  useEffect(() => {
    return () => {
      stopLogPlayback()
      abortController?.abort()
    }
  }, [abortController, stopLogPlayback])

  const isBusy = isRunning || isPlayback

  const handleCrawlerResult = useCallback(
    (result: CrawlerResult) => {
      setStats(result.stats)
      setResults(result.records)

      const completedAt = new Date()
      const logEntries = result.logs

      if (logEntries.length === 0) {
        setLogs([])
        setLastRunAt(completedAt)
        return
      }

      setIsPlayback(true)
      stopLogPlayback()
      setLogs([])

      let index = 0
      logPlaybackRef.current = setInterval(() => {
        setLogs((prev) => [...prev, logEntries[index]])
        index += 1
        if (index >= logEntries.length) {
          stopLogPlayback()
          setIsPlayback(false)
          setLastRunAt(completedAt)
        }
      }, 320)
    },
    [stopLogPlayback]
  )

  const handleStartCrawler = async () => {
    if (isBusy) return

    const controller = new AbortController()
    setAbortController(controller)
    setIsRunning(true)
    setIsPlayback(false)
    setLogs([])
    setResults([])
    setStats(null)
    setError(null)
    stopLogPlayback()

    try {
      const result = await startCrawler(controller.signal)
      handleCrawlerResult(result)
    } catch (err) {
      if ((err as DOMException)?.name === "AbortError") {
        setError("Crawler run cancelled by user.")
        setLogs((prev) => [
          ...prev,
          {
            id: `log-cancel-${Date.now()}`,
            timestamp: new Date(),
            message: "Crawler run cancelled by user",
            type: "warning",
          },
        ])
      } else {
        console.error("Crawler error:", err)
        setError("Failed to run crawler. Ensure the backend is running on port 8000.")
      }
    } finally {
      setIsRunning(false)
      setAbortController(null)
    }
  }

  const handleStopCrawler = () => {
    if (abortController) {
      abortController.abort()
      setAbortController(null)
    }
    stopLogPlayback()
    setIsRunning(false)
    setIsPlayback(false)
  }

  const handleCustomCrawl = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customSite.trim() || !customThreat.trim()) return

    setIsRunning(true)
    setLogs([])

    try {
      const mockLogs: CrawlerLog[] = [
        { id: `mock-${Date.now()}-1`, timestamp: new Date(), message: `Initiating custom crawl for: ${customSite}`, type: "info" },
        { id: `mock-${Date.now()}-2`, timestamp: new Date(), message: `Threat type: ${customThreat}`, type: "info" },
        { id: `mock-${Date.now()}-3`, timestamp: new Date(), message: "Connecting to data sources...", type: "info" },
        {
          id: `mock-${Date.now()}-4`,
          timestamp: new Date(),
          message: `Scanning ${customSite} for ${customThreat} indicators...`,
          type: "info",
        },
        { id: `mock-${Date.now()}-5`, timestamp: new Date(), message: "Analyzing threat patterns...", type: "warning" },
        {
          id: `mock-${Date.now()}-6`,
          timestamp: new Date(),
          message: `Found 12 potential ${customThreat} indicators`,
          type: "success",
        },
        { id: `mock-${Date.now()}-7`, timestamp: new Date(), message: "Indexing results in threat database...", type: "info" },
        { id: `mock-${Date.now()}-8`, timestamp: new Date(), message: "Custom crawl completed successfully", type: "success" },
      ]

      setLogs([])
      setIsPlayback(true)

      let index = 0
      stopLogPlayback()
      logPlaybackRef.current = setInterval(() => {
        setLogs((prev) => [...prev, mockLogs[index]])
        index += 1
        if (index >= mockLogs.length) {
          stopLogPlayback()
          setIsPlayback(false)
        }
      }, 280)

      setCustomSite("")
      setCustomThreat("")
      setShowCustomForm(false)
    } catch (err) {
      console.error("Custom crawl error:", err)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="p-8 space-y-8">
      <div className="fade-in">
        <h1 className="text-3xl font-bold text-foreground mb-2">OSINT Crawler</h1>
        <p className="text-muted-foreground">Automated threat intelligence data collection and indexing</p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg">
          <p className="font-semibold">{error}</p>
        </div>
      )}

      <div className="fade-in" style={{ animationDelay: "0.1s" }}>
        <div
          className="backdrop-blur-md border border-border bg-card dark:bg-gradient-to-br dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] rounded-lg p-6"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Crawler Status</h3>
              <p className="text-muted-foreground">
                {isRunning
                  ? "Crawler request in progress..."
                  : isPlayback
                    ? "Streaming log output..."
                    : lastRunAt
                      ? `Last run at ${lastRunAt.toLocaleTimeString()}`
                      : "Crawler is idle"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleStartCrawler}
                disabled={isBusy}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  isBusy
                    ? "bg-muted/20 text-muted cursor-not-allowed"
                    : "bg-primary text-white hover:bg-cyan-500 hover:shadow-lg hover:shadow-cyan-500/30"
                }`}
              >
                <Play className="w-5 h-5" />
                {isBusy ? "Running..." : "Start Crawler"}
              </button>
              {isBusy && (
                <button
                  onClick={handleStopCrawler}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-destructive/40 bg-destructive/10 text-destructive font-semibold hover:bg-destructive/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Stop
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 fade-in" style={{ animationDelay: "0.2s" }}>
        <div
          className="backdrop-blur-md border border-border bg-card dark:bg-gradient-to-br dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] rounded-lg p-6"
        >
          <p className="text-sm text-muted-foreground mb-2">Sources Crawled</p>
          <p className="text-2xl font-bold text-foreground">{stats?.sources ?? 0}</p>
        </div>
        <div
          className="backdrop-blur-md border border-border bg-card dark:bg-gradient-to-br dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] rounded-lg p-6"
        >
          <p className="text-sm text-muted mb-2">Items Collected</p>
          <p className="text-2xl font-bold text-foreground">{stats?.itemsTotal ?? 0}</p>
        </div>
        <div
          className="backdrop-blur-md border border-border bg-card dark:bg-gradient-to-br dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] rounded-lg p-6"
        >
          <p className="text-sm text-muted mb-2">Unique Findings</p>
          <p className="text-2xl font-bold text-foreground">{stats?.itemsUnique ?? 0}</p>
        </div>
      </div>

      <div className="fade-in" style={{ animationDelay: "0.3s" }}>
        <button
          onClick={() => setShowCustomForm(!showCustomForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors duration-300 font-semibold"
        >
          <Search className="w-5 h-5" />
          {showCustomForm ? "Hide" : "Custom Site Crawl"}
        </button>

        {showCustomForm && (
        <div
          className="backdrop-blur-md border border-border bg-card dark:bg-gradient-to-br dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] rounded-lg p-6 mt-4"
        >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Search for Specific Threats</h3>
              <button
                onClick={() => setShowCustomForm(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCustomCrawl} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Site/Domain</label>
                <input
                  type="text"
                  value={customSite}
                  onChange={(e) => setCustomSite(e.target.value)}
                  placeholder="e.g., example.com, 192.168.1.1"
                  className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Threat Type</label>
                <select
                  value={customThreat}
                  onChange={(e) => setCustomThreat(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                >
                  <option value="">Select threat type...</option>
                  <option value="Malware">Malware</option>
                  <option value="Phishing">Phishing</option>
                  <option value="DDoS">DDoS</option>
                  <option value="SQL Injection">SQL Injection</option>
                  <option value="XSS">XSS</option>
                  <option value="Ransomware">Ransomware</option>
                  <option value="Data Breach">Data Breach</option>
                  <option value="Zero-Day">Zero-Day</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isRunning || !customSite.trim() || !customThreat.trim()}
                className={`w-full px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                  isRunning || !customSite.trim() || !customThreat.trim()
                    ? "bg-muted/20 text-muted cursor-not-allowed"
                    : "bg-primary text-white hover:bg-cyan-500 hover:shadow-lg hover:shadow-cyan-500/30"
                }`}
              >
                Start Custom Crawl
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="fade-in" style={{ animationDelay: "0.4s" }}>
        <CrawlerLogs logs={logs} isRunning={isRunning || isPlayback} />
      </div>

      {results.length > 0 && <CrawlerSummary records={results} logs={logs} />}
    </div>
  )
}
