// Bu dosya Supabase veritabanı şemasını tanımlar
// TypeScript tiplerimiz için kullanılabilir

export interface IsletmeType {
  id: string
  isletme_adi: string
  slug?: string
  adres?: string
  telefon: string
  website?: string
  email?: string
  aciklama?: string
  harita_linki?: string
  koordinatlar?: string
  kategori?: string
  alt_kategori?: string
  sunulan_hizmetler?: string
  calisma_saatleri?: string
  sosyal_medya?: {
    facebook?: string
    instagram?: string
    twitter?: string
    linkedin?: string
    youtube?: string
  }
  seo_baslik?: string
  seo_aciklama?: string
  seo_anahtar_kelimeler?: string
  fotograf_url?: string
  fotograflar?: string[]
  kullanici_id?: string
  created_at?: string
  updated_at?: string
  fiyat_araligi?: string
  sehir?: string
  ilce?: string
  url_slug?: string
  one_cikan?: boolean
}

export interface KullaniciType {
  id: string
  ad_soyad?: string
  email?: string
  created_at?: string
  updated_at?: string
  rol: "admin" | "user" | "sales"
}

export interface MusteriType {
  id: string
  isletme_adi: string
  yetkili_kisi?: string
  telefon?: string
  email?: string
  adres?: string
  sehir?: string
  odeme_durumu: "beklemede" | "odendi" | "iptal"
  sozlesme_baslangic?: string
  sozlesme_bitis?: string
  notlar?: string
  odeme_tutari?: number
  created_at?: string
  updated_at?: string
  kullanici_id?: string
}

export interface SiteAyarlariType {
  id: number
  site_adi: string
  site_aciklama?: string
  iletisim_email?: string
  iletisim_telefon?: string
  iletisim_adres?: string
  logo_url?: string
  footer_text?: string
  seo_title?: string
  seo_description?: string
  seo_keywords?: string
  created_at?: string
  updated_at?: string
}

// Database türleri
export type Database = {
  public: {
    Tables: {
      isletmeler: {
        Row: IsletmeType
        Insert: Omit<IsletmeType, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<IsletmeType, "id" | "created_at" | "updated_at">>
      }
      kullanicilar: {
        Row: KullaniciType
        Insert: Omit<KullaniciType, "created_at" | "updated_at">
        Update: Partial<Omit<KullaniciType, "id" | "created_at" | "updated_at">>
      }
      musteriler: {
        Row: MusteriType
        Insert: Omit<MusteriType, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<MusteriType, "id" | "created_at" | "updated_at">>
      }
      site_ayarlari: {
        Row: SiteAyarlariType
        Insert: Omit<SiteAyarlariType, "created_at" | "updated_at">
        Update: Partial<Omit<SiteAyarlariType, "created_at" | "updated_at">>
      }
    }
  }
}
