"use client"

import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, MapPin, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Leaflet bileşenlerini dinamik olarak import ediyoruz
// Bu, sunucu tarafında render edilmesini önler
const MapWithNoSSR = dynamic(() => import("./map-components").then((mod) => mod.MapComponent), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full rounded-md overflow-hidden border flex items-center justify-center bg-muted">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  ),
})

interface MapLocationPickerProps {
  initialPosition?: [number, number]
  onLocationSelect: (lat: number, lng: number, address: string) => void
  defaultAddress?: string
}

export function MapLocationPicker({ initialPosition, onLocationSelect, defaultAddress }: MapLocationPickerProps) {
  const [position, setPosition] = useState<[number, number] | null>(
    initialPosition || [39.925533, 32.866287], // Türkiye merkezi
  )
  const [searchQuery, setSearchQuery] = useState(defaultAddress || "")
  const [isSearching, setIsSearching] = useState(false)
  const [isGettingAddress, setIsGettingAddress] = useState(false)
  const { toast } = useToast()

  // Konum değiştiğinde adres bilgisini al
  useEffect(() => {
    if (position && typeof window !== "undefined") {
      getAddressFromCoordinates(position[0], position[1])
    }
  }, [position])

  // Koordinatlardan adres bilgisini al
  const getAddressFromCoordinates = async (lat: number, lng: number) => {
    if (typeof window === "undefined") return

    setIsGettingAddress(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      )
      const data = await response.json()

      if (data && data.display_name) {
        setSearchQuery(data.display_name)
        onLocationSelect(lat, lng, data.display_name)
      }
    } catch (error) {
      console.error("Adres bilgisi alınamadı:", error)
      toast({
        title: "Hata",
        description: "Adres bilgisi alınamadı. Lütfen tekrar deneyin.",
        variant: "destructive",
      })
    } finally {
      setIsGettingAddress(false)
    }
  }

  // Adres araması yap
  const searchAddress = async () => {
    if (!searchQuery.trim() || typeof window === "undefined") return

    setIsSearching(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
      )
      const data = await response.json()

      if (data && data.length > 0) {
        const { lat, lon } = data[0]
        const newPosition: [number, number] = [Number.parseFloat(lat), Number.parseFloat(lon)]
        setPosition(newPosition)

        toast({
          title: "Konum bulundu",
          description: "Harita seçilen konuma taşındı.",
        })
      } else {
        toast({
          title: "Konum bulunamadı",
          description: "Aradığınız adres bulunamadı. Lütfen başka bir adres deneyin.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Adres araması başarısız:", error)
      toast({
        title: "Hata",
        description: "Adres araması sırasında bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  // Mevcut konumu al
  const getCurrentLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      toast({
        title: "Hata",
        description: "Tarayıcınız konum özelliğini desteklemiyor.",
        variant: "destructive",
      })
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const newPosition: [number, number] = [latitude, longitude]
        setPosition(newPosition)

        toast({
          title: "Konum alındı",
          description: "Mevcut konumunuz haritada işaretlendi.",
        })
      },
      (error) => {
        console.error("Konum alınamadı:", error)
        toast({
          title: "Hata",
          description: "Konum alınamadı. Lütfen konum izinlerini kontrol edin.",
          variant: "destructive",
        })
      },
    )
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="address-search">Adres Ara</Label>
          <div className="flex space-x-2">
            <div className="relative flex-grow">
              <Input
                id="address-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Adres ara veya haritadan seç"
                className="pr-10"
                disabled={isSearching || isGettingAddress}
              />
              {(isSearching || isGettingAddress) && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            <Button onClick={searchAddress} disabled={isSearching || !searchQuery.trim()}>
              <Search className="h-4 w-4 mr-2" />
              Ara
            </Button>
            <Button variant="outline" onClick={getCurrentLocation} type="button">
              <MapPin className="h-4 w-4 mr-2" />
              Konumum
            </Button>
          </div>
        </div>

        <div className="h-[400px] w-full rounded-md overflow-hidden border">
          <MapWithNoSSR position={position} setPosition={setPosition} />
        </div>

        <div className="text-sm text-muted-foreground">
          Haritada istediğiniz konuma tıklayarak veya yukarıdaki arama kutusunu kullanarak işletme konumunu
          seçebilirsiniz.
        </div>
      </CardContent>
    </Card>
  )
}
