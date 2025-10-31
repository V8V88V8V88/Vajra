"use client"

import { BarChart3, Settings, Zap, AlertCircle, Info } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"

const navItems = [
  { href: "/", label: "Dashboard", icon: BarChart3 },
  { href: "/threats", label: "Threat Feed", icon: AlertCircle },
  { href: "/crawler", label: "Crawler", icon: Zap },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/about", label: "About", icon: Info }, // About Section
]

export function Sidebar() {
  const pathname = usePathname()

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
      style={{ backgroundColor: "rgba(30, 41, 59, 0.5)", borderColor: "rgba(51, 65, 85, 0.2)" }}
      className="w-64 border-r backdrop-blur-md p-6 flex flex-col"
    >
      <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">Navigation</h2>
      </motion.div>

      <motion.nav className="flex-1 space-y-2" variants={containerVariants} initial="hidden" animate="visible">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <motion.div key={item.href} variants={itemVariants}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "text-muted hover:text-foreground hover:bg-surface-light/20"
                }`}
                style={isActive ? { boxShadow: "0 10px 15px -3px rgba(14, 165, 233, 0.2)" } : {}}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            </motion.div>
          )
        })}
      </motion.nav>

      <motion.div
        className="pt-6 border-t border-surface-light/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-xs text-muted">v1.0.0</p>
      </motion.div>
    </aside>
  )
}
