import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Supabase client oluşturma
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
)

// Re-export client ve server modülleri
export * from "./client"
export * from "./server"
