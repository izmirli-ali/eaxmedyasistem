import Head from "next/head"
import type { SiteAyarlariType } from "@/lib/supabase-schema"
import { createLocalBusinessSchema, createFAQSchema } from "@/lib/seo-helpers"

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
}: SeoMetaProps) {
  // Varsayılan değerler
  const defaultTitle = siteSettings?.seo_title || siteSettings?.site_adi || "İşletme Yönetim Sistemi"
  const defaultDescription = siteSettings?.seo_description || siteSettings?.site_aciklama || "İşletme yönetim sistemi"
  const defaultKeywords = siteSettings?.seo_keywords || "işletme yönetimi, işletme listesi, işletme rehberi"

  // Canonical URL
  const canonicalUrl =
    ogUrl ||
    (typeof window !== "undefined"
      ? window.location.href
      : `${process.env.NEXT_PUBLIC_SITE_URL || ""}/isletme/${isletmeData?.id || ""}`)

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
  let structuredData = null

  if (isletmeData) {
    structuredData = createLocalBusinessSchema({
      name: isletmeData.isletme_adi,
      description: isletmeData.aciklama || finalDescription,
      image: isletmeData.fotograf_url || ogImage,
      url: canonicalUrl,
      telephone: isletmeData.telefon || "",
      email: isletmeData.email || "",
      address: {
        locality: isletmeData.ilce || "",
        region: isletmeData.sehir || "",
        country: "Türkiye",
      },
      priceRange: isletmeData.fiyat_araligi || "₺₺",
      openingHours: isletmeData.calisma_saatleri || "",
      socialLinks: isletmeData.sosyal_medya ? Object.values(isletmeData.sosyal_medya).filter(Boolean) : [],
    })
  }

  // FAQ yapılandırılmış verisi
  let faqStructuredData = null
  if (faqData && faqData.length > 0) {
    faqStructuredData = createFAQSchema(faqData)
  }

  return (
    <Head>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      {ogImage && <meta property="og:image" content={ogImage} />}
      <meta property="og:site_name" content={defaultTitle} />
      <meta property="og:locale" content="tr_TR" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {/* Ek Meta Etiketleri */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content={siteSettings?.site_adi || "İşletme Yönetim Sistemi"} />
      <meta name="language" content="Turkish" />
      <meta name="revisit-after" content="7 days" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      {/* Yapılandırılmış Veri */}
      {structuredData && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      )}

      {/* FAQ Yapılandırılmış Verisi */}
      {faqStructuredData && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }} />
      )}

      <link rel="icon" href="/favicon.ico" />
    </Head>
  )
}
