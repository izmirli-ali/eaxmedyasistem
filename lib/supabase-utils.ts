// Supabase ile ilgili yardımcı fonksiyonlar
import { createClient } from "@/lib/supabase/client"
import type { IsletmeType, MusteriType } from "./supabase-schema"

// Kullanıcı rolünü kontrol et - RLS politikalarını tetiklemeyen güvenli bir yöntem
export async function checkUserRole(): Promise<string | null> {
  const supabase = createClient()

  try {
    const { data: session } = await supabase.auth.getSession()

    if (!session.session) return null

    // Doğrudan auth.users tablosundan kontrol et
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(session.session.user.id)

    if (authError || !authUser) {
      console.error("Auth kullanıcı bilgisi alınamadı:", authError)

      // Alternatif olarak, RPC kullan
      const { data: roleData, error: rpcError } = await supabase.rpc("get_user_role", {
        user_id: session.session.user.id,
      })

      if (rpcError) {
        console.error("RPC hatası:", rpcError)
        return null
      }

      return roleData
    }

    // Super admin kontrolü
    if (authUser.user?.app_metadata?.is_super_admin) {
      return "admin"
    }

    // Email domain kontrolü ile satış temsilcisi tespiti
    if (authUser.user?.email?.endsWith("@sales.example.com")) {
      return "sales"
    }

    return "user" // Varsayılan rol
  } catch (error) {
    console.error("Kullanıcı rolü kontrol edilirken hata:", error)
    return null
  }
}

// Admin mi kontrol et
export async function isAdmin(): Promise<boolean> {
  const rol = await checkUserRole()
  return rol === "admin"
}

// Satış temsilcisi mi kontrol et
export async function isSales(): Promise<boolean> {
  const rol = await checkUserRole()
  return rol === "sales"
}

// İşletme listesini getir - RLS politikalarını kullanarak
export async function getIsletmeler(limit = 100): Promise<IsletmeType[]> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("isletmeler")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("İşletmeler yüklenirken hata:", error)
    return []
  }
}

// Müşteri listesini getir
export async function getMusteriler(limit = 100): Promise<MusteriType[]> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("musteriler")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Müşteriler yüklenirken hata:", error)
    return []
  }
}

// Sunulan hizmetler string olarak geliyor, diziye dönüştürmek için
export function parseHizmetler(hizmetlerString?: string): string[] {
  if (!hizmetlerString) return []

  return hizmetlerString
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

// İşletmeyi URL slug ile getir
export async function getIsletmeBySlug(sehir: string, slug: string): Promise<IsletmeType | null> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.from("isletmeler").select("*").eq("url_slug", `${sehir}/${slug}`).single()

    if (error) throw error

    return data
  } catch (error) {
    console.error(`İşletme (${sehir}/${slug}) yüklenirken hata:`, error)
    return null
  }
}
