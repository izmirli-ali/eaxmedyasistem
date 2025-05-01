/**
 * Hata işleme yardımcı fonksiyonları
 * Bu modül, uygulama genelinde hata yönetimini kolaylaştırmak için kullanılır.
 */

import { logger } from "@/lib/logger"

/**
 * Özel hata sınıfı
 */
export class AppError extends Error {
  code: string
  originalError?: any

  constructor(message: string, code: string, originalError?: any) {
    super(message)
    this.name = "AppError"
    this.code = code
    this.originalError = originalError

    // Error sınıfının prototype zincirini düzelt
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

/**
 * Hata işleyici
 * @param error Hata nesnesi
 * @param context Hata bağlamı (loglama için)
 * @returns Hata mesajı
 */
export function handleError(error: any, context?: string): { message: string; code?: string } {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorCode = error instanceof AppError ? error.code : "UNKNOWN_ERROR"

  // Hatayı logla
  logger.error(`${context ? `[${context}] ` : ""}${errorMessage}`, {
    stack: error instanceof Error ? error.stack : undefined,
    ...(error.code && { code: error.code }),
    ...(error.status && { status: error.status }),
  })

  return {
    message: errorMessage,
    code: errorCode,
  }
}

/**
 * Try-catch bloğunu basitleştiren yardımcı fonksiyon
 * @param fn Denenecek fonksiyon
 * @param context Hata bağlamı (loglama için)
 * @returns Fonksiyonun sonucu veya hata
 */
export async function tryCatch<T>(fn: () => Promise<T>, context?: string): Promise<T | null> {
  try {
    return await fn()
  } catch (error: any) {
    handleError(error, context)
    return null
  }
}
