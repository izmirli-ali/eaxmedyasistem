import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { runScheduledBackup } from "@/lib/scheduled-backup"

export async function GET(request: NextRequest) {
  try {
    // API anahtarını kontrol et
    const url = new URL(request.url)
    const key = url.searchParams.get("key")

    // Çevre değişkeninden API anahtarını al
    const apiSecret = process.env.BACKUP_API_SECRET

    if (!apiSecret || key !== apiSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = createClient()

    // Yedekleme zamanlamasını kontrol et
    const { data: schedule, error: scheduleError } = await supabase
      .from("backup_schedules")
      .select("*")
      .eq("id", 1)
      .single()

    if (scheduleError) {
      return NextResponse.json(
        { error: "Yedekleme zamanlaması bulunamadı", details: scheduleError.message },
        { status: 404 },
      )
    }

    // Zamanlama etkin değilse çık
    if (!schedule.enabled) {
      return NextResponse.json({ message: "Otomatik yedekleme devre dışı" })
    }

    // Şu anki zamanı al
    const now = new Date()

    // Bir sonraki çalışma zamanı ayarlanmamışsa veya geçmişse
    if (!schedule.next_run || new Date(schedule.next_run) <= now) {
      // Yedeklemeyi çalıştır
      const result = await runScheduledBackup()

      // Bir sonraki çalışma zamanını hesapla
      const nextRun = calculateNextRun(schedule)

      // Zamanlama bilgisini güncelle
      await supabase
        .from("backup_schedules")
        .update({
          last_run: now.toISOString(),
          next_run: nextRun.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq("id", 1)

      return NextResponse.json({
        message: "Otomatik yedekleme başlatıldı",
        result,
        nextRun: nextRun.toISOString(),
      })
    }

    // Henüz çalışma zamanı gelmemiş
    return NextResponse.json({
      message: "Henüz çalışma zamanı gelmedi",
      nextRun: schedule.next_run,
    })
  } catch (error) {
    console.error("Otomatik yedekleme kontrolü sırasında hata:", error)
    return NextResponse.json(
      { error: "Otomatik yedekleme kontrolü sırasında bir hata oluştu", details: error.message },
      { status: 500 },
    )
  }
}

// Bir sonraki çalışma zamanını hesapla
function calculateNextRun(schedule) {
  const now = new Date()
  const [hours, minutes, seconds] = schedule.time_of_day.split(":").map(Number)
  const nextRun = new Date(now)

  nextRun.setHours(hours, minutes, seconds || 0, 0)

  // Eğer belirtilen zaman bugün geçtiyse, bir sonraki periyoda ayarla
  if (nextRun <= now) {
    if (schedule.frequency === "daily") {
      nextRun.setDate(nextRun.getDate() + 1)
    } else if (schedule.frequency === "weekly") {
      // Haftanın gününe ayarla (1-7, Pazartesi-Pazar)
      const currentDay = nextRun.getDay() || 7 // JS'de 0-6, Pazar-Cumartesi, biz 1-7 Pazartesi-Pazar kullanıyoruz
      const daysToAdd = (schedule.day_of_week - currentDay + 7) % 7 || 7
      nextRun.setDate(nextRun.getDate() + daysToAdd)
    } else if (schedule.frequency === "monthly") {
      // Ayın gününe ayarla
      nextRun.setDate(schedule.day_of_month)
      // Eğer bu ay geçtiyse, bir sonraki aya ayarla
      if (nextRun <= now) {
        nextRun.setMonth(nextRun.getMonth() + 1)
      }
    }
  }

  return nextRun
}
