"use client"
import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState, useRef } from "react"
import {
  Phone,
  Mail,
  Clock,
  LinkIcon,
  Star,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Image } from "@/components/ui/image"
import { Loader2 } from "lucide-react"
import "keen-slider/keen-slider.min.css"
import { useKeenSlider } from "keen-slider/react"
import { parseHizmetler } from "@/lib/supabase-utils"

interface IsletmeDetayIcerikProps {
  isletme: any
}

// Declare google variable
declare global {
  interface Window {
    google: any
  }
}

export function IsletmeDetayIcerik({ isletme }: IsletmeDetayIcerikProps) {
  const [position, setPosition] = useState(null)
  const [allReviews, setAllReviews] = useState([])
  const [reviews, setReviews] = useState([])
  const [mapRef, setMapRef] = useState<HTMLDivElement | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [reviewsLoading, setReviewsLoading] = useState(true)
  const [reviewsError, setReviewsError] = useState<string | null>(null)
  const [emblaRef, emblaApi] = useState<any>(null)
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

  const supabase = createClient()

  useEffect(() => {
    if (isletme?.koordinatlar) {
      const [latitude, longitude] = isletme.koordinatlar.split(",").map(Number)
      if (!isNaN(latitude) && !isNaN(longitude)) {
        setPosition([latitude, longitude])
      }
    }
  }, [isletme])

  useEffect(() => {
    if (!window.google && !document.getElementById("google-maps-script")) {
      const script = document.createElement("script")
      script.id = "google-maps-script"
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => setMapLoaded(true)
      document.head.appendChild(script)
    } else if (window.google) {
      setMapLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (mapLoaded && position && mapRef) {
      const map = new window.google.maps.Map(mapRef, {
        center: { lat: position[0], lng: position[1] },
        zoom: 15,
      })

      new window.google.maps.Marker({
        position: { lat: position[0], lng: position[1] },
        map: map,
        title: isletme.isletme_adi,
      })
    }
  }, [mapLoaded, position, isletme, mapRef])

  // Google Haritalar yorumlarını getirme
  const fetchReviews = async () => {
    if (!isletme?.koordinatlar) return

    setReviewsLoading(true)
    setReviewsError(null)

    try {
      const [latitude, longitude] = isletme.koordinatlar.split(",").map(Number)
      if (isNaN(latitude) || isNaN(longitude)) {
        throw new Error("Geçersiz koordinatlar")
      }

      // Place ID'yi almak için Places API'yi kullan
      if (window.google && window.google.maps) {
        const placesService = new window.google.maps.places.PlacesService(document.createElement("div"))
        placesService.findPlaceFromQuery(
          {
            query: isletme.isletme_adi,
            locationBias: { lat: latitude, lng: longitude },
            fields: ["place_id"],
          },
          (results, status) => {
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
              const placeId = results[0].place_id

              // Place Details API'yi kullanarak yorumları al
              placesService.getDetails(
                {
                  placeId: placeId,
                  fields: ["reviews"],
                },
                (place, detailsStatus) => {
                  if (detailsStatus === window.google.maps.places.PlacesServiceStatus.OK && place) {
                    // Tüm yorumları sakla
                    setAllReviews(place.reviews || [])

                    // 3 ve üzeri puanı olan yorumları filtrele
                    const filteredReviews = (place.reviews || []).filter((review) => review.rating >= 3)
                    setReviews(filteredReviews)
                  } else {
                    setReviewsError("Yorumlar yüklenirken bir hata oluştu.")
                  }
                  setReviewsLoading(false)
                },
              )
            } else {
              setReviewsError("İşletme bulunamadı veya yorumlar yüklenemedi.")
              setReviewsLoading(false)
            }
          },
        )
      } else {
        setReviewsError("Google Maps API yüklenemedi.")
        setReviewsLoading(false)
      }
    } catch (error) {
      console.error("Yorumlar yüklenirken hata:", error)
      setReviewsError(error.message || "Yorumlar yüklenirken bir hata oluştu.")
      setReviewsLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()

    // Her gün saat 23:00'da yorumları yenile
    const intervalId = setInterval(() => {
      const now = new Date()
      if (now.getHours() === 23 && now.getMinutes() === 0) {
        fetchReviews()
      }
    }, 60 * 1000) // Her dakika kontrol et

    return () => clearInterval(intervalId)
  }, [isletme])

  // İşletme fotoğraflarını yükle
  useEffect(() => {
    if (isletme?.fotograflar && Array.isArray(isletme.fotograflar)) {
      setImages(isletme.fotograflar)
    }
  }, [isletme])

  // Yol tarifi URL'si oluşturma
  const getDirectionsUrl = () => {
    if (position) {
      return `https://www.google.com/maps/dir/?api=1&destination=${position[0]},${position[1]}`
    }
    return ""
  }

  // Sosyal medya ikonları
  const sosyalMedya = isletme.sosyal_medya || {}

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Sol Kolon - Detaylar */}
      <div>
        {/* İşletme Fotoğrafı */}
        {isletme.fotograf_url && (
          <Card className="mb-6">
            <CardContent className="p-0">
              <div className="relative aspect-video overflow-hidden rounded-md">
                <Image
                  src={isletme.fotograf_url || "/placeholder.svg?height=300&width=400"}
                  alt={`${isletme.isletme_adi} ana görseli`}
                  fill
                  className="object-cover"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* İşletme Fotoğrafları - Slider */}
        {images.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <h3 className="text-xl font-bold mb-4" id="galeri-baslik">
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
                    <div
                      key={index}
                      className="keen-slider__slide"
                      role="group"
                      aria-roledescription="slide"
                      aria-label={`${index + 1} / ${images.length}`}
                    >
                      <div className="relative aspect-[16/9] w-full">
                        <Image
                          src={image || "/placeholder.svg?height=400&width=600"}
                          alt={`${isletme.isletme_adi} fotoğrafı ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
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
              {isletme.calisma_saatleri && (
                <div>
                  <h4 className="font-medium" id="calisma-saatleri">
                    Çalışma Saatleri
                  </h4>
                  <p className="text-gray-600 flex items-center" tabIndex={0} aria-labelledby="calisma-saatleri">
                    <Clock className="h-4 w-4 mr-1" aria-hidden="true" />
                    {isletme.calisma_saatleri}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sosyal Medya Hesapları */}
        {Object.keys(sosyalMedya).length > 0 && (
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
      </div>

      {/* Sağ Kolon - Harita ve Yorumlar */}
      <div>
        <Card className="mb-6">
          <CardContent className="p-0">
            {position ? (
              <>
                <div
                  ref={(node) => setMapRef(node)}
                  style={{ height: "300px", width: "100%" }}
                  className="rounded-md"
                  aria-label={`${isletme.isletme_adi} konumu haritası`}
                  role="application"
                />
                <div className="p-4 flex justify-center">
                  <Button
                    asChild
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <a
                      href={getDirectionsUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6"
                      aria-label={`${isletme.isletme_adi} için yol tarifi al`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="animate-pulse"
                        aria-hidden="true"
                      >
                        <path d="M9 20l-5.5-5.5a7.78 7.78 0 0 1 0-11 7.78 7.78 0 0 1 11 0L16 5"></path>
                        <path d="M15 4l1 1"></path>
                        <path d="M18 7l1 1"></path>
                        <path d="M19 11l1 1"></path>
                        <path d="M20 15l1 1"></path>
                        <path d="M5 19l-1-1"></path>
                      </svg>
                      Yol Tarifi Al
                    </a>
                  </Button>
                </div>
              </>
            ) : (
              <div className="h-48 bg-gray-100 flex items-center justify-center text-gray-500" role="alert">
                Konum bilgisi bulunmamaktadır.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Google Haritalar Yorumları */}
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
              <div className="text-red-500" role="alert">
                {reviewsError}
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
    </div>
  )
}
