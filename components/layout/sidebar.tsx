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
      className="border-r border-border/70 backdrop-blur-md py-6 flex flex-col relative overflow-hidden bg-[#f9f9f9] dark:bg-[#090909]"
    >
      <div className="pointer-events-none absolute inset-0 opacity-90">
        {/* Light mode gradients */}
        <div className="absolute inset-0 dark:hidden" style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(254,254,254,0.98) 40%, rgba(253,253,253,0.92) 70%, rgba(255,255,255,0.96) 100%)"
        }} />
        <div className="absolute inset-0 dark:hidden mix-blend-screen" style={{
          background: "radial-gradient(circle at top left, rgba(255,255,255,0.28), transparent 55%), radial-gradient(circle at bottom right, rgba(255,255,255,0.3), transparent 60%)"
        }} />
        {/* Dark mode gradients */}
        <div className="hidden dark:block absolute inset-0" style={{
          background: "linear-gradient(180deg, rgba(15,15,15,0.94) 0%, rgba(6,6,6,0.98) 40%, rgba(4,4,4,0.92) 70%, rgba(0,0,0,0.96) 100%)"
        }} />
        <div className="hidden dark:block absolute inset-0 mix-blend-screen" style={{
          background: "radial-gradient(circle at top left, rgba(40,40,40,0.28), transparent 55%), radial-gradient(circle at bottom right, rgba(25,25,25,0.3), transparent 60%)"
        }} />
      </div>

      <div 
        className="flex items-center mb-8 relative z-10"
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
          className="p-2 rounded-lg transition-colors duration-150 hover:bg-muted/60 dark:hover:bg-muted/40 flex-shrink-0"
          style={{
            marginLeft: isCollapsed ? 0 : "auto",
            transition: "margin-left 150ms cubic-bezier(0.4, 0, 0.2, 1)"
          }}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-5 h-5 text-gray-700 dark:text-gray-100" style={{ strokeWidth: 2.5 }} />
          ) : (
            <PanelLeftClose className="w-5 h-5 text-gray-700 dark:text-gray-100" style={{ strokeWidth: 2.5 }} />
          )}
        </button>
      </div>

      <nav className="flex-1 space-y-2 relative z-10">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <div key={item.href} className="relative z-10">
              <Link
                href={item.href}
                className={`flex items-center py-3 rounded-lg transition-colors duration-150 border relative z-10 ${
                  isActive 
                    ? "bg-secondary text-foreground dark:text-white border-border/80 shadow-[0_12px_32px_rgba(0,0,0,0.18)]"
                    : "border-transparent text-gray-700 dark:text-gray-100 hover:bg-muted/60 dark:hover:bg-muted/40 hover:text-gray-900 dark:hover:text-white"
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
                <Icon 
                  className={`w-5 h-5 flex-shrink-0 ${
                    isActive 
                      ? "text-foreground dark:text-white" 
                      : "text-gray-700 dark:text-gray-100"
                  }`}
                  style={{ strokeWidth: 2.5 }} 
                />
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
