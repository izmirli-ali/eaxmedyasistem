import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ContentReminderService } from "@/lib/content-reminder-service"

// İşletme için otomatik hatırlatmalar oluştur
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Kullanıcı oturumunu kontrol et
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor" }, { status: 401 })
    }

    // İstek gövdesini al
    const body = await request.json()
    const { isletmeId } = body

    if (!isletmeId) {
      return NextResponse.json({ error: "Geçersiz istek. İşletme ID'si eksik" }, { status: 400 })
    }

    // İşletmenin kullanıcıya ait olup olmadığını kontrol et
    const { data: isletmeData, error: isletmeError } = await supabase
      .from("isletmeler")
      .select("id")
      .eq("id", isletmeId)
      .eq("kullanici_id", session.user.id)
      .single()

    if (isletmeError || !isletmeData) {
      return NextResponse.json({ error: "Bu işletme size ait değil veya bulunamadı" }, { status: 403 })
    }

    // Hatırlatma servisini başlat
    const reminderService = ContentReminderService.getInstance()

    // Otomatik hatırlatmalar oluştur
    await reminderService.createAutomaticReminders(isletmeId, session.user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Otomatik hatırlatmalar oluşturulurken hata:", error)
    return NextResponse.json({ error: "Otomatik hatırlatmalar oluşturulurken bir hata oluştu" }, { status: 500 })
  }
}
