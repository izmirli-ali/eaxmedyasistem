// types/index.ts - Tüm tip tanımlarını dışa aktarır

// Hatırlatma türleri
export enum ReminderType {
  BUSINESS_INFO_UPDATE = "business_info_update",
  PHOTO_UPDATE = "photo_update",
  OPENING_HOURS_CHECK = "opening_hours_check",
  SERVICES_UPDATE = "services_update",
  CONTACT_INFO_CHECK = "contact_info_check",
  DESCRIPTION_UPDATE = "description_update",
  REVIEW_RESPONSE = "review_response",
  GOOGLE_POSTS = "google_posts",
  SEO_OPTIMIZATION = "seo_optimization",
}

// Hatırlatma durumları
export enum ReminderStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  DISMISSED = "dismissed",
  OVERDUE = "overdue",
}

// Hatırlatma önceliği
export enum ReminderPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

// İşletme tipi
export interface Business {
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
  calisma_saatleri?: Record<string, any>
  sosyal_medya?: Record<string, any>
  seo_baslik?: string
  seo_aciklama?: string
  seo_anahtar_kelimeler?: string
  fotograf_url?: string
  fotograflar?: any[]
  kullanici_id?: string
  created_at?: string
  updated_at?: string
  fiyat_araligi?: string
  sehir?: string
  ilce?: string
  url_slug?: string
  one_cikan?: boolean
  ozellikler?: Record<string, any>
  taslak_durumu?: boolean
  taslak_versiyonu?: number
  goruntulenme_sayisi?: number
  son_guncelleme_tarihi?: string
  onay_durumu?: string
  aktif?: boolean
}

// Müşteri tipi
export interface Customer {
  id: string
  ad: string
  soyad: string
  email: string
  telefon?: string
  firma_adi?: string
  adres?: string
  sehir?: string
  ulke?: string
  posta_kodu?: string
  notlar?: string
  created_at?: string
  updated_at?: string
  durum?: string
  son_islem_tarihi?: string
  kullanici_id?: string
}

// Kullanıcı tipi
export interface User {
  id: string
  email: string
  ad?: string
  soyad?: string
  telefon?: string
  rol?: string
  created_at?: string
  updated_at?: string
  son_giris_tarihi?: string
  aktif?: boolean
}

// Başvuru tipi
export interface Application {
  id: string
  isletme_adi: string
  yetkili_adi: string
  yetkili_soyadi: string
  telefon: string
  email: string
  adres?: string
  sehir?: string
  ilce?: string
  kategori?: string
  mesaj?: string
  created_at?: string
  durum?: string
  islem_tarihi?: string
  islem_yapan_kullanici_id?: string
}

// Bildirim tipi
export interface Notification {
  id: string
  baslik: string
  mesaj: string
  tip: string
  okundu: boolean
  kullanici_id?: string
  created_at?: string
  updated_at?: string
  link?: string
  oncelik?: string
}

// Görev tipi
export interface Task {
  id: string
  baslik: string
  aciklama?: string
  durum: string
  oncelik?: string
  son_tarih?: string
  atanan_kullanici_id?: string
  olusturan_kullanici_id?: string
  created_at?: string
  updated_at?: string
  tamamlanma_tarihi?: string
}

// Site ayarları tipi
export interface SiteSettings {
  id: string
  site_basligi: string
  site_aciklamasi?: string
  iletisim_email?: string
  iletisim_telefon?: string
  iletisim_adres?: string
  sosyal_medya?: Record<string, string>
  logo_url?: string
  favicon_url?: string
  footer_metni?: string
  created_at?: string
  updated_at?: string
  seo_meta_baslik?: string
  seo_meta_aciklama?: string
  seo_meta_anahtar_kelimeler?: string
  google_analytics_id?: string
}

// Yedekleme tipi
export interface Backup {
  id: string
  dosya_adi: string
  dosya_boyutu?: number
  dosya_yolu?: string
  olusturma_tarihi: string
  olusturan_kullanici_id?: string
  notlar?: string
  durum: string
  yedekleme_turu: string
}

// Hatırlatma bilgisi tipi
export interface ReminderInfo {
  id: string
  user_id: string
  isletme_id: string
  type: ReminderType
  title: string
  description: string
  status: ReminderStatus
  priority: ReminderPriority
  due_date: string
  created_at: string
  updated_at: string
  completed_at?: string
  dismissed_at?: string
  recurrence?: string // "daily", "weekly", "monthly", "quarterly", "yearly"
  metadata?: Record<string, any>
}
