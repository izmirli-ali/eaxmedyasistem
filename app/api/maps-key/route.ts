import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Sunucu tarafı API anahtarını kullan
    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      console.error("GOOGLE_MAPS_API_KEY çevre değişkeni tanımlanmamış")
      return NextResponse.json({ error: "API anahtarı bulunamadı" }, { status: 500 })
    }

    // API anahtarını istemciye gönder
    return NextResponse.json({ apiKey })
  } catch (error) {
    console.error("Maps API anahtarı alınırken hata:", error)
    return NextResponse.json({ error: "API anahtarı alınırken bir hata oluştu" }, { status: 500 })
  }
}
