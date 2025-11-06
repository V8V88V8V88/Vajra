"use client"

import { useState } from "react"
import { checkWebsite, type WebsiteCheckResult } from "@/lib/api"
import { Search, AlertCircle, CheckCircle, XCircle, ExternalLink, Shield, Server, Code, Globe, Loader2 } from "lucide-react"

const severityColors = {
  critical: "bg-red-500/10 border-red-500/20 text-red-400",
  high: "bg-orange-500/10 border-orange-500/20 text-orange-400",
  medium: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
  low: "bg-blue-500/10 border-blue-500/20 text-blue-400",
}

const confidenceColors = {
  high: "text-green-400",
  medium: "text-yellow-400",
  low: "text-red-400",
}

export default function WebsiteChecker() {
  const [url, setUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<WebsiteCheckResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCheck = async () => {
    if (!url.trim()) {
      setError("Please enter a URL")
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = await checkWebsite(url.trim())
      setResult(data)
    } catch (err: any) {
      setError(err.message || "Failed to check website")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">Website Vulnerability Checker</h1>
        <p className="text-muted-foreground">
          Analyze your website's technology stack and check for known CVEs and security vulnerabilities
        </p>
      </div>

      {/* Input Section */}
      <div className="backdrop-blur-md border border-border bg-card dark:bg-gradient-to-br dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] rounded-lg p-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCheck()}
              placeholder="https://example.com"
              className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={loading}
            />
          </div>
          <button
            onClick={handleCheck}
            disabled={loading || !url.trim()}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Search className="w-5 h-5" />
                Check Website
              </>
            )}
          </button>
        </div>
        {error && (
          <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="backdrop-blur-md border border-border bg-card dark:bg-gradient-to-br dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total CVEs Checked</p>
                  <p className="text-2xl font-bold text-foreground">{result.summary.total_cves_checked}</p>
                </div>
                <Shield className="w-8 h-8 text-primary" />
              </div>
            </div>
            <div className="backdrop-blur-md border border-border bg-card dark:bg-gradient-to-br dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Vulnerable</p>
                  <p className="text-2xl font-bold text-red-400">{result.summary.vulnerable_count}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
            </div>
            <div className="backdrop-blur-md border border-border bg-card dark:bg-gradient-to-br dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical</p>
                  <p className="text-2xl font-bold text-red-500">{result.summary.critical_count}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <div className="backdrop-blur-md border border-border bg-card dark:bg-gradient-to-br dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">High</p>
                  <p className="text-2xl font-bold text-orange-400">{result.summary.high_count}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-orange-400" />
              </div>
            </div>
          </div>

          {/* Vulnerabilities List */}
          {result.vulnerabilities.length > 0 && (
            <div className="backdrop-blur-md border border-border bg-card dark:bg-gradient-to-br dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Vulnerabilities Found
              </h2>
              <div className="space-y-4">
                {result.vulnerabilities.map((vuln, idx) => (
                  <div
                    key={idx}
                    className={`border rounded-lg p-4 ${
                      severityColors[vuln.severity.toLowerCase() as keyof typeof severityColors] || severityColors.medium
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <a
                            href={vuln.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-foreground hover:underline"
                          >
                            {vuln.cve_id}
                          </a>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            severityColors[vuln.severity.toLowerCase() as keyof typeof severityColors] || severityColors.medium
                          }`}>
                            {vuln.severity.toUpperCase()}
                          </span>
                          {vuln.cvss_score && (
                            <span className="text-xs text-muted-foreground">
                              CVSS: {vuln.cvss_score}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{vuln.description}</p>
                        
                        {/* AI Analysis */}
                        {vuln.ai_is_vulnerable !== undefined && (
                          <div className="mt-3 p-3 bg-background/50 rounded border border-border">
                            <div className="flex items-center gap-2 mb-2">
                              {vuln.ai_is_vulnerable ? (
                                <XCircle className="w-4 h-4 text-red-400" />
                              ) : (
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              )}
                              <span className={`font-medium ${
                                vuln.ai_is_vulnerable ? 'text-red-400' : 'text-green-400'
                              }`}>
                                {vuln.ai_is_vulnerable ? 'Vulnerable' : 'Not Vulnerable'}
                              </span>
                              {vuln.ai_confidence && (
                                <span className={`text-xs ${confidenceColors[vuln.ai_confidence.toLowerCase() as keyof typeof confidenceColors] || confidenceColors.medium}`}>
                                  ({vuln.ai_confidence} confidence)
                                </span>
                              )}
                            </div>
                            {vuln.ai_reasoning && (
                              <p className="text-xs text-muted-foreground mb-2">{vuln.ai_reasoning}</p>
                            )}
                            {vuln.ai_remediation && (
                              <div className="mt-2 pt-2 border-t border-border">
                                <p className="text-xs font-medium text-green-400 mb-1">Remediation:</p>
                                <p className="text-xs text-muted-foreground">{vuln.ai_remediation}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <a
                        href={vuln.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-4 p-2 hover:bg-background/50 rounded transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Technologies Detected */}
          {Object.keys(result.technologies).length > 0 && (
            <div className="backdrop-blur-md border border-border bg-card dark:bg-gradient-to-br dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Code className="w-5 h-5" />
                Technologies Detected
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(result.technologies).map(([category, techs]) => (
                  <div key={category} className="space-y-2">
                    <h3 className="text-sm font-medium text-muted-foreground uppercase">{category}</h3>
                    <div className="space-y-1">
                      {techs.map((tech, idx) => {
                        // Find check status for this tech
                        const checkStatus = result.tech_check_status?.find(
                          ts => ts.name === tech.name && ts.category === category
                        )
                        return (
                          <div key={idx} className="flex items-center gap-2 text-sm">
                            <span className="text-foreground font-medium">{tech.name}</span>
                            {tech.version && (
                              <span className="text-muted-foreground">v{tech.version}</span>
                            )}
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              tech.confidence === 'high' ? 'bg-green-500/20 text-green-400' :
                              tech.confidence === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {tech.confidence}
                            </span>
                            {checkStatus && (
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                checkStatus.matched_cves > 0 ? 'bg-red-500/20 text-red-400' :
                                checkStatus.cves_exist ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-gray-500/20 text-gray-400'
                              }`} title={
                                checkStatus.matched_cves > 0 
                                  ? `${checkStatus.matched_cves} CVE(s) matched`
                                  : checkStatus.cves_exist 
                                  ? 'CVEs exist in database but none matched'
                                  : 'No CVEs found in database for this technology'
                              }>
                                {checkStatus.matched_cves > 0 ? `⚠️ ${checkStatus.matched_cves}` :
                                 checkStatus.cves_exist ? '✓ Checked' : '○ No CVEs'}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CVE Check Status */}
          {result.summary.total_cves_in_database !== undefined && (
            <div className="backdrop-blur-md border border-border bg-card dark:bg-gradient-to-br dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] rounded-lg p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                CVE Database Status
              </h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-background/50 rounded">
                  <span className="text-sm text-muted-foreground">Total CVEs in Database:</span>
                  <span className="text-sm font-semibold text-foreground">{result.summary.total_cves_in_database}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-background/50 rounded">
                  <span className="text-sm text-muted-foreground">CVEs Checked Against Technologies:</span>
                  <span className="text-sm font-semibold text-foreground">{result.summary.total_cves_checked}</span>
                </div>
                {result.summary.total_cves_in_database === 0 && (
                  <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-sm text-yellow-400">
                      <strong>⚠️ Database Empty:</strong> Run the crawler first to populate CVEs before checking websites.
                    </p>
                  </div>
                )}
                {result.summary.total_cves_in_database > 0 && result.summary.total_cves_checked === 0 && (
                  <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-sm text-blue-400">
                      <strong>ℹ️ No Matches:</strong> Checked {result.summary.total_cves_in_database} CVEs in database, but none matched the detected technologies. This could mean the technologies are secure or not in the CVE database.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* No Vulnerabilities */}
          {result.vulnerabilities.length === 0 && (
            <div className="backdrop-blur-md border border-border bg-card dark:bg-gradient-to-br dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] rounded-lg p-6">
              <div className="text-center mb-4">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No Vulnerabilities Found</h3>
                <p className="text-muted-foreground mb-4">
                  {result.summary.total_cves_checked === 0 && result.summary.total_cves_in_database === 0
                    ? "No CVEs found in database. Run the crawler first to populate CVEs."
                    : result.summary.total_cves_checked === 0 && result.summary.total_cves_in_database && result.summary.total_cves_in_database > 0
                    ? `Checked ${result.summary.total_cves_in_database} CVEs in database. No matching CVEs found for detected technologies.`
                    : "No matching CVEs were found for the detected technologies, or the website appears to be secure."}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}