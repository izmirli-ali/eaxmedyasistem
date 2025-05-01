"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { logger } from "@/lib/logger"

interface AddressAutocompleteProps {
  value: string
  onChange: (value: string, placeData?: any) => void
  label?: string
  placeholder?: string
  className?: string
  required?: boolean
  error?: string
}

// Declare google as a global variable to avoid Typescript errors
declare global {
  interface Window {
    google?: any
    initGoogleMapsCallback?: () => void
  }
}

export function AddressAutocomplete({
  value,
  onChange,
  label = "Adres",
  placeholder = "Adres ara...",
  className,
  required = false,
  error,
}: AddressAutocompleteProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isScriptLoaded, setIsScriptLoaded] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)
  const [scriptError, setScriptError] = useState<string | null>(null)
  const [apiKey, setApiKey] = useState<string | null>(null)

  // API anahtarını al
  useEffect(() => {
    async function fetchApiKey() {
      try {
        setIsLoading(true)
        const response = await fetch("/api/maps-key")

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          logger.error("API key fetch failed", {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
          })
          throw new Error(`API key could not be fetched: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()

        if (!data.apiKey) {
          logger.error("API key is missing in response", { data })
          throw new Error("API key is missing in response")
        }

        setApiKey(data.apiKey)
        logger.info("API key fetched successfully")

        // API anahtarı alındıktan sonra script'i yükle
        const script = document.createElement("script")
        script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=places&language=tr`
        script.async = true
        script.defer = true

        script.onload = () => {
          logger.info("Google Maps script loaded successfully")
          setIsScriptLoaded(true)
          setIsLoading(false)
        }

        script.onerror = (e) => {
          logger.error("Google Maps script failed to load", { error: e })
          setScriptError("Google Maps API yüklenemedi")
          setIsLoading(false)
        }

        document.head.appendChild(script)
      } catch (err) {
        logger.error("Failed to fetch Google Maps API key", { error: err })
        setScriptError(`Google Maps API anahtarı yüklenemedi: ${err.message}`)
        setIsLoading(false)
      }
    }

    fetchApiKey()

    // Cleanup function
    return () => {
      const scripts = document.querySelectorAll('script[src*="maps.googleapis.com"]')
      scripts.forEach((script) => script.remove())
    }
  }, [])

  // Autocomplete'i başlat
  useEffect(() => {
    if (typeof window === "undefined" || !inputRef.current || !isScriptLoaded || !window.google) {
      return
    }

    try {
      logger.info("Initializing Google Maps Autocomplete")

      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: "tr" },
        fields: ["address_components", "formatted_address", "geometry", "name"],
      })

      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace()
        if (place && place.formatted_address) {
          onChange(place.formatted_address, place)
        }
      })

      logger.info("Google Maps Autocomplete initialized successfully")
    } catch (error) {
      logger.error("Google Maps Autocomplete initialization failed", { error })
      setScriptError(`Autocomplete başlatılamadı: ${error.message}`)
    }
  }, [isScriptLoaded, onChange])

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor="address" className={error ? "text-destructive" : ""}>
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <div className="relative">
        <Input
          ref={inputRef}
          id="address"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={isLoading ? "Yükleniyor..." : placeholder}
          disabled={isLoading}
          className={error ? "border-destructive" : ""}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      {scriptError && <p className="text-xs text-destructive mt-1">{scriptError}</p>}
    </div>
  )
}
