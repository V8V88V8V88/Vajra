"use client"

import type React from "react"

import { useState } from "react"
import { startCrawler, type CrawlerLog } from "@/lib/api"
import { CrawlerLogs } from "@/components/crawler/crawler-logs"
import { Play, Search, X } from "lucide-react"

export default function CrawlerPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [logs, setLogs] = useState<CrawlerLog[]>([])
  const [customSite, setCustomSite] = useState("")
  const [customThreat, setCustomThreat] = useState("")
  const [showCustomForm, setShowCustomForm] = useState(false)

  const handleStartCrawler = async () => {
    setIsRunning(true)
    setLogs([])

    try {
      const crawlerLogs = await startCrawler()
      setLogs(crawlerLogs)
    } catch (error) {
      console.error("Crawler error:", error)
    } finally {
      setIsRunning(false)
    }
  }

  const handleCustomCrawl = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customSite.trim() || !customThreat.trim()) return

    setIsRunning(true)
    setLogs([])

    try {
      // Simulate custom crawl with mock logs
      const mockLogs: CrawlerLog[] = [
        { timestamp: new Date().toISOString(), message: `Initiating custom crawl for: ${customSite}`, type: "info" },
        { timestamp: new Date().toISOString(), message: `Threat type: ${customThreat}`, type: "info" },
        { timestamp: new Date().toISOString(), message: "Connecting to data sources...", type: "info" },
        {
          timestamp: new Date().toISOString(),
          message: `Scanning ${customSite} for ${customThreat} indicators...`,
          type: "info",
        },
        { timestamp: new Date().toISOString(), message: "Analyzing threat patterns...", type: "warning" },
        {
          timestamp: new Date().toISOString(),
          message: `Found 12 potential ${customThreat} indicators`,
          type: "success",
        },
        { timestamp: new Date().toISOString(), message: "Indexing results in threat database...", type: "info" },
        { timestamp: new Date().toISOString(), message: "Custom crawl completed successfully", type: "success" },
      ]

      // Simulate streaming logs
      for (const log of mockLogs) {
        await new Promise((resolve) => setTimeout(resolve, 300))
        setLogs((prev) => [...prev, log])
      }

      setCustomSite("")
      setCustomThreat("")
      setShowCustomForm(false)
    } catch (error) {
      console.error("Custom crawl error:", error)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="fade-in">
        <h1 className="text-3xl font-bold text-foreground mb-2">OSINT Crawler</h1>
        <p className="text-muted">Automated threat intelligence data collection and indexing</p>
      </div>

      {/* Control Panel */}
      <div className="fade-in" style={{ animationDelay: "0.1s" }}>
        <div
          style={{ backgroundColor: "rgba(15, 26, 46, 0.6)", borderColor: "rgba(30, 41, 59, 0.3)" }}
          className="backdrop-blur-md border rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Crawler Status</h3>
              <p className="text-muted">{isRunning ? "Crawler is running..." : "Crawler is idle"}</p>
            </div>
            <button
              onClick={handleStartCrawler}
              disabled={isRunning}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                isRunning
                  ? "bg-muted/20 text-muted cursor-not-allowed"
                  : "bg-primary text-white hover:bg-cyan-500 hover:shadow-lg hover:shadow-cyan-500/30"
              }`}
            >
              <Play className="w-5 h-5" />
              {isRunning ? "Running..." : "Start Crawler"}
            </button>
          </div>
        </div>
      </div>

      {/* Crawler Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 fade-in" style={{ animationDelay: "0.2s" }}>
        <div
          style={{ backgroundColor: "rgba(15, 26, 46, 0.6)", borderColor: "rgba(30, 41, 59, 0.3)" }}
          className="backdrop-blur-md border rounded-lg p-6"
        >
          <p className="text-sm text-muted mb-2">Crawler Interval</p>
          <p className="text-2xl font-bold text-foreground">6 hours</p>
        </div>
        <div
          style={{ backgroundColor: "rgba(15, 26, 46, 0.6)", borderColor: "rgba(30, 41, 59, 0.3)" }}
          className="backdrop-blur-md border rounded-lg p-6"
        >
          <p className="text-sm text-muted mb-2">Data Sources</p>
          <p className="text-2xl font-bold text-foreground">5</p>
        </div>
        <div
          style={{ backgroundColor: "rgba(15, 26, 46, 0.6)", borderColor: "rgba(30, 41, 59, 0.3)" }}
          className="backdrop-blur-md border rounded-lg p-6"
        >
          <p className="text-sm text-muted mb-2">Last Sync</p>
          <p className="text-2xl font-bold text-foreground">2 hours ago</p>
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
            style={{ backgroundColor: "rgba(15, 26, 46, 0.6)", borderColor: "rgba(30, 41, 59, 0.3)" }}
            className="backdrop-blur-md border rounded-lg p-6 mt-4"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Search for Specific Threats</h3>
              <button
                onClick={() => setShowCustomForm(false)}
                className="text-muted hover:text-foreground transition-colors"
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

      {/* Logs */}
      <div className="fade-in" style={{ animationDelay: "0.4s" }}>
        <CrawlerLogs logs={logs} isRunning={isRunning} />
      </div>
    </div>
  )
}
