import { NextResponse } from "next/server"
import { logger } from "@/lib/logger"
import { headers } from "next/headers"

export async function GET() {
  try {
    // Referrer kontrolü yap
    const headersList = headers()
    const referer = headersList.get("referer") || ""
    const origin = headersList.get("origin") || ""

    logger.info("Maps API key request", { referer, origin })

    const allowedDomains = [
      "localhost",
      "isletmenionecikar.com",
      "www.isletmenionecikar.com",
      "isletme-yonetim-sistemi.vercel.app",
      "vercel.app", // Tüm Vercel preview URL'leri için
    ]

    const isAllowedReferrer = allowedDomains.some((domain) => referer.includes(domain) || origin.includes(domain))

    if (!isAllowedReferrer && referer !== "" && origin !== "") {
      logger.warn("Unauthorized maps API key request", { referer, origin })
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // API anahtarını döndür
    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      logger.error("Google Maps API key is not defined in environment variables")
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    return NextResponse.json({ apiKey })
  } catch (error) {
    logger.error("Error fetching maps API key", { error })
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
