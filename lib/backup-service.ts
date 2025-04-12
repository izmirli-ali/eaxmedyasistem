/**
 * Veri yedekleme servisi
 * Bu servis, Supabase veritabanı yedeklemesi için gerekli fonksiyonları içerir
 */

import { createClient } from "@/lib/supabase/client"
import { v4 as uuidv4 } from "uuid"

// Yedekleme durumları
export type BackupStatus = "pending" | "in_progress" | "completed" | "failed"

// Yedekleme bilgisi tipi
export interface BackupInfo {
  id: string
  created_at: string
  status: BackupStatus
  file_name?: string
  file_size?: number
  tables: string[]
  error?: string
  completed_at?: string
}

/**
 * Yeni bir yedekleme işlemi başlatır
 * @param tables Yedeklenecek tablolar
 * @returns Yedekleme bilgisi
 */
export async function startBackup(tables: string[]): Promise<BackupInfo> {
  const supabase = createClient()

  try {
    // Yeni bir yedekleme kaydı oluştur
    const backupId = uuidv4()
    const now = new Date().toISOString()

    const newBackup: BackupInfo = {
      id: backupId,
      created_at: now,
      status: "pending",
      tables: tables,
    }

    // Yedekleme kaydını veritabanına ekle
    const { error } = await supabase.from("backups").insert([newBackup])

    if (error) throw error

    // Yedekleme işlemini başlat (asenkron)
    processBackup(backupId, tables).catch(console.error)

    return newBackup
  } catch (error) {
    console.error("Yedekleme başlatılırken hata:", error)
    throw error
  }
}

/**
 * Yedekleme işlemini gerçekleştirir
 * @param backupId Yedekleme ID
 * @param tables Yedeklenecek tablolar
 */
async function processBackup(backupId: string, tables: string[]): Promise<void> {
  const supabase = createClient()

  try {
    // Yedekleme durumunu güncelle
    await supabase.from("backups").update({ status: "in_progress" }).eq("id", backupId)

    // Her tablo için veri çek
    const backupData: Record<string, any[]> = {}

    for (const table of tables) {
      const { data, error } = await supabase.from(table).select("*")

      if (error) throw error

      backupData[table] = data || []
    }

    // JSON dosyasına dönüştür
    const jsonData = JSON.stringify(backupData, null, 2)
    const fileName = `backup_${backupId}_${new Date().toISOString().replace(/:/g, "-")}.json`

    // Storage'a yükle
    const { error: uploadError } = await supabase.storage
      .from("backups")
      .upload(fileName, new Blob([jsonData], { type: "application/json" }))

    if (uploadError) throw uploadError

    // Yedekleme kaydını güncelle
    await supabase
      .from("backups")
      .update({
        status: "completed",
        file_name: fileName,
        file_size: jsonData.length,
        completed_at: new Date().toISOString(),
      })
      .eq("id", backupId)
  } catch (error) {
    console.error("Yedekleme işlemi sırasında hata:", error)

    // Hata durumunda yedekleme kaydını güncelle
    await supabase
      .from("backups")
      .update({
        status: "failed",
        error: error.message || "Bilinmeyen hata",
        completed_at: new Date().toISOString(),
      })
      .eq("id", backupId)
  }
}

/**
 * Tüm yedekleme kayıtlarını getirir
 * @returns Yedekleme kayıtları
 */
export async function getBackups(): Promise<BackupInfo[]> {
  const supabase = createClient()

  try {
    // Önce backups tablosunun var olup olmadığını kontrol edelim
    const { data: tableExists, error: tableCheckError } = await supabase
      .from("backups")
      .select("id")
      .limit(1)
      .maybeSingle()

    // Tablo yoksa veya erişim hatası varsa boş dizi döndür
    if (tableCheckError) {
      console.warn("Backups tablosu kontrolünde hata:", tableCheckError)
      return []
    }

    // Yedeklemeleri getir
    const { data, error } = await supabase.from("backups").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Yedekleme verileri alınırken hata:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Yedeklemeler alınırken hata:", error)
    return []
  }
}

/**
 * Belirli bir yedekleme kaydını getirir
 * @param backupId Yedekleme ID
 * @returns Yedekleme bilgisi
 */
export async function getBackup(backupId: string): Promise<BackupInfo | null> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from("backups").select("*").eq("id", backupId).single()

    if (error) throw error

    return data
  } catch (error) {
    console.error("Yedekleme bilgisi alınırken hata:", error)
    return null
  }
}

/**
 * Yedekleme dosyasını indirir
 * @param fileName Dosya adı
 * @returns Dosya URL'i
 */
export async function downloadBackup(fileName: string): Promise<string> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.storage.from("backups").createSignedUrl(fileName, 60) // 60 saniyelik geçerli URL

    if (error) throw error

    return data.signedUrl
  } catch (error) {
    console.error("Yedekleme dosyası indirme hatası:", error)
    throw error
  }
}

/**
 * Yedekleme dosyasını siler
 * @param backupId Yedekleme ID
 * @param fileName Dosya adı
 */
export async function deleteBackup(backupId: string, fileName: string): Promise<void> {
  const supabase = createClient()

  try {
    // Önce storage'dan dosyayı sil
    if (fileName) {
      const { error: storageError } = await supabase.storage.from("backups").remove([fileName])

      if (storageError) throw storageError
    }

    // Sonra veritabanından kaydı sil
    const { error: dbError } = await supabase.from("backups").delete().eq("id", backupId)

    if (dbError) throw dbError
  } catch (error) {
    console.error("Yedekleme silme hatası:", error)
    throw error
  }
}
