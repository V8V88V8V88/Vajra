"use client"

import { Bell, Settings, User, LogOut, UserCircle, ChevronDown, AlertCircle, CheckCircle2, Info, X, CheckCheck, Moon, Sun } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { useNotifications } from "@/contexts/notification-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Navbar() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { notifications, markAsRead, markAllAsRead, clearAll, unreadCount } = useNotifications()
  const [mounted, setMounted] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Mock user data - replace with actual user context/auth when implemented
  // Using useState to ensure stable reference and avoid hydration issues
  const [user, setUser] = useState({
    name: "User",
    email: "user@example.com",
    initials: "U",
    avatarUrl: undefined as string | undefined,
  })

  // Helper function to load user data from localStorage
  const loadUserData = () => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("user-profile")
        if (stored) {
          const profile = JSON.parse(stored)
          const initials = profile.name
            ? profile.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)
            : "U"
          setUser({
            name: profile.name || "User",
            email: profile.email || "user@example.com",
            initials: initials || "U",
            avatarUrl: profile.avatarUrl,
          })
        }
      } catch (error) {
        // Keep default user if there's an error
        console.error("Error loading user from localStorage:", error)
      }
    }
  }

  // Load user data from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    loadUserData()

    // Listen for storage changes (when profile is updated in another tab/window)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user-profile") {
        loadUserData()
      }
    }

    // Listen for custom storage event (for same-tab updates)
    const handleCustomStorageChange = () => {
      loadUserData()
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("user-profile-updated", handleCustomStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("user-profile-updated", handleCustomStorageChange)
    }
  }, [])

  const handleLogout = () => {
    // TODO: Implement logout logic
    console.log("Logout clicked")
    // Could navigate to login page or clear session
  }

  const getNotificationIcon = (type: "info" | "warning" | "success" | "error") => {
    switch (type) {
      case "warning":
      case "error":
        return <AlertCircle className="w-4 h-4 text-destructive" />
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case "info":
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <nav 
      className="border-b px-4 py-2 flex items-center justify-between h-14 backdrop-blur-md bg-white/80 dark:bg-gradient-to-r dark:from-[rgba(15,23,42,0.95)] dark:to-[rgba(8,16,30,0.98)] border-slate-200 dark:border-[rgba(30,58,138,0.3)]"
      style={{
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
      }}
    >
      <div className="flex items-center gap-2.5">
        <div className="relative group">
          <Image
            src="/VajraLogo.png"
            alt="Vajra Logo"
            width={24}
            height={24}
            className="rounded-md transition-transform duration-200 group-hover:scale-110"
          />
        </div>
        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700/50" />
        <span className="text-base font-bold text-slate-900 dark:text-foreground tracking-tight">Vajra</span>
      </div>

      <div className="flex items-center gap-1.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className="relative p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800/40 rounded-md transition-all duration-200 text-slate-600 dark:text-foreground/70 hover:text-slate-900 dark:hover:text-foreground hover:scale-105 active:scale-95"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold text-white rounded-full animate-pulse"
                  style={{
                    backgroundColor: "rgb(239, 68, 68)",
                    boxShadow: "0 0 8px rgba(239, 68, 68, 0.6)",
                  }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80 p-0 bg-popover dark:bg-popover border-border"
          >
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <DropdownMenuLabel className="p-0 text-foreground font-semibold">
                  Notifications
                </DropdownMenuLabel>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <CheckCheck className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
              </div>
              {notifications.length === 0 && (
                <p className="text-sm text-foreground/60 py-4 text-center">
                  No notifications
                </p>
              )}
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                <>
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 border-b hover:bg-accent dark:hover:bg-slate-800/40 transition-colors cursor-pointer ${
                        !notification.read ? "bg-blue-500/5 dark:bg-blue-500/5" : ""
                      } border-border`}
                      onClick={() => {
                        if (notification.link) {
                          router.push(notification.link)
                        }
                        if (!notification.read) {
                          markAsRead(notification.id)
                        }
                      }}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={`text-sm font-medium ${
                                !notification.read
                                  ? "text-foreground"
                                  : "text-foreground/70"
                              }`}
                            >
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className="text-xs text-foreground/60 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-foreground/40 mt-1">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsRead(notification.id)
                          }}
                          className="flex-shrink-0 p-1 hover:bg-accent dark:hover:bg-slate-700/40 rounded transition-colors"
                        >
                          <X className="w-3 h-3 text-foreground/40" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="p-2 border-t border-border">
                    <button
                      onClick={clearAll}
                      className="w-full text-xs text-muted-foreground hover:text-foreground text-center py-2 hover:bg-accent dark:hover:bg-slate-800/40 rounded transition-colors"
                    >
                      Clear all notifications
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <button 
          onClick={() => setSettingsOpen(true)}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800/40 rounded-md transition-all duration-200 text-slate-600 dark:text-foreground/70 hover:text-slate-900 dark:hover:text-foreground hover:scale-105 active:scale-95"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800/40 rounded-md transition-all duration-200 text-slate-600 dark:text-foreground/70 hover:text-slate-900 dark:hover:text-foreground hover:scale-105 active:scale-95"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
        )}

        <div className="h-5 w-px bg-slate-300 dark:bg-slate-700/50 mx-1" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 p-1 pr-1.5 hover:bg-slate-100 dark:hover:bg-slate-800/40 rounded-md transition-all duration-200 text-slate-600 dark:text-foreground/70 hover:text-slate-900 dark:hover:text-foreground hover:scale-105 active:scale-95 group">
              <Avatar className="w-7 h-7 ring-2 ring-slate-300 dark:ring-slate-700/50 group-hover:ring-primary/50 transition-all duration-200">
                <AvatarImage 
                  src={user.avatarUrl} 
                  alt={user.name}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-primary/30 to-primary/10 text-primary text-[10px] font-semibold">
                  {user.initials}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-56 bg-popover dark:bg-popover border-border"
          >
            <DropdownMenuLabel className="flex flex-col gap-1">
              <span className="text-foreground font-semibold">{user.name}</span>
              <span className="text-xs text-foreground/60 font-normal">{user.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <UserCircle className="w-4 h-4 mr-2" />
                Profile & Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem 
              onClick={handleLogout}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Quick Settings Dialog */}
        <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
          <DialogContent 
            className="bg-popover dark:bg-popover border-border"
          >
            <DialogHeader>
              <DialogTitle className="text-foreground">Quick Settings</DialogTitle>
              <DialogDescription className="text-foreground/60">
                Quick access to common settings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <Link 
                href="/settings"
                onClick={() => setSettingsOpen(false)}
                className="block p-4 rounded-lg border border-border hover:bg-accent dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Settings className="w-5 h-5 text-foreground/70" />
                  <div>
                    <div className="font-medium text-foreground">Go to Settings</div>
                    <div className="text-sm text-foreground/60">Manage all application settings</div>
                  </div>
                </div>
              </Link>
              
              <div className="pt-2 space-y-2">
                <h4 className="text-sm font-medium text-foreground/80 mb-2">Quick Actions</h4>
                <button
                  className="w-full text-left p-3 rounded-lg border border-border hover:bg-accent dark:hover:bg-slate-800/40 transition-colors"
                  onClick={() => {
                    // TODO: Implement notification toggle
                    console.log("Toggle notifications")
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-foreground">Notifications</span>
                    <span className="text-xs text-foreground/60">On</span>
                  </div>
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </nav>
  )
}
