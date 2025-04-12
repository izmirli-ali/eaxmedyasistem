/**
 * Otomatik yedekleme servisi
 * Bu servis, düzenli aralıklarla veritabanı yedeklemesi yapar
 */

import { startBackup, getBackups } from "./backup-service"
import { createClient } from "./supabase"

// Yedeklenecek tabloların listesi
const TABLES_TO_BACKUP = ["isletmeler", "kullanicilar", "musteriler", "site_ayarlari", "notifications", "tasks"]

// Son 10 yedeklemeyi sakla, diğerlerini temizle
const MAX_BACKUPS_TO_KEEP = 10

// Yedekleme işlemini daha güvenli hale getirelim
export async function runScheduledBackup() {
  try {
    console.log("Otomatik yedekleme başlatılıyor...")

    // Yedekleme işlemi başlamadan önce sistem log kaydı oluştur
    await logBackupActivity("start", "Otomatik yedekleme başlatıldı")

    // Yeni yedekleme başlat
    const backup = await startBackup(TABLES_TO_BACKUP)

    console.log(`Yedekleme başlatıldı: ${backup.id}`)

    // Eski yedeklemeleri temizle
    await cleanupOldBackups()

    // Başarılı yedekleme log kaydı
    await logBackupActivity("success", `Otomatik yedekleme tamamlandı: ${backup.id}`)

    return {
      success: true,
      backupId: backup.id,
      message: "Otomatik yedekleme başarıyla başlatıldı",
    }
  } catch (error) {
    console.error("Otomatik yedekleme hatası:", error)

    // Hata log kaydı
    await logBackupActivity("error", `Otomatik yedekleme hatası: ${error.message}`)

    return {
      success: false,
      error: error.message || "Bilinmeyen hata",
      message: "Otomatik yedekleme başlatılırken hata oluştu",
    }
  }
}

// Yedekleme aktivitesini logla
async function logBackupActivity(status, message) {
  const supabase = createClient()

  try {
    await supabase.from("system_logs").insert([
      {
        action: "scheduled_backup",
        status,
        details: {
          message,
          timestamp: new Date().toISOString(),
        },
      },
    ])
  } catch (error) {
    console.error("Yedekleme log kaydı oluşturulurken hata:", error)
  }
}

/**
 * Eski yedeklemeleri temizler
 */
async function cleanupOldBackups() {
  try {
    // Tüm yedeklemeleri al
    const backups = await getBackups()

    // Tamamlanmış yedeklemeleri tarihe göre sırala (en yeniden en eskiye)
    const completedBackups = backups
      .filter((b) => b.status === "completed")
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // Maksimum sayıdan fazla yedekleme varsa, en eskileri sil
    if (completedBackups.length > MAX_BACKUPS_TO_KEEP) {
      const backupsToDelete = completedBackups.slice(MAX_BACKUPS_TO_KEEP)

      console.log(`${backupsToDelete.length} eski yedekleme temizleniyor...`)

      // Silme işlemlerini gerçekleştir
      // Not: Bu kısmı şimdilik yorum olarak bırakıyoruz, gerçek silme işlemi için aktifleştirilebilir
      /*
      for (const backup of backupsToDelete) {
        if (backup.file_name) {
          await deleteBackup(backup.id, backup.file_name);
          console.log(`Yedekleme silindi: ${backup.id}`);
        }
      }
      */
    }
  } catch (error) {
    console.error("Eski yedeklemeleri temizlerken hata:", error)
  }
}

/**
 * Otomatik yedekleme için zamanlama bilgilerini alır
 * @returns Zamanlama bilgileri
 */
export async function getBackupSchedule() {
  const supabase = createClient()

  try {
    // Zamanlama bilgisini getir
    const { data, error } = await supabase.from("backup_schedules").select("*").eq("id", 1).single()

    if (error) {
      console.error("Yedekleme zamanlaması alınırken hata:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Yedekleme zamanlaması alınırken hata:", error)
    return null
  }
}

/**
 * Otomatik yedekleme için zamanlama bilgilerini günceller
 * @param schedule Zamanlama bilgileri
 * @returns Güncelleme sonucu
 */
export async function updateBackupSchedule(schedule) {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from("backup_schedules")
      .upsert({
        ...schedule,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1)

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Yedekleme zamanlaması güncellenirken hata:", error)
    return { success: false, error: error.message }
  }
}
