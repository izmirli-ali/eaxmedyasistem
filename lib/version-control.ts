/**
 * Sürüm kontrolü ve değişiklik günlüğü
 * Bu modül, sistem değişikliklerini takip etmek için kullanılır
 */

import { createClient } from "@/lib/supabase/client"

// Değişiklik tipi
export type ChangeType = "feature" | "bugfix" | "improvement" | "database" | "security" | "other"

// Değişiklik kaydı
export interface ChangeLog {
  id?: string
  version: string
  change_type: ChangeType
  description: string
  details?: string
  affected_components?: string[]
  created_by: string
  created_at?: string
  is_major: boolean
}

/**
 * Yeni bir değişiklik kaydı ekler
 * @param change Değişiklik bilgileri
 * @returns Eklenen değişiklik kaydı
 */
export async function addChangeLog(change: Omit<ChangeLog, "id" | "created_at">): Promise<ChangeLog | null> {
  const supabase = createClient()

  try {
    // Değişiklik kaydını ekle
    const { data, error } = await supabase
      .from("change_logs")
      .insert({
        ...change,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return data
  } catch (error) {
    console.error("Değişiklik kaydı eklenirken hata:", error)
    return null
  }
}

/**
 * Değişiklik kayıtlarını getirir
 * @param limit Maksimum kayıt sayısı
 * @returns Değişiklik kayıtları
 */
export async function getChangeLogs(limit = 50): Promise<ChangeLog[]> {
  const supabase = createClient()

  try {
    // Önce tablonun var olup olmadığını kontrol et
    try {
      await supabase.from("change_logs").select("id").limit(1)
    } catch (error) {
      if (error.message && error.message.includes("does not exist")) {
        throw new Error('relation "public.change_logs" does not exist')
      }
    }

    const { data, error } = await supabase
      .from("change_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Değişiklik kayıtları alınırken hata:", error)
    throw error
  }
}

/**
 * Mevcut sistem sürümünü getirir
 * @returns Sistem sürümü
 */
export async function getCurrentVersion(): Promise<string> {
  const supabase = createClient()

  try {
    // Tablonun var olup olmadığını kontrol et
    try {
      await supabase.from("change_logs").select("id").limit(1)
    } catch (error) {
      if (error.message && error.message.includes("does not exist")) {
        return "1.0.0" // Varsayılan sürüm
      }
    }

    // En son major değişikliği bul
    const { data, error } = await supabase
      .from("change_logs")
      .select("version")
      .eq("is_major", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error) return "1.0.0" // Varsayılan sürüm

    return data.version
  } catch (error) {
    console.error("Sistem sürümü alınırken hata:", error)
    return "1.0.0" // Varsayılan sürüm
  }
}
