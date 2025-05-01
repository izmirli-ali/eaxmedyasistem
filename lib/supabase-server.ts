import { createClient as supabaseCreateClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL veya Anonim Anahtar bulunamadı.")
  }

  return supabaseCreateClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      detectSessionInUrl: false,
      autoRefreshToken: false,
      storage: {
        getItem: (key) => {
          const cookieStore = cookies()
          const value = cookieStore.get(key)?.value
          return value ? value : null
        },
        setItem: () => {},
        removeItem: () => {},
      },
    },
  })
}
