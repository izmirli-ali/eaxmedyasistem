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

// LocalBusiness şemasını daha kapsamlı hale getirelim
export function createLocalBusinessSchema(businessData: {
  name: string
  description: string
  image: string
  url: string
  telephone: string
  email: string
  address: {
    locality: string
    region: string
    country: string
    streetAddress?: string
    postalCode?: string
  }
  priceRange: string
  openingHours: string
  socialLinks: string[]
  geo?: {
    latitude: number
    longitude: number
  }
  // Yeni alanlar ekleyelim
  category?: string
  subCategory?: string
  services?: string[]
  paymentAccepted?: string[]
  hasMap?: string
  aggregateRating?: {
    ratingValue: number
    reviewCount: number
  }
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: businessData.name,
    description: businessData.description,
    image: businessData.image,
    url: businessData.url,
    telephone: businessData.telephone,
    email: businessData.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: businessData.address.locality,
      addressRegion: businessData.address.region,
      addressCountry: businessData.address.country,
      streetAddress: businessData.address.streetAddress,
      postalCode: businessData.address.postalCode,
    },
    priceRange: businessData.priceRange,
    openingHours: businessData.openingHours,
    sameAs: businessData.socialLinks,
    // Yeni alanları ekleyelim
    ...(businessData.geo && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: businessData.geo.latitude,
        longitude: businessData.geo.longitude,
      },
    }),
    ...(businessData.category && { category: businessData.category }),
    ...(businessData.services && {
      makesOffer: businessData.services.map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service,
        },
      })),
    }),
    ...(businessData.paymentAccepted && { paymentAccepted: businessData.paymentAccepted.join(", ") }),
    ...(businessData.hasMap && { hasMap: businessData.hasMap }),
    ...(businessData.aggregateRating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: businessData.aggregateRating.ratingValue,
        reviewCount: businessData.aggregateRating.reviewCount,
      },
    }),
  }
}

// Sayfa için JSON-LD yapılandırılmış veri oluşturmak için yardımcı fonksiyon
export function createFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }
}

// Email doğrulama fonksiyonu
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Telefon numarası doğrulama fonksiyonu
export function validatePhone(phone: string): { valid: boolean; formatted?: string; message?: string } {
  // Boş değer kontrolü
  if (!phone) return { valid: false, message: "Telefon numarası gereklidir" }

  // Sadece rakamları al
  const digits = phone.replace(/\D/g, "")

  // Türkiye telefon numarası formatı kontrolü (10 veya 11 rakam)
  if (digits.length === 10) {
    // 10 haneli numara (başında 0 olmadan)
    return {
      valid: true,
      formatted: digits.replace(/(\d{3})(\d{3})(\d{4})/, "0$1 $2 $3"),
    }
  } else if (digits.length === 11 && digits.startsWith("0")) {
    // 11 haneli numara (başında 0 ile)
    return {
      valid: true,
      formatted: digits.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, "$1$2 $3 $4"),
    }
  }

  return {
    valid: false,
    message: "Geçerli bir telefon numarası giriniz (0555 555 5555 formatında)",
  }
}

// Şifre güçlülük kontrolü
export function isStrongPassword(password: string): boolean {
  // En az 8 karakter, en az bir büyük harf, bir küçük harf ve bir rakam
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
  return passwordRegex.test(password)
}

// URL doğrulama fonksiyonu
export function validateUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch (e) {
    return false
  }
}

// Boş alan kontrolü
export function isEmpty(value: string): boolean {
  return value.trim() === ""
}

// Minimum uzunluk kontrolü
export function minLength(value: string, length: number): boolean {
  return value.length >= length
}

// Maksimum uzunluk kontrolü
export function maxLength(value: string, length: number): boolean {
  return value.length <= length
}

// Sayı kontrolü
export function isNumber(value: string): boolean {
  return !isNaN(Number(value))
}

// Tarih kontrolü (YYYY-MM-DD formatı)
export function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateString)) return false

  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

// UUID formatı kontrolü
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

// Form verilerini doğrulama fonksiyonu
export function validateFormData(formData: any): {
  isValid: boolean
  errors: Record<string, string>
  formattedData: any
} {
  const errors: Record<string, string> = {}
  const formattedData: any = { ...formData }
  let isValid = true

  // İşletme adı kontrolü
  if (isEmpty(formData.isletme_adi)) {
    errors.isletme_adi = "İşletme adı zorunludur"
    isValid = false
  }

  // Telefon numarası kontrolü
  const phoneValidation = validatePhone(formData.telefon)
  if (!phoneValidation.valid) {
    errors.telefon = phoneValidation.message
    isValid = false
  } else {
    formattedData.telefon = phoneValidation.formatted
  }

  // E-posta kontrolü
  if (formData.email && !validateEmail(formData.email)) {
    errors.email = "Geçerli bir e-posta adresi giriniz"
    isValid = false
  }

  // Web sitesi kontrolü
  if (formData.website && !validateUrl(formData.website)) {
    errors.website = "Geçerli bir web sitesi adresi giriniz"
    isValid = false
  }

  // Koordinatlar kontrolü
  if (formData.koordinatlar) {
    const koordinatlar = formData.koordinatlar.split(",").map((coord) => coord.trim())
    if (koordinatlar.length !== 2 || isNaN(Number(koordinatlar[0])) || isNaN(Number(koordinatlar[1]))) {
      errors.koordinatlar = "Geçerli koordinatlar giriniz (Örn: 41.0082, 28.9784)"
      isValid = false
    }
  }

  return { isValid, errors, formattedData }
}
