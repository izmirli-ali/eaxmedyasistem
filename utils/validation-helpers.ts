// Email doğrulama fonksiyonu
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Telefon numarası doğrulama fonksiyonu
export function validatePhone(phone: string): boolean {
  // Türkiye telefon formatı: +90 5XX XXX XX XX veya 05XX XXX XX XX
  const phoneRegex = /^(\+90|0)?\s*5\d{2}\s*\d{3}\s*\d{2}\s*\d{2}$/
  return phoneRegex.test(phone)
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
