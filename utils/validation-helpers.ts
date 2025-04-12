/**
 * Veri doğrulama yardımcı fonksiyonları
 */

// Telefon numarası doğrulama
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
  } else if (digits.length >= 10) {
    // En az 10 rakam varsa, son 10 rakamı al ve formatla
    const lastTenDigits = digits.slice(-10)
    return {
      valid: true,
      formatted: "0" + lastTenDigits.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3"),
    }
  }

  return {
    valid: false,
    message: "Geçerli bir telefon numarası giriniz (0555 555 5555 formatında)",
  }
}

// E-posta doğrulama
export function validateEmail(email: string): { valid: boolean; message?: string } {
  if (!email) return { valid: true } // E-posta zorunlu değil

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, message: "Geçerli bir e-posta adresi giriniz" }
  }

  return { valid: true }
}

// Web sitesi doğrulama
export function validateWebsite(website: string): { valid: boolean; formatted?: string; message?: string } {
  if (!website) return { valid: true } // Web sitesi zorunlu değil

  // URL formatı kontrolü
  let formattedWebsite = website

  // http:// veya https:// ile başlamıyorsa ekle
  if (!/^https?:\/\//i.test(website)) {
    formattedWebsite = "https://" + website
  }

  try {
    new URL(formattedWebsite)
    return { valid: true, formatted: formattedWebsite }
  } catch (e) {
    return { valid: false, message: "Geçerli bir web sitesi adresi giriniz" }
  }
}

// Koordinat doğrulama
export function validateCoordinates(coordinates: string): { valid: boolean; message?: string } {
  // Boş veya undefined değer kontrolü
  if (!coordinates || coordinates.trim() === "") return { valid: true }

  // Koordinat formatı: "enlem,boylam" (örn: "41.0082,28.9784")
  const coordRegex = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/

  if (!coordRegex.test(coordinates)) {
    return { valid: false, message: "Koordinatlar 'enlem,boylam' formatında olmalıdır (örn: 41.0082,28.9784)" }
  }

  // Değerlerin geçerli aralıkta olup olmadığını kontrol et
  const [lat, lng] = coordinates.split(",").map(Number)

  if (lat < -90 || lat > 90) {
    return { valid: false, message: "Enlem değeri -90 ile 90 arasında olmalıdır" }
  }

  if (lng < -180 || lng > 180) {
    return { valid: false, message: "Boylam değeri -180 ile 180 arasında olmalıdır" }
  }

  return { valid: true }
}

// Adres doğrulama
export function validateAddress(address: string): { valid: boolean; message?: string } {
  if (!address) return { valid: true } // Adres zorunlu değil

  if (address.length < 10) {
    return { valid: false, message: "Adres çok kısa, lütfen tam adresi giriniz" }
  }

  return { valid: true }
}

// Tüm form verilerini doğrula
export function validateFormData(formData: any): {
  isValid: boolean
  errors: Record<string, string>
  formattedData: any
} {
  const errors: Record<string, string> = {}
  const formattedData = { ...formData }

  // İşletme adı kontrolü
  if (!formData.isletme_adi || formData.isletme_adi.trim().length < 2) {
    errors.isletme_adi = "İşletme adı en az 2 karakter olmalıdır"
  }

  // Telefon kontrolü
  const phoneResult = validatePhone(formData.telefon)
  if (!phoneResult.valid) {
    errors.telefon = phoneResult.message || "Geçerli bir telefon numarası giriniz"
  } else if (phoneResult.formatted) {
    formattedData.telefon = phoneResult.formatted
  }

  // E-posta kontrolü
  const emailResult = validateEmail(formData.email)
  if (!emailResult.valid) {
    errors.email = emailResult.message || "Geçerli bir e-posta adresi giriniz"
  }

  // Web sitesi kontrolü
  const websiteResult = validateWebsite(formData.website)
  if (!websiteResult.valid) {
    errors.website = websiteResult.message || "Geçerli bir web sitesi adresi giriniz"
  } else if (websiteResult.formatted) {
    formattedData.website = websiteResult.formatted
  }

  // Koordinat kontrolü
  const coordResult = validateCoordinates(formData.koordinatlar)
  if (!coordResult.valid) {
    errors.koordinatlar = coordResult.message || "Geçerli koordinatlar giriniz"
  }

  // Adres kontrolü
  const addressResult = validateAddress(formData.adres)
  if (!addressResult.valid) {
    errors.adres = addressResult.message || "Geçerli bir adres giriniz"
  }

  // Şehir kontrolü
  if (!formData.sehir) {
    errors.sehir = "Şehir seçimi zorunludur"
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    formattedData,
  }
}
