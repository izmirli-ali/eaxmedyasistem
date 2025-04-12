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
  }>
}

export function IsletmeHaritasi({ isletmeler }: IsletmeHaritasiProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [loading, setLoading] = useState(false)

  // Google Maps yükleme
  useEffect(() => {
    if (!window.google && !document.getElementById("google-maps-script")) {
      const script = document.createElement("script")
      script.id = "google-maps-script"
      script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => setMapLoaded(true)
      document.head.appendChild(script)
    } else if (window.google) {
      setMapLoaded(true)
    }
  }, [])

  // Harita oluşturma
  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      setLoading(true)
      try {
        // Türkiye'nin merkezi
        const turkeyCenter = { lat: 39.0, lng: 35.0 }

        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: turkeyCenter,
          zoom: 6,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: true,
        })

        // Koordinatları olan işletmeler için marker oluştur
        const bounds = new window.google.maps.LatLngBounds()
        let hasValidCoordinates = false

        isletmeler.forEach((isletme) => {
          if (isletme.koordinatlar) {
            const [lat, lng] = isletme.koordinatlar.split(",").map(Number)

            // Geçerli koordinatlar mı kontrol et
            if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
              const position = { lat, lng }

              const marker = new window.google.maps.Marker({
                position,
                map: mapInstance,
                title: isletme.isletme_adi,
                animation: window.google.maps.Animation.DROP,
              })

              const infoWindow = new window.google.maps.InfoWindow({
                content: `
                  <div style="max-width: 200px;">
                    <h3 style="font-weight: bold; margin-bottom: 5px;">${isletme.isletme_adi}</h3>
                    <p style="font-size: 0.9em; margin-bottom: 5px;">${isletme.kategori || ""}</p>
                    <p style="font-size: 0.9em; margin-bottom: 5px;">${isletme.sehir || ""}</p>
                    <a href="/admin/isletme/${isletme.id}" style="color: #ef4444; font-weight: bold; text-decoration: none;">Detayları Görüntüle</a>
                  </div>
                `,
              })

              marker.addListener("click", () => {
                infoWindow.open(mapInstance, marker)
              })

              bounds.extend(position)
              hasValidCoordinates = true
            }
          }
        })

        // Haritayı sınırlara göre ayarla
        if (hasValidCoordinates) {
          mapInstance.fitBounds(bounds)

          // Eğer tek bir marker varsa zoom seviyesini ayarla
          if (isletmeler.length === 1) {
            mapInstance.setZoom(15)
          }
        }
      } catch (error) {
      } finally {
        setLoading(false)
      }
    }
  }, [mapLoaded, isletmeler])

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>İşletme Haritası</CardTitle>
        <CardDescription>Koordinat bilgisi olan işletmelerin harita görünümü</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative w-full h-[400px] rounded-md overflow-hidden">
          <div id="map" ref={mapRef} className="w-full h-full rounded-md"></div>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 rounded-md">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
              <p className="text-gray-600">Harita yükleniyor...</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
