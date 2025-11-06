"use client"

import { useEffect } from "react"

export function FontLoader() {
  useEffect(() => {
    // Always try to use San Francisco font first (works on Apple devices and browsers that support it)
    // Fallback to Inter only if San Francisco is not available
    
    // San Francisco font stack (will work on Apple devices)
    const sanFranciscoFont = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial'
    
    // Inter font is loaded via Next.js, so it's available as fallback
    // Font stack: San Francisco first, then Inter, then system sans-serif
    const fontStack = `${sanFranciscoFont}, Inter, sans-serif`
    
    // Apply font with !important to override Inter className
    document.body.style.setProperty('font-family', fontStack, 'important')
    
    // Also set it on html element for better coverage
    document.documentElement.style.setProperty('font-family', fontStack, 'important')
  }, [])

  return null
}

