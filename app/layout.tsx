import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/layout/sidebar"
import { Navbar } from "@/components/layout/navbar"
import { QueryProvider } from "@/components/providers/query-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI Cyber Threat Forecaster",
  description: "Advanced threat intelligence and forecasting platform",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className={`${inter.className} text-foreground`}
        style={{
          background: "linear-gradient(135deg, rgba(5, 15, 28, 1) 0%, rgba(8, 16, 30, 0.98) 50%, rgba(15, 23, 42, 0.95) 100%)",
          minHeight: "100vh"
        }}
      >
        <QueryProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Navbar />
              <main className="flex-1 overflow-auto">{children}</main>
            </div>
          </div>
        </QueryProvider>
      </body>
    </html>
  )
}
