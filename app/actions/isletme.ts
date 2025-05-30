"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

export async function isletmeEkle(data: any) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Kullanıcı oturumunu kontrol et
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) {
      console.error("Oturum hatası:", sessionError)
      return { success: false, error: "Oturum hatası" }
    }

    if (!session) {
      return { success: false, error: "Oturum açmanız gerekiyor" }
    }

    // İşletme verilerini hazırla
    const isletmeData = {
      ...data,
      kullanici_id: session.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      url_slug: `${data.sehir.toLowerCase()}/${data.isletme_adi.toLowerCase().replace(/\s+/g, "-")}`,
      aktif: true,
      onay_durumu: "beklemede",
    }

    // Veritabanına kaydet
    const { error: insertError } = await supabase
      .from("isletmeler")
      .insert([isletmeData])

    if (insertError) {
      console.error("Veritabanı hatası:", insertError)
      return { success: false, error: insertError.message }
    }

    // Sitemap'i yenile
    revalidatePath("/sitemap.xml")
    
    return { success: true }
  } catch (error) {
    console.error("İşletme ekleme hatası:", error)
    return { success: false, error: "Beklenmeyen bir hata oluştu" }
  }
}
