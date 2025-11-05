import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/layout/sidebar"
import { Navbar } from "@/components/layout/navbar"
import { QueryProvider } from "@/components/providers/query-provider"
import { ThemeProvider } from "@/components/theme-provider"

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
        className={`${inter.className} text-foreground dark:bg-gradient-to-br dark:from-[#050f1a] dark:via-[#08101e] dark:to-[#0f172a] bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100`}
        style={{
          minHeight: "100vh"
        }}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <QueryProvider>
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <div 
                className="flex-1 flex flex-col overflow-hidden"
                style={{
                  transition: "margin-left 150ms cubic-bezier(0.4, 0, 0.2, 1)",
                  willChange: "margin-left"
                }}
              >
                <Navbar />
                <main className="flex-1 overflow-auto">{children}</main>
              </div>
            </div>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
