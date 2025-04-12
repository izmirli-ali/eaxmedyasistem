/**
 * SEO önerileri için yardımcı fonksiyonlar
 */

// Anahtar kelime önerileri oluşturma
export function generateKeywordSuggestions(
  isletmeAdi: string,
  kategori: string,
  sehir: string,
  hizmetler: string[] = [],
): string[] {
  const suggestions: string[] = []

  // İşletme adı ile öneriler
  if (isletmeAdi) {
    suggestions.push(isletmeAdi)
    suggestions.push(`${isletmeAdi} iletişim`)
    suggestions.push(`${isletmeAdi} adres`)
    suggestions.push(`${isletmeAdi} telefon`)
  }

  // Kategori ile öneriler
  if (kategori) {
    suggestions.push(kategori)

    if (sehir) {
      suggestions.push(`${sehir} ${kategori}`)
      suggestions.push(`${sehir}da ${kategori}`)
      suggestions.push(`${sehir} en iyi ${kategori}`)
    }
  }

  // Hizmetler ile öneriler
  hizmetler.forEach((hizmet) => {
    suggestions.push(hizmet)

    if (sehir) {
      suggestions.push(`${sehir} ${hizmet}`)
    }

    if (kategori) {
      suggestions.push(`${kategori} ${hizmet}`)
    }
  })

  // Konum bazlı öneriler
  if (sehir) {
    suggestions.push(`${sehir} ${isletmeAdi}`)

    if (kategori) {
      suggestions.push(`${sehir} ${kategori} fiyatları`)
      suggestions.push(`${sehir} uygun ${kategori}`)
      suggestions.push(`${sehir} kaliteli ${kategori}`)
    }
  }

  // Benzersiz önerileri döndür
  return [...new Set(suggestions)]
}

// SEO başlığı önerisi oluşturma
export function generateTitleSuggestion(isletmeAdi: string, kategori: string, sehir: string): string {
  if (!isletmeAdi) return ""

  if (kategori && sehir) {
    return `${isletmeAdi} - ${sehir} ${kategori} | Kaliteli Hizmet`
  }

  if (kategori) {
    return `${isletmeAdi} - ${kategori} | En İyi Hizmet`
  }

  if (sehir) {
    return `${isletmeAdi} - ${sehir} | İletişim ve Adres`
  }

  return `${isletmeAdi} | Resmi Web Sitesi`
}

// SEO açıklaması önerisi oluşturma
export function generateDescriptionSuggestion(
  isletmeAdi: string,
  kategori: string,
  sehir: string,
  aciklama = "",
): string {
  if (!isletmeAdi) return ""

  let baseDescription = ""

  if (aciklama && aciklama.length > 20) {
    // Açıklama varsa, ilk 150 karakterini al
    baseDescription = aciklama.substring(0, 150)

    // Cümleyi tamamla
    if (aciklama.length > 150) {
      const lastPeriod = baseDescription.lastIndexOf(".")
      if (lastPeriod > 100) {
        baseDescription = baseDescription.substring(0, lastPeriod + 1)
      } else {
        baseDescription += "..."
      }
    }

    return baseDescription
  }

  // Açıklama yoksa, temel bilgilerden oluştur
  if (kategori && sehir) {
    return `${isletmeAdi}, ${sehir} bölgesinde hizmet veren kaliteli bir ${kategori} işletmesidir. En iyi hizmet ve uygun fiyatlar için hemen iletişime geçin.`
  }

  if (kategori) {
    return `${isletmeAdi}, alanında uzman bir ${kategori} işletmesidir. Kaliteli hizmet ve müşteri memnuniyeti için bizi tercih edin.`
  }

  if (sehir) {
    return `${isletmeAdi}, ${sehir} bölgesinde hizmet veren işletmemize hoş geldiniz. İletişim bilgileri ve adres için web sitemizi ziyaret edin.`
  }

  return `${isletmeAdi} resmi web sitesi. İletişim bilgileri, adres ve hizmetlerimiz hakkında detaylı bilgi için bizi ziyaret edin.`
}

// URL slug önerisi oluşturma
export function generateSlugSuggestion(isletmeAdi: string, sehir: string): string {
  if (!isletmeAdi || !sehir) return ""

  // Türkçe karakterleri değiştir
  const turkishToEnglish = (text: string) => {
    return text
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "")
  }

  const sehirSlug = turkishToEnglish(sehir)
  const isletmeSlug = turkishToEnglish(isletmeAdi)

  return `${sehirSlug}/${isletmeSlug}`
}

// Tüm SEO önerilerini oluştur
export function generateSeoSuggestions(formData: any): {
  title: string
  description: string
  keywords: string[]
  slug: string
} {
  const hizmetler = formData.sunulan_hizmetler ? formData.sunulan_hizmetler.split(",").map((h: string) => h.trim()) : []

  const title = generateTitleSuggestion(formData.isletme_adi || "", formData.kategori || "", formData.sehir || "")

  const description = generateDescriptionSuggestion(
    formData.isletme_adi || "",
    formData.kategori || "",
    formData.sehir || "",
    formData.aciklama || "",
  )

  const keywords = generateKeywordSuggestions(
    formData.isletme_adi || "",
    formData.kategori || "",
    formData.sehir || "",
    hizmetler,
  )

  const slug = generateSlugSuggestion(formData.isletme_adi || "", formData.sehir || "")

  return {
    title,
    description,
    keywords,
    slug,
  }
}
