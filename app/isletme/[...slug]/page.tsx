"use client"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge, ChevronLeft, MapPin } from "lucide-react"
import SeoMeta from "@/components/seo-meta"
import { IsletmeDetayIcerik } from "@/components/isletme-detay-icerik"
import { parseHizmetler } from "@/lib/supabase-utils"
import { EnhancedBusinessDetails } from "@/components/enhanced-business-details"
import GoogleMapsLoader from "@/components/google-maps-loader"

interface Props {
  params: { slug: string[] }
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

      const { data, error, status } = await supabase
        .from("isletmeler")
        .select("*")
        .ilike("url_slug", params.slug.join("/")) // Use ilike for case-insensitive matching
        .limit(1)

      if (error) {
        console.error("Supabase error fetching isletme:", error)
        throw new Error(`Supabase error: ${error.message} (Status: ${status})`)
      }

      if (!data || data.length === 0) {
        console.warn(`No isletme found with url_slug: ${params.slug.join("/")}`)
        setIsletme(null)
        setError("İşletme bulunamadı.")
        return
      }

      if (data.length > 1) {
        console.warn(`Multiple isletmeler found with url_slug: ${params.slug.join("/")}.  Using the first one.`)
        setIsletme(data[0]) // Use the first one
      } else {
        setIsletme(data[0])
      }

      // İşletme için SSS verilerini oluştur
      if (data && data[0]) {
        const generatedFaqs = [
          {
            question: `${data[0].isletme_adi} nerede bulunuyor?`,
            answer: `${data[0].isletme_adi}, ${data[0].adres} ${data[0].ilce ? `, ${data[0].ilce}` : ""} ${data[0].sehir ? `, ${data[0].sehir}` : ""} adresinde bulunmaktadır.`,
          },
          {
            question: `${data[0].isletme_adi} hangi hizmetleri sunuyor?`,
            answer: data[0].sunulan_hizmetler
              ? `${data[0].isletme_adi}, ${parseHizmetler(data[0].sunulan_hizmetler).join(", ")} hizmetlerini sunmaktadır.`
              : `${data[0].isletme_adi}'nin sunduğu hizmetler hakkında detaylı bilgi için lütfen işletme ile iletişime geçin.`,
          },
          {
            question: `${data[0].isletme_adi} ile nasıl iletişime geçebilirim?`,
            answer: `${data[0].isletme_adi} ile ${data[0].telefon} numaralı telefondan${data[0].email ? ` veya ${data[0].email} e-posta adresinden` : ""} iletişime geçebilirsiniz.`,
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
  }, [params.slug.join("/"), supabase])

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

    fetchData()
  }, [fetchIsletme, fetchSiteSettings])

  // Geri dönme işlemi
  const handleBack = useCallback(() => {
    router.push("/isletme-listesi")
  }, [router])

  // Ana sayfaya dönme işlemi
  const handleGoHome = useCallback(() => {
    router.push("/")
  }, [router])

  // Sayfa URL'sini oluştur
  const getPageUrl = useCallback(() => {
    if (typeof window !== "undefined") {
      return window.location.href
    }
    return `${process.env.NEXT_PUBLIC_SITE_URL || "https://isletmenionecikar.com"}/isletme/${params.slug.join("/")}`
  }, [params.slug.join("/")])

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          <span className="ml-3">Yükleniyor...</span>
        </div>
      </div>
    )
  }

  if (error || !isletme) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
          <h2 className="text-xl font-bold text-red-700 mb-2">İşletme Bulunamadı</h2>
          <p className="text-red-600 mb-4">{error || "İşletme bilgileri yüklenemedi."}</p>
          <Button onClick={handleGoHome}>Ana Sayfaya Dön</Button>
        </div>
      </div>
    )
  }

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
      <GoogleMapsLoader>
        <main className="container mx-auto max-w-6xl py-8 px-4" itemScope itemType="https://schema.org/LocalBusiness">
          {/* Üst Bilgi Bölümü */}
          <div className="mb-8">
            <Button variant="outline" size="sm" onClick={handleBack} className="mb-4" aria-label="Geri dön">
              <ChevronLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              İşletme Listesine Dön
            </Button>

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
            </div>
          </div>

          {/* Ana İçerik */}
          <EnhancedBusinessDetails isletme={isletme} />
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
      </GoogleMapsLoader>
    </>
  )
}
