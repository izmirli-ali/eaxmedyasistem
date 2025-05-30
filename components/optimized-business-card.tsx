"use client"

import React, { useMemo, useCallback } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Phone, Globe, Star, ExternalLink } from "lucide-react"
import Link from "next/link"
import { formatPhoneNumber } from "@/utils/format-helpers"

interface BusinessCardProps {
  business: {
    id: string
    isletme_adi: string
    kategori: string
    adres: string
    telefon: string
    website?: string
    fotograf_url?: string
    sehir: string
    url_slug: string
    fiyat_araligi?: string
    one_cikan?: boolean
    goruntulenme_sayisi?: number
  }
  onView?: (id: string) => void
  showActions?: boolean
}

// React.memo ile bileşeni sarmalayarak gereksiz render'ları önlüyoruz
const OptimizedBusinessCard = React.memo(({ business, onView, showActions = true }: BusinessCardProps) => {
  // URL'yi useMemo ile hesaplayarak her render'da yeniden hesaplamayı önlüyoruz
  const businessUrl = useMemo(() => `/isletme/${business.url_slug}`, [business.url_slug])

  // Telefon formatlamasını useMemo ile hesaplıyoruz
  const formattedPhone = useMemo(() => formatPhoneNumber(business.telefon), [business.telefon])

  // Event handler'ları useCallback ile sarmalıyoruz
  const handleView = useCallback(() => {
    if (onView) {
      onView(business.id)
    }
  }, [business.id, onView])

  // Fiyat aralığı gösterimini useMemo ile optimize ediyoruz
  const priceRangeDisplay = useMemo(() => {
    if (!business.fiyat_araligi) return null

    return (
      <Badge variant="outline" className="ml-2">
        {business.fiyat_araligi}
      </Badge>
    )
  }, [business.fiyat_araligi])

  // Görüntülenme sayısı gösterimini useMemo ile optimize ediyoruz
  const viewCountDisplay = useMemo(() => {
    if (typeof business.goruntulenme_sayisi !== "number") return null

    return (
      <div className="text-xs text-muted-foreground flex items-center">
        <Star className="h-3 w-3 mr-1" />
        {business.goruntulenme_sayisi} görüntülenme
      </div>
    )
  }, [business.goruntulenme_sayisi])

  return (
    <Card className="h-full flex flex-col overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-0 flex-grow">
        <div className="relative">
          <div
            className="w-full h-40 bg-center bg-cover"
            style={{
              backgroundImage: business.fotograf_url
                ? `url(${business.fotograf_url})`
                : "url(/placeholder.svg?height=160&width=320&query=business)",
            }}
          />
          {business.one_cikan && <Badge className="absolute top-2 right-2 bg-primary">Öne Çıkan</Badge>}
        </div>

        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg line-clamp-1">{business.isletme_adi}</h3>
            {priceRangeDisplay}
          </div>

          <Badge variant="secondary" className="mb-2">
            {business.kategori}
          </Badge>

          <div className="space-y-2 mt-3 text-sm">
            <div className="flex items-start">
              <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 text-muted-foreground" />
              <span className="line-clamp-2">{business.adres || `${business.sehir}`}</span>
            </div>

            <div className="flex items-center">
              <Phone className="h-4 w-4 mr-2 flex-shrink-0 text-muted-foreground" />
              <span>{formattedPhone}</span>
            </div>

            {business.website && (
              <div className="flex items-center">
                <Globe className="h-4 w-4 mr-2 flex-shrink-0 text-muted-foreground" />
                <a
                  href={business.website.startsWith("http") ? business.website : `https://${business.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline truncate max-w-[200px]"
                >
                  {business.website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
          </div>

          {viewCountDisplay}
        </div>
      </CardContent>

      {showActions && (
        <CardFooter className="p-4 pt-0 mt-auto">
          <div className="flex gap-2 w-full">
            <Button asChild variant="outline" className="flex-1" onClick={handleView}>
              <Link href={businessUrl}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Detaylar
              </Link>
            </Button>
            <Button asChild variant="default" className="flex-1">
              <a href={`tel:${business.telefon}`}>
                <Phone className="h-4 w-4 mr-2" />
                Ara
              </a>
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  )
})

OptimizedBusinessCard.displayName = "OptimizedBusinessCard"

export default OptimizedBusinessCard
