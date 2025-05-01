"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Script from "next/script"
import { logger } from "@/lib/logger"

interface GoogleMapsLoaderProps {
  children: React.ReactNode
}

export default function GoogleMapsLoader({ children }: GoogleMapsLoaderProps) {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchApiKey() {
      try {
        logger.info("Fetching Maps API key")
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

        logger.info("API key fetched successfully")
        setApiKey(data.apiKey)
      } catch (err) {
        logger.error("Failed to fetch Google Maps API key", { error: err })
        setError(`Google Maps API anahtarı yüklenemedi: ${err.message}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchApiKey()
  }, [])

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-700">{error}</p>
        <p className="text-sm text-red-600">Harita özellikleri kullanılamıyor.</p>
        {children}
      </div>
    )
  }

  if (isLoading || !apiKey) {
    return (
      <>
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          <span className="ml-2 text-sm text-gray-600">Harita yükleniyor...</span>
        </div>
        {children}
      </>
    )
  }

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=tr`}
        strategy="lazyOnload"
        onLoad={() => logger.info("Google Maps script loaded via Script component")}
        onError={(e) => logger.error("Google Maps script failed to load", { error: e })}
      />
      {children}
    </>
  )
}
