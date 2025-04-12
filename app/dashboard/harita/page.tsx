"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Search, Building } from "lucide-react"
import Link from "next/link"

export default function HaritaSayfasi() {
  const [isletmeler, setIsletmeler] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCity, setSelectedCity] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [cities, setCities] = useState([])
  const [mapLoaded, setMapLoaded] = useState(false)
  const [map, setMap] = useState(null)
  const [markers, setMarkers] = useState([])

  const supabase = createClient()

  // Şehirleri yükle
  useEffect(() => {
    async function fetchCities() {
      try {
        const { data } = await supabase.from("isletmeler").select("sehir").not("sehir", "is", null).order("sehir")

        if (data) {
          const uniqueCities = [...new Set(data.map((item) => item.sehir).filter(Boolean))]
          setCities(uniqueCities)
        }
      } catch (error) {
        console.error("Şehirler yüklenirken hata:", error.message)
      }
    }

    fetchCities()
  }, [])

  // İşletmeleri yükle
  useEffect(() => {
    async function fetchIsletmeler() {
      try {
        setLoading(true)

        let query = supabase
          .from("isletmeler")
          .select("id, isletme_adi, kategori, adres, sehir, ilce, harita_linki, latitude, longitude")
          .order("isletme_adi")

        // Arama filtresi
        if (searchTerm) {
          query = query.ilike("isletme_adi", `%${searchTerm}%`)
        }

        // Şehir filtresi
        if (selectedCity) {
          query = query.eq("sehir", selectedCity)
        }

        const { data, error } = await query

        if (error) throw error

        setIsletmeler(data || [])
      } catch (error) {
        console.error("İşletmeler yüklenirken hata:", error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchIsletmeler()
  }, [searchTerm, selectedCity])

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
    if (mapLoaded && !map) {
      // Türkiye'nin merkezi
      const turkeyCenter = { lat: 39.0, lng: 35.0 }

      const mapInstance = new window.google.maps.Map(document.getElementById("map"), {
        center: turkeyCenter,
        zoom: 6,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      })

      setMap(mapInstance)
    }
  }, [mapLoaded, map])

  // Markerları güncelleme
  useEffect(() => {
    if (map && isletmeler.length > 0) {
      // Önceki markerları temizle
      markers.forEach((marker) => marker.setMap(null))
      const newMarkers = []

      // Koordinatları olan işletmeler için marker oluştur
      const bounds = new window.google.maps.LatLngBounds()
      let hasValidCoordinates = false

      isletmeler.forEach((isletme) => {
        if (isletme.latitude && isletme.longitude) {
          const position = { lat: Number.parseFloat(isletme.latitude), lng: Number.parseFloat(isletme.longitude) }

          // Geçerli koordinatlar mı kontrol et
          if (
            !isNaN(position.lat) &&
            !isNaN(position.lng) &&
            position.lat >= -90 &&
            position.lat <= 90 &&
            position.lng >= -180 &&
            position.lng <= 180
          ) {
            const marker = new window.google.maps.Marker({
              position,
              map,
              title: isletme.isletme_adi,
              animation: window.google.maps.Animation.DROP,
            })

            const infoWindow = new window.google.maps.InfoWindow({
              content: `
                <div style="max-width: 200px;">
                  <h3 style="font-weight: bold; margin-bottom: 5px;">${isletme.isletme_adi}</h3>
                  <p style="font-size: 0.9em; margin-bottom: 5px;">${isletme.kategori || ""}</p>
                  <p style="font-size: 0.9em; margin-bottom: 5px;">${isletme.adres || ""}</p>
                  <a href="/isletme/${isletme.id}" style="color: #ef4444; font-weight: bold; text-decoration: none;">Detayları Görüntüle</a>
                </div>
              `,
            })

            marker.addListener("click", () => {
              infoWindow.open(map, marker)
            })

            newMarkers.push(marker)
            bounds.extend(position)
            hasValidCoordinates = true
          }
        }
      })

      setMarkers(newMarkers)

      // Haritayı sınırlara göre ayarla
      if (hasValidCoordinates && newMarkers.length > 0) {
        map.fitBounds(bounds)

        // Eğer tek bir marker varsa zoom seviyesini ayarla
        if (newMarkers.length === 1) {
          map.setZoom(15)
        }
      }
    }
  }, [map, isletmeler])

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">İşletme Haritası</h1>
        <p className="text-gray-600">Sistemdeki işletmeleri harita üzerinde görüntüleyin.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Kolon - Filtreler ve Liste */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">İşletme Ara</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="İşletme adı..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full"
                    />
                    <Button variant="outline" size="icon">
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Şehir</label>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Şehir seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Şehirler</SelectItem>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg">İşletme Listesi</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                  {isletmeler.length > 0 ? (
                    isletmeler.map((isletme) => (
                      <Link key={isletme.id} href={`/isletme/${isletme.id}`} className="block">
                        <div className="border rounded-md p-3 hover:bg-gray-50 transition-colors">
                          <h3 className="font-medium text-red-600">{isletme.isletme_adi}</h3>
                          <div className="text-sm text-gray-600 mt-1 flex items-start">
                            <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
                            <span>
                              {isletme.adres}
                              {isletme.ilce && `, ${isletme.ilce}`}
                              {isletme.sehir && `, ${isletme.sehir}`}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Building className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-600">İşletme bulunamadı</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sağ Kolon - Harita */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardContent className="p-0 h-[700px]">
              <div id="map" className="w-full h-full rounded-md"></div>
              {!mapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 rounded-md">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Harita yükleniyor...</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4">Harita Kullanımı</h2>
            <div className="space-y-2">
              <p>
                <span className="font-medium">Yakınlaştırma:</span> Haritayı yakınlaştırmak için fare tekerleğini
                kullanın veya haritadaki + butonuna tıklayın.
              </p>
              <p>
                <span className="font-medium">Uzaklaştırma:</span> Haritayı uzaklaştırmak için fare tekerleğini kullanın
                veya haritadaki - butonuna tıklayın.
              </p>
              <p>
                <span className="font-medium">Gezinme:</span> Haritada gezinmek için fare ile sürükleyin.
              </p>
              <p>
                <span className="font-medium">İşletme Bilgisi:</span> İşletme hakkında bilgi almak için haritadaki
                işaretçiye tıklayın.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
