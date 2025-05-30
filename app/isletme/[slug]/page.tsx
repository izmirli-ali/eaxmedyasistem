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
  const { data: isletme, error } = await supabase
    .from("isletmeler")
    .select("*")
    .eq("url_slug", params.slug)
    .single()

  if (error || !isletme) {
    return {
      title: "İşletme Bulunamadı | İşletmeni Öne Çıkar",
      description: "Aradığınız işletme bulunamadı.",
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const siteUrl = "https://isletmenionecikar.com"
  const canonicalUrl = `${siteUrl}/isletme/${isletme.url_slug}`

  // SEO başlığı ve açıklaması oluştur
  const title = isletme.seo_baslik || `${isletme.isletme_adi} - ${isletme.sehir} ${isletme.kategori} | İşletmeni Öne Çıkar`
  const description = isletme.seo_aciklama || 
    `${isletme.isletme_adi}, ${isletme.sehir} bölgesinde hizmet veren ${isletme.kategori} işletmesidir. ${isletme.aciklama?.substring(0, 120) || ""}`

  // Anahtar kelimeleri oluştur
  const keywords = [
    isletme.isletme_adi,
    isletme.kategori,
    isletme.sehir,
    isletme.ilce,
    "işletme",
    "yerel işletme",
    "Google Haritalar",
    "Google Maps",
    ...(isletme.seo_anahtar_kelimeler ? isletme.seo_anahtar_kelimeler.split(",").map(k => k.trim()) : []),
  ].filter(Boolean)

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "İşletmeni Öne Çıkar",
      images: [
        {
          url: isletme.fotograf_url || `${siteUrl}/placeholder.jpg`,
          width: 1200,
          height: 630,
          alt: isletme.isletme_adi,
        },
      ],
      locale: "tr_TR",
      type: "business.business",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [isletme.fotograf_url || `${siteUrl}/placeholder.jpg`],
      creator: "@isletmenionecikar",
    },
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    other: {
      "business:contact_data:street_address": isletme.adres,
      "business:contact_data:locality": isletme.ilce,
      "business:contact_data:region": isletme.sehir,
      "business:contact_data:postal_code": isletme.posta_kodu,
      "business:contact_data:country_name": "Türkiye",
      "business:contact_data:phone_number": isletme.telefon,
      "business:contact_data:email": isletme.email,
      "business:contact_data:website": canonicalUrl,
      "business:contact_data:opening_hours": isletme.calisma_saatleri,
    },
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
