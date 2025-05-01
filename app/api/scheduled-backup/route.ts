import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { runScheduledBackup } from "@/lib/scheduled-backup"
import { csrfProtect } from "@/lib/csrf-protection"
import { logger } from "@/lib/logger"
import { createClient } from "@/lib/supabase/client"
import crypto from "crypto"

// API anahtarı için çevre değişkeni
const API_SECRET_KEY = process.env.BACKUP_API_SECRET

if (!API_SECRET_KEY) {
  logger.error("BACKUP_API_SECRET çevre değişkeni tanımlanmamış!")
}

// Zamanlanmış yedekleme API endpoint'i
export async function GET(request: NextRequest) {
  try {
    // URL'den API anahtarını ve zaman damgasını al
    const url = new URL(request.url)
    const apiKey = url.searchParams.get("key")
    const timestamp = url.searchParams.get("timestamp")

    // API anahtarını doğrula
    if (!validateApiKey(apiKey, timestamp)) {
      logger.warn("Geçersiz API anahtarı ile yedekleme denemesi", {
        ip: request.ip || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      })
      return NextResponse.json({ error: "Geçersiz API anahtarı veya zaman damgası" }, { status: 401 })
    }

    // Rate limiting kontrolü
    const rateLimitResult = await checkRateLimit(request)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit aşıldı",
          retryAfter: rateLimitResult.retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimitResult.retryAfter || 60),
          },
        },
      )
    }

    // Yedekleme işlemini başlat
    const result = await runScheduledBackup()

    return NextResponse.json(result)
  } catch (error: any) {
    logger.error("Otomatik yedekleme API hatası:", error)
    return NextResponse.json(
      {
        error: "Yedekleme işlemi sırasında bir hata oluştu",
        message: error.message || "Bilinmeyen hata",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

// POST isteği için CSRF koruması ekle
export async function POST(request: NextRequest) {
  // CSRF koruması kontrol et
  if (!(await csrfProtect(request))) {
    logger.warn("Geçersiz CSRF token ile yedekleme denemesi", {
      ip: request.ip || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
    })
    return NextResponse.json({ error: "Geçersiz CSRF token" }, { status: 403 })
  }

  try {
    // Rate limiting kontrolü
    const rateLimitResult = await checkRateLimit(request)
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit aşıldı",
          retryAfter: rateLimitResult.retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimitResult.retryAfter || 60),
          },
        },
      )
    }

    // İstek gövdesini al
    const body = await request.json()
    const { apiKey, timestamp } = body

    // API anahtarını doğrula
    if (!validateApiKey(apiKey, timestamp)) {
      logger.warn("Geçersiz API anahtarı ile yedekleme denemesi", {
        ip: request.ip || "unknown",
        userAgent: request.headers.get("user-agent") || "unknown",
      })
      return NextResponse.json({ error: "Geçersiz API anahtarı veya zaman damgası" }, { status: 401 })
    }

    // Yedekleme işlemini başlat
    const result = await runScheduledBackup()

    return NextResponse.json(result)
  } catch (error: any) {
    logger.error("Otomatik yedekleme API hatası:", error)
    return NextResponse.json(
      {
        error: "Yedekleme işlemi sırasında bir hata oluştu",
        message: error.message || "Bilinmeyen hata",
      },
      { status: 500 },
    )
  }
}

// HMAC tabanlı API anahtarı doğrulama
function validateApiKey(apiKey: string | null, timestamp: string | null): boolean {
  if (!apiKey || !timestamp || !API_SECRET_KEY) return false

  // Zaman damgası kontrolü (5 dakikadan eski istekleri reddet)
  const timestampNum = Number.parseInt(timestamp, 10)
  if (isNaN(timestampNum) || Date.now() - timestampNum > 5 * 60 * 1000) {
    return false
  }

  const message = `${timestamp}:backup-operation`
  const expectedSignature = crypto.createHmac("sha256", API_SECRET_KEY).update(message).digest("hex")

  return apiKey === expectedSignature
}

// Rate limiting kontrolü - Supabase kullanarak kalıcı depolama
async function checkRateLimit(request: NextRequest): Promise<{
  allowed: boolean
  limit: number
  remaining: number
  retryAfter?: number
}> {
  const ip = request.ip || "unknown"
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 dakika
  const maxRequests = 5 // 1 dakikada maksimum 5 istek
  const supabase = createClient()

  try {
    // Mevcut rate limit kaydını getir
    const { data, error } = await supabase.from("rate_limits").select("*").eq("ip", ip).single()

    if (error && error.code !== "PGRST116") {
      // PGRST116: Kayıt bulunamadı hatası
      throw error
    }

    let requests: number[] = []

    if (data) {
      // Mevcut istekleri al
      requests = data.requests || []
      // Pencere dışındaki istekleri temizle
      requests = requests.filter((timestamp) => now - timestamp < windowMs)
    }

    // İstek limitini kontrol et
    if (requests.length >= maxRequests) {
      // Bir sonraki isteğin ne zaman yapılabileceğini hesapla
      const oldestRequest = Math.min(...requests)
      const retryAfter = Math.ceil((oldestRequest + windowMs - now) / 1000)

      return {
        allowed: false,
        limit: maxRequests,
        remaining: 0,
        retryAfter,
      }
    }

    // Yeni isteği ekle
    requests.push(now)

    // Rate limit kaydını güncelle veya oluştur
    await supabase.from("rate_limits").upsert({
      ip,
      requests,
      updated_at: new Date().toISOString(),
    })

    return {
      allowed: true,
      limit: maxRequests,
      remaining: maxRequests - requests.length,
    }
  } catch (error) {
    logger.error("Rate limiting hatası:", error)
    // Hata durumunda isteğe izin ver, ancak logla
    return { allowed: true, limit: maxRequests, remaining: 1 }
  }
}
