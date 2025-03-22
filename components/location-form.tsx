"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Location } from "@/lib/types"
import { Search, MapPin, Globe, AlertCircle, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useDebounce } from "@/hooks/use-debounce"

interface LocationFormProps {
  location: Location
  onLocationChange: (location: Location) => void
  onComplete: () => void
}

// Sample location data
const sampleLocations: Location[] = [
  { latitude: 40.7128, longitude: -74.006, name: "New York, USA" },
  { latitude: 51.5074, longitude: -0.1278, name: "London, UK" },
  { latitude: 35.6762, longitude: 139.6503, name: "Tokyo, Japan" },
  { latitude: -33.8688, longitude: 151.2093, name: "Sydney, Australia" },
  { latitude: 48.8566, longitude: 2.3522, name: "Paris, France" },
  { latitude: 55.7558, longitude: 37.6173, name: "Moscow, Russia" },
  { latitude: -22.9068, longitude: -43.1729, name: "Rio de Janeiro, Brazil" },
  { latitude: 37.7749, longitude: -122.4194, name: "San Francisco, USA" },
  { latitude: 41.9028, longitude: 12.4964, name: "Rome, Italy" },
  { latitude: 52.52, longitude: 13.405, name: "Berlin, Germany" },
  { latitude: 25.2048, longitude: 55.2708, name: "Dubai, UAE" },
  { latitude: 1.3521, longitude: 103.8198, name: "Singapore" },
  { latitude: 19.4326, longitude: -99.1332, name: "Mexico City, Mexico" },
  { latitude: -34.6037, longitude: -58.3816, name: "Buenos Aires, Argentina" },
  { latitude: 59.3293, longitude: 18.0686, name: "Stockholm, Sweden" },
  { latitude: 30.0444, longitude: 31.2357, name: "Cairo, Egypt" },
]

export default function LocationForm({ location, onLocationChange, onComplete }: LocationFormProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearchQuery = useDebounce(searchQuery, 300) // 300ms debounce
  const [searchResults, setSearchResults] = useState<Location[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [manualLocation, setManualLocation] = useState({
    latitude: location.latitude.toString(),
    longitude: location.longitude.toString(),
    name: location.name,
  })
  const [error, setError] = useState<string | null>(null)

  // Store the selected location from search results
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  // Effect to perform search when debounced query changes
  useEffect(() => {
    if (debouncedSearchQuery.trim().length === 0) {
      setSearchResults([])
      return
    }

    setIsSearching(true)

    // Simulate API call with setTimeout
    const timeoutId = setTimeout(() => {
      const results = sampleLocations.filter((loc) =>
        loc.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()),
      )

      setSearchResults(results)
      setIsSearching(false)
    }, 200) // Simulate network delay

    return () => clearTimeout(timeoutId)
  }, [debouncedSearchQuery])

  const handleSelectLocation = (loc: Location) => {
    // Store the selected location
    setSelectedLocation(loc)

    // Update the form fields to reflect the selection
    setManualLocation({
      latitude: loc.latitude.toString(),
      longitude: loc.longitude.toString(),
      name: loc.name,
    })

    setError(null)
    setSearchQuery("") // Clear search after selection
  }

  const handleManualSubmit = () => {
    setError(null)

    // Validate inputs
    const lat = Number.parseFloat(manualLocation.latitude)
    const lng = Number.parseFloat(manualLocation.longitude)

    if (isNaN(lat) || isNaN(lng)) {
      setError("Please enter valid numbers for latitude and longitude")
      return
    }

    if (lat < -90 || lat > 90) {
      setError("Latitude must be between -90 and 90 degrees")
      return
    }

    if (lng < -180 || lng > 180) {
      setError("Longitude must be between -180 and 180 degrees")
      return
    }

    const name = manualLocation.name.trim() || `${lat.toFixed(4)}, ${lng.toFixed(4)}`

    // Apply the manual location directly
    onLocationChange({
      latitude: lat,
      longitude: lng,
      name: name,
    })

    // Return to view
    onComplete()
  }

  const handleApply = () => {
    // If a location was selected from search results, apply it
    if (selectedLocation) {
      onLocationChange(selectedLocation)
      onComplete()
      return
    }

    // Otherwise, try to apply the manual location if it's valid
    const lat = Number.parseFloat(manualLocation.latitude)
    const lng = Number.parseFloat(manualLocation.longitude)

    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      const name = manualLocation.name.trim() || `${lat.toFixed(4)}, ${lng.toFixed(4)}`

      onLocationChange({
        latitude: lat,
        longitude: lng,
        name: name,
      })
    }

    onComplete()
  }

  const handleCancel = () => {
    // Just return to view without applying changes
    onComplete()
  }

  const handleInputChange = (field: keyof typeof manualLocation, value: string) => {
    setManualLocation((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Clear the selected location when manually editing
    setSelectedLocation(null)

    // Clear error when user starts typing again
    if (error) setError(null)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Search className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Search Location</h3>
        </div>

        <div className="relative">
          <Input
            placeholder="Start typing to search for a city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>

        {searchResults.length > 0 && (
          <div className="grid gap-2 mt-2 max-h-[300px] overflow-y-auto">
            {searchResults.map((result, index) => (
              <Card key={index} className="overflow-hidden hover:border-primary transition-colors">
                <button
                  className="w-full text-left p-3 flex items-center gap-3"
                  onClick={() => handleSelectLocation(result)}
                >
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <div>
                    <div className="font-medium">{result.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {result.latitude.toFixed(4)}, {result.longitude.toFixed(4)}
                    </div>
                  </div>
                </button>
              </Card>
            ))}
          </div>
        )}

        {debouncedSearchQuery && !isSearching && searchResults.length === 0 && (
          <div className="text-center p-4 text-muted-foreground bg-muted/50 rounded-md">
            No locations found. Try a different search term or use manual coordinates.
          </div>
        )}
      </div>

      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Manual Coordinates</h3>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-destructive/15 border border-destructive/30 text-destructive-foreground flex items-start gap-2 dark:bg-destructive/30 dark:border-destructive/50">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span className="dark:font-medium">{error}</span>
          </div>
        )}

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Location Name (optional)</Label>
            <Input
              id="name"
              placeholder="My Location"
              value={manualLocation.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="latitude">Latitude (-90 to 90)</Label>
              <Input
                id="latitude"
                placeholder="40.7128"
                value={manualLocation.latitude}
                onChange={(e) => handleInputChange("latitude", e.target.value)}
                type="number"
                min="-90"
                max="90"
                step="0.0001"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="longitude">Longitude (-180 to 180)</Label>
              <Input
                id="longitude"
                placeholder="-74.006"
                value={manualLocation.longitude}
                onChange={(e) => handleInputChange("longitude", e.target.value)}
                type="number"
                min="-180"
                max="180"
                step="0.0001"
              />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <Button onClick={handleManualSubmit} className="w-full">
            Set Custom Location
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleApply}>Apply</Button>
      </div>
    </div>
  )
}

