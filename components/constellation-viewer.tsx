"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import SkyCanvas from "@/components/sky-canvas"
import LocationForm from "@/components/location-form"
import DateTimeForm from "@/components/date-time-form"
import { calculateCelestialPositions } from "@/lib/astronomy"
import type { Location, CelestialData } from "@/lib/types"
import { MapPin, Calendar, Compass, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useTheme } from "next-themes"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function ConstellationViewer() {
  // Use client-side only state initialization to prevent hydration mismatch
  const [mounted, setMounted] = useState(false)
  const [dateTime, setDateTime] = useState<Date | null>(null)
  const [formattedDateTime, setFormattedDateTime] = useState<string>("")
  const [location, setLocation] = useState<Location>({
    latitude: 40.7128,
    longitude: -74.006,
    name: "New York, USA",
  })

  const [skyData, setSkyData] = useState<CelestialData | null>(null)
  const [activeTab, setActiveTab] = useState("view")
  const { resolvedTheme } = useTheme()

  // Initialize date only on client side to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
    const now = new Date()
    setDateTime(now)
    setFormattedDateTime(now.toLocaleString())
  }, [])

  useEffect(() => {
    if (!dateTime) return

    try {
      // Calculate star positions based on date/time and location
      const data = calculateCelestialPositions(dateTime, location)
      setSkyData(data)
    } catch (error) {
      console.error("Error calculating celestial positions:", error)
    }
  }, [dateTime, location])

  // Update formatted date string whenever dateTime changes
  useEffect(() => {
    if (dateTime) {
      setFormattedDateTime(dateTime.toLocaleString())
    }
  }, [dateTime])

  const handleDateTimeChange = (newDateTime: Date) => {
    try {
      // Validate that it's a proper Date object
      if (!(newDateTime instanceof Date) || isNaN(newDateTime.getTime())) {
        console.error("Invalid date provided:", newDateTime)
        return
      }
      setDateTime(newDateTime)
    } catch (error) {
      console.error("Error setting date time:", error)
    }
  }

  const handleLocationChange = (newLocation: Location) => {
    setLocation(newLocation)
  }

  // Show a loading state until client-side hydration is complete
  if (!mounted) {
    return (
      <div className="grid gap-6">
        <div className="h-12 bg-muted animate-pulse rounded-md"></div>
        <div className="h-[400px] bg-muted animate-pulse rounded-md"></div>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <Tabs defaultValue="view" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="view" className="flex items-center gap-2">
            <Compass className="h-4 w-4" />
            <span className="hidden sm:inline">Sky View</span>
          </TabsTrigger>
          <TabsTrigger value="location" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Location</span>
          </TabsTrigger>
          <TabsTrigger value="time" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Date & Time</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="space-y-4">
          <Card className="border-2 overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col items-center">
                <div className="w-full bg-muted p-4 flex justify-between items-center flex-wrap gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => setActiveTab("location")}
                        >
                          <MapPin className="h-4 w-4 text-primary" />
                          <span className="font-medium">{location.name}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Click to change location</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab("time")}>
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>{formattedDateTime}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Click to change date & time</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>

                <SkyCanvas skyData={skyData} />

                <div className="w-full p-4 flex flex-wrap gap-2 justify-center">
                  {skyData?.constellations
                    .filter((c) => c.lines.length > 0)
                    .map((constellation) => (
                      <Badge key={constellation.name} variant="outline" className="bg-primary/10">
                        {constellation.name}
                      </Badge>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-muted-foreground">
            <div className="flex items-center justify-center gap-1">
              <Info className="h-3 w-3" />
              <span>Click on the location or date above to change settings</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="location">
          <Card>
            <CardContent className="pt-6">
              <LocationForm
                location={location}
                onLocationChange={handleLocationChange}
                onComplete={() => setActiveTab("view")}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time">
          <Card>
            <CardContent className="pt-6">
              {dateTime && (
                <DateTimeForm
                  dateTime={dateTime}
                  onDateTimeChange={handleDateTimeChange}
                  onComplete={() => setActiveTab("view")}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

