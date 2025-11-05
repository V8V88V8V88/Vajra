"use client"

import { BarChart3, Settings, Zap, AlertCircle, Info, PanelLeftClose, PanelLeftOpen } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  }

  return (
    <aside
      style={{ 
        background: "linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(8, 16, 30, 0.98) 50%, rgba(5, 15, 28, 1) 100%)",
        borderColor: "rgba(30, 58, 138, 0.3)" 
      }}
      className={`${isCollapsed ? "w-16 px-2" : "w-64 px-6"} border-r backdrop-blur-md py-6 flex flex-col transition-all duration-300 relative`}
    >
      <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} mb-8`}>
        {!isCollapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <h2 className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">Navigation</h2>
          </motion.div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 hover:bg-secondary/20 rounded-lg transition-smooth text-foreground/70 hover:text-foreground ${isCollapsed ? "" : "ml-auto"}`}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>
      </div>

      <motion.nav className="flex-1 space-y-2" variants={containerVariants} initial="hidden" animate="visible">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <motion.div key={item.href} variants={itemVariants}>
              <Link
                href={item.href}
                className={`flex items-center ${isCollapsed ? "justify-center px-2" : "gap-3 px-4"} py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "text-primary border border-primary/30"
                    : "text-foreground/80 hover:text-foreground hover:bg-slate-800/30"
                }`}
                style={isActive ? { 
                  background: "linear-gradient(135deg, rgba(14, 165, 233, 0.25) 0%, rgba(6, 182, 212, 0.15) 100%)",
                  boxShadow: "0 10px 15px -3px rgba(14, 165, 233, 0.2)" 
                } : {}}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">{item.label}</span>}
              </Link>
            </motion.div>
          )
        })}
      </motion.nav>

      {!isCollapsed && (
        <motion.div
          className="pt-6 border-t border-surface-light/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-xs text-foreground/60">v1.0.0</p>
        </motion.div>
      )}
    </aside>
  )
}
