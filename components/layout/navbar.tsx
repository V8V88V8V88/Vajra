"use client"

import { Bell, Settings, User } from "lucide-react"
import Image from "next/image"

export function Navbar() {
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
        <button className="p-2 hover:bg-slate-800/40 rounded-lg transition-smooth text-foreground/70 hover:text-foreground">
          <Bell className="w-5 h-5" />
        </button>
        <button className="p-2 hover:bg-slate-800/40 rounded-lg transition-smooth text-foreground/70 hover:text-foreground">
          <Settings className="w-5 h-5" />
        </button>
        <button className="p-2 hover:bg-slate-800/40 rounded-lg transition-smooth text-foreground/70 hover:text-foreground">
          <User className="w-5 h-5" />
        </button>
      </div>
    </nav>
  )
}
