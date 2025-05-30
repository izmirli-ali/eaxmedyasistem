// components/isletme-detay-icerik.tsx
"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useRef, useState, useCallback } from "react"
import {
  Phone,
  Mail,
  LinkIcon,
  Star,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Wifi,
  Car,
  CreditCard,
  CalendarCheck,
  Package,
  Accessibility,
  Baby,
  Dog,
  Cigarette,
  Music,
  Coffee,
  UtensilsCrossed,
  Tv,
  Truck,
  Banknote,
  Globe,
  CreditCardIcon,
  Leaf,
  Wheat,
  Carrot,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Image } from "@/components/ui/image"
import { Loader2 } from "lucide-react"
import "keen-slider/keen-slider.min.css"
import { useKeenSlider } from "keen-slider/react"
import { parseHizmetler } from "@/lib/supabase-utils"
import { HomepagePreviewCard } from "@/components/homepage-preview-card"
import { GoogleMapsService } from "@/lib/google-maps-service"
import { createClient } from "@/lib/supabase/client"

interface IsletmeDetayIcerikProps {
  isletme: any
}

// Google Maps API'nin yüklenmesi için global callback tanımlaması ekleyelim
declare global {
  interface Window {
    google: any
    initGoogleMapsCallback: () => void
  }
}

// Görsel optimizasyonu için Image bileşenini güncelleyelim
const OptimizedImage = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  return (
    <Image
      src={src || "/placeholder.svg"}
      alt={alt}
      width={800}
      height={600}
      className={className}
      loading="lazy"
      quality={75}
      priority={false}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  )
}

export function IsletmeDetayIcerik({ isletme }: IsletmeDetayIcerikProps) {
  const [allReviews, setAllReviews] = useState([])
  const [reviews, setReviews] = useState([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewsError, setReviewsError] = useState<string | null>(null)
  const [images, setImages] = useState<{ url: string; alt: string }[]>([])
  const [currentReviewPage, setCurrentReviewPage] = useState(1)
  const reviewsPerPage = 5
  const [currentSlide, setCurrentSlide] = useState(0)
  const [sliderRef, instanceRef] = useKeenSlider({
    initial: 0,
    slideChanged(slider) {
      setCurrentSlide(slider.track.details.rel)
      // Ekran okuyucular için güncel slayt bilgisini güncelle
      if (sliderStatusRef.current) {
        sliderStatusRef.current.textContent = `Slayt ${slider.track.details.rel + 1} / ${images.length}`
      }
    },
    accessibility: true, // Erişilebilirlik özelliklerini etkinleştir
  })

  // Ekran okuyucular için slayt durumu
  const sliderStatusRef = useRef<HTMLDivElement>(null)
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null)
  const googleMapsService = GoogleMapsService.getInstance()

  const supabase = createClient()

  // Place ID'yi önbelleğe almak için state ekleyelim
  const [placeId, setPlaceId] = useState<string | null>(null)

  // fetchReviews fonksiyonunu güncelleyelim
  const fetchReviews = useCallback(async () => {
    if (!isletme?.koordinatlar) {
      setReviewsLoading(false)
      setReviewsError("Koordinat bilgisi bulunamadı.")
      return
    }

    setReviewsLoading(true)
    setReviewsError(null)

    try {
      // Place ID'yi al
      const placeId = await googleMapsService.getPlaceId(isletme.id, isletme.isletme_adi, isletme.koordinatlar)

      // Yorumları al
      const reviews = await googleMapsService.getReviews(placeId)

      // Tüm yorumları sakla
      setAllReviews(reviews)

      // 3 ve üzeri puanı olan yorumları filtrele
      const filteredReviews = reviews.filter((review) => review.rating >= 3)
      setReviews(filteredReviews)
      setReviewsLoading(false)
    } catch (error) {
      console.error("Yorumlar yüklenirken hata:", error)
      setReviewsError(error.message || "Yorumlar yüklenirken bir hata oluştu.")
      setReviewsLoading(false)
    }
  }, [isletme?.id, isletme?.isletme_adi, isletme?.koordinatlar, googleMapsService])

  const memoizedFetchReviews = useCallback(fetchReviews, [
    isletme?.id,
    isletme?.isletme_adi,
    isletme?.koordinatlar,
    googleMapsService,
  ])

  // useEffect içindeki fetchReviews çağrısını değiştirelim
  useEffect(() => {
    // Sayfa yüklendiğinde yorumları getir
    if (isletme?.koordinatlar) {
      // API yükleme hatalarını önlemek için kısa bir gecikme ekleyelim
      const timer = setTimeout(() => {
        memoizedFetchReviews()
      }, 1000)

      return () => clearTimeout(timer)
    }

    // Her gün saat 23:00'da yorumları yenile
    const intervalId = setInterval(() => {
      const now = new Date()
      if (now.getHours() === 23 && now.getMinutes() === 0) {
        memoizedFetchReviews()
      }
    }, 60 * 1000) // Her dakika kontrol et

    return () => clearInterval(intervalId)
  }, [memoizedFetchReviews, isletme?.koordinatlar])

  // İşletme fotoğraflarını yükle
  useEffect(() => {
    const newImages: { url: string; alt: string }[] = []

    // Ana fotoğrafı ekle
    if (isletme?.fotograf_url) {
      newImages.push({
        url: isletme.fotograf_url,
        alt: `${isletme.isletme_adi} - Ana Görsel`,
      })
    }

    // Diğer fotoğrafları ekle
    if (isletme?.fotograflar && Array.isArray(isletme.fotograflar)) {
      isletme.fotograflar.forEach((foto: any, index: number) => {
        if (typeof foto === "string") {
          newImages.push({
            url: foto,
            alt: `${isletme.isletme_adi} - Fotoğraf ${index + 1}`,
          })
        } else if (foto && foto.url) {
          newImages.push({
            url: foto.url,
            alt: foto.alt || `${isletme.isletme_adi} - Fotoğraf ${index + 1}`,
          })
        }
      })
    }

    if (newImages.length > 0) {
      setImages(newImages)
    }
  }, [isletme])

  // Sayfa sayısı
  const totalReviewPages = Math.ceil(reviews.length / reviewsPerPage)

  // Sayfalandırılmış yorumlar
  const paginatedReviews = reviews.slice((currentReviewPage - 1) * reviewsPerPage, currentReviewPage * reviewsPerPage)

  // Klavye ile slider kontrolü
  const handleSliderKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      instanceRef.current?.prev()
    } else if (e.key === "ArrowRight") {
      instanceRef.current?.next()
    }
  }

  // Sosyal medya verilerini tanımla
  const sosyalMedya = {
    facebook: isletme.facebook_url || (isletme.sosyal_medya && isletme.sosyal_medya.facebook) || null,
    instagram: isletme.instagram_url || (isletme.sosyal_medya && isletme.sosyal_medya.instagram) || null,
    twitter: isletme.twitter_url || (isletme.sosyal_medya && isletme.sosyal_medya.twitter) || null,
    linkedin: isletme.linkedin_url || (isletme.sosyal_medya && isletme.sosyal_medya.linkedin) || null,
    youtube: isletme.youtube_url || (isletme.sosyal_medya && isletme.sosyal_medya.youtube) || null,
  }

  // İşletme detay sayfasında yapısal veri iyileştirmeleri için koordinat bilgilerini kullanalım

  // Koordinat bilgilerini işleyelim ve yapısal veriye ekleyelim
  useEffect(() => {
    if (isletme?.koordinatlar) {
      try {
        const [lat, lng] = isletme.koordinatlar.split(",").map(Number)
        if (!isNaN(lat) && !isNaN(lng)) {
          // Koordinat bilgilerini state'e ekleyelim
          setCoordinates({ latitude: lat, longitude: lng })
        }
      } catch (error) {
        console.error("Koordinat bilgileri işlenirken hata:", error)
      }
    }
  }, [isletme])

  // Sosyal medya paylaşım butonları
  const SocialShareButtons = ({ url, title, description }) => {
    return (
      <div className="flex space-x-2 mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank")
          }
          aria-label="Facebook'ta paylaş"
        >
          <Facebook className="h-4 w-4 mr-2" />
          Paylaş
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            window.open(
              `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
              "_blank",
            )
          }
          aria-label="Twitter'da paylaş"
        >
          <Twitter className="h-4 w-4 mr-2" />
          Tweet
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(title + " " + url)}`, "_blank")
          }
          aria-label="WhatsApp'ta paylaş"
        >
          <MessageCircle className="h-4 w-4 mr-2" />
          WhatsApp
        </Button>
      </div>
    )
  }

  // Çalışma saatlerini render et
  const renderCalismaSaatleri = () => {
    if (!isletme.calisma_saatleri) return <p className="text-gray-500">Çalışma saatleri belirtilmemiş.</p>

    const calismaSaatleri =
      typeof isletme.calisma_saatleri === "string" ? JSON.parse(isletme.calisma_saatleri) : isletme.calisma_saatleri

    if (!calismaSaatleri || Object.keys(calismaSaatleri).length === 0) {
      return <p className="text-gray-500">Çalışma saatleri belirtilmemiş.</p>
    }

    // Günleri ve Türkçe karşılıklarını tanımla
    const gunler = ["pazartesi", "sali", "carsamba", "persembe", "cuma", "cumartesi", "pazar"]
    const gunlerTurkce = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"]

    return (
      <div className="space-y-2">
        {gunler.map((gun, index) => {
          const gunData = calismaSaatleri[gun]
          if (!gunData) return null

          const acik = gunData.acik !== false
          const acilis = gunData.acilis || "00:00"
          const kapanis = gunData.kapanis || "00:00"

          return (
            <div key={gun} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
              <span className="font-medium">{gunlerTurkce[index]}</span>
              <span className={acik ? "text-green-600" : "text-red-500"}>
                {acik ? `${acilis} - ${kapanis}` : "Kapalı"}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  // Harita iframe'ini render et
  const renderHaritaIframe = () => {
    if (!isletme.harita_linki) return null

    try {
      // iframe HTML'ini güvenli bir şekilde işle
      return <div className="h-[400px] w-full" dangerouslySetInnerHTML={{ __html: isletme.harita_linki }} />
    } catch (error) {
      console.error("Harita iframe işlenemedi:", error)
      return <p className="text-gray-500">Harita görüntülenemiyor.</p>
    }
  }

  // Özellikleri render et
  const renderOzellikler = () => {
    const ozellikler = [
      { key: "wifi", icon: <Wifi className="h-4 w-4" />, label: "Wi-Fi" },
      { key: "otopark", icon: <Car className="h-4 w-4" />, label: "Otopark" },
      { key: "kredi_karti", icon: <CreditCard className="h-4 w-4" />, label: "Kredi Kartı" },
      { key: "rezervasyon", icon: <CalendarCheck className="h-4 w-4" />, label: "Rezervasyon" },
      { key: "paket_servis", icon: <Package className="h-4 w-4" />, label: "Paket Servis" },
      { key: "engelli_erisim", icon: <Accessibility className="h-4 w-4" />, label: "Engelli Erişimi" },
      { key: "bebek_dostu", icon: <Baby className="h-4 w-4" />, label: "Bebek Dostu" },
      { key: "evcil_hayvan_dostu", icon: <Dog className="h-4 w-4" />, label: "Evcil Hayvan Dostu" },
      { key: "sigara_alani", icon: <Cigarette className="h-4 w-4" />, label: "Sigara Alanı" },
      { key: "canli_muzik", icon: <Music className="h-4 w-4" />, label: "Canlı Müzik" },
      { key: "kahvalti", icon: <Coffee className="h-4 w-4" />, label: "Kahvaltı" },
      { key: "aksam_yemegi", icon: <UtensilsCrossed className="h-4 w-4" />, label: "Akşam Yemeği" },
      { key: "tv", icon: <Tv className="h-4 w-4" />, label: "TV" },
      { key: "ucretsiz_teslimat", icon: <Truck className="h-4 w-4" />, label: "Ücretsiz Teslimat" },
      { key: "nakit_odeme", icon: <Banknote className="h-4 w-4" />, label: "Nakit Ödeme" },
      { key: "online_odeme", icon: <Globe className="h-4 w-4" />, label: "Online Ödeme" },
      { key: "temassiz_odeme", icon: <CreditCardIcon className="h-4 w-4" />, label: "Temassız Ödeme" },
      { key: "organik_urunler", icon: <Leaf className="h-4 w-4" />, label: "Organik Ürünler" },
      { key: "glutensiz_secenekler", icon: <Wheat className="h-4 w-4" />, label: "Glutensiz Seçenekler" },
      { key: "vegan_secenekler", icon: <Carrot className="h-4 w-4" />, label: "Vegan Seçenekler" },
    ]

    // Aktif özellikleri filtrele
    const aktifOzellikler = ozellikler.filter((ozellik) => {
      // Önce isletme.ozellikler objesini kontrol et
      if (isletme.ozellikler && typeof isletme.ozellikler === "object") {
        if (isletme.ozellikler[ozellik.key] === true) return true
      }

      // Sonra doğrudan isletme objesini kontrol et
      return isletme[ozellik.key] === true
    })

    if (aktifOzellikler.length === 0) {
      return <p className="text-gray-500">Özellik bilgisi belirtilmemiş.</p>
    }

    return (
      <div className="grid grid-cols-2 gap-2" role="list" aria-label="İşletme Özellikleri">
        {aktifOzellikler.map((ozellik) => (
          <div key={ozellik.key} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md" role="listitem">
            <div className="text-primary">{ozellik.icon}</div>
            <span>{ozellik.label}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    // Mobil uyumluluk için responsive tasarım iyileştirmeleri

    // Mobil cihazlarda daha iyi görünüm için
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
      {/* Sol Kolon - Detaylar */}
      <div>
        {/* İşletme Fotoğrafı */}

        {/* İşletme Fotoğrafları - Slider */}
        {images.length > 0 && (
          <Card className="mb-4 md:mb-6 col-span-1 md:col-span-2">
            <CardContent className="p-3 md:p-4">
              <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4" id="galeri-baslik">
                Fotoğraf Galerisi
              </h3>
              <div className="relative">
                <div
                  ref={sliderRef}
                  className="keen-slider rounded-lg overflow-hidden"
                  role="region"
                  aria-roledescription="carousel"
                  aria-labelledby="galeri-baslik"
                  tabIndex={0}
                  onKeyDown={handleSliderKeyDown}
                >
                  {images.map((image, index) => (
                    <div key={index} className="keen-slider__slide">
                      <OptimizedImage
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>

                {/* Ekran okuyucular için slayt durumu */}
                <div ref={sliderStatusRef} className="sr-only" aria-live="polite">
                  Slayt {currentSlide + 1} / {images.length}
                </div>

                {/* Slider Navigation */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => instanceRef.current?.prev()}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90 rounded-full p-2 shadow-md z-10"
                      disabled={currentSlide === 0}
                      aria-label="Önceki slayt"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => instanceRef.current?.next()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90 rounded-full p-2 shadow-md z-10"
                      disabled={currentSlide === images.length - 1}
                      aria-label="Sonraki slayt"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>

                    {/* Dots */}
                    <div className="flex justify-center gap-1 mt-2" role="tablist" aria-label="Slayt göstergeleri">
                      {images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => instanceRef.current?.moveToIdx(idx)}
                          className={`w-2 h-2 rounded-full ${currentSlide === idx ? "bg-primary" : "bg-gray-300"}`}
                          role="tab"
                          aria-selected={currentSlide === idx}
                          aria-label={`Slayt ${idx + 1}`}
                          tabIndex={currentSlide === idx ? 0 : -1}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4" id="isletme-detaylari">
              İşletme Detayları
            </h3>
            <div className="space-y-4">
              {isletme.sunulan_hizmetler && (
                <div>
                  <h4 className="font-medium mb-2" id="sunulan-hizmetler">
                    Sunulan Hizmetler
                  </h4>
                  <div className="grid grid-cols-2 gap-2" role="list" aria-labelledby="sunulan-hizmetler">
                    {parseHizmetler(isletme.sunulan_hizmetler).map((hizmet, index) => (
                      <div
                        key={index}
                        className="flex items-center bg-gray-50 p-2 rounded-md"
                        role="listitem"
                        tabIndex={0}
                      >
                        <div className="h-2 w-2 rounded-full bg-primary mr-2" aria-hidden="true"></div>
                        <span className="text-gray-700">{hizmet}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {isletme.aciklama && (
                <div>
                  <h4 className="font-medium" id="aciklama">
                    Açıklama
                  </h4>
                  <p className="text-gray-600" tabIndex={0} aria-labelledby="aciklama">
                    {isletme.aciklama}
                  </p>
                </div>
              )}
              <div>
                <h4 className="font-medium" id="adres">
                  Adres
                </h4>
                <p className="text-gray-600" tabIndex={0} aria-labelledby="adres">
                  {isletme.adres}
                  {isletme.ilce && `, ${isletme.ilce}`}
                  {isletme.sehir && `, ${isletme.sehir}`}
                </p>
              </div>
              <div>
                <h4 className="font-medium" id="telefon">
                  Telefon
                </h4>
                <p className="text-gray-600">
                  <a
                    href={`tel:${isletme.telefon}`}
                    className="text-blue-600 hover:underline flex items-center"
                    aria-labelledby="telefon"
                  >
                    <Phone className="h-4 w-4 mr-1" aria-hidden="true" />
                    {isletme.telefon}
                  </a>
                </p>
              </div>
              {isletme.website && (
                <div>
                  <h4 className="font-medium" id="website">
                    Web Sitesi
                  </h4>
                  <p className="text-gray-600">
                    <a
                      href={isletme.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center"
                      aria-labelledby="website"
                    >
                      <LinkIcon className="h-4 w-4 mr-1" aria-hidden="true" />
                      Web Sitesini Ziyaret Et
                    </a>
                  </p>
                </div>
              )}
              {isletme.email && (
                <div>
                  <h4 className="font-medium" id="email">
                    E-posta
                  </h4>
                  <p className="text-gray-600">
                    <a
                      href={`mailto:${isletme.email}`}
                      className="text-blue-600 hover:underline flex items-center"
                      aria-labelledby="email"
                    >
                      <Mail className="h-4 w-4 mr-1" aria-hidden="true" />
                      {isletme.email}
                    </a>
                  </p>
                </div>
              )}
              <div>
                <h4 className="font-medium" id="calisma-saatleri">
                  Çalışma Saatleri
                </h4>
                {renderCalismaSaatleri()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Özellikler Kartı */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4" id="isletme-ozellikleri">
              İşletme Özellikleri
            </h3>
            {renderOzellikler()}
          </CardContent>
        </Card>

        {/* Harita Kartı */}
        {(isletme.harita_linki || (isletme.latitude && isletme.longitude)) && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4" id="konum">
                Konum
              </h3>
              {renderHaritaIframe()}
              {!isletme.harita_linki && isletme.latitude && isletme.longitude && (
                <div className="h-[400px] w-full bg-gray-100 flex items-center justify-center">
                  <p className="text-gray-500">Harita yükleniyor...</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {Object.keys(sosyalMedya).some((key) => sosyalMedya[key]) && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4" id="sosyal-medya">
                Sosyal Medya Hesapları
              </h3>
              <div className="flex space-x-4" role="list" aria-labelledby="sosyal-medya">
                {sosyalMedya.facebook && (
                  <a
                    href={sosyalMedya.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook sayfasını ziyaret et"
                    role="listitem"
                  >
                    <Facebook className="h-6 w-6" />
                  </a>
                )}
                {sosyalMedya.instagram && (
                  <a
                    href={sosyalMedya.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram sayfasını ziyaret et"
                    role="listitem"
                  >
                    <Instagram className="h-6 w-6" />
                  </a>
                )}
                {sosyalMedya.twitter && (
                  <a
                    href={sosyalMedya.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Twitter sayfasını ziyaret et"
                    role="listitem"
                  >
                    <Twitter className="h-6 w-6" />
                  </a>
                )}
                {sosyalMedya.linkedin && (
                  <a
                    href={sosyalMedya.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn sayfasını ziyaret et"
                    role="listitem"
                  >
                    <Linkedin className="h-6 w-6" />
                  </a>
                )}
                {sosyalMedya.youtube && (
                  <a
                    href={sosyalMedya.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube kanalını ziyaret et"
                    role="listitem"
                  >
                    <Youtube className="h-6 w-6" />
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        {/* Bileşeni kullanma */}
        <SocialShareButtons
          url={typeof window !== "undefined" ? window.location.href : ""}
          title={isletme.isletme_adi}
          description={isletme.aciklama || `${isletme.isletme_adi} - ${isletme.kategori || ""}`}
        />
      </div>

      {/* Google Haritalar Yorumları */}
      <div>
        <Card>
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4" id="musteri-yorumlari">
              Müşteri Yorumları
            </h3>
            {reviewsLoading ? (
              <div className="flex justify-center items-center py-4" aria-live="polite" aria-busy="true">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                <span className="sr-only">Yorumlar yükleniyor...</span>
              </div>
            ) : reviewsError ? (
              <div className="p-4 border border-red-200 bg-red-50 rounded-md" role="alert">
                <p className="text-red-600 font-medium mb-2">Yorumlar yüklenemedi</p>
                <p className="text-red-500 text-sm">{reviewsError}</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => fetchReviews()}>
                  Tekrar Dene
                </Button>
              </div>
            ) : reviews.length > 0 ? (
              <>
                <div role="feed" aria-labelledby="musteri-yorumlari">
                  {paginatedReviews.map((review, index) => (
                    <div className="mb-4 p-4 border rounded-md" key={index} tabIndex={0}>
                      <div className="flex items-center mb-2">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" aria-hidden="true" />
                        <span aria-label={`${review.rating} yıldız`}>{review.rating}</span>
                        <span className="ml-2 font-medium">{review.author_name}</span>
                      </div>
                      <p className="text-gray-600">{review.text}</p>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls */}
                {reviews.length > reviewsPerPage && (
                  <div
                    className="flex justify-between items-center mt-4"
                    role="navigation"
                    aria-label="Yorum sayfaları"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentReviewPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentReviewPage === 1}
                      aria-label="Önceki yorumlar"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" aria-hidden="true" />
                      Önceki
                    </Button>
                    <span aria-live="polite">
                      {currentReviewPage} / {totalReviewPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentReviewPage((prev) => Math.min(prev + 1, totalReviewPages))}
                      disabled={currentReviewPage === totalReviewPages}
                      aria-label="Sonraki yorumlar"
                    >
                      Sonraki
                      <ChevronRight className="h-4 w-4 ml-1" aria-hidden="true" />
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-gray-500" role="status">
                Henüz yorum bulunmamaktadır.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      <HomepagePreviewCard />
    </div>
  )
}
