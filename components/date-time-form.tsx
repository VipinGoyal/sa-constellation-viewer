"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Clock, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

interface DateTimeFormProps {
  dateTime: Date
  onDateTimeChange: (date: Date) => void
  onComplete: () => void
}

export default function DateTimeForm({ dateTime, onDateTimeChange, onComplete }: DateTimeFormProps) {
  // Local working copy of the date
  const [workingDate, setWorkingDate] = useState<Date>(new Date(dateTime.getTime()))

  const [date, setDate] = useState<Date | undefined>(workingDate)
  const [time, setTime] = useState(() => {
    try {
      return format(workingDate, "HH:mm")
    } catch (error) {
      console.error("Error formatting time:", error)
      return "00:00"
    }
  })
  const [formattedDate, setFormattedDate] = useState<string>("")

  // Update formatted date when date changes
  useEffect(() => {
    if (date) {
      try {
        setFormattedDate(format(date, "PPP"))
      } catch (error) {
        console.error("Error formatting date:", error)
      }
    }
  }, [date])

  // Ensure we always have a valid time format
  useEffect(() => {
    // Validate time format when component mounts
    if (!time || !/^\d{2}:\d{2}$/.test(time)) {
      try {
        setTime(format(workingDate, "HH:mm"))
      } catch (error) {
        console.error("Error setting time:", error)
        setTime("00:00")
      }
    }
  }, [workingDate])

  const handleTimeChange = (value: string) => {
    // Store the input value regardless of validity
    setTime(value)

    // Only update the working date if the time format is valid
    if (date && /^\d{2}:\d{2}$/.test(value)) {
      try {
        const [hours, minutes] = value.split(":").map(Number)

        // Validate hours and minutes
        if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
          return // Don't update if values are invalid
        }

        const newDate = new Date(date)
        newDate.setHours(hours, minutes)
        setWorkingDate(newDate)
      } catch (error) {
        console.error("Error parsing time:", error)
      }
    }
  }

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate)
      try {
        // Only try to set hours/minutes if time format is valid
        if (/^\d{2}:\d{2}$/.test(time)) {
          const [hours, minutes] = time.split(":").map(Number)

          // Validate hours and minutes
          if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            // Use current hours/minutes if invalid
            const updatedDate = new Date(newDate)
            setWorkingDate(updatedDate)
            return
          }

          const updatedDate = new Date(newDate)
          updatedDate.setHours(hours, minutes)
          setWorkingDate(updatedDate)
        } else {
          // If time format is invalid, just use the date with current time
          setWorkingDate(newDate)
        }
      } catch (error) {
        console.error("Error setting time:", error)
        setWorkingDate(newDate)
      }
    }
  }

  const handleNow = () => {
    const now = new Date()
    setDate(now)
    setWorkingDate(now)
    try {
      const formattedTime = format(now, "HH:mm")
      setTime(formattedTime)
    } catch (error) {
      console.error("Error formatting now time:", error)
      setTime("00:00")
    }
  }

  const handleCancel = () => {
    // Just return to view without applying changes
    onComplete()
  }

  const handleApply = () => {
    // Apply the working date to the actual date
    onDateTimeChange(workingDate)
    onComplete()
  }

  // Predefined times for quick selection
  const quickTimes = [
    { label: "Sunset", time: "19:30" },
    { label: "Midnight", time: "00:00" },
    { label: "Dawn", time: "05:30" },
  ]

  // Handle time input keydown to prevent crashes
  const handleTimeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Delete" || e.key === "Backspace") {
      // If the input would be empty after deletion, prevent default
      const input = e.currentTarget
      const selectionStart = input.selectionStart || 0
      const selectionEnd = input.selectionEnd || 0

      if (selectionStart === 0 && selectionEnd === input.value.length) {
        e.preventDefault()
        // Instead of setting to empty, set to a valid time
        setTime("00:00")
      }
    }
  }

  // Handle time input blur to ensure valid format
  const handleTimeBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value

    // If empty or invalid format, reset to a valid time
    if (!value || !/^\d{2}:\d{2}$/.test(value)) {
      // Reset to current time or a default
      if (date) {
        try {
          setTime(format(date, "HH:mm"))
        } catch (error) {
          console.error("Error formatting time on blur:", error)
          setTime("00:00")
        }
      } else {
        setTime("00:00")
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Select Date</h3>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formattedDate ? formattedDate : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={date} onSelect={handleDateChange} initialFocus />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Select Time</h3>
        </div>

        <div className="relative">
          <Input
            type="time"
            value={time}
            onChange={(e) => handleTimeChange(e.target.value)}
            onKeyDown={handleTimeKeyDown}
            onBlur={handleTimeBlur}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          {quickTimes.map((quickTime) => (
            <Button
              key={quickTime.time}
              variant="outline"
              onClick={() => handleTimeChange(quickTime.time)}
              className="text-xs"
            >
              {quickTime.label}
            </Button>
          ))}
        </div>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Current Selection</h4>
              <p className="text-sm text-muted-foreground">
                {formattedDate || "No date selected"} at {time}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleNow} className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              Now
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleApply}>Apply</Button>
      </div>
    </div>
  )
}

