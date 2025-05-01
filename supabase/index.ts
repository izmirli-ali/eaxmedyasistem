import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL ve Anon Key tanımlanmamış!")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Diğer Supabase yardımcı fonksiyonları
export const getUser = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export const signOut = async () => {
  return await supabase.auth.signOut()
}

// Veritabanı işlemleri için yardımcı fonksiyonlar
export const fetchBusinesses = async () => {
  const { data, error } = await supabase.from("isletmeler2").select("*")

  if (error) throw error
  return data
}

export const fetchBusinessById = async (id: string) => {
  const { data, error } = await supabase.from("isletmeler2").select("*").eq("id", id).single()

  if (error) throw error
  return data
}

export const fetchCustomers = async () => {
  const { data, error } = await supabase.from("musteriler").select("*")

  if (error) throw error
  return data
}

export const fetchUsers = async () => {
  const { data, error } = await supabase.from("kullanicilar").select("*")

  if (error) throw error
  return data
}

export const fetchApplications = async () => {
  const { data, error } = await supabase.from("on_basvurular").select("*")

  if (error) throw error
  return data
}
