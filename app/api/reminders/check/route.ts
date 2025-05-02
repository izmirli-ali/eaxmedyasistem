import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ContentReminderService } from "@/lib/content-reminder-service"

// Vadesi geçmiş ve yaklaşan hatırlatmaları kontrol et
export async function GET(request: Request) {
  try {
    const supabase = createClient()

    // API anahtarını kontrol et
    const url = new URL(request.url)
    const apiKey = url.searchParams.get("apiKey")

    if (apiKey !== process.env.BACKUP_API_SECRET) {
      return NextResponse.json({ error: "Geçersiz API anahtarı" }, { status: 401 })
    }

    // Hatırlatma servisini başlat
    const reminderService = ContentReminderService.getInstance()

    // Vadesi geçmiş hatırlatmaları güncelle
    await reminderService.updateOverdueReminders()

    // Yaklaşan hatırlatmaları kontrol et ve bildirim gönder
    await reminderService.checkUpcomingReminders()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Hatırlatmalar kontrol edilirken hata:", error)
    return NextResponse.json({ error: "Hatırlatmalar kontrol edilirken bir hata oluştu" }, { status: 500 })
  }
}
