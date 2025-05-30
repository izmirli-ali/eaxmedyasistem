"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function isletmeEkle(data: any) {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from("isletmeler")
      .insert([
        {
          isletme_adi: data.isletme_adi,
          adres: data.adres,
          telefon: data.telefon,
          email: data.email,
          website: data.website,
          aciklama: data.aciklama,
          kategori: data.kategori,
          sehir: data.sehir,
          ilce: data.ilce,
          enlem: data.enlem,
          boylam: data.boylam,
          calisma_saatleri: data.calisma_saatleri,
          ozellikler: data.ozellikler,
          resimler: data.resimler,
          durum: "beklemede",
        },
      ])

    if (error) throw error

    // Sitemap'i yenile
    revalidatePath("/sitemap.xml")
    
    return { success: true }
  } catch (error) {
    console.error("İşletme ekleme hatası:", error)
    return { success: false, error }
  }
}
