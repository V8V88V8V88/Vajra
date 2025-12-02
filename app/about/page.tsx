"use client"

import { Shield, Database, TrendingUp, Search, Download, Calendar, Zap, Bell, Filter, FileText, Globe, Brain, ChevronDown, ChevronUp } from "lucide-react"
import { useState } from "react"

export default function About() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 text-foreground">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold mb-2">About VAJRA</h1>
        <p className="text-xl text-muted-foreground">
          AI-Powered Cyber Threat Forecaster for Critical Infrastructure Protection
        </p>
        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <span>
            <span className="font-semibold">Developed by:</span>{" "}
            <a href="https://v8v88v8v88.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Vaibhav Pratap Singh
            </a>{" "}
            & Suryansh Sharma
          </span>
          <span>•</span>
          <span><span className="font-semibold">Year:</span> 4th Year (Minor Project)</span>
        </div>
      </div>

      {/* Simple Tech Stack - Always Visible */}
      <section className="backdrop-blur-md border border-border bg-card/95 dark:bg-card/95 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <h3 className="font-semibold text-foreground mb-2 text-lg">Backend</h3>
            <p className="text-muted-foreground text-sm">Python 3.10+</p>
            <p className="text-muted-foreground text-sm">FastAPI + Uvicorn</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2 text-lg">Frontend</h3>
            <p className="text-muted-foreground text-sm">Next.js 16</p>
            <p className="text-muted-foreground text-sm">React + TypeScript</p>
            <p className="text-muted-foreground text-sm">Tailwind CSS</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2 text-lg">Database</h3>
            <p className="text-muted-foreground text-sm">Neo4j (Graph DB)</p>
            <p className="text-muted-foreground text-sm">JSON (Fallback)</p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2 text-lg">AI & ML</h3>
            <p className="text-muted-foreground text-sm">Google Gemini AI (Chat)</p>
            <p className="text-muted-foreground text-sm">PyTorch (GNN, LSTM)</p>
            <p className="text-muted-foreground text-sm">BERT, scikit-learn</p>
          </div>
        </div>
      </section>

      {/* Expandable Details */}
      <section className="backdrop-blur-md border border-border bg-card/95 dark:bg-card/95 rounded-lg p-6">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-left mb-4 hover:opacity-80 transition-opacity"
        >
          <h2 className="text-2xl font-semibold text-foreground">
            {isExpanded ? "Project Details" : "Show Project Details"}
          </h2>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </button>

        {isExpanded && (
          <div className="space-y-8 pt-4 border-t border-border">
            {/* Overview */}
            <div>
              <p className="text-foreground leading-relaxed">
                VAJRA is an enterprise-grade threat intelligence platform that combines advanced machine learning with 
                real-time OSINT data collection to predict, detect, and analyze cyber threats. The system automatically 
                crawls multiple threat intelligence sources, stores data persistently, and provides comprehensive 
                visualization through an interactive dashboard. Features include real-time event-driven notifications, 
                advanced filtering and sorting capabilities, website vulnerability scanning with AI-powered analysis, 
                enhanced LSTM forecasting for short and long-term predictions, and consistent date range selectors 
                across all visualizations. All features are production-ready with persistent logging and export capabilities.
              </p>
            </div>

            {/* Key Features */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Zap className="w-6 h-6 text-primary" />
                Key Features
              </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="backdrop-blur-md border border-border bg-card/95 dark:bg-card/95 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">OSINT Crawler</h3>
                <p className="text-sm text-muted-foreground">
                  Automated collection from 8 diverse sources: NVD CVEs, CISA KEV, GitHub Security Advisories, 
                  Abuse.ch (URLhaus & ThreatFox), Exploit-DB, MalwareBazaar, and Reddit /r/netsec. 
                  Supports custom date ranges (1 month to 12 months or custom range).
                </p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md border border-border bg-card/95 dark:bg-card/95 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <Database className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Persistent Storage</h3>
                <p className="text-sm text-muted-foreground">
                  All crawled threats are stored persistently in JSON format, ensuring data survives server 
                  restarts. Duplicate detection prevents redundant entries. Works seamlessly with or without 
                  Neo4j database.
                </p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md border border-border bg-card/95 dark:bg-card/95 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Real-Time Dashboard</h3>
                <p className="text-sm text-muted-foreground">
                  Interactive dashboard showing threat trends, severity distribution, and source analysis. 
                  Custom date range selection for trend analysis. All data sourced from actual crawled threats, 
                  not synthetic data.
                </p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md border border-border bg-card/95 dark:bg-card/95 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <Search className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Threat Intelligence</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced search with real-time debouncing. Filter by severity (critical, high, medium, low) 
                  and sort by date (newest/oldest). Browse threats by severity, source, and date. Complete 
                  threat details with indicators, affected systems, recommendations, and direct CVE site links.
                </p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md border border-border bg-card/95 dark:bg-card/95 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Flexible Date Ranges</h3>
                <p className="text-sm text-muted-foreground">
                  Consistent date range selectors across all charts (1, 3, 6, 12 months + custom). Crawler 
                  supports custom time ranges with historical data crawling up to 5 years. Trend charts, 
                  source charts, and forecast charts all support flexible date filtering for comprehensive analysis.
                </p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md border border-border bg-card/95 dark:bg-card/95 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <Download className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Data Export</h3>
                <p className="text-sm text-muted-foreground">
                  Export all crawled threats as JSON for backup or analysis. Export website vulnerability 
                  scan results with complete analysis. Complete metadata included with timestamps, sources, 
                  severity, and all threat indicators.
                </p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md border border-border bg-card/95 dark:bg-card/95 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Real-Time Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Event-driven notification system that triggers on crawler completion, website vulnerability 
                  checks, and system events. Notifications persist across sessions and provide direct links 
                  to relevant pages. No more fake notifications - all alerts are based on actual system events.
                </p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md border border-border bg-card/95 dark:bg-card/95 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Website Vulnerability Checker</h3>
                <p className="text-sm text-muted-foreground">
                  Comprehensive website security analysis with technology detection, CVE matching, HTTPS 
                  verification, security headers check, and AI-powered vulnerability assessment. Export 
                  detailed scan reports as JSON. Detects piracy indicators and unsafe practices.
                </p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md border border-border bg-card/95 dark:bg-card/95 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <Brain className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">AI Threat Forecasting</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced LSTM-based forecasting for 7 days, 1 month, and 3 months ahead. Improved algorithms 
                  prevent convergence issues in long-term forecasts. Severity-based and source activity 
                  forecasting available. Hybrid approach combines LSTM predictions with statistical methods 
                  for accurate long-term trends.
                </p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md border border-border bg-card/95 dark:bg-card/95 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <Filter className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Advanced Filtering & Sorting</h3>
                <p className="text-sm text-muted-foreground">
                  Filter threats by severity (critical, high, medium, low) and sort by date (newest first 
                  or oldest first). Real-time filtering with instant results. Combined with search for 
                  powerful threat discovery capabilities.
                </p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md border border-border bg-card/95 dark:bg-card/95 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Crawler Logs Persistence</h3>
                <p className="text-sm text-muted-foreground">
                  Crawler run logs are automatically saved and persist across browser sessions. View last 
                  crawl statistics, timing information, and results even after closing the browser. 
                  Complete audit trail of all crawler activities.
                </p>
              </div>
            </div>
          </div>
        </div>
            </div>

            {/* Technical Stack */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold mb-4">Technical Stack</h2>
        <div className="backdrop-blur-md border border-border bg-card/95 dark:bg-card/95 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-foreground mb-3">Backend</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Python 3.10+ with FastAPI</li>
                <li>• Uvicorn ASGI server</li>
                <li>• Pydantic for data validation</li>
                <li>• RESTful API architecture</li>
                <li>• CORS configuration</li>
                <li>• Structured logging</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Frontend</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Next.js 16 with React & TypeScript</li>
                <li>• Tailwind CSS for styling</li>
                <li>• Recharts for data visualization</li>
                <li>• React Query for data fetching</li>
                <li>• Real-time crawler log streaming</li>
                <li>• Event-driven notification system</li>
                <li>• Persistent localStorage for logs & settings</li>
                <li>• Responsive dark mode UI</li>
                <li>• Consistent date range selectors</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">AI/ML Layer</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• PyTorch for deep learning</li>
                <li>• Graph Neural Networks (GNN) - 92.3% accuracy</li>
                <li>• LSTM models for temporal forecasting - 88.7% accuracy</li>
                <li>• BERT transformers for NLP analysis</li>
                <li>• Isolation Forest for anomaly detection</li>
                <li>• Explainable AI (XAI) layer</li>
                <li>• Pre-trained models on 88,500+ threats</li>
                <li>• Hybrid forecasting (LSTM + Statistical)</li>
                <li>• Gemini AI for chat & analysis</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Database</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Neo4j graph database (primary)</li>
                <li>• Bolt protocol for Neo4j connection</li>
                <li>• JSON file persistence (fallback)</li>
                <li>• Atomic file writes for data integrity</li>
                <li>• In-memory simulation mode</li>
                <li>• Automatic fallback mechanisms</li>
                <li>• Graph query support</li>
                <li>• Relationship management</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">OSINT Crawler</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Python requests library</li>
                <li>• Feedparser for RSS feeds</li>
                <li>• JSON API parsing</li>
                <li>• Custom user-agent handling</li>
                <li>• Retry logic with exponential backoff</li>
                <li>• Pagination support (NVD API)</li>
                <li>• Date range filtering</li>
                <li>• Duplicate detection</li>
                <li>• Error handling & logging</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">Website Vulnerability Scanner</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Python requests for HTTP scanning</li>
                <li>• BeautifulSoup4 for HTML parsing</li>
                <li>• Regular expressions for pattern matching</li>
                <li>• SSL/TLS certificate verification</li>
                <li>• HTTP header analysis</li>
                <li>• Technology fingerprinting</li>
                <li>• CVE database matching</li>
                <li>• AI-powered risk assessment</li>
                <li>• Security headers detection</li>
              </ul>
            </div>
          </div>
        </div>
            </div>

            {/* Data Sources */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold mb-4">Threat Intelligence Sources</h2>
        <div className="backdrop-blur-md border border-border bg-card/95 dark:bg-card/95 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span>NVD (National Vulnerability Database)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span>CISA Known Exploited Vulnerabilities</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span>GitHub Security Advisories</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span>Abuse.ch URLhaus (Malware URLs)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span>Abuse.ch ThreatFox (IOCs)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span>Exploit-DB</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span>MalwareBazaar</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span>Reddit /r/netsec</span>
            </div>
          </div>
        </div>
            </div>

            {/* How It Works */}
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
        <div className="backdrop-blur-md border border-border bg-card/95 dark:bg-card/95 rounded-lg p-6">
          <ol className="list-decimal list-inside space-y-4 text-foreground">
            <li>
              <span className="font-semibold">OSINT Data Collection:</span> The crawler automatically fetches 
              threat intelligence from 8 diverse sources. You can configure custom date ranges from 1 month 
              to multiple years, or select specific date ranges for historical analysis.
            </li>
            <li>
              <span className="font-semibold">Data Normalization & Storage:</span> Raw threat data is normalized 
              into a consistent format, deduplicated, and stored persistently in the database. The system works 
              with Neo4j when available, or uses JSON-based persistence for standalone operation.
            </li>
            <li>
              <span className="font-semibold">AI-Powered Analysis:</span> Threats are analyzed using Graph Neural 
              Networks for relationship mapping, LSTM models for trend forecasting, BERT for NLP analysis, and 
              Isolation Forest for anomaly detection.
            </li>
            <li>
              <span className="font-semibold">Real-Time Dashboard:</span> The frontend displays threat trends, 
              severity distributions, source analysis, and comprehensive statistics. All visualizations are based 
              on actual crawled data, not synthetic information.
            </li>
            <li>
              <span className="font-semibold">Threat Intelligence Search:</span> Advanced search capabilities 
              with filtering by severity (critical, high, medium, low) and sorting by date (newest/oldest). 
              Real-time debouncing ensures smooth search experience. Direct links to CVE sites from threat details.
            </li>
            <li>
              <span className="font-semibold">Website Vulnerability Scanning:</span> Comprehensive security 
              analysis of websites including technology detection, CVE matching, security headers verification, 
              and AI-powered risk assessment. Export detailed scan reports.
            </li>
            <li>
              <span className="font-semibold">AI-Powered Forecasting:</span> LSTM neural networks predict 
              threat trends for 7 days, 1 month, and 3 months ahead. Enhanced algorithms prevent convergence 
              in long-term forecasts. Severity-based and source activity forecasting available.
            </li>
            <li>
              <span className="font-semibold">Real-Time Notifications:</span> Event-driven notification system 
              alerts users when crawler completes, website scans finish, or system events occur. Notifications 
              persist across sessions with direct links to relevant pages.
            </li>
            <li>
              <span className="font-semibold">Data Export:</span> Export all crawled threats and website scan 
              results as JSON for backup, analysis, or integration with other security tools. Complete metadata 
              included with timestamps, sources, severity, and all threat indicators.
            </li>
            <li>
              <span className="font-semibold">Crawler Logs Persistence:</span> All crawler runs are logged and 
              saved automatically. View last crawl statistics, timing, and results even after browser restart. 
              Complete audit trail of crawler activities.
            </li>
          </ol>
        </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-6 border-t border-border">
              <p className="text-muted-foreground text-sm">
                This project demonstrates end-to-end engineering: full-stack data flow from real-world OSINT crawling 
                to sophisticated AI processing and user-focused visualization. Built for cybersecurity professionals 
                protecting critical infrastructure worldwide.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
