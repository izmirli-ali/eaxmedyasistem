/**
 * Telefon numarasını formatlar
 * @param phoneNumber Formatlanacak telefon numarası
 * @returns Formatlanmış telefon numarası
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Sadece rakamları al
  const digitsOnly = phoneNumber.replace(/\D/g, "")

  // Format: (0xxx) xxx xx xx
  if (digitsOnly.length <= 11) {
    if (digitsOnly.length === 0) {
      return ""
    } else if (digitsOnly.length <= 4) {
      return `(${digitsOnly}`
    } else if (digitsOnly.length <= 7) {
      return `(${digitsOnly.substring(0, 4)}) ${digitsOnly.substring(4)}`
    } else if (digitsOnly.length <= 9) {
      return `(${digitsOnly.substring(0, 4)}) ${digitsOnly.substring(4, 7)} ${digitsOnly.substring(7)}`
    } else {
      return `(${digitsOnly.substring(0, 4)}) ${digitsOnly.substring(4, 7)} ${digitsOnly.substring(7, 9)} ${digitsOnly.substring(9)}`
    }
  }

  return phoneNumber
}

/**
 * Formatlanmış telefon numarasını temizler
 * @param phoneNumber Temizlenecek telefon numarası
 * @returns Sadece rakamlardan oluşan telefon numarası
 */
export function unformatPhoneNumber(phoneNumber: string): string {
  return phoneNumber.replace(/\D/g, "")
}
