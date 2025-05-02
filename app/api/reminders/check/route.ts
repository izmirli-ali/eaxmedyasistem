import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = createClient()

    // Bugünün tarihini al
    const today = new Date()
    const formattedDate = today.toISOString().split("T")[0]

    // Bugün için hatırlatmaları getir
    const { data: reminders, error } = await supabase
      .from("content_reminders")
      .select("*")
      .eq("reminder_date", formattedDate)
      .eq("is_sent", false)

    if (error) {
      console.error("Hatırlatmalar alınırken hata:", error)
      return NextResponse.json({ error: "Hatırlatmalar alınırken hata oluştu" }, { status: 500 })
    }

    // Hatırlatma yoksa erken dön
    if (!reminders || reminders.length === 0) {
      return NextResponse.json({ message: "Bugün için hatırlatma bulunmamaktadır" })
    }

    // Her hatırlatma için bildirim oluştur
    const notifications = []
    for (const reminder of reminders) {
      // Bildirim oluştur
      const { data: notification, error: notificationError } = await supabase
        .from("notifications")
        .insert({
          user_id: reminder.user_id,
          title: "İçerik Hatırlatması",
          message: `${reminder.business_name} işletmesi için ${reminder.reminder_type} güncellemesi zamanı geldi.`,
          type: "reminder",
          related_id: reminder.id,
          is_read: false,
        })
        .select()
        .single()

      if (notificationError) {
        console.error("Bildirim oluşturulurken hata:", notificationError)
        continue
      }

      // Hatırlatmayı gönderildi olarak işaretle
      const { error: updateError } = await supabase
        .from("content_reminders")
        .update({ is_sent: true })
        .eq("id", reminder.id)

      if (updateError) {
        console.error("Hatırlatma güncellenirken hata:", updateError)
        continue
      }

      notifications.push(notification)
    }

    return NextResponse.json({
      message: `${notifications.length} hatırlatma işlendi`,
      notifications,
    })
  } catch (error) {
    console.error("Hatırlatma kontrolü sırasında hata:", error)
    return NextResponse.json({ error: "Hatırlatma kontrolü sırasında hata oluştu" }, { status: 500 })
  }
}
