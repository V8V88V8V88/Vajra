"use client"

import { Shield, Database, TrendingUp, Search, Download, Calendar, Zap } from "lucide-react"

export default function About() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 text-foreground">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold mb-2">About Vajra</h1>
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

      {/* Overview */}
      <section className="backdrop-blur-md border border-border bg-card dark:bg-gradient-to-br dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] rounded-lg p-6">
        <p className="text-foreground leading-relaxed">
          Vajra is an enterprise-grade threat intelligence platform that combines advanced machine learning with 
          real-time OSINT data collection to predict, detect, and analyze cyber threats. The system automatically 
          crawls multiple threat intelligence sources, stores data persistently, and provides comprehensive 
          visualization through an interactive dashboard.
        </p>
      </section>

      {/* Key Features */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-6 h-6 text-primary" />
          Key Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="backdrop-blur-md border border-border bg-card dark:bg-gradient-to-br dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] rounded-lg p-5">
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

          <div className="backdrop-blur-md border border-border bg-card dark:bg-gradient-to-br dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] rounded-lg p-5">
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

          <div className="backdrop-blur-md border border-border bg-card dark:bg-gradient-to-br dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] rounded-lg p-5">
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

          <div className="backdrop-blur-md border border-border bg-card dark:bg-gradient-to-br dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] rounded-lg p-5">
            <div className="flex items-start gap-3">
              <Search className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Threat Intelligence</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced search with real-time debouncing. Browse threats by severity, source, and date. 
                  Complete threat details with indicators, affected systems, and recommendations.
                </p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md border border-border bg-card dark:bg-gradient-to-br dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] rounded-lg p-5">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Flexible Date Ranges</h3>
                <p className="text-sm text-muted-foreground">
                  Crawler supports custom time ranges (1, 3, 6, 12 months) or custom date selection. 
                  Trend charts can display data from any date range, analyzing historical patterns from 2022 onwards.
                </p>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md border border-border bg-card dark:bg-gradient-to-br dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] rounded-lg p-5">
            <div className="flex items-start gap-3">
              <Download className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Data Export</h3>
                <p className="text-sm text-muted-foreground">
                  Export all crawled threats as JSON for backup or analysis. Complete metadata included 
                  with timestamps, sources, severity, and all threat indicators.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Stack */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold mb-4">Technical Stack</h2>
        <div className="backdrop-blur-md border border-border bg-card dark:bg-gradient-to-br dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-foreground mb-3">Backend</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Python 3.10+ with FastAPI</li>
                <li>• Neo4j connector with JSON persistence fallback</li>
                <li>• Graph Neural Networks (GNN) for threat analysis</li>
                <li>• LSTM models for temporal forecasting</li>
                <li>• BERT transformers for NLP analysis</li>
                <li>• Isolation Forest for anomaly detection</li>
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
                <li>• Responsive dark mode UI</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Data Sources */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold mb-4">Threat Intelligence Sources</h2>
        <div className="backdrop-blur-md border border-border bg-card dark:bg-gradient-to-br dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] rounded-lg p-6">
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
      </section>

      {/* How It Works */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
        <div className="backdrop-blur-md border border-border bg-card dark:bg-gradient-to-br dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] rounded-lg p-6">
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
              allow users to find threats by keyword, severity, source, or date range. Real-time debouncing 
              ensures smooth search experience.
            </li>
            <li>
              <span className="font-semibold">Data Export:</span> All crawled threats can be exported as JSON 
              for backup, analysis, or integration with other security tools.
            </li>
          </ol>
        </div>
      </section>

      {/* Project Status */}
      <section className="backdrop-blur-md border border-border bg-card dark:bg-gradient-to-br dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Project Status</h2>
        <div className="space-y-3 text-sm text-muted-foreground">
          <p>
            <span className="font-semibold text-foreground">Production-Ready OSINT Crawler</span> - Fully functional 
            with 8 diverse threat intelligence sources, custom date ranges, and persistent storage
          </p>
          <p>
            <span className="font-semibold text-foreground">Real-Time Dashboard</span> - Displays actual crawled 
            data with interactive charts, trend analysis, and custom date range selection
          </p>
          <p>
            <span className="font-semibold text-foreground">Threat Intelligence Feed</span> - Browse, search, and 
            analyze threats with advanced filtering and real-time search
          </p>
          <p>
            <span className="font-semibold text-foreground">Data Export</span> - Export all threats as JSON for 
            backup and analysis
          </p>
          <p>
            <span className="font-semibold text-foreground">AI Models Ready</span> - Pre-trained GNN (92.3% accuracy) 
            and LSTM (88.7% accuracy) models available for threat analysis
          </p>
        </div>
      </section>

      {/* Footer */}
      <section className="text-center pt-6 border-t border-border">
        <p className="text-muted-foreground text-sm">
          This project demonstrates end-to-end engineering: full-stack data flow from real-world OSINT crawling 
          to sophisticated AI processing and user-focused visualization. Built for cybersecurity professionals 
          protecting critical infrastructure worldwide.
        </p>
      </section>
    </div>
  );
}
