"use client"

import { useEffect } from "react"
import type { Business } from "@/types"

interface EnhancedSchemaOrgProps {
  isletme: Business
  siteUrl: string
}

export function EnhancedSchemaOrg({ isletme, siteUrl }: EnhancedSchemaOrgProps) {
  useEffect(() => {
    // Yapısal veri oluştur
    const schemaData = generateSchemaData(isletme, siteUrl)

    // Mevcut script etiketini kontrol et ve güncelle
    const existingScript = document.getElementById("schema-script")
    if (existingScript) {
      existingScript.textContent = JSON.stringify(schemaData)
    } else {
      // Yeni script etiketi oluştur
      const script = document.createElement("script")
      script.id = "schema-script"
      script.type = "application/ld+json"
      script.textContent = JSON.stringify(schemaData)
      document.head.appendChild(script)
    }

    // Temizleme fonksiyonu
    return () => {
      const scriptToRemove = document.getElementById("schema-script")
      if (scriptToRemove) {
        scriptToRemove.remove()
      }
    }
  }, [isletme, siteUrl])

  // Yapısal veri oluşturma fonksiyonu
  const generateSchemaData = (isletme: Business, siteUrl: string) => {
    // Temel işletme bilgileri
    const schemaData: any = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      name: isletme.isletme_adi,
      description: isletme.aciklama || "",
      url: `${siteUrl}/isletme/${isletme.url_slug}`,
      telephone: isletme.telefon || "",
      email: isletme.email || isletme.eposta || "",
    }

    // Adres bilgileri
    if (isletme.adres) {
      schemaData.address = {
        "@type": "PostalAddress",
        streetAddress: isletme.adres || "",
        addressLocality: isletme.ilce || "",
        addressRegion: isletme.sehir || "",
        addressCountry: "TR",
      }
    }

    // Konum bilgileri
    if (isletme.latitude && isletme.longitude) {
      schemaData.geo = {
        "@type": "GeoCoordinates",
        latitude: Number.parseFloat(isletme.latitude.toString()),
        longitude: Number.parseFloat(isletme.longitude.toString()),
      }
    }

    // Görsel bilgileri
    if (isletme.fotograf_url) {
      schemaData.image = isletme.fotograf_url
    }

    // Çalışma saatleri
    if (isletme.calisma_saatleri) {
      try {
        const calismaSaatleri =
          typeof isletme.calisma_saatleri === "string" ? JSON.parse(isletme.calisma_saatleri) : isletme.calisma_saatleri

        const openingHoursSpecification = []
        const gunler = {
          pazartesi: "Monday",
          sali: "Tuesday",
          carsamba: "Wednesday",
          persembe: "Thursday",
          cuma: "Friday",
          cumartesi: "Saturday",
          pazar: "Sunday",
        }

        for (const [gun, gunIngilizce] of Object.entries(gunler)) {
          const gunData = calismaSaatleri[gun]
          if (gunData && !gunData.kapali) {
            openingHoursSpecification.push({
              "@type": "OpeningHoursSpecification",
              dayOfWeek: gunIngilizce,
              opens: gunData.acilis || "09:00",
              closes: gunData.kapanis || "18:00",
            })
          }
        }

        if (openingHoursSpecification.length > 0) {
          schemaData.openingHoursSpecification = openingHoursSpecification
        }
      } catch (error) {
        console.error("Çalışma saatleri parse edilemedi:", error)
      }
    }

    // Fiyat aralığı
    if (isletme.fiyat_araligi) {
      try {
        const fiyatSayisi = Number.parseInt(isletme.fiyat_araligi.toString())
        if (!isNaN(fiyatSayisi) && fiyatSayisi > 0 && fiyatSayisi <= 5) {
          schemaData.priceRange = "₺".repeat(fiyatSayisi)
        }
      } catch (error) {
        console.error("Fiyat aralığı işlenemedi:", error)
      }
    }

    // Sosyal medya
    if (isletme.sosyal_medya) {
      try {
        const sosyalMedya =
          typeof isletme.sosyal_medya === "string" ? JSON.parse(isletme.sosyal_medya) : isletme.sosyal_medya

        const sameAs = []
        if (sosyalMedya.facebook) sameAs.push(sosyalMedya.facebook)
        if (sosyalMedya.instagram) sameAs.push(sosyalMedya.instagram)
        if (sosyalMedya.twitter) sameAs.push(sosyalMedya.twitter)
        if (sosyalMedya.linkedin) sameAs.push(sosyalMedya.linkedin)
        if (sosyalMedya.youtube) sameAs.push(sosyalMedya.youtube)

        if (sameAs.length > 0) {
          schemaData.sameAs = sameAs
        }
      } catch (error) {
        console.error("Sosyal medya verileri işlenemedi:", error)
      }
    }

    // Web sitesi
    if (isletme.website) {
      if (!schemaData.sameAs) {
        schemaData.sameAs = []
      }
      schemaData.sameAs.push(isletme.website)
    }

    return schemaData
  }

  // Bu bileşen görsel olarak bir şey render etmez
  return null
}
