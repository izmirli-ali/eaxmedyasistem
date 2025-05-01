import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
}

/**
 * Telefon numarasını formatlar
 * @param phone Formatlanacak telefon numarası
 * @returns Formatlanmış telefon numarası
 */
export function formatPhoneNumber(phone: string): string {
  // Sadece rakamları al
  const cleaned = ("" + phone).replace(/\D/g, "")

  // Türkiye formatı: 0(555) 123 45 67
  const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{2})(\d{2})$/)
  if (match) {
    return `${match[1]}(${match[2]}) ${match[3]} ${match[4]} ${match[5]}`
  }

  return phone
}

/**
 * Para birimini formatlar
 * @param amount Formatlanacak miktar
 * @param currency Para birimi (varsayılan: TRY)
 * @returns Formatlanmış para birimi
 */
export function formatCurrency(amount: number, currency = "TRY"): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: currency,
  }).format(amount)
}

/**
 * Tarihi formatlar
 * @param date Formatlanacak tarih
 * @param format Format türü (long, short, time)
 * @returns Formatlanmış tarih
 */
export function formatDate(date: Date | string, format: "long" | "short" | "time" = "short"): string {
  const d = typeof date === "string" ? new Date(date) : date

  if (format === "long") {
    return d.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } else if (format === "time") {
    return d.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  } else {
    return d.toLocaleDateString("tr-TR")
  }
}

/**
 * Metni kısaltır
 * @param text Kısaltılacak metin
 * @param maxLength Maksimum uzunluk
 * @returns Kısaltılmış metin
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

/**
 * Dosya boyutunu formatlar
 * @param bytes Bayt cinsinden dosya boyutu
 * @returns Formatlanmış dosya boyutu
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}
