// İşletme detay sayfasını düzenleyelim ve veri dönüşümlerini ekleyelim
import type { Metadata } from "next"
import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import IsletmeDetayClient from "./IsletmeDetayClient"
import { parseHizmetler } from "@/lib/supabase-utils"
import { EnhancedSchemaOrg } from "@/components/enhanced-schema-org"

// Dinamik metadata
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createClient()

  // İşletmeyi getir - isletmeler2 tablosundan
  const { data: isletme, error } = await supabase.from("isletmeler2").select("*").eq("url_slug", params.slug).single()

  if (error || !isletme) {
    return {
      title: "İşletme Bulunamadı",
      description: "Aradığınız işletme bulunamadı.",
    }
  }

  // Site URL'ini al
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://isletmenionecikar.com"
  const canonicalUrl = `${siteUrl}/isletme/${params.slug}`

  // Schema.org yapılandırması
  const schemaOrgData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": canonicalUrl,
    "name": isletme.isletme_adi,
    "image": isletme.fotograf_url || "/placeholder.jpg",
    "description": isletme.seo_aciklama || isletme.aciklama,
    "url": canonicalUrl,
    "telephone": isletme.telefon,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": isletme.adres,
      "addressLocality": isletme.sehir,
      "addressRegion": isletme.ilce,
      "postalCode": isletme.posta_kodu,
      "addressCountry": "TR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": isletme.latitude,
      "longitude": isletme.longitude
    },
    "priceRange": isletme.fiyat_araligi ? "₺".repeat(isletme.fiyat_araligi) : undefined,
    "openingHoursSpecification": isletme.calisma_saatleri ? Object.entries(isletme.calisma_saatleri).map(([day, hours]) => ({
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": day,
      "opens": hours.split("-")[0],
      "closes": hours.split("-")[1]
    })) : undefined,
    "sameAs": isletme.sosyal_medya ? Object.values(isletme.sosyal_medya) : undefined,
    "aggregateRating": isletme.puan ? {
      "@type": "AggregateRating",
      "ratingValue": isletme.puan,
      "reviewCount": isletme.degerlendirme_sayisi || 0
    } : undefined,
    "servesCuisine": isletme.mutfak_turu,
    "hasMenu": isletme.menu_url ? {
      "@type": "Menu",
      "url": isletme.menu_url
    } : undefined,
    "amenityFeature": [
      isletme.wifi && { "@type": "LocationFeatureSpecification", "name": "WiFi", "value": true },
      isletme.otopark && { "@type": "LocationFeatureSpecification", "name": "Otopark", "value": true },
      isletme.engelli_erisim && { "@type": "LocationFeatureSpecification", "name": "Engelli Erişimi", "value": true }
    ].filter(Boolean)
  }

  return {
    title: isletme.seo_baslik || isletme.isletme_adi,
    description: isletme.seo_aciklama || (isletme.aciklama ? isletme.aciklama.substring(0, 160) : ""),
    keywords: isletme.seo_anahtar_kelimeler,
    openGraph: {
      title: isletme.seo_baslik || isletme.isletme_adi,
      description: isletme.seo_aciklama || (isletme.aciklama ? isletme.aciklama.substring(0, 160) : ""),
      url: canonicalUrl,
      siteName: "İşletme Yönetim Sistemi",
      images: [
        {
          url: isletme.fotograf_url || "/placeholder.jpg",
          width: 1200,
          height: 630,
          alt: isletme.isletme_adi,
        },
      ],
      locale: "tr_TR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: isletme.seo_baslik || isletme.isletme_adi,
      description: isletme.seo_aciklama || (isletme.aciklama ? isletme.aciklama.substring(0, 160) : ""),
      images: [isletme.fotograf_url || "/placeholder.jpg"],
    },
    alternates: {
      canonical: canonicalUrl,
    },
    other: {
      "schema-org": JSON.stringify(schemaOrgData)
    }
  }
}

// Boolean değerleri dönüştürmek için yardımcı fonksiyon
function parseBoolean(value: any): boolean {
  if (value === true || value === "true" || value === 1 || value === "1" || value === "t") return true
  if (
    value === false ||
    value === "false" ||
    value === 0 ||
    value === "0" ||
    value === "f" ||
    value === null ||
    value === undefined
  )
    return false
  return Boolean(value)
}

// JSON verilerini güvenli bir şekilde parse etmek için yardımcı fonksiyon
function safeJsonParse(jsonString: any, defaultValue: any = null) {
  if (!jsonString) return defaultValue

  if (typeof jsonString === "object") return jsonString

  try {
    return JSON.parse(jsonString)
  } catch (error) {
    console.error("JSON parse hatası:", error, "Değer:", jsonString)
    return defaultValue
  }
}

// Sayısal değerleri dönüştürmek için yardımcı fonksiyon
function parseNumber(value: any, defaultValue = 0): number {
  if (typeof value === "number") return value
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value)
    return isNaN(parsed) ? defaultValue : parsed
  }
  return defaultValue
}

// Fotoğrafları işlemek için yardımcı fonksiyon
function processFotograflar(fotograflar: any): any[] {
  if (!fotograflar) return []

  // Eğer fotograflar bir string dizisi ise (URL'ler)
  if (Array.isArray(fotograflar) && typeof fotograflar[0] === "string") {
    return fotograflar.map((url) => ({ url }))
  }

  // Eğer fotograflar zaten bir obje dizisi ise
  if (Array.isArray(fotograflar) && typeof fotograflar[0] === "object") {
    return fotograflar
  }

  // Eğer fotograflar bir string ise, JSON parse etmeyi dene
  if (typeof fotograflar === "string") {
    try {
      const parsed = JSON.parse(fotograflar)
      if (Array.isArray(parsed)) {
        return parsed.map((item) => {
          if (typeof item === "string") return { url: item }
          return item
        })
      }
      return []
    } catch (error) {
      console.error("Fotoğraflar parse edilemedi:", error)
      return []
    }
  }

  return []
}

export default async function IsletmeDetaySayfasi({ params }: { params: { slug: string } }) {
  const supabase = createClient()

  // İşletme verilerini çek
  const { data: rawIsletme, error } = await supabase
    .from("isletmeler2")
    .select("*")
    .eq("url_slug", params.slug)
    .single()

  if (error) {
    console.error("İşletme verisi çekilirken hata:", error)
    redirect("/hata?mesaj=İşletme bulunamadı")
  }

  // Ham verileri konsola yazdır
  console.log("1. VERİTABANINDAN ÇEKİLEN HAM VERİLER:", rawIsletme)

  if (!rawIsletme) {
    console.error("İşletme bulunamadı")
    notFound()
  }

  // Fotoğrafları işle
  const processedFotograflar = processFotograflar(rawIsletme.fotograflar)
  console.log("İŞLENMİŞ FOTOĞRAFLAR:", processedFotograflar)

  // Boolean özellikleri kontrol et
  const booleanFields = [
    "wifi",
    "otopark",
    "kredi_karti",
    "rezervasyon",
    "paket_servis",
    "engelli_erisim",
    "bebek_dostu",
    "evcil_hayvan_dostu",
    "sigara_alani",
    "canli_muzik",
    "kahvalti",
    "aksam_yemegi",
    "tv",
    "ucretsiz_teslimat",
    "nakit_odeme",
    "online_odeme",
    "temassiz_odeme",
    "organik_urunler",
    "glutensiz_secenekler",
    "vegan_secenekler",
  ]

  console.log("HAM BOOLEAN DEĞERLER:")
  booleanFields.forEach((field) => {
    console.log(`${field}:`, rawIsletme[field], typeof rawIsletme[field])
  })

  // Veri dönüşümleri
  const isletmeData = {
    ...rawIsletme,
    // JSON verilerini parse et
    sosyal_medya: safeJsonParse(rawIsletme.sosyal_medya, {}),
    calisma_saatleri: safeJsonParse(rawIsletme.calisma_saatleri, {}),
    fotograflar: processedFotograflar,
    one_cikan_urunler: safeJsonParse(rawIsletme.one_cikan_urunler, []),
    one_cikan_hizmetler: safeJsonParse(rawIsletme.one_cikan_hizmetler, []),
    sertifikalar: safeJsonParse(rawIsletme.sertifikalar, []),
    odullar: safeJsonParse(rawIsletme.odullar, []),
    ozellikler: safeJsonParse(rawIsletme.ozellikler, {}),

    // Boolean değerleri dönüştür
    wifi: parseBoolean(rawIsletme.wifi),
    otopark: parseBoolean(rawIsletme.otopark),
    kredi_karti: parseBoolean(rawIsletme.kredi_karti),
    rezervasyon: parseBoolean(rawIsletme.rezervasyon),
    paket_servis: parseBoolean(rawIsletme.paket_servis),
    engelli_erisim: parseBoolean(rawIsletme.engelli_erisim),
    bebek_dostu: parseBoolean(rawIsletme.bebek_dostu),
    evcil_hayvan_dostu: parseBoolean(rawIsletme.evcil_hayvan_dostu),
    sigara_alani: parseBoolean(rawIsletme.sigara_alani),
    canli_muzik: parseBoolean(rawIsletme.canli_muzik),
    kahvalti: parseBoolean(rawIsletme.kahvalti),
    aksam_yemegi: parseBoolean(rawIsletme.aksam_yemegi),
    tv: parseBoolean(rawIsletme.tv),
    ucretsiz_teslimat: parseBoolean(rawIsletme.ucretsiz_teslimat),
    nakit_odeme: parseBoolean(rawIsletme.nakit_odeme),
    online_odeme: parseBoolean(rawIsletme.online_odeme),
    temassiz_odeme: parseBoolean(rawIsletme.temassiz_odeme),
    organik_urunler: parseBoolean(rawIsletme.organik_urunler),
    glutensiz_secenekler: parseBoolean(rawIsletme.glutensiz_secenekler),
    vegan_secenekler: parseBoolean(rawIsletme.vegan_secenekler),

    // Sayısal değerleri dönüştür
    latitude: parseNumber(rawIsletme.latitude),
    longitude: parseNumber(rawIsletme.longitude),
    fiyat_araligi: parseNumber(rawIsletme.fiyat_araligi),
    kurulus_yili: parseNumber(rawIsletme.kurulus_yili),
    goruntulenme_sayisi: parseNumber(rawIsletme.goruntulenme_sayisi),
  }

  // Dönüştürülmüş boolean değerleri kontrol et
  console.log("DÖNÜŞTÜRÜLMÜŞ BOOLEAN DEĞERLER:")
  booleanFields.forEach((field) => {
    console.log(`${field}:`, isletmeData[field], typeof isletmeData[field])
  })

  // Dönüştürülmüş verileri konsola yazdır
  console.log("2. DÖNÜŞTÜRÜLMÜŞ VERİLER:", isletmeData)

  try {
    // Görüntülenme sayısını artır
    await supabase
      .from("isletmeler2")
      .update({
        goruntulenme_sayisi: (rawIsletme.goruntulenme_sayisi || 0) + 1,
      })
      .eq("id", rawIsletme.id)
  } catch (updateError) {
    console.error("Görüntülenme sayısı güncellenemedi:", updateError)
    // Görüntülenme sayısı güncellenemese bile devam et
  }

  // Sunulan hizmetleri parse et
  const hizmetler = parseHizmetler(isletmeData.sunulan_hizmetler)

  // Site URL'ini al
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://isletmenionecikar.com"

  return (
    <>
      {/* Yapılandırılmış veri (JSON-LD) */}
      <EnhancedSchemaOrg isletme={isletmeData} siteUrl={siteUrl} />

      {/* İşletme detay içeriği */}
      <IsletmeDetayClient isletme={isletmeData} hizmetler={hizmetler} />
    </>
  )
}
