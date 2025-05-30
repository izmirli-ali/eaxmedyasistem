import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { BacklinkTracker } from "@/lib/backlink-tracker"

export async function GET() {
  try {
    const supabase = createClient()

    // Kullanıcı oturumunu kontrol et
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor" }, { status: 401 })
    }

    // Kullanıcının admin olup olmadığını kontrol et
    const { data: user, error: userError } = await supabase
      .from("kullanicilar")
      .select("rol")
      .eq("id", session.user.id)
      .single()

    if (userError || user.rol !== "admin") {
      return NextResponse.json({ error: "Bu işlem için yetkiniz yok" }, { status: 403 })
    }

    // Backlink takip servisini başlat
    const backlinkTracker = BacklinkTracker.getInstance()

    // Zamanı gelen backlinkleri kontrol et
    const updatedCount = await backlinkTracker.checkDueBacklinks()

    return NextResponse.json({
      success: true,
      message: `${updatedCount} backlink kontrol edildi`,
      updatedCount,
    })
  } catch (error) {
    console.error("Backlink kontrolü sırasında hata:", error)
    return NextResponse.json({ error: "Backlink kontrolü sırasında bir hata oluştu" }, { status: 500 })
  }
}
