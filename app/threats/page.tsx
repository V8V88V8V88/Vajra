"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { getThreats } from "@/lib/api"
import { ThreatCard } from "@/components/threats/threat-card"
import { ThreatDetailModal } from "@/components/threats/threat-detail-modal"
import type { Threat } from "@/lib/api"
import { Search } from "lucide-react"
import { motion } from "framer-motion"

export default function ThreatsPage() {
  const [page, setPage] = useState(1)
  const [selectedThreat, setSelectedThreat] = useState<Threat | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["threats", page],
    queryFn: () => getThreats(page, 5),
  })

  const threats = data?.threats || []
  const total = data?.total || 0
  const totalPages = Math.ceil(total / 5)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold text-foreground mb-2">Threat Feed</h1>
        <p className="text-muted-foreground">Browse and analyze detected threats</p>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="relative">
          <Search className="absolute left-4 top-3 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search threats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-lg bg-input dark:bg-gradient-to-r dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
          />
        </div>
      </motion.div>

      {/* Threats List */}
      <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="h-32 rounded-lg animate-pulse bg-card dark:bg-gradient-to-r dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] border border-border"
              />
            ))}
          </div>
        ) : threats.length > 0 ? (
          threats.map((threat) => (
            <motion.div key={threat.id} variants={itemVariants}>
              <ThreatCard threat={threat} onClick={() => setSelectedThreat(threat)} />
            </motion.div>
          ))
        ) : (
          <motion.div
            variants={itemVariants}
            className="text-center py-12 rounded-lg bg-card dark:bg-gradient-to-r dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] border border-border"
          >
            <p className="text-muted-foreground">No threats found</p>
          </motion.div>
        )}
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          className="flex items-center justify-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
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
        </motion.div>
      )}

      {/* Detail Modal */}
      {selectedThreat && <ThreatDetailModal threat={selectedThreat} onClose={() => setSelectedThreat(null)} />}
    </div>
  )
}
