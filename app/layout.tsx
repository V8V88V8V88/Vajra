import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/layout/sidebar"
import { Navbar } from "@/components/layout/navbar"
import { QueryProvider } from "@/components/providers/query-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { FontLoader } from "@/components/font-loader"
import { NotificationProvider } from "@/contexts/notification-context"

// Inter font for non-Apple platforms
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "VAJRA - AI Cyber Threat Forecaster",
  description: "Advanced threat intelligence and forecasting platform",
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/favicon-16x16.png?v=2', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png?v=2', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico?v=2', sizes: 'any' },
    ],
    apple: [
      { url: '/apple-touch-icon.png?v=2', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'android-chrome-192x192', url: '/android-chrome-192x192.png?v=2', sizes: '192x192', type: 'image/png' },
      { rel: 'android-chrome-512x512', url: '/android-chrome-512x512.png?v=2', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className={`${inter.className} text-foreground bg-gradient-to-br from-[#fafafa] via-[#f4f4f5] to-[#ededee] dark:bg-gradient-to-br dark:from-[#050505] dark:via-[#080808] dark:to-[#0c0c0c]`}
        style={{
          minHeight: "100vh"
        }}
      >
        <FontLoader />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <NotificationProvider>
            <QueryProvider>
              <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Navbar />
                  <main className="flex-1 overflow-auto">{children}</main>
                </div>
              </div>
            </QueryProvider>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
