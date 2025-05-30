"use server"

import { createClient } from "@/lib/supabase/server"

export async function handleIsletmeEkle(data: any) {
  const supabase = createClient()
  
  try {
    // İşletme ekleme işlemleri
    const { data: result, error } = await supabase
      .from('businesses')
      .insert([data])
      .select()

    if (error) throw error

    return { success: true, data: result }
  } catch (error) {
    console.error('İşletme eklenirken hata:', error)
    return { success: false, error }
  }
}
