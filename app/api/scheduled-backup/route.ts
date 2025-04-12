import { NextResponse } from "next/server"
import { runScheduledBackup } from "@/lib/scheduled-backup"
import { createClient } from "@/lib/supabase/server"

// Güvenlik anahtarı - bu anahtarı .env dosyasında saklamalısınız
const API_SECRET_KEY = process.env.BACKUP_API_SECRET || "backup-secret-key-change-this"

export async function GET(request: Request) {
  try {
    // URL'den API anahtarını al
    const url = new URL(request.url)
    const apiKey = url.searchParams.get("key")

    // API anahtarını doğrula
    if (apiKey !== API_SECRET_KEY) {
      console.warn("Geçersiz API anahtarı ile yedekleme denemesi")
      return NextResponse.json({ error: "Geçersiz API anahtarı" }, { status: 401 })
    }

    // Yedekleme işlemini başlat
    const result = await runScheduledBackup()

    // Yedekleme başarılı ise
    if (result.success) {
      // Yedekleme kaydını logla
      await logBackupActivity(result.backupId, "success", "Otomatik yedekleme başarıyla tamamlandı")
      return NextResponse.json({ success: true, message: result.message, backupId: result.backupId })
    } else {
      // Yedekleme başarısız ise
      await logBackupActivity(null, "error", `Yedekleme hatası: ${result.error}`)
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }
  } catch (error) {
    console.error("Otomatik yedekleme API hatası:", error)
    return NextResponse.json({ error: "Yedekleme işlemi sırasında bir hata oluştu" }, { status: 500 })
  }
}

// Yedekleme aktivitesini logla
async function logBackupActivity(backupId: string | null, status: "success" | "error", message: string) {
  try {
    const supabase = createClient()

    // Aktivite logu oluştur
    await supabase.from("system_logs").insert([
      {
        action: "scheduled_backup",
        status,
        details: {
          backupId,
          message,
          timestamp: new Date().toISOString(),
        },
      },
    ])
  } catch (error) {
    console.error("Yedekleme logu kaydedilirken hata:", error)
  }
}
