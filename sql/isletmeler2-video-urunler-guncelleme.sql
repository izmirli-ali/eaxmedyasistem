-- İşletmeler2 tablosuna video ve öne çıkan ürünler için alan ekleme
ALTER TABLE isletmeler2 
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS video_baslik TEXT,
ADD COLUMN IF NOT EXISTS video_aciklama TEXT,
ADD COLUMN IF NOT EXISTS one_cikan_urunler JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS one_cikan_hizmetler JSONB DEFAULT '[]'::jsonb;

-- Öne çıkan ürünler için örnek veri yapısı:
/*
[
  {
    "id": "1",
    "baslik": "Ürün Adı",
    "aciklama": "Ürün açıklaması",
    "fiyat": "99.90",
    "gorsel_url": "https://example.com/urun.jpg"
  }
]
*/

-- Öne çıkan hizmetler için örnek veri yapısı:
/*
[
  {
    "id": "1",
    "baslik": "Hizmet Adı",
    "aciklama": "Hizmet açıklaması",
    "fiyat": "199.90",
    "gorsel_url": "https://example.com/hizmet.jpg",
    "sure": "60 dakika"
  }
]
*/

-- Yapısal veri için ek alanlar
ALTER TABLE isletmeler2
ADD COLUMN IF NOT EXISTS kabul_edilen_odeme_yontemleri TEXT[] DEFAULT '{"Nakit", "Kredi Kartı"}'::TEXT[],
ADD COLUMN IF NOT EXISTS diller TEXT[] DEFAULT '{"Türkçe"}'::TEXT[],
ADD COLUMN IF NOT EXISTS kurulus_yili INTEGER,
ADD COLUMN IF NOT EXISTS sertifikalar TEXT[] DEFAULT '{}'::TEXT[],
ADD COLUMN IF NOT EXISTS odullar TEXT[] DEFAULT '{}'::TEXT[];

-- Mobil deneyim için ek alanlar
ALTER TABLE isletmeler2
ADD COLUMN IF NOT EXISTS mobil_gorunum_tercihleri JSONB DEFAULT '{
  "hizli_arama_goster": true,
  "yol_tarifi_goster": true,
  "paylasim_goster": true,
  "whatsapp_goster": false
}'::jsonb;

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_isletmeler2_video_url ON isletmeler2(video_url) WHERE video_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_isletmeler2_one_cikan_urunler ON isletmeler2 USING GIN(one_cikan_urunler) WHERE one_cikan_urunler IS NOT NULL AND one_cikan_urunler != '[]'::jsonb;
