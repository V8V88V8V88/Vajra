"use client"

import { useState, useEffect } from "react"
import { Save, RotateCcw, Download } from "lucide-react"
import { motion } from "framer-motion"
import { exportAllThreats } from "@/lib/api"

interface Settings {
  crawlerInterval: string
  apiUrl: string
  darkMode: boolean
  enableNotifications: boolean
}

const defaultSettings: Settings = {
  crawlerInterval: "6",
  apiUrl: "https://api.example.com",
  darkMode: true,
  enableNotifications: true,
}

// Helper function to safely get settings from localStorage
const getStoredSettings = (): Settings | null => {
  if (typeof window === "undefined") return null
  try {
    const stored = localStorage.getItem("ctf-settings")
    if (stored) {
      return JSON.parse(stored) as Settings
    }
  } catch (error) {
    console.error("Error loading settings from localStorage:", error)
  }
  return null
}

export default function SettingsPage() {
  // Always start with defaults to avoid hydration mismatch
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [saved, setSaved] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)

  useEffect(() => {
    // Only load from localStorage after component mounts (client-side only)
    setIsMounted(true)
    const stored = getStoredSettings()
    if (stored) {
      setSettings(stored)
    }
  }, [])

  const handleSave = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("ctf-settings", JSON.stringify(settings))
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      } catch (error) {
        console.error("Error saving settings to localStorage:", error)
        alert("Failed to save settings. Please try again.")
      }
    }
  }

  const handleReset = () => {
    setSettings(defaultSettings)
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("ctf-settings")
      } catch (error) {
        console.error("Error removing settings from localStorage:", error)
      }
    }
  }

  const handleExportThreats = async () => {
    setIsExporting(true)
    setExportError(null)
    try {
      await exportAllThreats()
    } catch (error) {
      console.error("Export failed:", error)
      setExportError("Failed to export threats. Please ensure the backend is running.")
    } finally {
      setIsExporting(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Configure crawler and application preferences</p>
      </motion.div>

      {/* Settings Form */}
      <motion.div className="max-w-2xl space-y-6" variants={containerVariants} initial="hidden" animate="visible">
        {/* Crawler Settings */}
        <motion.div
          variants={itemVariants}
          className="backdrop-blur-md border border-border bg-card dark:bg-gradient-to-br dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-6">Crawler Configuration</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Crawler Interval (hours)</label>
              <input
                type="number"
                min="1"
                max="24"
                value={settings.crawlerInterval}
                onChange={(e) => setSettings({ ...settings, crawlerInterval: e.target.value })}
                className="w-full px-4 py-2 bg-input dark:bg-[rgba(30,41,59,0.5)] border border-border rounded-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-foreground"
              />
              <p className="text-xs text-muted-foreground mt-2">How often the crawler syncs threat data</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">API URL</label>
              <input
                type="text"
                value={settings.apiUrl}
                onChange={(e) => setSettings({ ...settings, apiUrl: e.target.value })}
                className="w-full px-4 py-2 bg-input dark:bg-[rgba(30,41,59,0.5)] border border-border rounded-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-foreground"
              />
              <p className="text-xs text-muted mt-2">Backend API endpoint (TODO: implement backend integration)</p>
            </div>
          </div>
        </motion.div>

        {/* Display Settings */}
        <motion.div
          variants={itemVariants}
          className="backdrop-blur-md border border-border bg-card dark:bg-gradient-to-br dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-6">Display Settings</h3>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.darkMode}
                onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })}
                className="w-4 h-4 rounded border-surface-light/20 bg-surface/50 cursor-pointer"
              />
              <span className="text-foreground font-medium">Dark Mode</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.enableNotifications}
                onChange={(e) => setSettings({ ...settings, enableNotifications: e.target.checked })}
                className="w-4 h-4 rounded border-surface-light/20 bg-surface/50 cursor-pointer"
              />
              <span className="text-foreground font-medium">Enable Notifications</span>
            </label>
          </div>
        </motion.div>

        {/* Data Management */}
        <motion.div
          variants={itemVariants}
          className="backdrop-blur-md border border-border bg-card dark:bg-gradient-to-br dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-6">Data Management</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-3">
                Export all crawled threats from the database as a JSON file for backup or analysis.
              </p>
              <button
                onClick={handleExportThreats}
                disabled={isExporting}
                className="flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-lg font-semibold hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                <Download className="w-5 h-5" />
                {isExporting ? "Exporting..." : "Export All Threats"}
              </button>
              {exportError && (
                <p className="text-sm text-destructive mt-2">{exportError}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div variants={itemVariants} className="flex gap-4">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-all duration-300"
          >
            <Save className="w-5 h-5" />
            Save Settings
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-6 py-3 bg-card dark:bg-[rgba(30,41,59,0.5)] border border-border rounded-lg font-semibold hover:bg-accent dark:hover:bg-slate-800/40 transition-all duration-300 text-foreground"
          >
            <RotateCcw className="w-5 h-5" />
            Reset to Defaults
          </button>
        </motion.div>

        {/* Success Message */}
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-lg"
          >
            Settings saved successfully!
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
