import { createClient } from "@/lib/supabase/server"
import { logger } from "@/lib/logger"

/**
 * Zamanlanmış yedekleme işlemini çalıştırır
 * @returns {Promise<Object>} Yedekleme sonucu
 */
export async function runScheduledBackup() {
  try {
    logger.info("Zamanlanmış yedekleme başlatılıyor...")
    const startTime = Date.now()
    const supabase = createClient()

    // Yedekleme zamanlamasını güncelle
    const now = new Date()
    await supabase
      .from("backup_schedules")
      .update({
        last_run: now.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq("id", 1)

    // Yedeklenecek tabloları al
    const { data: tables, error: tablesError } = await supabase.from("backup_tables").select("*").eq("enabled", true)

    if (tablesError) {
      throw new Error(`Yedeklenecek tablolar alınamadı: ${tablesError.message}`)
    }

    if (!tables || tables.length === 0) {
      return {
        success: true,
        message: "Yedeklenecek tablo bulunamadı",
        timestamp: now.toISOString(),
        duration: Date.now() - startTime,
      }
    }

    // Her tablo için yedekleme yap
    const backupResults = []
    for (const table of tables) {
      try {
        // Tablo verilerini al
        const { data, error } = await supabase.from(table.table_name).select("*")

        if (error) {
          throw new Error(`Tablo verileri alınamadı (${table.table_name}): ${error.message}`)
        }

        // Yedekleme kaydı oluştur
        const { data: backupData, error: backupError } = await supabase.from("backups").insert({
          table_name: table.table_name,
          data: data,
          created_at: now.toISOString(),
          status: "completed",
          record_count: data?.length || 0,
        })

        if (backupError) {
          throw new Error(`Yedekleme kaydı oluşturulamadı (${table.table_name}): ${backupError.message}`)
        }

        backupResults.push({
          table: table.table_name,
          status: "success",
          recordCount: data?.length || 0,
        })

        logger.info(`Tablo yedeklendi: ${table.table_name} (${data?.length || 0} kayıt)`)
      } catch (error) {
        logger.error(`Tablo yedekleme hatası (${table.table_name}):`, error)
        backupResults.push({
          table: table.table_name,
          status: "error",
          error: error.message,
        })

        // Hata kaydı oluştur
        await supabase.from("backups").insert({
          table_name: table.table_name,
          created_at: now.toISOString(),
          status: "error",
          error_message: error.message,
        })
      }
    }

    // Yedekleme log kaydı oluştur
    await supabase.from("backup_logs").insert({
      created_at: now.toISOString(),
      status: "completed",
      details: {
        results: backupResults,
        duration: Date.now() - startTime,
      },
    })

    logger.info(`Zamanlanmış yedekleme tamamlandı (${Date.now() - startTime}ms)`)

    return {
      success: true,
      message: "Zamanlanmış yedekleme tamamlandı",
      timestamp: now.toISOString(),
      duration: Date.now() - startTime,
      results: backupResults,
    }
  } catch (error) {
    logger.error("Zamanlanmış yedekleme hatası:", error)

    // Hata log kaydı oluştur
    try {
      const supabase = createClient()
      await supabase.from("backup_logs").insert({
        created_at: new Date().toISOString(),
        status: "error",
        error_message: error.message,
      })
    } catch (logError) {
      logger.error("Yedekleme hata logu oluşturulamadı:", logError)
    }

    return {
      success: false,
      message: "Zamanlanmış yedekleme sırasında hata oluştu",
      error: error.message,
      timestamp: new Date().toISOString(),
    }
  }
}
