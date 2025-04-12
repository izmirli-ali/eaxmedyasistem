import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Singleton pattern ile supabase client'ı oluşturma
let supabaseInstance = null
let retryCount = 0
const MAX_RETRIES = 3

export function createClient() {
  if (supabaseInstance) return supabaseInstance

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL ve Anon Key tanımlanmamış!")
  }

  try {
    supabaseInstance = createSupabaseClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false, // URL'deki oturum bilgilerini algılamayı devre dışı bırak
      },
      // Bağlantı havuzu ayarları
      db: {
        schema: "public",
      },
      global: {
        // Bağlantı zaman aşımı süresini artır
        fetch: (url, options = {}) => {
          return fetch(url, {
            ...options,
            // Zaman aşımı süresini 30 saniyeye çıkar
            signal: options.signal || new AbortController().signal,
          })
        },
      },
    })

    // Bağlantıyı test et
    supabaseInstance
      .from("kullanicilar")
      .select("count", { count: "exact", head: true })
      .then(() => {
        console.log("Supabase bağlantısı başarılı")
        retryCount = 0 // Başarılı bağlantıda sayacı sıfırla
      })
      .catch((err) => {
        console.error("Supabase bağlantı testi hatası:", err)
      })

    return supabaseInstance
  } catch (error) {
    console.error("Supabase istemcisi oluşturulurken hata:", error)

    // Yeniden deneme mantığı
    if (retryCount < MAX_RETRIES) {
      retryCount++
      console.log(`Supabase bağlantısı yeniden deneniyor (${retryCount}/${MAX_RETRIES})...`)
      // Supabase instance'ı sıfırla ve yeniden oluştur
      supabaseInstance = null
      return createClient()
    }

    // Maksimum deneme sayısına ulaşıldı
    throw new Error(`Supabase bağlantısı ${MAX_RETRIES} deneme sonrasında başarısız oldu: ${error.message}`)
  }
}
