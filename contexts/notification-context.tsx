"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"

export interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "success" | "error"
  timestamp: Date
  read: boolean
  link?: string
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearAll: () => void
  unreadCount: number
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

const STORAGE_KEY = "VAJRA-notifications"
const MAX_NOTIFICATIONS = 50 // Keep last 50 notifications

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Load notifications from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored) as Notification[]
          // Convert timestamp strings back to Date objects
          const notificationsWithDates = parsed.map((n) => ({
            ...n,
            timestamp: new Date(n.timestamp),
          }))
          setNotifications(notificationsWithDates)
        }
      } catch (error) {
        console.error("Error loading notifications:", error)
      }
    }
  }, [])

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined" && notifications.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
      } catch (error) {
        console.error("Error saving notifications:", error)
      }
    }
  }, [notifications])

  // Listen for custom notification events
  useEffect(() => {
    const handleNotificationEvent = (event: CustomEvent<Omit<Notification, "id" | "timestamp" | "read">>) => {
      addNotification(event.detail)
    }

    window.addEventListener("vajra-notification" as any, handleNotificationEvent as EventListener)
    return () => {
      window.removeEventListener("vajra-notification" as any, handleNotificationEvent as EventListener)
    }
  }, [])

  const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    }

    setNotifications((prev) => {
      const updated = [newNotification, ...prev]
      // Keep only last MAX_NOTIFICATIONS
      return updated.slice(0, MAX_NOTIFICATIONS)
    })
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        unreadCount,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}

// Helper function to dispatch notifications from anywhere
export function dispatchNotification(notification: Omit<Notification, "id" | "timestamp" | "read">) {
  if (typeof window !== "undefined") {
    const event = new CustomEvent("vajra-notification", { detail: notification })
    window.dispatchEvent(event)
  }
}

