import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { ContentReminderService, type ReminderStatus, ReminderPriority } from "@/lib/content-reminder-service"

//  ReminderStatus, ReminderType, ReminderPriority } from "@/lib/content-reminder-service"

// Hatırlatmaları listele
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Kullanıcı oturumunu kontrol et
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor" }, { status: 401 })
    }

    // URL parametrelerini al
    const url = new URL(request.url)
    const status = url.searchParams.get("status") as ReminderStatus
    const isletmeId = url.searchParams.get("isletmeId")

    // Hatırlatma servisini başlat
    const reminderService = ContentReminderService.getInstance()

    // Hatırlatmaları listele
    const reminders = await reminderService.listReminders(session.user.id, status, isletmeId)

    return NextResponse.json({ reminders })
  } catch (error) {
    console.error("Hatırlatmalar listelenirken hata:", error)
    return NextResponse.json({ error: "Hatırlatmalar listelenirken bir hata oluştu" }, { status: 500 })
  }
}

// Yeni hatırlatma oluştur
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
    const { isletmeId, type, title, description, priority, dueDate, recurrence, metadata } = body

    if (!isletmeId || !type || !title || !description) {
      return NextResponse.json({ error: "Geçersiz istek. Eksik parametreler" }, { status: 400 })
    }

    // Hatırlatma servisini başlat
    const reminderService = ContentReminderService.getInstance()

    // Hatırlatma oluştur
    const reminder = await reminderService.createReminder(
      session.user.id,
      isletmeId,
      type,
      title,
      description,
      priority || ReminderPriority.MEDIUM,
      dueDate ? new Date(dueDate) : undefined,
      recurrence,
      metadata,
    )

    return NextResponse.json({ reminder })
  } catch (error) {
    console.error("Hatırlatma oluşturulurken hata:", error)
    return NextResponse.json({ error: "Hatırlatma oluşturulurken bir hata oluştu" }, { status: 500 })
  }
}

// Hatırlatma durumunu güncelle
export async function PATCH(request: NextRequest) {
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
    const { reminderId, status, metadata } = body

    if (!reminderId || !status) {
      return NextResponse.json({ error: "Geçersiz istek. Eksik parametreler" }, { status: 400 })
    }

    // Hatırlatma servisini başlat
    const reminderService = ContentReminderService.getInstance()

    // Hatırlatma durumunu güncelle
    await reminderService.updateReminderStatus(reminderId, status, metadata)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Hatırlatma durumu güncellenirken hata:", error)
    return NextResponse.json({ error: "Hatırlatma durumu güncellenirken bir hata oluştu" }, { status: 500 })
  }
}
