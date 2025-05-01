/**
 * Supabase ile ilgili yardımcı fonksiyonlar
 * Bu modül, Supabase veritabanı işlemleri için yardımcı fonksiyonlar içerir.
 * @module lib/supabase-utils
 */

import { createClient } from "@/lib/supabase/client"
import { tryCatch, AppError } from "@/lib/error-handler"
import { logger } from "@/lib/logger"
import type { Database } from "@/types/supabase"
import { createClient as createSupabase } from "@supabase/supabase-js"

// Supabase client oluşturma
export const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

  return createSupabase<Database>(supabaseUrl, supabaseKey)
}

/**
 * Kullanıcı rolünü kontrol eder
 * @returns {Promise<string|null>} Kullanıcı rolü veya null
 */
export async function checkUserRole(): Promise<string | null> {
  const supabase = createClient()

  try {
    const { data: session } = await supabase.auth.getSession()

    if (!session.session) return null

    // İstemci tarafında admin API'sini kullanmak yerine RPC kullan
    const { data: roleData, error: rpcError } = await supabase.rpc("get_user_role", {
      user_id: session.session.user.id,
    })

    if (rpcError) {
      logger.error("Kullanıcı rolü alınırken hata", rpcError, "checkUserRole")
      return null
    }

    // Email domain kontrolü ile satış temsilcisi tespiti
    if (session.session.user.email?.endsWith("@sales.example.com")) {
      return "sales"
    }

    return roleData || "user" // Varsayılan rol
  } catch (error) {
    logger.error("Kullanıcı rolü kontrol edilirken hata", error, "checkUserRole")
    return null
  }
}

/**
 * Kullanıcının admin olup olmadığını kontrol eder
 * @returns {Promise<boolean>} Admin ise true, değilse false
 */
export async function isAdmin(): Promise<boolean> {
  const rol = await checkUserRole()
  return rol === "admin"
}

/**
 * Kullanıcının satış temsilcisi olup olmadığını kontrol eder
 * @returns {Promise<boolean>} Satış temsilcisi ise true, değilse false
 */
export async function isSales(): Promise<boolean> {
  const rol = await checkUserRole()
  return rol === "sales"
}

/**
 * İşletme listesini getirir
 * @param {number} limit - Maksimum işletme sayısı
 * @returns {Promise<IsletmeType[]>} İşletme listesi
 */
export async function getIsletmeler(limit = 100) {
  return tryCatch(async () => {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("isletmeler")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      throw new AppError("İşletmeler yüklenirken hata oluştu", "FETCH_ISLETMELER_ERROR", error)
    }

    return data || []
  }, "getIsletmeler")
}

/**
 * Müşteri listesini getirir
 * @param {number} limit - Maksimum müşteri sayısı
 * @returns {Promise<MusteriType[]>} Müşteri listesi
 */
export async function getMusteriler(limit = 100) {
  return tryCatch(async () => {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("musteriler")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      throw new AppError("Müşteriler yüklenirken hata oluştu", "FETCH_MUSTERILER_ERROR", error)
    }

    return data || []
  }, "getMusteriler")
}

/**
 * Sunulan hizmetleri string'den diziye dönüştürür
 * @param {string} hizmetlerString - Virgülle ayrılmış hizmetler
 * @returns {string[]} Hizmet dizisi
 */
export function parseHizmetler(hizmetlerString?: string): string[] {
  if (!hizmetlerString) return []

  return hizmetlerString
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

/**
 * İşletmeyi URL slug ile getirir
 * @param {string} sehir - İşletmenin bulunduğu şehir
 * @param {string} slug - İşletmenin URL slug'ı
 * @returns {Promise<{data: IsletmeType|null, error: any}>} İşletme verisi ve hata
 */
export async function getIsletmeBySlug(sehir: string, slug: string) {
  return tryCatch(async () => {
    const supabase = createClient()

    const { data, error } = await supabase.from("isletmeler").select("*").eq("url_slug", `${sehir}/${slug}`).single()

    if (error) {
      throw new AppError(`İşletme bulunamadı: ${sehir}/${slug}`, "FETCH_ISLETME_ERROR", error)
    }

    return data
  }, "getIsletmeBySlug")
}
