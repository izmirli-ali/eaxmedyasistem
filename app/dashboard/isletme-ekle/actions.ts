"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function handleIsletmeEkle(data: any) {
  const supabase = createClient()

  // Kullanıcı oturumunu kontrol et
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    throw new Error("Oturum açmanız gerekiyor")
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
  const { error } = await supabase.from("isletmeler2").insert([isletmeData])

  if (error) {
    throw new Error(`İşletme kaydedilirken bir hata oluştu: ${error.message}`)
  }

  // Başarılı kayıt sonrası yönlendirme
  redirect("/dashboard/isletmeler")
}
