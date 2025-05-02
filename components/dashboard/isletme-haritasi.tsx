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
  const [loading, setLoading] = useState(true)
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // API anahtarını güvenli bir şekilde al
  useEffect(() => {
    async function fetchApiKey() {
      try {
        const response = await fetch("/api/maps-key")
        if (response.ok) {
          const data = await response.json()
          setApiKey(data.apiKey)
        } else {
          console.error("API anahtarı alınamadı:", response.statusText)
          setError("API anahtarı alınamadı. Lütfen sistem yöneticinize başvurun.")
        }
      } catch (error) {
        console.error("API anahtarı alınırken hata:", error)
        setError("API anahtarı alınırken bir hata oluştu. Lütfen sistem yöneticinize başvurun.")
      }
    }

    fetchApiKey()
  }, [])

  // Google Maps yükleme
  useEffect(() => {
    if (apiKey && !window.google && !document.getElementById("google-maps-script")) {
      setLoading(true)
      const script = document.createElement("script")
      script.id = "google-maps-script"
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => {
        setMapLoaded(true)
        setLoading(false)
        initMap()
      }
      script.onerror = () => {
        setError("Google Maps yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.")
        setLoading(false)
      }
      document.head.appendChild(script)
    } else if (window.google) {
      setMapLoaded(true)
      setLoading(false)
      initMap()
    }
  }, [apiKey, isletmeler])

  // Harita oluşturma
  const initMap = () => {
    if (!mapLoaded || !mapRef.current || !window.google || !isletmeler || isletmeler.length === 0) return

    try {
      setLoading(true)

      const bounds = new window.google.maps.LatLngBounds()
      const map = new window.google.maps.Map(mapRef.current, {
        center: { lat: 39.9334, lng: 32.8597 }, // Ankara merkezi varsayılan
        zoom: 6,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      })

      // İşletmeleri haritaya ekle
      isletmeler.forEach((isletme) => {
        if (isletme.latitude && isletme.longitude) {
          const position = { lat: isletme.latitude, lng: isletme.longitude }
          const marker = new window.google.maps.Marker({
            position,
            map,
            title: isletme.isletme_adi,
          })

          // Marker'a tıklandığında bilgi penceresi göster
          const infoWindow = new window.google.maps.InfoWindow({
            content: `<div><strong>${isletme.isletme_adi}</strong></div>`,
          })

          marker.addListener("click", () => {
            infoWindow.open(map, marker)
          })

          // Sınırları güncelle
          bounds.extend(position)
        }
      })

      // Tüm işaretçileri görecek şekilde haritayı ayarla
      if (isletmeler.length > 0) {
        map.fitBounds(bounds)
        // Çok yakınlaşmayı önle
        const listener = window.google.maps.event.addListener(map, "idle", () => {
          if (map.getZoom() > 15) {
            map.setZoom(15)
          }
          window.google.maps.event.removeListener(listener)
        })
      }

      setLoading(false)
    } catch (error) {
      console.error("Harita oluşturulurken hata:", error)
      setError("Harita oluşturulurken bir hata oluştu.")
      setLoading(false)
    }
  }

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>İşletme Haritası</CardTitle>
        <CardDescription>Koordinat bilgisi olan işletmelerin harita görünümü</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-[400px] rounded-md overflow-hidden">
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80 rounded-md">
              <div className="text-red-600 mb-2">⚠️ Hata</div>
              <p className="text-gray-700 text-center px-4">{error}</p>
            </div>
          ) : !apiKey ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80 rounded-md">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
              <p className="text-gray-600">API anahtarı yükleniyor...</p>
            </div>
          ) : (
            <>
              <div id="map" ref={mapRef} className="w-full h-full rounded-md"></div>
              {loading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80 rounded-md">
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
