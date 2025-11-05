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
        width: isCollapsed ? "64px" : "256px",
        paddingLeft: isCollapsed ? "8px" : "24px",
        paddingRight: isCollapsed ? "8px" : "24px",
        transition: "width 150ms cubic-bezier(0.4, 0, 0.2, 1), padding 150ms cubic-bezier(0.4, 0, 0.2, 1)",
        willChange: "width, padding",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden"
      }}
      className="border-r backdrop-blur-md py-6 flex flex-col relative overflow-hidden bg-white/90 dark:bg-gradient-to-b dark:from-[rgba(15,23,42,0.95)] dark:via-[rgba(8,16,30,0.98)] dark:to-[rgba(5,15,28,1)] border-slate-200 dark:border-[rgba(30,58,138,0.3)]"
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
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap">Navigation</h2>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800/30 rounded-lg transition-colors duration-150 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-foreground flex-shrink-0"
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
                className={`flex items-center py-3 rounded-lg transition-colors duration-150 ${
                  isActive 
                    ? "bg-gradient-to-r from-cyan-500/25 to-cyan-400/15 dark:from-cyan-500/25 dark:to-cyan-400/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 shadow-lg shadow-cyan-500/20" 
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/30 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
                style={{
                  justifyContent: isCollapsed ? "center" : "flex-start",
                  paddingLeft: isCollapsed ? "8px" : "16px",
                  paddingRight: isCollapsed ? "8px" : "16px",
                  gap: isCollapsed ? 0 : "12px",
                  transition: "padding 150ms cubic-bezier(0.4, 0, 0.2, 1), gap 150ms cubic-bezier(0.4, 0, 0.2, 1), justify-content 150ms cubic-bezier(0.4, 0, 0.2, 1)",
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
        className="pt-6 border-t border-slate-200 dark:border-slate-700/50"
        style={{
          opacity: isCollapsed ? 0 : 1,
          height: isCollapsed ? 0 : "auto",
          overflow: "hidden",
          transition: "opacity 150ms cubic-bezier(0.4, 0, 0.2, 1), height 150ms cubic-bezier(0.4, 0, 0.2, 1)",
          willChange: "opacity, height"
        }}
      >
        <p className="text-xs text-slate-500 dark:text-slate-400">v1.0.0</p>
      </div>
    </aside>
  )
}
