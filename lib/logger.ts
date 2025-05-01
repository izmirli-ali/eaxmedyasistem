/**
 * Basit bir loglama modülü
 */

// Log seviyeleri
type LogLevel = "debug" | "info" | "warn" | "error"

// Log fonksiyonu tipi
type LogFunction = (message: string, ...args: any[]) => void

// Logger arayüzü
interface Logger {
  debug: LogFunction
  info: LogFunction
  warn: LogFunction
  error: LogFunction
}

// Log seviyesi kontrolü
const shouldLog = (level: LogLevel): boolean => {
  const envLogLevel = process.env.LOG_LEVEL || "info"
  const levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  }

  return levels[level] >= levels[envLogLevel as LogLevel]
}

// Loglama fonksiyonu
const log = (level: LogLevel, message: string, ...args: any[]): void => {
  if (!shouldLog(level)) return

  const timestamp = new Date().toISOString()
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`

  // Geliştirme ortamında konsola log
  if (process.env.NODE_ENV === "development") {
    switch (level) {
      case "debug":
        console.debug(prefix, message, ...args)
        break
      case "info":
        console.info(prefix, message, ...args)
        break
      case "warn":
        console.warn(prefix, message, ...args)
        break
      case "error":
        console.error(prefix, message, ...args)
        break
    }
  } else {
    // Üretim ortamında sadece önemli logları göster
    if (level === "error" || level === "warn") {
      console[level](prefix, message, ...args)
    }
  }

  // Burada ek loglama servisleri eklenebilir (örn. Sentry, LogRocket, vb.)
}

// Logger nesnesi
export const logger: Logger = {
  debug: (message: string, ...args: any[]) => log("debug", message, ...args),
  info: (message: string, ...args: any[]) => log("info", message, ...args),
  warn: (message: string, ...args: any[]) => log("warn", message, ...args),
  error: (message: string, ...args: any[]) => log("error", message, ...args),
}

// Hata yakalama yardımcısı
export const logError = (error: any, context?: string): void => {
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorStack = error instanceof Error ? error.stack : undefined

  logger.error(`${context ? `[${context}] ` : ""}${errorMessage}`, {
    stack: errorStack,
    ...(error.code && { code: error.code }),
    ...(error.status && { status: error.status }),
  })
}
