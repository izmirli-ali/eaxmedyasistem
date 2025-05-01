import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    console.log("[API] Supabase bağlantısı test ediliyor...")

    const supabase = createClient()

    // Basit bir sorgu yap
    const { data, error } = await supabase.from("site_ayarlari").select("*").limit(1)

    if (error) {
      console.error("[API] Supabase sorgu hatası:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Supabase bağlantısı başarılı",
      data: data,
    })
  } catch (error) {
    console.error("[API] Supabase test hatası:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Bilinmeyen hata",
      },
      { status: 500 },
    )
  }
}
