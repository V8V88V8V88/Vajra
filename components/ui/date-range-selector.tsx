"use client"

import { useState, useEffect } from "react"
import { Calendar, X } from "lucide-react"

export type DateRangeType = "1month" | "3months" | "6months" | "12months" | "custom"

interface DateRangeSelectorProps {
  value: DateRangeType
  customStartDate?: string
  customEndDate?: string
  onChange: (range: DateRangeType, startDate?: string, endDate?: string) => void
  className?: string
}

export function DateRangeSelector({
  value,
  customStartDate = "",
  customEndDate = "",
  onChange,
  className = "",
}: DateRangeSelectorProps) {
  const [showCustom, setShowCustom] = useState(value === "custom")
  const [startDate, setStartDate] = useState(customStartDate)
  const [endDate, setEndDate] = useState(customEndDate)

  useEffect(() => {
    setShowCustom(value === "custom")
  }, [value])

  useEffect(() => {
    setStartDate(customStartDate)
    setEndDate(customEndDate)
  }, [customStartDate, customEndDate])

  const handlePresetChange = (preset: DateRangeType) => {
    if (preset === "custom") {
      setShowCustom(true)
      onChange("custom", startDate || undefined, endDate || undefined)
    } else {
      setShowCustom(false)
      onChange(preset)
    }
  }

  const handleCustomApply = () => {
    if (startDate && endDate && new Date(startDate) <= new Date(endDate)) {
      onChange("custom", startDate, endDate)
      setShowCustom(false)
    }
  }

  const handleClear = () => {
    setStartDate("")
    setEndDate("")
    onChange("6months") // Reset to default
    setShowCustom(false)
  }

  const getDateRangeLabel = () => {
    if (value === "custom" && startDate && endDate) {
      return "Custom Range"
    }
    switch (value) {
      case "1month":
        return "1 Month"
      case "3months":
        return "3 Months"
      case "6months":
        return "6 Months"
      case "12months":
        return "12 Months"
      default:
        return "Date Range"
    }
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowCustom(!showCustom)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/60 bg-muted/60 text-foreground hover:bg-muted/80 transition-colors text-sm font-medium"
      >
        <Calendar className="w-4 h-4" />
        {getDateRangeLabel()}
      </button>

      {showCustom && (
        <div className="absolute right-0 top-full mt-2 z-10 bg-card border border-border rounded-lg p-4 shadow-lg min-w-[300px]">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-foreground">Select Date Range</span>
            <button
              onClick={() => {
                setShowCustom(false)
                if (value !== "custom") {
                  onChange(value)
                }
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Preset Options */}
          <div className="mb-4 space-y-2">
            <label className="block text-xs font-medium text-foreground mb-2">Quick Select</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handlePresetChange("1month")}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${
                  value === "1month"
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-muted/50 text-foreground hover:bg-muted/70"
                }`}
              >
                1 Month
              </button>
              <button
                onClick={() => handlePresetChange("3months")}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${
                  value === "3months"
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-muted/50 text-foreground hover:bg-muted/70"
                }`}
              >
                3 Months
              </button>
              <button
                onClick={() => handlePresetChange("6months")}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${
                  value === "6months"
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-muted/50 text-foreground hover:bg-muted/70"
                }`}
              >
                6 Months
              </button>
              <button
                onClick={() => handlePresetChange("12months")}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors border ${
                  value === "12months"
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-muted/50 text-foreground hover:bg-muted/70"
                }`}
              >
                12 Months
              </button>
            </div>
          </div>

          {/* Custom Date Inputs */}
          <div className="space-y-3 border-t border-border pt-3">
            <label className="block text-xs font-medium text-foreground mb-2">Custom Range</label>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCustomApply}
                disabled={!startDate || !endDate || new Date(startDate) > new Date(endDate)}
                className="flex-1 px-3 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:bg-foreground/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Apply Custom
              </button>
              {(startDate || endDate || value === "custom") && (
                <button
                  onClick={handleClear}
                  className="px-3 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted/60 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

