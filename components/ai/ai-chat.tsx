"use client"

import { useState, useRef, useEffect } from "react"
import { sendChatMessage } from "@/lib/api"
import { Send, Bot, User, Loader2, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import ReactMarkdown from "react-markdown"
import Image from "next/image"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const EXAMPLE_QUESTIONS = [
  "What is CVE-2023-38545 and how critical is it?",
  "Is my website vulnerable to SQL injection attacks?",
  "What are the latest zero-day vulnerabilities?",
  "Explain how ransomware attacks work",
  "What security measures should I take for my web server?"
]

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I'm your AI security assistant. I can help you with questions about CVEs, security threats, vulnerability assessments, and whether your systems might be affected by specific vulnerabilities. How can I assist you today?",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await sendChatMessage(userMessage.content)
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.message || "I apologize, but I encountered an error processing your request.",
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm sorry, I'm having trouble connecting to the AI service. Please check that the API key is configured correctly in the backend.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleExampleClick = (question: string) => {
    setInput(question)
    inputRef.current?.focus()
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full backdrop-blur-md border border-border bg-card/95 dark:bg-card/95 rounded-lg overflow-hidden">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-transparent">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-4 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "assistant" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted text-foreground flex items-center justify-center border border-border/60">
                <Sparkles className="w-4 h-4" />
              </div>
            )}
            
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                message.role === "user"
                  ? "bg-foreground text-background border border-foreground/40"
                  : "bg-muted/60 text-foreground border border-border/60"
              }`}
            >
              {message.role === "assistant" ? (
                <div className="text-sm markdown-content">
                  <ReactMarkdown
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-4 mb-2 text-foreground" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-lg font-semibold mt-3 mb-2 text-foreground" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-base font-semibold mt-3 mb-1 text-foreground" {...props} />,
                      h4: ({node, ...props}) => <h4 className="text-sm font-semibold mt-2 mb-1 text-foreground/90" {...props} />,
                      p: ({node, ...props}) => <p className="mb-2 text-muted-foreground leading-relaxed" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-semibold text-foreground" {...props} />,
                      em: ({node, ...props}) => <em className="italic text-muted-foreground" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2 ml-4 space-y-1 text-muted-foreground" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2 ml-4 space-y-1 text-muted-foreground" {...props} />,
                      li: ({node, ...props}) => <li className="text-muted-foreground" {...props} />,
                      code: ({node, inline, ...props}: any) => 
                        inline ? (
                          <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground" {...props} />
                        ) : (
                          <code className="block bg-muted p-2 rounded text-sm font-mono text-foreground overflow-x-auto border border-border/60" {...props} />
                        ),
                      pre: ({node, ...props}) => <pre className="bg-muted p-3 rounded mb-2 overflow-x-auto text-foreground border border-border/60" {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-border/60 pl-4 italic my-2 text-muted-foreground" {...props} />,
                      a: ({node, ...props}) => <a className="text-foreground underline decoration-dotted underline-offset-4 hover:text-foreground/80" target="_blank" rel="noopener noreferrer" {...props} />,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
              )}
              <p className={`text-xs mt-2 ${
                message.role === "user" 
                  ? "text-background/80" 
                  : "text-muted-foreground"
              }`}>
                {isMounted ? message.timestamp.toLocaleTimeString() : ""}
              </p>
            </div>

            {message.role === "user" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted text-foreground flex items-center justify-center border border-border/60 overflow-hidden">
                <Image
                  src="/VajraLogo.png"
                  alt="User"
                  width={20}
                  height={20}
                  className="object-contain"
                />
              </div>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="flex gap-4 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted text-foreground flex items-center justify-center border border-border/60">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="bg-muted/60 rounded-lg px-4 py-3 border border-border/50">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Example Questions */}
      {messages.length === 1 && (
        <div className="px-6 pb-2 border-t border-border/70 bg-card/90">
          <p className="text-xs text-muted-foreground mb-2 mt-3">Example questions:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUESTIONS.map((question, idx) => (
              <button
                key={idx}
                onClick={() => handleExampleClick(question)}
                className="text-xs px-3 py-1.5 rounded-full bg-muted/50 text-muted-foreground border border-border/50 hover:bg-muted/70 hover:text-foreground transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-border/70 p-4 bg-card/95">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about CVEs, vulnerabilities, or security threats..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-lg bg-transparent border border-border/60 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/30 focus:border-foreground/40 disabled:opacity-50"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-6"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

