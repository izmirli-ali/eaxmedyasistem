/**
 * Telefon numarasını formatlar (0xxx xxx xx xx)
 */
export function formatPhoneNumber(value: string): string {
  if (!value) return value

  // Sadece rakamları al
  const phoneNumber = value.replace(/\D/g, "")

  // Telefon numarası formatı
  if (phoneNumber.length < 4) return phoneNumber
  if (phoneNumber.length < 7) return `${phoneNumber.slice(0, 4)} ${phoneNumber.slice(4)}`
  if (phoneNumber.length < 9) return `${phoneNumber.slice(0, 4)} ${phoneNumber.slice(4, 7)} ${phoneNumber.slice(7)}`
  return `${phoneNumber.slice(0, 4)} ${phoneNumber.slice(4, 7)} ${phoneNumber.slice(7, 9)} ${phoneNumber.slice(9, 11)}`
}

/**
 * Formatlanmış telefon numarasından sadece rakamları alır
 */
export function unformatPhoneNumber(value: string): string {
  return value.replace(/[^\d]/g, "")
}

/**
 * URL dostu slug oluşturur
 * @param text Slugify yapılacak metin
 * @returns URL dostu slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "")
}
