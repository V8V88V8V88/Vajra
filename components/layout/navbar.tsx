"use client"

import { Bell, Settings, User } from "lucide-react"
import Image from "next/image"

export function Navbar() {
  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-md px-6 py-4 flex items-center justify-between">
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
        <button className="p-2 hover:bg-secondary/20 rounded-lg transition-smooth text-muted-foreground hover:text-foreground">
          <Bell className="w-5 h-5" />
        </button>
        <button className="p-2 hover:bg-secondary/20 rounded-lg transition-smooth text-muted-foreground hover:text-foreground">
          <Settings className="w-5 h-5" />
        </button>
        <button className="p-2 hover:bg-secondary/20 rounded-lg transition-smooth text-muted-foreground hover:text-foreground">
          <User className="w-5 h-5" />
        </button>
      </div>
    </nav>
  )
}
