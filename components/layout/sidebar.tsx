"use client"

import { BarChart3, Settings, Zap, AlertCircle, Info, PanelLeftClose, PanelLeftOpen, Brain, Globe } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const navItems = [
  { href: "/", label: "Dashboard", icon: BarChart3 },
  { href: "/threats", label: "Threat Feed", icon: AlertCircle },
  { href: "/crawler", label: "Crawler", icon: Zap },
  { href: "/website-checker", label: "Website Checker", icon: Globe },
  { href: "/ai", label: "AI Assistant", icon: Brain },
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
      className="border-r border-border/70 backdrop-blur-md py-6 flex flex-col relative overflow-hidden bg-card/95 dark:bg-card/95"
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
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">Navigation</h2>
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg transition-colors duration-150 text-muted-foreground hover:text-foreground hover:bg-muted/60 dark:hover:bg-muted/40 flex-shrink-0"
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
                className={`flex items-center py-3 rounded-lg transition-colors duration-150 border ${
                  isActive 
                    ? "bg-secondary text-foreground border-border/80 shadow-[0_12px_32px_rgba(0,0,0,0.18)]"
                    : "border-transparent text-muted-foreground hover:bg-muted/60 dark:hover:bg-muted/40 hover:text-foreground"
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
        className="pt-6 border-t border-border/70"
        style={{
          opacity: isCollapsed ? 0 : 1,
          height: isCollapsed ? 0 : "auto",
          overflow: "hidden",
          transition: "opacity 150ms cubic-bezier(0.4, 0, 0.2, 1), height 150ms cubic-bezier(0.4, 0, 0.2, 1)",
          willChange: "opacity, height"
        }}
      >
        <p className="text-xs text-muted-foreground">v1.0.0</p>
      </div>
    </aside>
  )
}
