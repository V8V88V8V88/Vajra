"use client"

import { useState, useEffect, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { getThreats, searchThreats } from "@/lib/api"
import { ThreatCard } from "@/components/threats/threat-card"
import { ThreatDetailModal } from "@/components/threats/threat-detail-modal"
import type { Threat } from "@/lib/api"
import { Search, Filter, Calendar } from "lucide-react"

type SeverityFilter = "all" | "critical" | "high" | "medium" | "low"
type DateSort = "newest" | "oldest"

export default function ThreatsPage() {
  const [page, setPage] = useState(1)
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null)
  const [searchInput, setSearchInput] = useState("")
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all")
  const [dateSort, setDateSort] = useState<DateSort>("newest")

  // Debounced search query - updates after user stops typing
  const [debouncedSearch, setDebouncedSearch] = useState("")

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput.trim())
      setPage(1) // Reset to first page when search changes
    }, 300) // 300ms delay

    return () => clearTimeout(timer)
  }, [searchInput])

  // Reset page to 1 when search changes
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  // Clear search
  const handleClearSearch = () => {
    setSearchInput("")
    setDebouncedSearch("")
    setPage(1)
  }

  // Fetch all threats when filters are active, otherwise use pagination
  const needsAllThreats = debouncedSearch || severityFilter !== "all"
  
  const { data, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: debouncedSearch 
      ? ["threats", "search", debouncedSearch] 
      : needsAllThreats 
        ? ["threats", "all"] 
        : ["threats", "list", page],
    queryFn: async () => {
      if (debouncedSearch) {
        const threats = await searchThreats(debouncedSearch)
        return { threats, total: threats.length }
      } else if (needsAllThreats) {
        // Fetch all threats when filtering
        const result = await getThreats(1, 1000) // Fetch large batch
        return result
      } else {
        const result = await getThreats(page, 5)
        return result
      }
    },
    enabled: true,
    staleTime: 0, // Always refetch to ensure fresh data
    refetchOnWindowFocus: false, // Don't refetch on focus to avoid flickering
  })

  // Refetch when filters change
  useEffect(() => {
    if (!isLoading) {
      refetch()
    }
  }, [debouncedSearch, severityFilter, refetch, isLoading])

  // Filter and sort threats
  const filteredAndSortedThreats = useMemo(() => {
    let threats = data?.threats || []
    
    // Apply severity filter
    if (severityFilter !== "all") {
      threats = threats.filter((threat) => {
        const threatSeverity = threat.severity?.toLowerCase() || ""
        return threatSeverity === severityFilter.toLowerCase()
      })
    }
    
    // Apply date sort
    threats = [...threats].sort((a, b) => {
      const dateA = a.timestamp ? new Date(a.timestamp).getTime() : 0
      const dateB = b.timestamp ? new Date(b.timestamp).getTime() : 0
      
      if (dateSort === "newest") {
        return dateB - dateA // Newest first
      } else {
        return dateA - dateB // Oldest first
      }
    })
    
    return threats
  }, [data?.threats, severityFilter, dateSort])

  const threats = filteredAndSortedThreats
  const total = threats.length
  // Only show pagination when not filtering/searching
  const totalPages = (debouncedSearch || severityFilter !== "all") ? 1 : Math.ceil((data?.total || 0) / 5)


  // Removed animation variants that might hide content

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Threat Feed</h1>
        <p className="text-muted-foreground">Browse and analyze detected threats</p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-3 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search threats..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-12 pr-10 py-3 rounded-lg bg-input dark:bg-input/40 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20 transition-all"
          />
          {searchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-4 top-3 text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter and Sort Controls */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Severity Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <label className="text-sm font-medium text-foreground">Severity:</label>
            <select
              value={severityFilter}
              onChange={(e) => {
                setSeverityFilter(e.target.value as SeverityFilter)
                setPage(1)
              }}
              className="px-3 py-2 rounded-lg bg-input dark:bg-input/40 border border-border text-foreground focus:outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20 transition-all text-sm"
            >
              <option value="all">All</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Date Sort */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <label className="text-sm font-medium text-foreground">Sort by Date:</label>
            <select
              value={dateSort}
              onChange={(e) => {
                setDateSort(e.target.value as DateSort)
                setPage(1)
              }}
              className="px-3 py-2 rounded-lg bg-input dark:bg-input/40 border border-border text-foreground focus:outline-none focus:border-foreground/40 focus:ring-1 focus:ring-foreground/20 transition-all text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          {/* Results Count */}
          {!debouncedSearch && (
            <div className="ml-auto text-sm text-muted-foreground">
              Showing {threats.length} {threats.length === 1 ? 'threat' : 'threats'}
              {severityFilter !== "all" && ` (${severityFilter})`}
            </div>
          )}
        </div>

        {debouncedSearch && (
          <div className="text-sm text-muted-foreground">
            Showing results for: <span className="text-foreground font-medium">"{debouncedSearch}"</span>
            {isFetching && <span className="ml-2 text-primary">(searching...)</span>}
            {threats.length > 0 && (
              <span className="ml-2">
                ({threats.length} {threats.length === 1 ? 'result' : 'results'})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Threats List */}
      <div className="space-y-4">
        {isLoading || isFetching ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-lg animate-pulse bg-card/95 dark:bg-card/95 border border-border"
              />
            ))}
          </div>
        ) : threats.length > 0 ? (
          threats.map((threat) => (
            <div key={threat.id}>
              <ThreatCard threat={threat} onClick={() => setSelectedThreat(threat)} />
            </div>
          ))
        ) : (
          <div className="text-center py-12 rounded-lg bg-card/95 dark:bg-card/95 border border-border">
            <p className="text-muted-foreground">
              {debouncedSearch 
                ? `No threats found matching "${debouncedSearch}"` 
                : "No threats found"}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-lg bg-card/95 dark:bg-card/95 border border-border text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/60 dark:hover:bg-muted/40 hover:border-foreground/30 transition-colors"
          >
            Previous
          </button>
          <span className="text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg bg-card/95 dark:bg-card/95 border border-border text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-muted/60 dark:hover:bg-muted/40 hover:border-foreground/30 transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Detail Modal */}
      {selectedThreat && <ThreatDetailModal threat={selectedThreat} onClose={() => setSelectedThreat(null)} />}
    </div>
  )
}
