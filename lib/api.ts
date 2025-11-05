// API layer for cyber threat forecaster
// Backend API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface Threat {
  id: string
  title: string
  severity: "critical" | "high" | "medium" | "low"
  timestamp: Date
  summary: string
  description: string
  source: string
  indicators: string[]
  affectedSystems: string[]
  recommendation: string
}

export interface ThreatStats {
  totalThreats: number
  criticalThreats: number
  activeCampaigns: number
  lastUpdate: Date
}

export interface CrawlerLog {
  id: string
  timestamp: Date
  message: string
  type: "info" | "success" | "warning" | "error"
}

export interface CrawlerRecord {
  id: string
  source: string
  title: string
  url: string
  summary: string
  published?: Date | null
  severity?: string | null
  status?: string | null
  metadata?: Record<string, string>
}

export interface CrawlerStats {
  sources: number
  itemsTotal: number
  itemsUnique: number
}

export interface CrawlerResult {
  logs: CrawlerLog[]
  records: CrawlerRecord[]
  stats: CrawlerStats
}

// Mock threat data
const mockThreats: Threat[] = [
  {
    id: "1",
    title: "APT-28 Spear Phishing Campaign",
    severity: "critical",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    summary: "Sophisticated phishing campaign targeting financial institutions",
    description:
      "Advanced persistent threat group APT-28 has launched a coordinated spear phishing campaign targeting major financial institutions across North America and Europe.",
    source: "OSINT Feed - Threat Intelligence",
    indicators: ["malicious.domain.com", "192.168.1.100", "phishing@fake-bank.com"],
    affectedSystems: ["Email Servers", "Web Gateways", "DNS Resolvers"],
    recommendation: "Implement advanced email filtering, conduct security awareness training, monitor for IOCs",
  },
  {
    id: "2",
    title: "Zero-Day Vulnerability in OpenSSL",
    severity: "critical",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    summary: "Critical vulnerability discovered in OpenSSL 3.0.x versions",
    description:
      "A critical remote code execution vulnerability has been discovered in OpenSSL versions 3.0.0 through 3.0.7. This vulnerability allows unauthenticated attackers to execute arbitrary code.",
    source: "CVE Database",
    indicators: ["CVE-2023-0286", "OpenSSL 3.0.x"],
    affectedSystems: ["Web Servers", "API Gateways", "Load Balancers"],
    recommendation: "Immediately patch OpenSSL to version 3.0.8 or later, review system logs for exploitation attempts",
  },
  {
    id: "3",
    title: "Ransomware-as-a-Service (RaaS) Marketplace Activity",
    severity: "high",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    summary: "Increased activity on dark web RaaS marketplaces",
    description:
      "Intelligence indicates a 45% increase in ransomware-as-a-service offerings on dark web marketplaces, with new variants targeting healthcare and manufacturing sectors.",
    source: "Dark Web Monitoring",
    indicators: ["LockBit 3.0", "BlackCat", "Cl0p"],
    affectedSystems: ["File Servers", "Backup Systems", "Database Servers"],
    recommendation: "Strengthen backup strategies, implement network segmentation, monitor for lateral movement",
  },
  {
    id: "4",
    title: "Credential Stuffing Attack Wave",
    severity: "high",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    summary: "Large-scale credential stuffing attacks detected",
    description:
      "Massive credential stuffing campaign detected targeting e-commerce and SaaS platforms using leaked credentials from previous breaches.",
    source: "Network Monitoring",
    indicators: ["Brute Force Patterns", "Leaked Credential Lists"],
    affectedSystems: ["Authentication Services", "API Endpoints"],
    recommendation: "Implement MFA, rate limiting, and CAPTCHA challenges on login endpoints",
  },
  {
    id: "5",
    title: "Supply Chain Attack - Compromised NPM Package",
    severity: "high",
    timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000),
    summary: "Popular NPM package compromised with malicious code",
    description:
      "A widely-used NPM package has been compromised and injected with malicious code designed to exfiltrate environment variables and credentials.",
    source: "Package Registry Monitoring",
    indicators: ["malicious-package@1.2.3", "npm registry"],
    affectedSystems: ["Development Environments", "CI/CD Pipelines"],
    recommendation: "Audit dependencies, implement package verification, use private registries",
  },
  {
    id: "6",
    title: "DDoS Attack on Financial Services",
    severity: "medium",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
    summary: "Distributed denial of service attack targeting banking sector",
    description:
      "A coordinated DDoS attack has been launched against multiple financial institutions, causing temporary service disruptions.",
    source: "ISP Alerts",
    indicators: ["Botnet C2 Servers", "Unusual Traffic Patterns"],
    affectedSystems: ["Web Servers", "DNS Infrastructure"],
    recommendation: "Activate DDoS mitigation services, implement rate limiting, coordinate with ISP",
  },
  {
    id: "7",
    title: "Malware Variant - Emotet Resurgence",
    severity: "medium",
    timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000),
    summary: "New Emotet malware variant detected in the wild",
    description:
      "Security researchers have identified a new variant of the Emotet banking trojan being distributed through malicious email attachments.",
    source: "Malware Analysis",
    indicators: ["Emotet", "Banking Trojan", "Email Attachments"],
    affectedSystems: ["Endpoints", "Email Servers"],
    recommendation: "Update antivirus signatures, block malicious file types, conduct user training",
  },
  {
    id: "8",
    title: "Suspicious DNS Activity Detected",
    severity: "low",
    timestamp: new Date(Date.now() - 16 * 60 * 60 * 1000),
    summary: "Unusual DNS query patterns observed",
    description:
      "Network monitoring has detected unusual DNS query patterns that may indicate reconnaissance activity or data exfiltration attempts.",
    source: "DNS Monitoring",
    indicators: ["Unusual Query Patterns", "Suspicious Domains"],
    affectedSystems: ["DNS Servers", "Network Infrastructure"],
    recommendation: "Review DNS logs, implement DNS filtering, monitor for C2 communications",
  },
]

// Mock stats
const mockStats: ThreatStats = {
  totalThreats: 2847,
  criticalThreats: 12,
  activeCampaigns: 34,
  lastUpdate: new Date(),
}

// Mock trend data for charts
export const mockTrendData = [
  { date: "2024-01-01", threats: 45, critical: 2, high: 8 },
  { date: "2024-01-02", threats: 52, critical: 3, high: 10 },
  { date: "2024-01-03", threats: 48, critical: 2, high: 9 },
  { date: "2024-01-04", threats: 61, critical: 4, high: 12 },
  { date: "2024-01-05", threats: 55, critical: 3, high: 11 },
  { date: "2024-01-06", threats: 67, critical: 5, high: 14 },
  { date: "2024-01-07", threats: 72, critical: 6, high: 16 },
  { date: "2024-01-08", threats: 68, critical: 4, high: 13 },
  { date: "2024-01-09", threats: 75, critical: 7, high: 18 },
  { date: "2024-01-10", threats: 82, critical: 8, high: 20 },
]

export const mockSeverityData = [
  { name: "Critical", value: 12, fill: "#ef4444" },
  { name: "High", value: 156, fill: "#f59e0b" },
  { name: "Medium", value: 892, fill: "#06b6d4" },
  { name: "Low", value: 1787, fill: "#10b981" },
]

export const mockSourceData = [
  { name: "OSINT Feeds", value: 1245 },
  { name: "CVE Database", value: 456 },
  { name: "Dark Web", value: 234 },
  { name: "Network Monitoring", value: 678 },
  { name: "Malware Analysis", value: 234 },
]

// Chart data interfaces
export interface TrendDataPoint {
  date: string
  threats: number
  critical: number
  high: number
}

export interface SeverityDataPoint {
  name: string
  value: number
  fill: string
}

export interface SourceDataPoint {
  name: string
  value: number
}

// API functions
export async function getThreats(page = 1, limit = 10): Promise<{ threats: Threat[]; total: number }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/threats?page=${page}&limit=${limit}`)
    if (!response.ok) throw new Error('API request failed')
    const data = await response.json()
    
    // Transform backend data to frontend format
    const threats = data.threats.map((t: any) => {
      // Handle timestamp safely
      let timestamp: Date
      try {
        if (t.timestamp) {
          timestamp = new Date(t.timestamp)
          if (isNaN(timestamp.getTime())) {
            timestamp = new Date()
          }
        } else {
          timestamp = new Date()
        }
      } catch {
        timestamp = new Date()
      }
      
      // Normalize severity
      const severityMap: Record<string, Threat['severity']> = {
        'critical': 'critical',
        'high': 'high',
        'medium': 'medium',
        'low': 'low'
      }
      const normalizedSeverity = severityMap[t.severity?.toLowerCase()] || 'medium'
      
      return {
        id: t.id || `threat-${Date.now()}-${Math.random()}`,
        title: t.title || 'Unknown Threat',
        severity: normalizedSeverity,
        timestamp: timestamp,
        summary: t.summary || t.description || 'No description available',
        description: t.description || t.summary || 'No description available',
        source: t.source || 'Threat Database',
        indicators: t.indicators || [t.id],
        affectedSystems: t.affectedSystems || [],
        recommendation: t.recommendation || 'Monitor and investigate'
      }
    })
    
    return { threats, total: data.total }
  } catch (error) {
    console.error('Failed to fetch threats from API:', error)
    throw error
  }
}

export async function getThreatById(id: string): Promise<Threat | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/threats/${id}`)
    if (!response.ok) throw new Error('API request failed')
    const data = await response.json()
    return {
      id: data.id,
      title: data.title,
      severity: data.severity,
      timestamp: new Date(data.timestamp),
      summary: data.summary,
      description: data.description,
      source: data.source,
      indicators: data.indicators || [],
      affectedSystems: data.affectedSystems || [],
      recommendation: data.recommendation
    }
  } catch (error) {
    console.error('Failed to fetch threat details:', error)
    throw error
  }
}

export async function getStats(): Promise<ThreatStats> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/stats`)
    if (!response.ok) throw new Error('API request failed')
    const data = await response.json()
    return {
      totalThreats: data.totalThreats,
      criticalThreats: data.criticalThreats,
      activeCampaigns: data.activeCampaigns,
      lastUpdate: new Date(data.lastUpdate)
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error)
    throw error
  }
}

export async function startCrawler(signal?: AbortSignal): Promise<CrawlerResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/crawler/start`, {
      method: 'POST',
      signal
    })
    if (!response.ok) throw new Error('API request failed')
    const data = await response.json()

    const logs: CrawlerLog[] = (data.logs || []).map((log: any, index: number) => ({
      id: log.id || `log-${index}-${Date.now()}`,
      timestamp: log.timestamp ? new Date(log.timestamp) : new Date(),
      message: log.message ?? '',
      type: (log.type as CrawlerLog['type']) || 'info'
    }))

    const records: CrawlerRecord[] = (data.records || []).map((record: any, index: number) => ({
      id: record.id ?? `record-${index}-${Date.now()}`,
      source: record.source ?? 'unknown',
      title: record.title ?? 'Untitled',
      url: record.url ?? '',
      summary: record.summary ?? '',
      published: record.published ? new Date(record.published) : null,
      severity: record.severity ?? null,
      status: record.status ?? null,
      metadata: record.metadata ?? {}
    }))

    const stats: CrawlerStats = {
      sources: data.stats?.sources ?? 0,
      itemsTotal: data.stats?.items_total ?? data.stats?.itemsTotal ?? records.length,
      itemsUnique:
        data.stats?.items_unique ?? data.stats?.itemsUnique ?? new Set(records.map((r) => `${r.source}:${r.id}`)).size,
    }

    return { logs, records, stats }
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw error
    }
    console.error('Failed to start crawler via API:', error)
    throw error
  }
}

export async function searchThreats(query: string): Promise<Threat[]> {
  console.log('[searchThreats] Called with query:', query)
  
  if (!query || !query.trim()) {
    console.log('[searchThreats] Empty query, returning empty array')
    return []
  }

  const searchUrl = `${API_BASE_URL}/api/search?q=${encodeURIComponent(query.trim())}`
  console.log('[searchThreats] Fetching from:', searchUrl)

  try {
    const response = await fetch(searchUrl)
    console.log('[searchThreats] Response status:', response.status, response.ok)
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }
    const data = await response.json()
    console.log('[searchThreats] Response data:', data)
    
    // Backend returns {results: [...]} with simplified threat objects
    const results = data.results || []
    console.log('[searchThreats] Results count:', results.length)
    
    // If backend returns results, map them to Threat format
    if (results.length > 0) {
      const mapped = results.map((t: any) => {
        // Normalize severity to match Threat type
        const severityMap: Record<string, Threat['severity']> = {
          'critical': 'critical',
          'high': 'high',
          'medium': 'medium',
          'low': 'low'
        }
        const normalizedSeverity = severityMap[t.severity?.toLowerCase()] || 'medium'
        
        // Handle timestamp - use current date if missing
        let timestamp: Date
        if (t.timestamp) {
          try {
            timestamp = new Date(t.timestamp)
            // Check if date is valid
            if (isNaN(timestamp.getTime())) {
              timestamp = new Date()
            }
          } catch {
            timestamp = new Date()
          }
        } else {
          timestamp = new Date()
        }
        
        return {
          id: t.id || `threat-${Date.now()}-${Math.random()}`,
          title: t.title || t.name || 'Unknown Threat',
          severity: normalizedSeverity,
          timestamp: timestamp,
          summary: t.summary || t.description || `Threat of type ${t.type || 'unknown'}`,
          description: t.description || `Threat type: ${t.type || 'unknown'}. ID: ${t.id}`,
          source: t.source || 'Threat Database',
          indicators: t.indicators || [t.id],
          affectedSystems: t.affectedSystems || [],
          recommendation: t.recommendation || 'Monitor and investigate'
        }
      })
      console.log('[searchThreats] Mapped results:', mapped)
      return mapped
    }
    
    // If backend returns empty results, fall back to mock data search
    console.log('[searchThreats] Backend returned empty results, falling back to mock data search')
    const queryLower = query.toLowerCase()
    const filtered = mockThreats.filter(
      (t) => 
        t.title.toLowerCase().includes(queryLower) || 
        t.summary.toLowerCase().includes(queryLower) ||
        t.description.toLowerCase().includes(queryLower) ||
        t.source.toLowerCase().includes(queryLower)
    )
    console.log('[searchThreats] Mock data filtered results:', filtered.length, 'threats')
    return filtered
  } catch (error) {
    console.error('[searchThreats] Failed to search threats via API, using mock data:', error)
    // Fallback to client-side filtering of mock data
    const queryLower = query.toLowerCase()
    const filtered = mockThreats.filter(
      (t) => 
        t.title.toLowerCase().includes(queryLower) || 
        t.summary.toLowerCase().includes(queryLower) ||
        t.description.toLowerCase().includes(queryLower) ||
        t.source.toLowerCase().includes(queryLower)
    )
    console.log('[searchThreats] Error fallback mock data results:', filtered.length, 'threats')
    return filtered
  }
}

// New API functions for backend AI inference endpoints
export async function analyzeWithGNN(data: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze/graph`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('GNN analysis failed')
    return await response.json()
  } catch (error) {
    console.error('GNN analysis error:', error)
    throw error
  }
}

export async function analyzeWithNLP(text: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze/nlp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    })
    if (!response.ok) throw new Error('NLP analysis failed')
    return await response.json()
  } catch (error) {
    console.error('NLP analysis error:', error)
    throw error
  }
}

export async function analyzeWithTemporal(data: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze/temporal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Temporal analysis failed')
    return await response.json()
  } catch (error) {
    console.error('Temporal analysis error:', error)
    throw error
  }
}

export async function detectAnomalies(data: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze/anomaly`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (!response.ok) throw new Error('Anomaly detection failed')
    return await response.json()
  } catch (error) {
    console.error('Anomaly detection error:', error)
    throw error
  }
}

export async function getHealthStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`)
    if (!response.ok) throw new Error('Health check failed')
    return await response.json()
  } catch (error) {
    console.error('Health check error:', error)
    return { status: 'offline', message: 'Backend unavailable' }
  }
}

// Chart data API functions
export async function getTrendData(days: number = 10): Promise<TrendDataPoint[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/charts/trend?days=${days}`)
    if (!response.ok) throw new Error('Failed to fetch trend data')
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Failed to fetch trend data from API:', error)
    throw error
  }
}

export async function getSeverityData(): Promise<SeverityDataPoint[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/charts/severity`)
    if (!response.ok) throw new Error('Failed to fetch severity data')
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Failed to fetch severity data from API:', error)
    throw error
  }
}

export async function getSourceData(): Promise<SourceDataPoint[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/charts/sources`)
    if (!response.ok) throw new Error('Failed to fetch source data')
    const data = await response.json()
    return data.data || []
  } catch (error) {
    console.error('Failed to fetch source data from API:', error)
    // Return empty array instead of mock data - let backend handle fallback
    return []
  }
}
