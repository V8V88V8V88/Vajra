"use client"

import { AIChat } from "@/components/ai/ai-chat"

export default function AIPage() {
  return (
    <div className="p-8 h-full flex flex-col">
      <div className="mb-6 fade-in">
        <h1 className="text-4xl font-bold text-foreground mb-2">AI Security Assistant</h1>
        <p className="text-muted-foreground">Ask questions about CVEs, security threats, and whether your systems are affected</p>
      </div>
      
      <div className="flex-1 min-h-0">
        <AIChat />
      </div>
    </div>
  )
}

