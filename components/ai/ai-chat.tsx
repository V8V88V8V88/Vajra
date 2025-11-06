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
    <div className="flex flex-col h-full backdrop-blur-md border border-slate-900 bg-[#0a0a0f] dark:bg-[#0a0a0f] rounded-lg overflow-hidden">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#0a0a0f]">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-4 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "assistant" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center border border-cyan-400/50">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            )}
            
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                message.role === "user"
                  ? "bg-cyan-500/60 dark:bg-cyan-500/60 text-white border border-cyan-500/70 dark:border-cyan-400/70"
                  : "bg-[#0d1217] dark:bg-[#0d1217] text-slate-100 dark:text-slate-200 border border-cyan-500/20 dark:border-cyan-500/20"
              }`}
            >
              {message.role === "assistant" ? (
                <div className="text-sm markdown-content">
                  <ReactMarkdown
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-4 mb-2 text-slate-100" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-3 mb-2 text-slate-100" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-base font-bold mt-3 mb-1 text-slate-100" {...props} />,
                      h4: ({node, ...props}) => <h4 className="text-sm font-bold mt-2 mb-1 text-slate-100" {...props} />,
                      p: ({node, ...props}) => <p className="mb-2 text-slate-200 leading-relaxed" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-semibold text-slate-100" {...props} />,
                      em: ({node, ...props}) => <em className="italic text-slate-200" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2 ml-4 space-y-1 text-slate-200" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2 ml-4 space-y-1 text-slate-200" {...props} />,
                      li: ({node, ...props}) => <li className="text-slate-200" {...props} />,
                      code: ({node, inline, ...props}: any) => 
                        inline ? (
                          <code className="bg-slate-800 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono text-cyan-300" {...props} />
                        ) : (
                          <code className="block bg-slate-800 dark:bg-slate-800 p-2 rounded text-sm font-mono text-cyan-300 overflow-x-auto" {...props} />
                        ),
                      pre: ({node, ...props}) => <pre className="bg-slate-800 dark:bg-slate-800 p-3 rounded mb-2 overflow-x-auto text-cyan-300" {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-slate-700 dark:border-slate-700 pl-4 italic my-2 text-slate-300" {...props} />,
                      a: ({node, ...props}) => <a className="text-cyan-400 dark:text-cyan-400 hover:text-cyan-300 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap break-words text-white">{message.content}</p>
              )}
              <p className={`text-xs mt-2 ${
                message.role === "user" 
                  ? "text-cyan-200 dark:text-cyan-200" 
                  : "text-slate-400 dark:text-slate-400"
              }`}>
                {isMounted ? message.timestamp.toLocaleTimeString() : ""}
              </p>
            </div>

            {message.role === "user" && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center border border-blue-500/50 overflow-hidden">
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
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center border border-cyan-400/50">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div className="bg-[#0f1419] dark:bg-[#0f1419] rounded-lg px-4 py-3 border border-cyan-500/20 dark:border-cyan-500/20">
              <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Example Questions */}
      {messages.length === 1 && (
        <div className="px-6 pb-2 border-t border-slate-900 bg-[#0a0a0f]">
          <p className="text-xs text-slate-500 mb-2 mt-3">Example questions:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_QUESTIONS.map((question, idx) => (
              <button
                key={idx}
                onClick={() => handleExampleClick(question)}
                className="text-xs px-3 py-1.5 rounded-full bg-[#0f1419] dark:bg-[#0f1419] hover:bg-[#151a20] dark:hover:bg-[#151a20] text-slate-300 border border-cyan-500/30 dark:border-cyan-500/30 hover:border-cyan-500/50 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-slate-900 p-4 bg-[#0a0a0f]">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about CVEs, vulnerabilities, or security threats..."
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-lg bg-[#0f1419] border border-cyan-500/30 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 disabled:opacity-50"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="px-6 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
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

