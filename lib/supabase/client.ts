import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Singleton pattern ile Supabase istemcisini oluştur
let supabaseInstance = null

export function createClient() {
  if (supabaseInstance) return supabaseInstance

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL ve Anon Key tanımlanmamış!")
  }

  supabaseInstance = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey)
  return supabaseInstance
}
