/**
 * Zamanlanmış yedekleme işlemleri için yardımcı fonksiyonlar
 */

import { createClient } from "@/lib/supabase/client"
import { logger } from "@/lib/logger"
import { tryCatch, AppError } from "@/lib/error-handler"

/**
 * Zamanlanmış yedekleme işlemini çalıştırır
 * @returns {Promise<{success: boolean, message: string, data?: any}>} İşlem sonucu
 */
export async function runScheduledBackup() {
  return tryCatch(async () => {
    logger.info("Zamanlanmış yedekleme işlemi başlatıldı")

    const supabase = createClient()
    const timestamp = new Date().toISOString()
    const backupName = `scheduled_backup_${timestamp.replace(/[:.]/g, "-")}`

    // Yedekleme kaydı oluştur
    const { data: backupRecord, error: backupError } = await supabase
      .from("backups")
      .insert([
        {
          dosya_adi: backupName,
          olusturma_tarihi: timestamp,
          durum: "başladı",
          yedekleme_turu: "zamanlanmış",
          notlar: "Otomatik zamanlanmış yedekleme",
        },
      ])
      .select()

    if (backupError) {
      throw new AppError("Yedekleme kaydı oluşturulamadı", "BACKUP_RECORD_ERROR", backupError)
    }

    const backupId = backupRecord[0].id

    try {
      // Yedeklenecek tabloları belirle
      const tables = [
        "isletmeler",
        "isletmeler2",
        "kullanicilar",
        "musteriler",
        "site_ayarlari",
        "backups",
        "on_basvurular",
        "bildirimler",
        "gorevler",
        "content_reminders",
        "change_logs",
        "system_logs",
      ]

      const backupData: Record<string, any> = {}

      // Her tablodan veri al
      for (const table of tables) {
        const { data, error } = await supabase.from(table).select("*")

        if (error) {
          logger.error(`${table} tablosu yedeklenirken hata oluştu:`, error)
          continue
        }

        backupData[table] = data
      }

      // Yedekleme dosyasını storage'a kaydet
      const { error: storageError } = await supabase.storage
        .from("backups")
        .upload(`${backupName}.json`, JSON.stringify(backupData, null, 2))

      if (storageError) {
        throw new AppError("Yedekleme dosyası kaydedilemedi", "BACKUP_STORAGE_ERROR", storageError)
      }

      // Yedekleme kaydını güncelle
      const { error: updateError } = await supabase
        .from("backups")
        .update({
          durum: "tamamlandı",
          dosya_boyutu: JSON.stringify(backupData).length,
          dosya_yolu: `backups/${backupName}.json`,
        })
        .eq("id", backupId)

      if (updateError) {
        throw new AppError("Yedekleme kaydı güncellenemedi", "BACKUP_UPDATE_ERROR", updateError)
      }

      logger.info("Zamanlanmış yedekleme işlemi başarıyla tamamlandı")

      return {
        success: true,
        message: "Yedekleme işlemi başarıyla tamamlandı",
        data: {
          backupId,
          backupName,
          timestamp,
          tables: Object.keys(backupData),
        },
      }
    } catch (error: any) {
      // Hata durumunda yedekleme kaydını güncelle
      await supabase
        .from("backups")
        .update({
          durum: "hata",
          notlar: `Hata: ${error.message || "Bilinmeyen hata"}`,
        })
        .eq("id", backupId)

      throw error
    }
  }, "runScheduledBackup")
}

/**
 * Yedekleme durumunu kontrol eder
 * @returns {Promise<{success: boolean, message: string, data?: any}>} İşlem sonucu
 */
export async function checkBackupStatus() {
  return tryCatch(async () => {
    const supabase = createClient()

    // Son yedeklemeyi kontrol et
    const { data: lastBackup, error } = await supabase
      .from("backups")
      .select("*")
      .order("olusturma_tarihi", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        // Hiç yedekleme yok
        return {
          success: true,
          message: "Henüz hiç yedekleme yapılmamış",
          data: {
            lastBackup: null,
            needsBackup: true,
          },
        }
      }
      throw new AppError("Yedekleme durumu kontrol edilirken hata oluştu", "BACKUP_STATUS_ERROR", error)
    }

    // Son yedeklemeden bu yana 24 saat geçmiş mi kontrol et
    const lastBackupTime = new Date(lastBackup.olusturma_tarihi).getTime()
    const currentTime = new Date().getTime()
    const timeDiff = currentTime - lastBackupTime
    const hoursDiff = timeDiff / (1000 * 60 * 60)

    const needsBackup = hoursDiff >= 24 || lastBackup.durum !== "tamamlandı"

    return {
      success: true,
      message: needsBackup ? "Yeni bir yedekleme yapılması gerekiyor" : "Son yedekleme 24 saat içinde yapılmış",
      data: {
        lastBackup,
        needsBackup,
        hoursSinceLastBackup: Math.floor(hoursDiff),
      },
    }
  }, "checkBackupStatus")
}
