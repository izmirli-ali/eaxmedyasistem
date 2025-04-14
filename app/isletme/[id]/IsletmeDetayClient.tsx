"use client"

import { CardContent } from "@/components/ui/card"
import { Card } from "@/components/ui/card"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "@/components/ui/icons"
import SeoMeta from "@/components/seo-meta"
import { IsletmeDetayIcerik } from "@/components/isletme-detay-icerik"
import { parseHizmetler } from "@/lib/supabase-utils"
import { isValidUUID } from "@/utils/validation-helpers"

interface Props {
  params: { id: string }
}

export default function IsletmeDetayClient({ params }: Props) {
  const router = useRouter()
  const [isletme, setIsletme] = useState(null)
  const [siteSettings, setSiteSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [faqData, setFaqData] = useState([])

  const supabase = createClient()

  // İşletme verilerini getirme fonksiyonu
  const fetchIsletme = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // ID'nin geçerli bir UUID olup olmadığını kontrol et
      if (!isValidUUID(params.id)) {
        throw new Error("Geçersiz işletme ID'si. Lütfen geçerli bir işletme seçin.")
      }

      const { data, error } = await supabase.from("isletmeler").select("*").eq("id", params.id).single()

      if (error) throw error

      setIsletme(data)

      // İşletme için SSS verilerini oluştur
      if (data) {
        const generatedFaqs = [
          {
            question: `${data.isletme_adi} nerede bulunuyor?`,
            answer: `${data.isletme_adi}, ${data.adres} ${data.ilce ? `, ${data.ilce}` : ""} ${data.sehir ? `, ${data.sehir}` : ""} adresinde bulunmaktadır.`,
          },
          {
            question: `${data.isletme_adi} hangi hizmetleri sunuyor?`,
            answer: data.sunulan_hizmetler
              ? `${data.isletme_adi}, ${parseHizmetler(data.sunulan_hizmetler).join(", ")} hizmetlerini sunmaktadır.`
              : `${data.isletme_adi}'nin sunduğu hizmetler hakkında detaylı bilgi için lütfen işletme ile iletişime geçin.`,
          },
          {
            question: `${data.isletme_adi} ile nasıl iletişime geçebilirim?`,
            answer: `${data.isletme_adi} ile ${data.telefon} numaralı telefondan${data.email ? ` veya ${data.email} e-posta adresinden` : ""} iletişime geçebilirsiniz.`,
          },
        ]
        setFaqData(generatedFaqs)
      }
    } catch (error) {
      console.error("İşletme yüklenirken hata:", error.message)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }, [params.id, supabase])

  // Site ayarlarını getirme fonksiyonu
  const fetchSiteSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase.from("site_ayarlari").select("*").single()

      if (error) throw error

      setSiteSettings(data)
    } catch (error) {
      console.error("Site ayarları yüklenirken hata:", error.message)
      // Site ayarları yüklenemese bile uygulamanın çalışmasına izin ver
      setSiteSettings({}) // Boş bir nesne ile devam et
    }
  }, [supabase])

  // Sayfa yüklendiğinde verileri getir
  useEffect(() => {
    async function fetchData() {
      await fetchIsletme()
      await fetchSiteSettings()
    }

    if (params.id) {
      fetchData()
    }
  }, [params.id, fetchIsletme, fetchSiteSettings])

  // Geri dönme işlemi
  const handleBack = useCallback(() => {
    router.back()
  }, [router])

  // İşletme listesine dönme işlemi
  const handleGoToList = useCallback(() => {
    router.push("/isletme-listesi")
  }, [router])

  // Ana sayfaya dönme işlemi
  const handleGoToHome = useCallback(() => {
    router.push("/")
  }, [router])

  // Sayfa URL'sini oluştur
  const getPageUrl = useCallback(() => {
    if (typeof window !== "undefined") {
      return window.location.href
    }
    return `${process.env.NEXT_PUBLIC_SITE_URL || "https://isletmenionecikar.com"}/isletme/${params.id}`
  }, [params.id])

  // Paylaşım işlevi
  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator
        .share({
          title: isletme?.isletme_adi || "İşletme Detayı",
          text: isletme?.aciklama || "İşletme detaylarını görüntüleyin",
          url: getPageUrl(),
        })
        .catch((error) => console.log("Paylaşım hatası:", error))
    } else {
      // Kopyala-yapıştır alternatifi
      navigator.clipboard
        .writeText(getPageUrl())
        .then(() => alert("Bağlantı panoya kopyalandı!"))
        .catch((err) => console.error("Kopyalama hatası:", err))
    }
  }, [isletme, getPageUrl])

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl py-12 px-4" aria-live="polite" aria-busy="true">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" role="status">
            <span className="sr-only">Yükleniyor...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !isletme) {
    return (
      <div className="container mx-auto max-w-6xl py-12 px-4" aria-live="polite">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">İşletme bulunamadı</h2>
            <p className="text-gray-600 mb-6">
              {error || "Aradığınız işletme bulunamadı veya bir hata oluştu. Lütfen daha sonra tekrar deneyin."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handleGoToList} variant="outline">
                İşletme Listesine Dön
              </Button>
              <Button onClick={handleGoToHome}>Ana Sayfaya Dön</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Sosyal medya bilgilerini JSONB'den çıkar
  const sosyalMedya = isletme.sosyal_medya || {}

  // Construct the URL
  const isletmeUrl = getPageUrl()

  return (
    <>
      <SeoMeta
        title={isletme.seo_baslik || isletme.isletme_adi}
        description={isletme.seo_aciklama || isletme.aciklama}
        keywords={isletme.seo_anahtar_kelimeler}
        ogImage={isletme.fotograf_url}
        ogUrl={isletmeUrl}
        isletmeAdi={isletme.isletme_adi}
        kategori={isletme.kategori}
        sehir={isletme.sehir}
        siteSettings={siteSettings || {}} // Varsayılan boş nesne
        isletmeData={isletme}
        faqData={faqData}
      />
      <main className="container mx-auto max-w-6xl py-8 px-4" itemScope itemType="https://schema.org/LocalBusiness">
        {/* Üst Bilgi Bölümü */}
        <div className="mb-8">
          {/* <Button variant="outline" size="sm" onClick={handleBack} className="mb-4" aria-label="Geri dön">
            <ChevronLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            Geri
          </Button> */}

          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2" itemProp="name" tabIndex={0}>
                {isletme.isletme_adi}
              </h1>
              <div className="flex flex-wrap gap-2 mb-3">
                {isletme.kategori && (
                  <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100" itemProp="category">
                    {isletme.kategori}
                  </Badge>
                )}
                {isletme.alt_kategori && <Badge variant="outline">{isletme.alt_kategori}</Badge>}
                {isletme.fiyat_araligi && (
                  <Badge variant="outline" className="text-green-700" itemProp="priceRange">
                    {isletme.fiyat_araligi}
                  </Badge>
                )}
              </div>
              <div
                className="flex items-center text-gray-600 mb-1"
                itemProp="address"
                itemScope
                itemType="https://schema.org/PostalAddress"
              >
                <MapPin className="h-4 w-4 mr-2" aria-hidden="true" />
                <span tabIndex={0}>
                  <span itemProp="streetAddress">{isletme.adres}</span>
                  {isletme.ilce && <span itemProp="addressLocality">, {isletme.ilce}</span>}
                  {isletme.sehir && <span itemProp="addressRegion">, {isletme.sehir}</span>}
                </span>
              </div>
            </div>

            {/* <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleShare} aria-label="İşletme bilgilerini paylaş">
                <Share2 className="mr-2 h-4 w-4" aria-hidden="true" />
                Paylaş
              </Button>
            </div> */}
          </div>
        </div>

        {/* Ana İçerik */}
        <IsletmeDetayIcerik isletme={isletme} />

        {/* Gizli SEO Bilgileri */}
        <div className="hidden">
          <span itemProp="telephone">{isletme.telefon}</span>
          {isletme.email && <span itemProp="email">{isletme.email}</span>}
          {isletme.website && <span itemProp="url">{isletme.website}</span>}
          {isletme.fotograf_url && (
            <img itemProp="image" src={isletme.fotograf_url || "/placeholder.svg"} alt={isletme.isletme_adi} />
          )}
        </div>
      </main>
    </>
  )
}
