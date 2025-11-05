"use client"

import { useState, useEffect } from "react"
import { Save, RotateCcw } from "lucide-react"
import { motion } from "framer-motion"

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
        <p className="text-muted">Configure crawler and application preferences</p>
      </motion.div>

      {/* Settings Form */}
      <motion.div className="max-w-2xl space-y-6" variants={containerVariants} initial="hidden" animate="visible">
        {/* Crawler Settings */}
        <motion.div
          variants={itemVariants}
          style={{ backgroundColor: "rgba(30, 41, 59, 0.5)", borderColor: "rgba(51, 65, 85, 0.2)" }}
          className="backdrop-blur-md border rounded-lg p-6"
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
                style={{ backgroundColor: "rgba(30, 41, 59, 0.5)", borderColor: "rgba(51, 65, 85, 0.2)" }}
                className="w-full px-4 py-2 backdrop-blur-md border rounded-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
              />
              <p className="text-xs text-muted mt-2">How often the crawler syncs threat data</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">API URL</label>
              <input
                type="text"
                value={settings.apiUrl}
                onChange={(e) => setSettings({ ...settings, apiUrl: e.target.value })}
                style={{ backgroundColor: "rgba(30, 41, 59, 0.5)", borderColor: "rgba(51, 65, 85, 0.2)" }}
                className="w-full px-4 py-2 backdrop-blur-md border rounded-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
              />
              <p className="text-xs text-muted mt-2">Backend API endpoint (TODO: implement backend integration)</p>
            </div>
          </div>
        </motion.div>

        {/* Display Settings */}
        <motion.div
          variants={itemVariants}
          style={{ backgroundColor: "rgba(30, 41, 59, 0.5)", borderColor: "rgba(51, 65, 85, 0.2)" }}
          className="backdrop-blur-md border rounded-lg p-6"
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
            style={{ backgroundColor: "rgba(30, 41, 59, 0.5)", borderColor: "rgba(51, 65, 85, 0.2)" }}
            className="flex items-center gap-2 px-6 py-3 backdrop-blur-md border rounded-lg font-semibold hover:bg-surface-light/20 transition-all duration-300"
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
