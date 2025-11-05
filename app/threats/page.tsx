"use client"

import { useState, useEffect, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { getThreats, searchThreats } from "@/lib/api"
import { ThreatCard } from "@/components/threats/threat-card"
import { ThreatDetailModal } from "@/components/threats/threat-detail-modal"
import type { Threat } from "@/lib/api"
import { Search } from "lucide-react"

export default function ThreatsPage() {
  const [page, setPage] = useState(1)
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null)
  const [searchInput, setSearchInput] = useState("")

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

  // Use search when debouncedSearch is present, otherwise use paginated list
  const { data, isLoading, error, isFetching, refetch } = useQuery({
    queryKey: debouncedSearch ? ["threats", "search", debouncedSearch] : ["threats", "list", page],
    queryFn: async () => {
      if (debouncedSearch) {
        const threats = await searchThreats(debouncedSearch)
        return { threats, total: threats.length }
      } else {
        const result = await getThreats(page, 5)
        return result
      }
    },
    enabled: true,
    staleTime: 0, // Always refetch to ensure fresh data
    refetchOnWindowFocus: false, // Don't refetch on focus to avoid flickering
  })

  // Refetch when switching from search to list mode
  useEffect(() => {
    if (!debouncedSearch && !isLoading) {
      refetch()
    }
  }, [debouncedSearch, refetch, isLoading])

  const threats = useMemo(() => data?.threats || [], [data?.threats])
  const total = data?.total || 0
  const totalPages = debouncedSearch ? 1 : Math.ceil(total / 5)


  // Removed animation variants that might hide content

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Threat Feed</h1>
        <p className="text-muted-foreground">Browse and analyze detected threats</p>
      </div>

      {/* Search */}
      <div>
        <div className="relative">
          <Search className="absolute left-4 top-3 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search threats..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-12 pr-10 py-3 rounded-lg bg-input dark:bg-gradient-to-r dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
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
        {debouncedSearch && (
          <div className="mt-2 text-sm text-muted-foreground">
            Showing results for: <span className="text-foreground font-medium">"{debouncedSearch}"</span>
            {isFetching && <span className="ml-2 text-primary">(searching...)</span>}
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
                className="h-32 rounded-lg animate-pulse bg-card dark:bg-gradient-to-r dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] border border-border"
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
          <div className="text-center py-12 rounded-lg bg-card dark:bg-gradient-to-r dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] border border-border">
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
            className="px-4 py-2 rounded-lg bg-card dark:bg-gradient-to-r dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] border border-border text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent dark:hover:bg-[rgba(15,23,42,0.95)] hover:border-primary/50 transition-colors"
          >
            Previous
          </button>
          <span className="text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-lg bg-card dark:bg-gradient-to-r dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] border border-border text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent dark:hover:bg-[rgba(15,23,42,0.95)] hover:border-primary/50 transition-colors"
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
