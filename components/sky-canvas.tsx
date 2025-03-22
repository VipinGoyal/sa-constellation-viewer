"use client"

import { useRef, useEffect, useState } from "react"
import type { CelestialData, Star, Constellation } from "@/lib/types"
import { useTheme } from "next-themes"

interface SkyCanvasProps {
  skyData: CelestialData | null
  theme?: string | undefined
}

export default function SkyCanvas({ skyData }: SkyCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Only render on client-side to prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !canvasRef.current || !skyData) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const size = Math.min(window.innerWidth - 40, 800)
    canvas.width = size
    canvas.height = size

    // Clear canvas with theme-appropriate background
    // Use a deeper blue for dark mode to make stars more visible
    const isDarkMode = resolvedTheme === "dark"

    // Create a gradient background
    const gradient = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      0,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 2,
    )

    if (isDarkMode) {
      gradient.addColorStop(0, "#1e293b")
      gradient.addColorStop(1, "#0f172a")
    } else {
      gradient.addColorStop(0, "#001e3c")
      gradient.addColorStop(1, "#000814")
    }

    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Add some "atmosphere" glow at the bottom
    const horizonGradient = ctx.createLinearGradient(0, canvas.height * 0.7, 0, canvas.height)
    if (isDarkMode) {
      horizonGradient.addColorStop(0, "rgba(30, 58, 138, 0)")
      horizonGradient.addColorStop(1, "rgba(30, 58, 138, 0.3)")
    } else {
      horizonGradient.addColorStop(0, "rgba(0, 30, 60, 0)")
      horizonGradient.addColorStop(1, "rgba(0, 30, 60, 0.3)")
    }

    ctx.fillStyle = horizonGradient
    ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3)

    // Calculate the radius with increased padding
    const padding = 40 // Increased padding in pixels (was 20)
    const radius = Math.min(canvas.width, canvas.height) / 2 - padding

    // Draw stars with enhanced visuals
    skyData.stars.forEach((star) => {
      drawStar(ctx, star, canvas.width, canvas.height, isDarkMode, padding)
    })

    // Draw constellations
    skyData.constellations.forEach((constellation) => {
      drawConstellation(ctx, constellation, canvas.width, canvas.height, isDarkMode, padding)
    })

    // Draw cardinal directions and horizon
    drawCardinalDirections(ctx, canvas.width, canvas.height, isDarkMode, radius, padding)
  }, [skyData, resolvedTheme, mounted])

  const drawStar = (
    ctx: CanvasRenderingContext2D,
    star: Star,
    width: number,
    height: number,
    isDarkMode: boolean,
    padding: number,
  ) => {
    // Calculate center point
    const centerX = width / 2
    const centerY = height / 2

    // Calculate the radius with padding
    const radius = Math.min(width, height) / 2 - padding

    // Calculate position with padding adjustment
    const azimuthRad = (star.azimuth * Math.PI) / 180
    const altitudeRatio = (90 - star.altitude) / 90

    // Calculate position from center
    const distance = altitudeRatio * radius
    const x = centerX + distance * Math.sin(azimuthRad)
    const y = centerY - distance * Math.cos(azimuthRad)

    // Only draw stars that are above the horizon
    if (star.altitude > 0) {
      // Adjust star brightness based on theme
      const brightness = isDarkMode ? 1.2 : 1
      const starRadius = Math.max(1, 3 * (star.magnitude / 6) * brightness)

      // Create gradient for star
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, starRadius * 2)

      // Star color based on magnitude (brighter stars are more blue/white)
      let starColor = "#ffffff"
      if (star.magnitude > 1.5) starColor = "#f8f7ff"
      if (star.magnitude > 3) starColor = "#f5f3ff"

      gradient.addColorStop(0, starColor)
      gradient.addColorStop(0.5, `rgba(255, 255, 255, ${0.5 * brightness})`)
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)")

      ctx.beginPath()
      ctx.arc(x, y, starRadius, 0, Math.PI * 2)
      ctx.fillStyle = gradient
      ctx.fill()

      // Add a subtle glow for brighter stars
      if (star.magnitude < 2) {
        ctx.beginPath()
        ctx.arc(x, y, starRadius * 3, 0, Math.PI * 2)
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, starRadius * 3)
        glowGradient.addColorStop(0, `rgba(255, 255, 255, ${0.2 * brightness})`)
        glowGradient.addColorStop(1, "rgba(255, 255, 255, 0)")
        ctx.fillStyle = glowGradient
        ctx.fill()
      }

      // Add star name if available
      if (star.name) {
        ctx.font = "10px Arial"
        ctx.fillStyle = "rgba(255, 255, 255, 0.8)"
        ctx.textAlign = "center"
        ctx.fillText(star.name, x, y + 12)
      }
    }
  }

  const drawConstellation = (
    ctx: CanvasRenderingContext2D,
    constellation: Constellation,
    width: number,
    height: number,
    isDarkMode: boolean,
    padding: number,
  ) => {
    // Calculate center point
    const centerX = width / 2
    const centerY = height / 2

    // Calculate the radius with padding
    const radius = Math.min(width, height) / 2 - padding

    // Use a more visible color for constellation lines in dark mode
    const lineColor = isDarkMode ? "rgba(148, 163, 184, 0.6)" : "rgba(100, 149, 237, 0.5)"
    ctx.strokeStyle = lineColor
    ctx.lineWidth = 0.5

    constellation.lines.forEach((line) => {
      // Calculate start position with padding adjustment
      const startAzimuthRad = (line.start.azimuth * Math.PI) / 180
      const startAltitudeRatio = (90 - line.start.altitude) / 90
      const startDistance = startAltitudeRatio * radius
      const x1 = centerX + startDistance * Math.sin(startAzimuthRad)
      const y1 = centerY - startDistance * Math.cos(startAzimuthRad)

      // Calculate end position with padding adjustment
      const endAzimuthRad = (line.end.azimuth * Math.PI) / 180
      const endAltitudeRatio = (90 - line.end.altitude) / 90
      const endDistance = endAltitudeRatio * radius
      const x2 = centerX + endDistance * Math.sin(endAzimuthRad)
      const y2 = centerY - endDistance * Math.cos(endAzimuthRad)

      // Only draw lines if both stars are above the horizon
      if (line.start.altitude > 0 && line.end.altitude > 0) {
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
      }
    })

    // Draw constellation name
    if (constellation.center.altitude > 0 && constellation.lines.length > 0) {
      // Calculate center position with padding adjustment
      const centerAzimuthRad = (constellation.center.azimuth * Math.PI) / 180
      const centerAltitudeRatio = (90 - constellation.center.altitude) / 90
      const centerDistance = centerAltitudeRatio * radius
      const x = centerX + centerDistance * Math.sin(centerAzimuthRad)
      const y = centerY - centerDistance * Math.cos(centerAzimuthRad)

      ctx.font = "10px Arial"
      ctx.fillStyle = isDarkMode ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0.7)"
      ctx.textAlign = "center"
      ctx.fillText(constellation.name, x, y + 15)
    }
  }

  const drawCardinalDirections = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    isDarkMode: boolean,
    radius: number,
    padding: number,
  ) => {
    const centerX = width / 2
    const centerY = height / 2

    ctx.font = "12px Arial"
    ctx.fillStyle = isDarkMode ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0.7)"
    ctx.textAlign = "center"

    // North
    ctx.fillText("N", centerX, centerY - radius - 5)

    // East
    ctx.fillText("E", centerX + radius + 5, centerY)

    // South
    ctx.fillText("S", centerX, centerY + radius + 15)

    // West
    ctx.fillText("W", centerX - radius - 5, centerY)

    // Draw horizon line
    ctx.strokeStyle = isDarkMode ? "rgba(255, 255, 255, 0.3)" : "rgba(255, 255, 255, 0.2)"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
    ctx.stroke()

    // Draw altitude circles
    const altitudes = [30, 60]
    altitudes.forEach((alt) => {
      const altRadius = radius * (1 - alt / 90)
      ctx.strokeStyle = isDarkMode ? "rgba(255, 255, 255, 0.15)" : "rgba(255, 255, 255, 0.1)"
      ctx.beginPath()
      ctx.arc(centerX, centerY, altRadius, 0, Math.PI * 2)
      ctx.stroke()

      // Label the altitude
      ctx.fillStyle = isDarkMode ? "rgba(255, 255, 255, 0.5)" : "rgba(255, 255, 255, 0.4)"
      ctx.font = "10px Arial"
      ctx.fillText(`${alt}°`, centerX + altRadius, centerY)
    })
  }

  // Show a loading placeholder until client-side rendering is complete
  if (!mounted) {
    return (
      <div className="relative rounded-xl overflow-hidden transition-colors p-6">
        <div className="w-full h-[600px] bg-muted/30 rounded-lg animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="relative rounded-xl overflow-hidden transition-colors p-6">
      <canvas ref={canvasRef} className="w-full h-full rounded-lg" width={800} height={800} />
      {!skyData && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
          <p className="text-white">Loading sky data...</p>
        </div>
      )}
    </div>
  )
}

