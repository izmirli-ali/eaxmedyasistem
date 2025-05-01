import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"

export async function GET() {
  try {
    // Sadece sunucu tarafı API anahtarını kontrol et
    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    // Güvenlik için API anahtarının ilk ve son 4 karakterini göster
    const maskApiKey = (key: string | undefined) => {
      if (!key) return "undefined"
      if (key.length <= 8) return "***"
      return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`
    }

    logger.info("Test Maps API", {
      hasApiKey: !!apiKey,
      apiKeyMasked: maskApiKey(apiKey),
    })

    return NextResponse.json({
      success: true,
      hasApiKey: !!apiKey,
      message: "API anahtarı durumu kontrol edildi",
    })
  } catch (error) {
    logger.error("Error in test-maps endpoint", { error })
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
