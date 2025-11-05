"use client"

import { BarChart3, Settings, Zap, AlertCircle, Info, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const navItems = [
  { href: "/", label: "Dashboard", icon: BarChart3 },
  { href: "/threats", label: "Threat Feed", icon: AlertCircle },
  { href: "/crawler", label: "Crawler", icon: Zap },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/about", label: "About", icon: Info }, // About Section
]

export function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside
      style={{ 
        background: "linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(8, 16, 30, 0.98) 50%, rgba(5, 15, 28, 1) 100%)",
        borderColor: "rgba(30, 58, 138, 0.3)",
        width: isCollapsed ? "64px" : "256px",
        paddingLeft: isCollapsed ? "8px" : "24px",
        paddingRight: isCollapsed ? "8px" : "24px",
        transition: "width 150ms cubic-bezier(0.4, 0, 0.2, 1), padding 150ms cubic-bezier(0.4, 0, 0.2, 1)",
        willChange: "width, padding",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden"
      }}
      className="border-r backdrop-blur-md py-6 flex flex-col relative overflow-hidden"
    >
      <div 
        className="flex items-center mb-8"
        style={{
          justifyContent: isCollapsed ? "center" : "space-between",
          transition: "justify-content 150ms cubic-bezier(0.4, 0, 0.2, 1)"
        }}
      >
        <div
          style={{
            opacity: isCollapsed ? 0 : 1,
            width: isCollapsed ? 0 : "auto",
            overflow: "hidden",
            transition: "opacity 150ms cubic-bezier(0.4, 0, 0.2, 1), width 150ms cubic-bezier(0.4, 0, 0.2, 1)",
            willChange: "opacity, width"
          }}
        >
          <h2 className="text-sm font-semibold text-foreground/80 uppercase tracking-wider whitespace-nowrap">Navigation</h2>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-secondary/20 rounded-lg transition-colors duration-150 text-foreground/70 hover:text-foreground flex-shrink-0"
          style={{
            marginLeft: isCollapsed ? 0 : "auto",
            transition: "margin-left 150ms cubic-bezier(0.4, 0, 0.2, 1)"
          }}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <div key={item.href}>
              <Link
                href={item.href}
                className="flex items-center py-3 rounded-lg transition-colors duration-150"
                style={{
                  justifyContent: isCollapsed ? "center" : "flex-start",
                  paddingLeft: isCollapsed ? "8px" : "16px",
                  paddingRight: isCollapsed ? "8px" : "16px",
                  gap: isCollapsed ? 0 : "12px",
                  transition: "padding 150ms cubic-bezier(0.4, 0, 0.2, 1), gap 150ms cubic-bezier(0.4, 0, 0.2, 1), justify-content 150ms cubic-bezier(0.4, 0, 0.2, 1)",
                  ...(isActive ? { 
                    background: "linear-gradient(135deg, rgba(14, 165, 233, 0.25) 0%, rgba(6, 182, 212, 0.15) 100%)",
                    boxShadow: "0 10px 15px -3px rgba(14, 165, 233, 0.2)",
                    color: "rgb(6, 182, 212)",
                    border: "1px solid rgba(6, 182, 212, 0.3)"
                  } : {
                    color: "rgba(241, 245, 249, 0.8)"
                  })
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "rgb(241, 245, 249)"
                    e.currentTarget.style.backgroundColor = "rgba(51, 65, 85, 0.3)"
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "rgba(241, 245, 249, 0.8)"
                    e.currentTarget.style.backgroundColor = "transparent"
                  }
                }}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span
                  className="font-medium whitespace-nowrap"
                  style={{
                    opacity: isCollapsed ? 0 : 1,
                    width: isCollapsed ? 0 : "auto",
                    overflow: "hidden",
                    transition: "opacity 150ms cubic-bezier(0.4, 0, 0.2, 1), width 150ms cubic-bezier(0.4, 0, 0.2, 1)",
                    willChange: "opacity, width"
                  }}
                >
                  {item.label}
                </span>
              </Link>
            </div>
          )
        })}
      </nav>

      <div
        className="pt-6 border-t"
        style={{
          opacity: isCollapsed ? 0 : 1,
          height: isCollapsed ? 0 : "auto",
          overflow: "hidden",
          borderColor: "rgba(51, 65, 85, 0.2)",
          transition: "opacity 150ms cubic-bezier(0.4, 0, 0.2, 1), height 150ms cubic-bezier(0.4, 0, 0.2, 1)",
          willChange: "opacity, height"
        }}
      >
        <p className="text-xs text-foreground/60">v1.0.0</p>
      </div>
    </aside>
  )
}
