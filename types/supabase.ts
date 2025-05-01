export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      isletmeler: {
        Row: {
          id: string
          isletme_adi: string
          slug: string | null
          adres: string | null
          telefon: string
          website: string | null
          email: string | null
          aciklama: string | null
          harita_linki: string | null
          koordinatlar: string | null
          kategori: string | null
          alt_kategori: string | null
          sunulan_hizmetler: string | null
          calisma_saatleri: Json | null
          sosyal_medya: Json | null
          seo_baslik: string | null
          seo_aciklama: string | null
          seo_anahtar_kelimeler: string | null
          fotograf_url: string | null
          fotograflar: Json | null
          kullanici_id: string | null
          created_at: string
          updated_at: string
          fiyat_araligi: string | null
          sehir: string | null
          ilce: string | null
          url_slug: string | null
          one_cikan: boolean
          ozellikler: Json | null
          taslak_durumu: boolean
          taslak_versiyonu: number
          goruntulenme_sayisi: number
          son_guncelleme_tarihi: string
          onay_durumu: string
          aktif: boolean
        }
        Insert: {
          id?: string
          isletme_adi: string
          slug?: string | null
          adres?: string | null
          telefon: string
          website?: string | null
          email?: string | null
          aciklama?: string | null
          harita_linki?: string | null
          koordinatlar?: string | null
          kategori?: string | null
          alt_kategori?: string | null
          sunulan_hizmetler?: string | null
          calisma_saatleri?: Json | null
          sosyal_medya?: Json | null
          seo_baslik?: string | null
          seo_aciklama?: string | null
          seo_anahtar_kelimeler?: string | null
          fotograf_url?: string | null
          fotograflar?: Json | null
          kullanici_id?: string | null
          created_at?: string
          updated_at?: string
          fiyat_araligi?: string | null
          sehir?: string | null
          ilce?: string | null
          url_slug?: string | null
          one_cikan?: boolean
          ozellikler?: Json | null
          taslak_durumu?: boolean
          taslak_versiyonu?: number
          goruntulenme_sayisi?: number
          son_guncelleme_tarihi?: string
          onay_durumu?: string
          aktif?: boolean
        }
        Update: {
          id?: string
          isletme_adi?: string
          slug?: string | null
          adres?: string | null
          telefon?: string
          website?: string | null
          email?: string | null
          aciklama?: string | null
          harita_linki?: string | null
          koordinatlar?: string | null
          kategori?: string | null
          alt_kategori?: string | null
          sunulan_hizmetler?: string | null
          calisma_saatleri?: Json | null
          sosyal_medya?: Json | null
          seo_baslik?: string | null
          seo_aciklama?: string | null
          seo_anahtar_kelimeler?: string | null
          fotograf_url?: string | null
          fotograflar?: Json | null
          kullanici_id?: string | null
          created_at?: string
          updated_at?: string
          fiyat_araligi?: string | null
          sehir?: string | null
          ilce?: string | null
          url_slug?: string | null
          one_cikan?: boolean
          ozellikler?: Json | null
          taslak_durumu?: boolean
          taslak_versiyonu?: number
          goruntulenme_sayisi?: number
          son_guncelleme_tarihi?: string
          onay_durumu?: string
          aktif?: boolean
        }
      }
      isletmeler2: {
        Row: {
          id: string
          isletme_adi: string
          slug: string | null
          adres: string | null
          telefon: string
          website: string | null
          email: string | null
          aciklama: string | null
          harita_linki: string | null
          koordinatlar: string | null
          kategori: string | null
          alt_kategori: string | null
          sunulan_hizmetler: string | null
          calisma_saatleri: Json | null
          sosyal_medya: Json | null
          seo_baslik: string | null
          seo_aciklama: string | null
          seo_anahtar_kelimeler: string | null
          fotograf_url: string | null
          fotograflar: Json | null
          kullanici_id: string | null
          created_at: string
          updated_at: string
          fiyat_araligi: string | null
          sehir: string | null
          ilce: string | null
          url_slug: string | null
          one_cikan: boolean
          ozellikler: Json | null
          taslak_durumu: boolean
          taslak_versiyonu: number
          goruntulenme_sayisi: number
          son_guncelleme_tarihi: string
          onay_durumu: string
          aktif: boolean
        }
        Insert: {
          id?: string
          isletme_adi: string
          slug?: string | null
          adres?: string | null
          telefon: string
          website?: string | null
          email?: string | null
          aciklama?: string | null
          harita_linki?: string | null
          koordinatlar?: string | null
          kategori?: string | null
          alt_kategori?: string | null
          sunulan_hizmetler?: string | null
          calisma_saatleri?: Json | null
          sosyal_medya?: Json | null
          seo_baslik?: string | null
          seo_aciklama?: string | null
          seo_anahtar_kelimeler?: string | null
          fotograf_url?: string | null
          fotograflar?: Json | null
          kullanici_id?: string | null
          created_at?: string
          updated_at?: string
          fiyat_araligi?: string | null
          sehir?: string | null
          ilce?: string | null
          url_slug?: string | null
          one_cikan?: boolean
          ozellikler?: Json | null
          taslak_durumu?: boolean
          taslak_versiyonu?: number
          goruntulenme_sayisi?: number
          son_guncelleme_tarihi?: string
          onay_durumu?: string
          aktif?: boolean
        }
        Update: {
          id?: string
          isletme_adi?: string
          slug?: string | null
          adres?: string | null
          telefon?: string
          website?: string | null
          email?: string | null
          aciklama?: string | null
          harita_linki?: string | null
          koordinatlar?: string | null
          kategori?: string | null
          alt_kategori?: string | null
          sunulan_hizmetler?: string | null
          calisma_saatleri?: Json | null
          sosyal_medya?: Json | null
          seo_baslik?: string | null
          seo_aciklama?: string | null
          seo_anahtar_kelimeler?: string | null
          fotograf_url?: string | null
          fotograflar?: Json | null
          kullanici_id?: string | null
          created_at?: string
          updated_at?: string
          fiyat_araligi?: string | null
          sehir?: string | null
          ilce?: string | null
          url_slug?: string | null
          one_cikan?: boolean
          ozellikler?: Json | null
          taslak_durumu?: boolean
          taslak_versiyonu?: number
          goruntulenme_sayisi?: number
          son_guncelleme_tarihi?: string
          onay_durumu?: string
          aktif?: boolean
        }
      }
      // Diğer tablolar...
    }
    // Diğer şema tanımları...
  }
}
