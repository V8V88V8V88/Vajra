"use client"

import { useState, useEffect, useRef } from "react"
import { UserCircle, Mail, Save, Edit2, X, Upload } from "lucide-react"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface UserProfile {
  name: string
  email: string
  role: string
  joinedDate: string
  avatarUrl?: string
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

export default function ProfilePage() {
  // Always start with defaults to avoid hydration mismatch
  const [profile, setProfile] = useState<UserProfile>(createDefaultProfile())
  const [isEditing, setIsEditing] = useState(false)
  const [saved, setSaved] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Only load from localStorage after component mounts (client-side only)
    setIsMounted(true)
    const stored = getStoredProfile()
    if (stored) {
      // Ensure joinedDate is set if missing
      if (!stored.joinedDate) {
        stored.joinedDate = new Date().toLocaleDateString()
      }
      setProfile(stored)
      // Load avatar preview if exists
      if (stored.avatarUrl) {
        setAvatarPreview(stored.avatarUrl)
      }
    } else {
      // Set joinedDate for default profile
      setProfile((prev) => ({
        ...prev,
        joinedDate: new Date().toLocaleDateString(),
      }))
    }
  }, [])

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file")
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB")
        return
      }

      // Create preview URL
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

  const handleSave = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("user-profile", JSON.stringify(profile))
        // Dispatch custom event to notify navbar and other components
        window.dispatchEvent(new Event("user-profile-updated"))
        setSaved(true)
        setIsEditing(false)
        setTimeout(() => setSaved(false), 2000)
      } catch (error) {
        console.error("Error saving profile to localStorage:", error)
        alert("Failed to save profile. Please try again.")
      }
    }
  }

  const handleCancel = () => {
    // Reload from storage
    const stored = getStoredProfile()
    if (stored) {
      setProfile(stored)
    } else {
      setProfile(createDefaultProfile())
    }
    setIsEditing(false)
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">User Profile</h1>
          <p className="text-muted-foreground">Manage your account information and preferences</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-all duration-300"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-4 py-2 border border-border bg-card dark:bg-[rgba(30,41,59,0.5)] rounded-lg font-semibold hover:bg-accent dark:hover:bg-slate-800/40 transition-all duration-300 text-foreground"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-all duration-300"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        )}
      </motion.div>

      {/* Profile Form */}
      <motion.div
        className="max-w-2xl space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
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
              {isEditing && (
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
              {isEditing ? (
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
              {isEditing ? (
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
              {isEditing ? (
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
              <label className="text-sm font-medium text-foreground mb-2 block">
                Member Since
              </label>
              <p className="text-muted-foreground px-4 py-2">{profile.joinedDate}</p>
            </div>
          </div>
        </motion.div>

        {/* Success Message */}
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-success/10 border border-success/20 text-success px-4 py-3 rounded-lg"
          >
            Profile updated successfully!
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}

