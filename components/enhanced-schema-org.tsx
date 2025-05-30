import type { Business } from "@/types"

interface EnhancedSchemaOrgProps {
  isletme: Business
  siteUrl: string
}

export function EnhancedSchemaOrg({ isletme, siteUrl }: EnhancedSchemaOrgProps) {
  // Çalışma saatleri yapısal verisi
  const generateOpeningHours = () => {
    try {
      if (!isletme.calisma_saatleri) return []

      const calismaSaatleri =
        typeof isletme.calisma_saatleri === "string" ? JSON.parse(isletme.calisma_saatleri) : isletme.calisma_saatleri

      const gunIngilizce: Record<string, string> = {
        pazartesi: "Monday",
        sali: "Tuesday",
        carsamba: "Wednesday",
        persembe: "Thursday",
        cuma: "Friday",
        cumartesi: "Saturday",
        pazar: "Sunday",
      }

      return Object.entries(calismaSaatleri)
        .filter(([_, gunData]) => gunData && !gunData.kapali)
        .map(([gun, gunData]) => ({
          "@type": "OpeningHoursSpecification",
          dayOfWeek: gunIngilizce[gun],
          opens: gunData.acilis || "09:00",
          closes: gunData.kapanis || "18:00",
        }))
    } catch (error) {
      console.error("Çalışma saatleri yapısal verisi oluşturulamadı:", error)
      return []
    }
  }

  // Ödeme yöntemleri
  const paymentMethods = Array.isArray(isletme.kabul_edilen_odeme_yontemleri)
    ? isletme.kabul_edilen_odeme_yontemleri
    : ["Nakit", "Kredi Kartı"]

  // Fiyat aralığı - güvenli bir şekilde işle
  const getPriceRange = () => {
    try {
      if (!isletme.fiyat_araligi) return "₺₺"

      const fiyatSayisi = Number.parseInt(isletme.fiyat_araligi.toString())
      if (isNaN(fiyatSayisi) || fiyatSayisi <= 0 || fiyatSayisi > 5) return "₺₺"

      return "₺".repeat(fiyatSayisi)
    } catch (error) {
      console.error("Fiyat aralığı işlenemedi:", error)
      return "₺₺"
    }
  }

  // Öne çıkan ürünler
  const getOfferedProducts = () => {
    try {
      if (!isletme.one_cikan_urunler) return []

      const urunler =
        typeof isletme.one_cikan_urunler === "string"
          ? JSON.parse(isletme.one_cikan_urunler)
          : isletme.one_cikan_urunler

      if (!Array.isArray(urunler) || urunler.length === 0) return []

      return urunler.map((urun) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Product",
          name: urun.baslik || "Ürün",
          description: urun.aciklama || "",
          image: urun.gorsel_url || "",
          offers: {
            "@type": "Offer",
            price: urun.fiyat || "0",
            priceCurrency: "TRY",
          },
        },
      }))
    } catch (error) {
      console.error("Öne çıkan ürünler yapısal verisi oluşturulamadı:", error)
      return []
    }
  }

  // Öne çıkan hizmetler
  const getOfferedServices = () => {
    try {
      if (!isletme.one_cikan_hizmetler) return []

      const hizmetler =
        typeof isletme.one_cikan_hizmetler === "string"
          ? JSON.parse(isletme.one_cikan_hizmetler)
          : isletme.one_cikan_hizmetler

      if (!Array.isArray(hizmetler) || hizmetler.length === 0) return []

      return hizmetler.map((hizmet) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: hizmet.baslik || "Hizmet",
          description: hizmet.aciklama || "",
          offers: {
            "@type": "Offer",
            price: hizmet.fiyat || "0",
            priceCurrency: "TRY",
          },
        },
      }))
    } catch (error) {
      console.error("Öne çıkan hizmetler yapısal verisi oluşturulamadı:", error)
      return []
    }
  }

  // Video yapısal verisi
  const getVideoObject = () => {
    if (!isletme.video_url) return null

    return {
      "@type": "VideoObject",
      name: isletme.video_baslik || `${isletme.isletme_adi} Tanıtım Videosu`,
      description: isletme.video_aciklama || `${isletme.isletme_adi} hakkında tanıtım videosu`,
      thumbnailUrl: isletme.fotograf_url || "",
      uploadDate: isletme.created_at || new Date().toISOString(),
      contentUrl: isletme.video_url,
      embedUrl:
        isletme.video_url && isletme.video_url.includes("youtube.com")
          ? isletme.video_url.replace("watch?v=", "embed/")
          : isletme.video_url,
    }
  }

  // Sertifikalar ve ödüller güvenli bir şekilde işle
  const getSertifikalar = () => {
    try {
      if (!isletme.sertifikalar) return []

      const sertifikalar =
        typeof isletme.sertifikalar === "string" ? JSON.parse(isletme.sertifikalar) : isletme.sertifikalar

      if (!Array.isArray(sertifikalar)) return []

      return sertifikalar.map((sertifika) => ({
        "@type": "EducationalOccupationalCredential",
        name: sertifika || "",
      }))
    } catch (error) {
      console.error("Sertifikalar yapısal verisi oluşturulamadı:", error)
      return []
    }
  }

  const getOdullar = () => {
    try {
      if (!isletme.odullar) return []

      const odullar = typeof isletme.odullar === "string" ? JSON.parse(isletme.odullar) : isletme.odullar

      if (!Array.isArray(odullar)) return []

      return odullar
    } catch (error) {
      console.error("Ödüller yapısal verisi oluşturulamadı:", error)
      return []
    }
  }

  // Ana yapısal veri
  const schemaData: any = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: isletme.isletme_adi || "",
    image: isletme.fotograf_url || "",
    "@id": `${siteUrl}/isletme/${isletme.url_slug || isletme.slug || ""}#business`,
    url: `${siteUrl}/isletme/${isletme.url_slug || isletme.slug || ""}`,
    telephone: isletme.telefon || "",
    email: isletme.email || "",
    description: isletme.aciklama || "",
    priceRange: getPriceRange(),
    currenciesAccepted: "TRY",
    paymentAccepted: paymentMethods.join(", "),
    address: {
      "@type": "PostalAddress",
      streetAddress: isletme.adres || "",
      addressLocality: isletme.ilce || "",
      addressRegion: isletme.sehir || "",
      addressCountry: "TR",
    },
  }

  // Koordinatlar varsa ekle
  if (isletme.latitude && isletme.longitude) {
    schemaData.geo = {
      "@type": "GeoCoordinates",
      latitude: Number.parseFloat(isletme.latitude.toString()),
      longitude: Number.parseFloat(isletme.longitude.toString()),
    }
  }

  // Çalışma saatleri varsa ekle
  const openingHours = generateOpeningHours()
  if (openingHours.length > 0) {
    schemaData.openingHoursSpecification = openingHours
  }

  // Öne çıkan ürünler ve hizmetler varsa ekle
  const offeredProducts = getOfferedProducts()
  const offeredServices = getOfferedServices()
  const allOffers = [...offeredProducts, ...offeredServices]

  if (allOffers.length > 0) {
    schemaData.makesOffer = allOffers
  }

  // Video varsa ekle
  const videoObject = getVideoObject()
  if (videoObject) {
    schemaData.video = videoObject
  }

  // Kuruluş yılı varsa ekle
  if (isletme.kurulus_yili) {
    schemaData.foundingDate = `${isletme.kurulus_yili}-01-01`
  }

  // Sertifikalar ve ödüller varsa ekle
  const sertifikalar = getSertifikalar()
  if (sertifikalar.length > 0) {
    schemaData.hasCredential = sertifikalar
  }

  const odullar = getOdullar()
  if (odullar.length > 0) {
    schemaData.award = odullar
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      key="schema-localBusiness"
    />
  )
}
