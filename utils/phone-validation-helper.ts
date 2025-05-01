/**
 * Telefon numarası doğrulama yardımcı fonksiyonu
 */

export function validatePhoneNumber(phone: string): { valid: boolean; formatted?: string; message?: string } {
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
