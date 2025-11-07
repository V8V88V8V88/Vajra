"use client"

import { useState, useEffect, useRef } from "react"
import { Save, RotateCcw, Download, Trash2, UserCircle, Mail, Edit2, X, Upload } from "lucide-react"
import { motion } from "framer-motion"
import { exportAllThreats, deleteAllThreats } from "@/lib/api"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserProfile {
  name: string
  email: string
  role: string
  joinedDate: string
  avatarUrl?: string
}

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

// Helper function to create default profile (without calling Date methods)
const createDefaultProfile = (): UserProfile => ({
  name: "User",
  email: "user@example.com",
  role: "Administrator",
  joinedDate: typeof window !== "undefined" ? new Date().toLocaleDateString() : "",
})

// Helper function to safely get profile from localStorage
const getStoredProfile = (): UserProfile | null => {
  if (typeof window === "undefined") return null
  try {
    const stored = localStorage.getItem("user-profile")
    if (stored) {
      return JSON.parse(stored) as UserProfile
    }
  } catch (error) {
    console.error("Error loading profile from localStorage:", error)
  }
  return null
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
  // Profile state
  const [profile, setProfile] = useState<UserProfile>(createDefaultProfile())
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Settings state
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [saved, setSaved] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Active tab state
  const [activeTab, setActiveTab] = useState<"profile" | "settings">("profile")

  useEffect(() => {
    // Only load from localStorage after component mounts (client-side only)
    setIsMounted(true)
    const storedProfile = getStoredProfile()
    const storedSettings = getStoredSettings()
    
    if (storedProfile) {
      if (!storedProfile.joinedDate) {
        storedProfile.joinedDate = new Date().toLocaleDateString()
      }
      setProfile(storedProfile)
      if (storedProfile.avatarUrl) {
        setAvatarPreview(storedProfile.avatarUrl)
      }
    } else {
      setProfile((prev) => ({
        ...prev,
        joinedDate: new Date().toLocaleDateString(),
      }))
    }
    
    if (storedSettings) {
      setSettings(storedSettings)
    }
  }, [])

  // Profile handlers
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file")
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB")
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setAvatarPreview(result)
        setProfile((prev) => ({
          ...prev,
          avatarUrl: result,
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleChangePictureClick = () => {
    fileInputRef.current?.click()
  }

  const handleSaveProfile = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("user-profile", JSON.stringify(profile))
        window.dispatchEvent(new Event("user-profile-updated"))
        setSaved(true)
        setIsEditingProfile(false)
        setTimeout(() => setSaved(false), 2000)
      } catch (error) {
        console.error("Error saving profile to localStorage:", error)
        alert("Failed to save profile. Please try again.")
      }
    }
  }

  const handleCancelProfile = () => {
    const stored = getStoredProfile()
    if (stored) {
      setProfile(stored)
    } else {
      setProfile(createDefaultProfile())
    }
    setIsEditingProfile(false)
  }

  // Settings handlers
  const handleSaveSettings = () => {
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

  const handleDeleteAllThreats = async () => {
    setIsDeleting(true)
    setDeleteError(null)
    try {
      const result = await deleteAllThreats()
      setShowDeleteConfirm(false)
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (error: any) {
      console.error("Delete failed:", error)
      setDeleteError(error.message || "Failed to delete threats. Please ensure the backend is running.")
      setShowDeleteConfirm(false)
    } finally {
      setIsDeleting(false)
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

  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-3xl font-bold text-foreground mb-2">Profile & Settings</h1>
        <p className="text-muted-foreground">Manage your account information and application preferences</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-6 py-3 font-semibold transition-all duration-300 border-b-2 ${
            activeTab === "profile"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <UserCircle className="w-4 h-4 inline-block mr-2" />
          Profile
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`px-6 py-3 font-semibold transition-all duration-300 border-b-2 ${
            activeTab === "settings"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Save className="w-4 h-4 inline-block mr-2" />
          Settings
        </button>
      </div>

      {/* Content */}
      <div className="max-w-2xl space-y-6">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <motion.div 
            key="profile-tab"
            variants={containerVariants} 
            initial="hidden" 
            animate="visible"
            className="space-y-6"
          >
            {/* Edit Profile Button - Top Level */}
            {!isEditingProfile && (
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-all duration-300 shadow-lg"
                >
                  <Edit2 className="w-5 h-5" />
                  Edit Profile
                </button>
              </div>
            )}

            {/* Profile Picture Section */}
            <motion.div
              variants={itemVariants}
              className="backdrop-blur-md border border-border bg-card dark:bg-gradient-to-br dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold text-foreground mb-4">Profile Picture</h3>
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24">
                  {avatarPreview || profile.avatarUrl ? (
                    <AvatarImage src={avatarPreview || profile.avatarUrl} alt="Profile" />
                  ) : null}
                  <AvatarFallback className="bg-primary/20 text-primary text-2xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {avatarPreview || profile.avatarUrl
                      ? "Click to change your profile picture"
                      : "Avatar displays your initials"}
                  </p>
                  {isEditingProfile && (
                    <>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={handleChangePictureClick}
                        className="flex items-center gap-2 text-sm text-primary hover:underline transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        Change Picture
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Personal Information */}
            <motion.div
              variants={itemVariants}
              className="backdrop-blur-md border border-border bg-card dark:bg-gradient-to-br dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold text-foreground mb-6">Personal Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                    <UserCircle className="w-4 h-4" />
                    Full Name
                  </label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full px-4 py-2 bg-input dark:bg-[rgba(30,41,59,0.5)] border border-border rounded-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-foreground"
                    />
                  ) : (
                    <p className="text-foreground px-4 py-2">{profile.name}</p>
                  )}
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </label>
                  {isEditingProfile ? (
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full px-4 py-2 bg-input dark:bg-[rgba(30,41,59,0.5)] border border-border rounded-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-foreground"
                    />
                  ) : (
                    <p className="text-foreground px-4 py-2">{profile.email}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Role</label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={profile.role}
                      onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                      className="w-full px-4 py-2 bg-input dark:bg-[rgba(30,41,59,0.5)] border border-border rounded-lg focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-foreground"
                    />
                  ) : (
                    <p className="text-foreground px-4 py-2">{profile.role}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Member Since</label>
                  <p className="text-muted-foreground px-4 py-2">{isMounted ? profile.joinedDate : ""}</p>
                </div>
              </div>
            </motion.div>

            {/* Profile Actions - Always visible when editing */}
            {isEditingProfile && (
              <div className="flex gap-4 pt-6 mt-6 border-t-2 border-border">
                <button
                  onClick={handleCancelProfile}
                  className="flex items-center gap-2 px-6 py-3 border-2 border-border bg-card dark:bg-[rgba(30,41,59,0.5)] rounded-lg font-semibold hover:bg-accent dark:hover:bg-slate-800/40 transition-all duration-300 text-foreground"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-all duration-300 shadow-lg"
                >
                  <Save className="w-5 h-5" />
                  Save Changes
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            {/* Crawler Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="backdrop-blur-md border border-border bg-card dark:bg-gradient-to-br dark:from-[rgba(15,23,42,0.8)] dark:to-[rgba(8,16,30,0.9)] rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold text-foreground mb-6">Data Management</h3>
              <div className="space-y-6">
                {/* Export Section */}
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

                {/* Delete Section */}
                <div className="border-t border-border pt-6">
                  <p className="text-sm text-muted-foreground mb-3">
                    Permanently delete all crawled CVEs and threats from the database. This action cannot be undone.
                  </p>
                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      disabled={isDeleting}
                      className="flex items-center gap-2 px-6 py-3 bg-destructive text-destructive-foreground rounded-lg font-semibold hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      <Trash2 className="w-5 h-5" />
                      Delete All CVEs
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                        <p className="text-sm font-semibold text-destructive mb-2">
                          ⚠️ Warning: This will permanently delete ALL crawled threats from the database!
                        </p>
                        <p className="text-xs text-muted-foreground">
                          This action cannot be undone. Make sure you have exported your data if needed.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={handleDeleteAllThreats}
                          disabled={isDeleting}
                          className="flex items-center gap-2 px-6 py-3 bg-destructive text-destructive-foreground rounded-lg font-semibold hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                        >
                          <Trash2 className="w-5 h-5" />
                          {isDeleting ? "Deleting..." : "Confirm Delete"}
                        </button>
                        <button
                          onClick={() => {
                            setShowDeleteConfirm(false)
                            setDeleteError(null)
                          }}
                          disabled={isDeleting}
                          className="flex items-center gap-2 px-6 py-3 bg-card dark:bg-[rgba(30,41,59,0.5)] border border-border rounded-lg font-semibold hover:bg-accent dark:hover:bg-slate-800/40 transition-all duration-300 text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                      </div>
                      {deleteError && (
                        <p className="text-sm text-destructive mt-2">{deleteError}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Settings Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex gap-4"
            >
              <button
                onClick={handleSaveSettings}
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
          </div>
        )}

        {/* Success Message */}
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-lg"
          >
            {activeTab === "profile" ? "Profile updated successfully!" : "Settings saved successfully!"}
          </motion.div>
        )}
      </div>
    </div>
  )
}
