"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Phone, MapPin, Share, MessageSquare } from "lucide-react"
import type { Business } from "@/types"

interface MobileActionButtonsProps {
  isletme: Business
}

export function MobileActionButtons({ isletme }: MobileActionButtonsProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [preferences, setPreferences] = useState({
    hizli_arama_goster: true,
    yol_tarifi_goster: true,
    paylasim_goster: true,
    whatsapp_goster: false,
  })

  useEffect(() => {
    // Mobil cihaz kontrolü
    const isMobile = window.innerWidth < 768
    setIsVisible(isMobile)

    // Tercihler
    if (isletme.mobil_gorunum_tercihleri) {
      try {
        const terciher =
          typeof isletme.mobil_gorunum_tercihleri === "string"
            ? JSON.parse(isletme.mobil_gorunum_tercihleri)
            : isletme.mobil_gorunum_tercihleri

        setPreferences({
          ...preferences,
          ...terciher,
        })
      } catch (error) {
        console.error("Mobil görünüm tercihleri yüklenemedi:", error)
      }
    }
  }, [isletme.mobil_gorunum_tercihleri])

  // Paylaşım fonksiyonu
  const handleShare = async () => {
    const shareData = {
      title: isletme.isletme_adi,
      text: isletme.aciklama?.substring(0, 100) || `${isletme.isletme_adi} - ${isletme.kategori || ""}`,
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Paylaşım API'si yoksa kopyala
        await navigator.clipboard.writeText(window.location.href)
        alert("Bağlantı panoya kopyalandı!")
      }
    } catch (error) {
      console.error("Paylaşım hatası:", error)
    }
  }

  // WhatsApp paylaşım fonksiyonu
  const handleWhatsAppShare = () => {
    const text = `${isletme.isletme_adi} hakkında bilgi: ${window.location.href}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 md:hidden z-10">
      <div className="flex justify-between">
        {preferences.hizli_arama_goster && isletme.telefon && (
          <Button variant="ghost" size="sm" asChild className="flex-1">
            <a href={`tel:${isletme.telefon}`}>
              <Phone className="h-4 w-4 mr-1" />
              Ara
            </a>
          </Button>
        )}

        {preferences.yol_tarifi_goster && (
          <Button variant="ghost" size="sm" className="flex-1" asChild>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                `${isletme.adres || ""} ${isletme.ilce || ""} ${isletme.sehir || ""}`.trim(),
              )}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MapPin className="h-4 w-4 mr-1" />
              Yol Tarifi
            </a>
          </Button>
        )}

        {preferences.paylasim_goster && (
          <Button variant="ghost" size="sm" className="flex-1" onClick={handleShare}>
            <Share className="h-4 w-4 mr-1" />
            Paylaş
          </Button>
        )}

        {preferences.whatsapp_goster && (
          <Button variant="ghost" size="sm" className="flex-1" onClick={handleWhatsAppShare}>
            <MessageSquare className="h-4 w-4 mr-1" />
            WhatsApp
          </Button>
        )}
      </div>
    </div>
  )
}
