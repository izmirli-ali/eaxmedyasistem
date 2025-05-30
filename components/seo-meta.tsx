"use client"

import { useEffect } from "react"
import type { SiteAyarlariType } from "@/lib/supabase-schema"
import { createLocalBusinessSchema, createFAQSchema, createBreadcrumbSchema } from "@/lib/seo-helpers"
import Script from "next/script"

interface SeoMetaProps {
  title?: string
  description?: string
  keywords?: string
  ogImage?: string
  ogUrl?: string
  ogType?: string
  isletmeAdi?: string
  kategori?: string
  sehir?: string
  siteSettings: SiteAyarlariType | null
  isletmeData?: any // İşletme verisi için
  faqData?: { question: string; answer: string }[] // SSS verileri için
  breadcrumbs?: { name: string; item: string }[] // Breadcrumb verileri için
  noIndex?: boolean // Sayfanın indekslenmemesi gerekiyorsa
  publishedTime?: string // Yayınlanma tarihi
  modifiedTime?: string // Güncelleme tarihi
  alternateUrls?: Record<string, string> // Alternatif dil URL'leri
  jsonLd?: Record<string, any> // Özel JSON-LD verisi
}

export default function SeoMeta({
  title,
  description,
  keywords,
  ogImage,
  ogUrl,
  ogType = "website",
  isletmeAdi,
  kategori,
  sehir,
  siteSettings,
  isletmeData,
  faqData,
  breadcrumbs,
  noIndex = false,
  publishedTime,
  modifiedTime,
  alternateUrls = {},
  jsonLd,
}: SeoMetaProps) {
  // Varsayılan değerler
  const defaultTitle = siteSettings?.seo_title || siteSettings?.site_adi || "İşletme Yönetim Sistemi"
  const defaultDescription = siteSettings?.seo_description || siteSettings?.site_aciklama || "İşletme yönetim sistemi"
  const defaultKeywords = siteSettings?.seo_keywords || "işletme yönetimi, işletme listesi, işletme rehberi"
  const defaultImage = siteSettings?.seo_image || "/logo.png"

  // Canonical URL
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ""
  const canonicalUrl =
    ogUrl ||
    (typeof window !== "undefined"
      ? window.location.href
      : `${siteUrl}/isletme/${isletmeData?.sehir}/${isletmeData?.slug || ""}`)

  // SEO başlığı ve açıklamasını işletme verilerinden daha akıllı bir şekilde oluşturalım
  const finalTitle = isletmeData?.seo_baslik
    ? isletmeData.seo_baslik
    : title
      ? `${title} | ${defaultTitle}`
      : isletmeAdi && kategori && sehir
        ? `${isletmeAdi} - ${sehir} ${kategori} | ${defaultTitle}`
        : defaultTitle

  const finalDescription = isletmeData?.seo_aciklama
    ? isletmeData.seo_aciklama
    : description
      ? description
      : isletmeAdi && kategori && sehir
        ? `${isletmeAdi}, ${sehir} bölgesinde hizmet veren en iyi ${kategori} işletmesidir. İletişim: ${isletmeData?.telefon || siteSettings?.iletisim_telefon || ""}`
        : defaultDescription

  // Anahtar kelimeleri işletme verilerinden daha akıllı bir şekilde oluşturalım
  const finalKeywords = isletmeData?.seo_anahtar_kelimeler || keywords || defaultKeywords

  // JSON-LD yapılandırılmış veri
  let structuredData = jsonLd || null

  if (isletmeData && !jsonLd) {
    structuredData = createLocalBusinessSchema({
      name: isletmeData.isletme_adi,
      description: isletmeData.aciklama || finalDescription,
      image: isletmeData.fotograf_url || ogImage || defaultImage,
      url: canonicalUrl,
      telephone: isletmeData.telefon || "",
      email: isletmeData.email || "",
      address: {
        locality: isletmeData.ilce || "",
        region: isletmeData.sehir || "",
        country: "Türkiye",
        streetAddress: isletmeData.adres || "",
        postalCode: isletmeData.posta_kodu || "",
      },
      priceRange: isletmeData.fiyat_araligi || "₺₺",
      openingHours: isletmeData.calisma_saatleri || "",
      socialLinks: isletmeData.sosyal_medya ? Object.values(isletmeData.sosyal_medya).filter(Boolean) : [],
      category: isletmeData.kategori,
      subCategory: isletmeData.alt_kategori,
      geo:
        isletmeData.latitude && isletmeData.longitude
          ? {
              latitude: Number.parseFloat(isletmeData.latitude),
              longitude: Number.parseFloat(isletmeData.longitude),
            }
          : undefined,
      services: isletmeData.sunulan_hizmetler
        ? isletmeData.sunulan_hizmetler.split(",").map((s) => s.trim())
        : undefined,
      hasMap: isletmeData.harita_linki,
      aggregateRating:
        isletmeData.ortalama_puan && isletmeData.yorum_sayisi
          ? {
              ratingValue: Number.parseFloat(isletmeData.ortalama_puan),
              reviewCount: Number.parseInt(isletmeData.yorum_sayisi),
            }
          : undefined,
      foundingDate: isletmeData.kurulus_yili,
      areaServed: [isletmeData.sehir, isletmeData.ilce].filter(Boolean),
      keywords: isletmeData.seo_anahtar_kelimeler
        ? isletmeData.seo_anahtar_kelimeler.split(",").map((k) => k.trim())
        : undefined,
      accessibilityFeatures: [
        isletmeData.engelli_erisim && "Engelli Erişimi",
        isletmeData.bebek_dostu && "Bebek Dostu",
      ].filter(Boolean),
      amenityFeature: [
        isletmeData.wifi && "Wi-Fi",
        isletmeData.otopark && "Otopark",
        isletmeData.sigara_alani && "Sigara Alanı",
      ].filter(Boolean),
      paymentAccepted: [
        isletmeData.kredi_karti && "Kredi Kartı",
        isletmeData.nakit_odeme && "Nakit",
        isletmeData.online_odeme && "Online Ödeme",
        isletmeData.temassiz_odeme && "Temassız Ödeme",
      ].filter(Boolean),
      publicAccess: true,
      isAccessibleForFree: true,
      smokingAllowed: isletmeData.sigara_alani || false,
    })
  }

  // FAQ yapılandırılmış verisi
  let faqStructuredData = null
  if (faqData && faqData.length > 0) {
    faqStructuredData = createFAQSchema(faqData)
  }

  // Breadcrumb yapılandırılmış verisi
  let breadcrumbStructuredData = null
  if (breadcrumbs && breadcrumbs.length > 0) {
    breadcrumbStructuredData = createBreadcrumbSchema(breadcrumbs)
  }

  // Sayfa görüntülendiğinde Google Analytics'e sayfa görüntüleme olayı gönder
  useEffect(() => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("config", "G-MEASUREMENT_ID", {
        page_path: window.location.pathname,
        page_title: finalTitle,
        page_location: window.location.href,
      })
    }
  }, [finalTitle])

  return (
    <>
      {/* Yapılandırılmış Veri */}
      {structuredData && (
        <Script id="structured-data" type="application/ld+json">
          {JSON.stringify(structuredData)}
        </Script>
      )}

      {/* FAQ Yapılandırılmış Verisi */}
      {faqStructuredData && (
        <Script id="faq-structured-data" type="application/ld+json">
          {JSON.stringify(faqStructuredData)}
        </Script>
      )}

      {/* Breadcrumb Yapılandırılmış Verisi */}
      {breadcrumbStructuredData && (
        <Script id="breadcrumb-structured-data" type="application/ld+json">
          {JSON.stringify(breadcrumbStructuredData)}
        </Script>
      )}
    </>
  )
}
