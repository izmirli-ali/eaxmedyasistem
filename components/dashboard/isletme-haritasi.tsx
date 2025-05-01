"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface IsletmeHaritasiProps {
  isletmeler: Array<{
    id: string
    isletme_adi: string
    kategori?: string
    sehir?: string
    koordinatlar?: string
    latitude?: number
    longitude?: number
  }>
}

export function IsletmeHaritasi({ isletmeler }: IsletmeHaritasiProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiKey, setApiKey] = useState<string | null>(null)

  // API anahtarını güvenli bir şekilde al
  useEffect(() => {
    async function fetchApiKey() {
      try {
        const response = await fetch("/api/maps-key")
        if (response.ok) {
          const data = await response.json()
          setApiKey(data.apiKey)
        } else {
          console.error("API anahtarı alınamadı")
        }
      } catch (error) {
        console.error("API anahtarı alınırken hata:", error)
      }
    }

    fetchApiKey()
  }, [])

  // Google Maps yükleme
  useEffect(() => {
    if (apiKey && !window.google && !document.getElementById("google-maps-script")) {
      const script = document.createElement("script")
      script.id = "google-maps-script"
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => setMapLoaded(true)
      document.head.appendChild(script)
    } else if (window.google) {
      setMapLoaded(true)
    }
  }, [apiKey])

  // Harita oluşturma kodu...

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>İşletme Haritası</CardTitle>
        <CardDescription>Koordinat bilgisi olan işletmelerin harita görünümü</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-[400px] rounded-md overflow-hidden">
          {!apiKey ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 rounded-md">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
              <p className="text-gray-600">API anahtarı yükleniyor...</p>
            </div>
          ) : (
            <>
              <div id="map" ref={mapRef} className="w-full h-full rounded-md"></div>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 rounded-md">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
                  <p className="text-gray-600">Harita yükleniyor...</p>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
