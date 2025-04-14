// Email doğrulama fonksiyonu
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Telefon numarası doğrulama fonksiyonu
export function validatePhone(phone: string): boolean {
  // Türkiye telefon numarası formatı: +90 5XX XXX XX XX veya 05XX XXX XX XX
  const phoneRegex = /^(\+90|0)?\s*5\d{2}\s*\d{3}\s*\d{2}\s*\d{2}$/
  return phoneRegex.test(phone)
}

// Şifre doğrulama fonksiyonu
export function validatePassword(password: string): boolean {
  // En az 8 karakter, en az bir büyük harf, bir küçük harf ve bir rakam
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
  return passwordRegex.test(password)
}

// URL doğrulama fonksiyonu
export function validateURL(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch (e) {
    return false
  }
}

// UUID doğrulama fonksiyonu
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

// Boş değer kontrolü
export function isEmpty(value: string | null | undefined): boolean {
  return value === null || value === undefined || value.trim() === ""
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

// Pozitif sayı kontrolü
export function isPositiveNumber(value: string): boolean {
  const num = Number(value)
  return !isNaN(num) && num > 0
}

// Tarih formatı kontrolü (YYYY-MM-DD)
export function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateString)) return false

  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

// Türkçe karakter içerip içermediğini kontrol et
export function containsTurkishChars(text: string): boolean {
  const turkishChars = /[çğıöşüÇĞİÖŞÜ]/
  return turkishChars.test(text)
}

// Sadece harf ve rakam içerip içermediğini kontrol et
export function isAlphanumeric(text: string): boolean {
  const alphanumericRegex = /^[a-zA-Z0-9]+$/
  return alphanumericRegex.test(text)
}

// Sadece harf içerip içermediğini kontrol et
export function isAlphabetic(text: string): boolean {
  const alphabeticRegex = /^[a-zA-Z]+$/
  return alphabeticRegex.test(text)
}

// TC Kimlik Numarası doğrulama
export function validateTCKN(tckn: string): boolean {
  if (!/^[0-9]{11}$/.test(tckn)) return false

  const digits = tckn.split("").map(Number)

  // İlk 10 hane için algoritma kontrolü
  const odd = digits[0] + digits[2] + digits[4] + digits[6] + digits[8]
  const even = digits[1] + digits[3] + digits[5] + digits[7]
  const digit10 = (odd * 7 - even) % 10

  // Son hane için algoritma kontrolü
  const sum = digits.slice(0, 10).reduce((acc, val) => acc + val, 0)
  const digit11 = sum % 10

  return digit10 === digits[9] && digit11 === digits[10]
}

// Kredi kartı numarası doğrulama (Luhn algoritması)
export function validateCreditCard(cardNumber: string): boolean {
  // Boşlukları kaldır
  const sanitized = cardNumber.replace(/\s+/g, "")

  if (!/^\d+$/.test(sanitized)) return false
  if (sanitized.length < 13 || sanitized.length > 19) return false

  // Luhn algoritması
  let sum = 0
  let double = false

  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = Number.parseInt(sanitized.charAt(i))

    if (double) {
      digit *= 2
      if (digit > 9) digit -= 9
    }

    sum += digit
    double = !double
  }

  return sum % 10 === 0
}
