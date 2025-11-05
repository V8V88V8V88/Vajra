"use client"

import { Bell, Settings, User, LogOut, UserCircle, ChevronDown, AlertCircle, CheckCircle2, Info, X, CheckCheck } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "success" | "error"
  timestamp: Date
  read: boolean
  link?: string
}

export function Navbar() {
  const router = useRouter()
  const [settingsOpen, setSettingsOpen] = useState(false)
  
  // Mock notifications - replace with actual notifications from API/context
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      title: "New Threat Detected",
      message: "High severity threat detected in the network",
      type: "warning",
      timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      read: false,
      link: "/threats",
    },
    {
      id: "2",
      title: "Crawler Update",
      message: "Threat data sync completed successfully",
      type: "success",
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      read: false,
      link: "/crawler",
    },
    {
      id: "3",
      title: "System Status",
      message: "All systems operational",
      type: "info",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      read: true,
    },
  ])

  // Mock user data - replace with actual user context/auth when implemented
  // Using useState to ensure stable reference and avoid hydration issues
  const [user, setUser] = useState({
    name: "User",
    email: "user@example.com",
    initials: "U",
  })

  // Load user data from localStorage after mount to avoid hydration mismatch
  useEffect(() => {
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
          })
        }
      } catch (error) {
        // Keep default user if there's an error
        console.error("Error loading user from localStorage:", error)
      }
    }
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleLogout = () => {
    // TODO: Implement logout logic
    console.log("Logout clicked")
    // Could navigate to login page or clear session
  }

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const getNotificationIcon = (type: Notification["type"]) => {
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
      style={{
        background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(8, 16, 30, 0.98) 100%)",
        borderColor: "rgba(30, 58, 138, 0.3)"
      }}
      className="border-b backdrop-blur-md px-6 py-4 flex items-center justify-between"
    >
      <div className="flex items-center gap-3 transition-smooth">
        <Image
          src="/VajraLogo.png"
          alt="Vajra Logo"
          width={32}
          height={32}
          className="rounded-lg"
        />
        <h1 className="text-xl font-bold text-foreground">Vajra</h1>
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className="relative p-2 hover:bg-slate-800/40 rounded-lg transition-smooth text-foreground/70 hover:text-foreground"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full"
                  style={{
                    backgroundColor: "rgb(239, 68, 68)",
                  }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-80 p-0"
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.98)",
              borderColor: "rgba(30, 58, 138, 0.3)",
            }}
          >
            <div className="p-4 border-b" style={{ borderColor: "rgba(51, 65, 85, 0.2)" }}>
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
                      className={`p-4 border-b hover:bg-slate-800/40 transition-colors cursor-pointer ${
                        !notification.read ? "bg-blue-500/5" : ""
                      }`}
                      style={{ borderColor: "rgba(51, 65, 85, 0.2)" }}
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
                          className="flex-shrink-0 p-1 hover:bg-slate-700/40 rounded transition-colors"
                        >
                          <X className="w-3 h-3 text-foreground/40" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="p-2 border-t" style={{ borderColor: "rgba(51, 65, 85, 0.2)" }}>
                    <button
                      onClick={clearAll}
                      className="w-full text-xs text-foreground/60 hover:text-foreground text-center py-2 hover:bg-slate-800/40 rounded transition-colors"
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
          className="p-2 hover:bg-slate-800/40 rounded-lg transition-smooth text-foreground/70 hover:text-foreground"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-2 hover:bg-slate-800/40 rounded-lg transition-smooth text-foreground/70 hover:text-foreground">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="bg-primary/20 text-primary text-xs">
                  {user.initials}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-56"
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.98)",
              borderColor: "rgba(30, 58, 138, 0.3)",
            }}
          >
            <DropdownMenuLabel className="flex flex-col gap-1">
              <span className="text-foreground font-semibold">{user.name}</span>
              <span className="text-xs text-foreground/60 font-normal">{user.email}</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator style={{ borderColor: "rgba(51, 65, 85, 0.2)" }} />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer">
                <UserCircle className="w-4 h-4 mr-2" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator style={{ borderColor: "rgba(51, 65, 85, 0.2)" }} />
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
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.98)",
              borderColor: "rgba(30, 58, 138, 0.3)",
            }}
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
                className="block p-4 rounded-lg border hover:bg-slate-800/40 transition-colors"
                style={{
                  borderColor: "rgba(51, 65, 85, 0.2)",
                }}
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
                  className="w-full text-left p-3 rounded-lg border hover:bg-slate-800/40 transition-colors"
                  style={{
                    borderColor: "rgba(51, 65, 85, 0.2)",
                  }}
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
