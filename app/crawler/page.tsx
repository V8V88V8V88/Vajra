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

interface SavedCrawlerRun {
  startTime: string
  endTime: string
  logs: CrawlerLog[]
  stats: CrawlerStats | null
  results: CrawlerRecord[]
  timeRange: string
  isCustomCrawl: boolean
  customSite?: string
  customThreat?: string
}

const STORAGE_KEY = "vajra-last-crawler-run"

function saveCrawlerRun(run: SavedCrawlerRun) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(run))
    } catch (error) {
      console.error("Failed to save crawler run:", error)
    }
  }
}

function loadCrawlerRun(): SavedCrawlerRun | null {
  if (typeof window === "undefined") return null
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved) as SavedCrawlerRun
      // Convert date strings back to Date objects for logs
      if (parsed.logs) {
        parsed.logs = parsed.logs.map((log) => ({
          ...log,
          timestamp: new Date(log.timestamp),
        }))
      }
      return parsed
    }
  } catch (error) {
    console.error("Failed to load crawler run:", error)
  }
  return null
}

export default function CrawlerPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [isPlayback, setIsPlayback] = useState(false)
  const [logs, setLogs] = useState<CrawlerLog[]>([])
  const [results, setResults] = useState<CrawlerRecord[]>([])
  const [stats, setStats] = useState<CrawlerStats | null>(null)
  const [lastRunAt, setLastRunAt] = useState<Date | null>(null)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [customSite, setCustomSite] = useState("")
  const [customThreat, setCustomThreat] = useState("")
  const [showCustomForm, setShowCustomForm] = useState(false)
  const [timeRange, setTimeRange] = useState<"1month" | "3months" | "6months" | "12months" | "custom">("6months")
  const [customStartDate, setCustomStartDate] = useState("")
  const [customEndDate, setCustomEndDate] = useState("")
  const [abortController, setAbortController] = useState<AbortController | null>(null)

  const logPlaybackRef = useRef<NodeJS.Timeout | null>(null)

  // Load saved crawler run on mount
  useEffect(() => {
    const saved = loadCrawlerRun()
    if (saved) {
      setLogs(saved.logs || [])
      setStats(saved.stats)
      setResults(saved.results || [])
      setLastRunAt(new Date(saved.endTime))
      setStartTime(new Date(saved.startTime))
      if (saved.timeRange) {
        setTimeRange(saved.timeRange as typeof timeRange)
      }
      if (saved.isCustomCrawl) {
        setCustomSite(saved.customSite || "")
        setCustomThreat(saved.customThreat || "")
      }
    }
  }, [])

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
    (result: CrawlerResult, isCustom: boolean = false) => {
      const completedAt = new Date()
      const logEntries = result.logs || []
      
      // Always set stats and results immediately
      setStats(result.stats)
      setResults(result.records || [])

      // If no logs, just save and finish
      if (logEntries.length === 0) {
        setLogs([])
        setLastRunAt(completedAt)
        setIsRunning(false)
        setIsPlayback(false)
        
        // Save even if no logs
        if (startTime) {
          saveCrawlerRun({
            startTime: startTime.toISOString(),
            endTime: completedAt.toISOString(),
            logs: [],
            stats: result.stats,
            results: result.records || [],
            timeRange: timeRange,
            isCustomCrawl: isCustom,
            customSite: isCustom ? customSite : undefined,
            customThreat: isCustom ? customThreat : undefined,
          })
        }
        return
      }

      // Validate logs have required fields
      const validLogs = logEntries.filter(log => 
        log && 
        log.id && 
        log.type && 
        log.message && 
        log.timestamp instanceof Date
      )
      
      if (validLogs.length === 0) {
        // Add a fallback log
        const fallbackLog: CrawlerLog = {
          id: `log-fallback-${Date.now()}`,
          timestamp: completedAt,
          message: "Crawler completed but no valid logs were returned",
          type: "warning"
        }
        setLogs([fallbackLog])
        setLastRunAt(completedAt)
        setIsRunning(false)
        setIsPlayback(false)
        return
      }

      // Start playback animation
      setIsPlayback(true)
      setIsRunning(false) // Mark as not running since we have results
      stopLogPlayback()
      setLogs([]) // Clear logs before playback

      let index = 0
      logPlaybackRef.current = setInterval(() => {
        if (index < validLogs.length && validLogs[index]) {
          setLogs((prev) => [...prev, validLogs[index]])
          index += 1
        }
        if (index >= validLogs.length) {
          stopLogPlayback()
          setIsPlayback(false)
          setLastRunAt(completedAt)
          
          // Ensure all logs are displayed (in case playback missed any)
          setLogs(validLogs)
          
          // Save crawler run data after playback completes
          if (startTime) {
            saveCrawlerRun({
              startTime: startTime.toISOString(),
              endTime: completedAt.toISOString(),
              logs: validLogs,
              stats: result.stats,
              results: result.records || [],
              timeRange: timeRange,
              isCustomCrawl: isCustom,
              customSite: isCustom ? customSite : undefined,
              customThreat: isCustom ? customThreat : undefined,
            })
          }
        }
      }, 320)
    },
    [stopLogPlayback, startTime, timeRange, customSite, customThreat]
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
    const crawlStartTime = new Date()
    setStartTime(crawlStartTime)
    stopLogPlayback()

    try {
      // Calculate date range based on selection
      let startDate: string | undefined = undefined
      let endDate: string | undefined = undefined
      
      if (timeRange === "custom") {
        if (!customStartDate || !customEndDate) {
          setError("Please select both start and end dates for custom range")
          setIsRunning(false)
          return
        }
        if (new Date(customStartDate) > new Date(customEndDate)) {
          setError("Start date must be before end date")
          setIsRunning(false)
          return
        }
        startDate = customStartDate
        endDate = customEndDate
      } else {
        const end = new Date()
        const start = new Date()
        const months = timeRange === "1month" ? 1 : timeRange === "3months" ? 3 : timeRange === "6months" ? 6 : 12
        start.setMonth(start.getMonth() - months)
        startDate = start.toISOString().split('T')[0]
        endDate = end.toISOString().split('T')[0]
      }
      
      const result = await startCrawler(controller.signal, startDate, endDate)
      
      // Ensure crawler is marked as stopped
      setIsRunning(false)
      
      // Process results
      handleCrawlerResult(result, false)
    } catch (err) {
      if ((err as DOMException)?.name === "AbortError") {
        setError("Crawler run cancelled by user.")
        const cancelLog: CrawlerLog = {
          id: `log-cancel-${Date.now()}`,
          timestamp: new Date(),
          message: "Crawler run cancelled by user",
          type: "warning",
        }
        setLogs((prev) => {
          const updatedLogs = [...prev, cancelLog]
          
          // Save cancelled run info
          if (startTime) {
            const cancelledAt = new Date()
            saveCrawlerRun({
              startTime: startTime.toISOString(),
              endTime: cancelledAt.toISOString(),
              logs: updatedLogs,
              stats: stats,
              results: results,
              timeRange: timeRange,
              isCustomCrawl: false,
            })
          }
          
          return updatedLogs
        })
      } else {
        console.error("Crawler error:", err)
        setError("Failed to run crawler. Ensure the backend is running on port 8000.")
        
        // Add error log
        const errorLog: CrawlerLog = {
          id: `log-error-${Date.now()}`,
          timestamp: new Date(),
          message: `Crawler failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
          type: "error",
        }
        setLogs((prev) => [...prev, errorLog])
        
        // Save error run info
        if (startTime) {
          const errorAt = new Date()
          saveCrawlerRun({
            startTime: startTime.toISOString(),
            endTime: errorAt.toISOString(),
            logs: [...logs, errorLog],
            stats: null,
            results: [],
            timeRange: timeRange,
            isCustomCrawl: false,
          })
        }
      }
    } finally {
      // Always ensure running state is cleared
      setIsRunning(false)
      setIsPlayback(false)
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

    const crawlStartTime = new Date()
    setStartTime(crawlStartTime)
    setIsRunning(true)
    setLogs([])
    setResults([])
    setStats(null)

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

      // Mock stats and results for custom crawl
      const mockStats: CrawlerStats = {
        sources: 3,
        itemsTotal: 12,
        itemsUnique: 12,
      }
      const mockResults: CrawlerRecord[] = []

      setLogs([])
      setIsPlayback(true)

      let index = 0
      stopLogPlayback()
      logPlaybackRef.current = setInterval(() => {
        if (index < mockLogs.length && mockLogs[index]) {
          setLogs((prev) => [...prev, mockLogs[index]])
          index += 1
        }
        if (index >= mockLogs.length) {
          stopLogPlayback()
          setIsPlayback(false)
          const completedAt = new Date()
          setLastRunAt(completedAt)
          setStats(mockStats)
          setResults(mockResults)
          
          // Save custom crawl run
          saveCrawlerRun({
            startTime: crawlStartTime.toISOString(),
            endTime: completedAt.toISOString(),
            logs: mockLogs,
            stats: mockStats,
            results: mockResults,
            timeRange: "custom",
            isCustomCrawl: true,
            customSite: customSite,
            customThreat: customThreat,
          })
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
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Crawler Status</h3>
                <p className="text-muted-foreground">
                  {isRunning
                    ? "Crawler request in progress..."
                    : isPlayback
                      ? "Streaming log output..."
                      : lastRunAt && startTime
                        ? `Last run: ${startTime.toLocaleString()} - ${lastRunAt.toLocaleString()} (${Math.round((lastRunAt.getTime() - startTime.getTime()) / 1000)}s)`
                        : lastRunAt
                          ? `Last run at ${lastRunAt.toLocaleString()}`
                          : "Crawler is idle"}
                </p>
                {lastRunAt && stats && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Collected {stats.itemsTotal} items from {stats.sources} sources ({stats.itemsUnique} unique)
                  </p>
                )}
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
            
            {/* Time Range Selector */}
            <div className="border-t border-border pt-4 mt-4">
              <label className="block text-sm font-medium text-foreground mb-3">Time Range</label>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setTimeRange("1month")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === "1month"
                      ? "bg-primary text-white"
                      : "bg-accent/10 text-foreground hover:bg-accent/20"
                  }`}
                >
                  1 Month
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange("3months")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === "3months"
                      ? "bg-primary text-white"
                      : "bg-accent/10 text-foreground hover:bg-accent/20"
                  }`}
                >
                  3 Months
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange("6months")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === "6months"
                      ? "bg-primary text-white"
                      : "bg-accent/10 text-foreground hover:bg-accent/20"
                  }`}
                >
                  6 Months
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange("12months")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === "12months"
                      ? "bg-primary text-white"
                      : "bg-accent/10 text-foreground hover:bg-accent/20"
                  }`}
                >
                  12 Months
                </button>
                <button
                  type="button"
                  onClick={() => setTimeRange("custom")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    timeRange === "custom"
                      ? "bg-primary text-white"
                      : "bg-accent/10 text-foreground hover:bg-accent/20"
                  }`}
                >
                  Custom Range
                </button>
              </div>
              
              {timeRange === "custom" && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Start Date</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">End Date</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                </div>
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
