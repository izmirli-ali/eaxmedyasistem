-- İşletmeler2 tablosunu oluşturma
CREATE TABLE IF NOT EXISTS isletmeler2 (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    isletme_adi TEXT NOT NULL,
    slug TEXT,
    adres TEXT,
    telefon TEXT NOT NULL,
    website TEXT,
    email TEXT,
    aciklama TEXT,
    harita_linki TEXT,
    koordinatlar TEXT,
    kategori TEXT,
    alt_kategori TEXT,
    sunulan_hizmetler TEXT,
    calisma_saatleri JSONB DEFAULT '{}'::JSONB, -- JSON formatında detaylı çalışma saatleri
    sosyal_medya JSONB DEFAULT '{}'::JSONB, -- JSON formatında sosyal medya bilgileri
    seo_baslik TEXT,
    seo_aciklama TEXT,
    seo_anahtar_kelimeler TEXT,
    fotograf_url TEXT,
    fotograflar JSONB DEFAULT '[]'::JSONB, -- JSON array formatında fotoğraf URL'leri ve sıralama bilgisi
    kullanici_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fiyat_araligi TEXT,
    sehir TEXT,
    ilce TEXT,
    url_slug TEXT UNIQUE,
    one_cikan BOOLEAN DEFAULT FALSE,
    ozellikler JSONB DEFAULT '{}'::JSONB, -- JSON formatında genişletilmiş işletme özellikleri
    taslak_durumu BOOLEAN DEFAULT TRUE, -- İşletmenin taslak durumunda olup olmadığı
    taslak_versiyonu INTEGER DEFAULT 1, -- Taslak versiyonu
    goruntulenme_sayisi INTEGER DEFAULT 0, -- İşletme sayfasının görüntülenme sayısı
    son_guncelleme_tarihi TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Son güncelleme tarihi
    onay_durumu TEXT DEFAULT 'beklemede', -- onaylandı, beklemede, reddedildi
    aktif BOOLEAN DEFAULT TRUE -- İşletmenin aktif olup olmadığı
);

-- İndeksler
CREATE INDEX IF NOT EXISTS isletmeler2_isletme_adi_idx ON isletmeler2 (isletme_adi);
CREATE INDEX IF NOT EXISTS isletmeler2_kategori_idx ON isletmeler2 (kategori);
CREATE INDEX IF NOT EXISTS isletmeler2_sehir_idx ON isletmeler2 (sehir);
CREATE INDEX IF NOT EXISTS isletmeler2_url_slug_idx ON isletmeler2 (url_slug);
CREATE INDEX IF NOT EXISTS isletmeler2_kullanici_id_idx ON isletmeler2 (kullanici_id);
CREATE INDEX IF NOT EXISTS isletmeler2_one_cikan_idx ON isletmeler2 (one_cikan);
CREATE INDEX IF NOT EXISTS isletmeler2_taslak_durumu_idx ON isletmeler2 (taslak_durumu);
CREATE INDEX IF NOT EXISTS isletmeler2_onay_durumu_idx ON isletmeler2 (onay_durumu);
CREATE INDEX IF NOT EXISTS isletmeler2_aktif_idx ON isletmeler2 (aktif);

-- Otomatik güncelleme için trigger
CREATE OR REPLACE FUNCTION update_isletmeler2_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    NEW.son_guncelleme_tarihi = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_isletmeler2_updated_at
BEFORE UPDATE ON isletmeler2
FOR EACH ROW
EXECUTE FUNCTION update_isletmeler2_updated_at();

-- URL slug oluşturma fonksiyonu
CREATE OR REPLACE FUNCTION generate_url_slug_for_isletmeler2()
RETURNS TRIGGER AS $$
DECLARE
    base_slug TEXT;
    new_slug TEXT;
    counter INTEGER := 1;
BEGIN
    -- Türkçe karakterleri değiştir ve küçük harfe çevir
    base_slug := LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
                 REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
                 REPLACE(NEW.isletme_adi, 'ı', 'i'), 'ğ', 'g'), 'ü', 'u'), 'ş', 's'), 'ö', 'o'),
                 'ç', 'c'), 'İ', 'i'), 'Ğ', 'g'), 'Ü', 'u'), 'Ş', 's'), 'Ö', 'o'), 'Ç', 'c');
    
    -- Alfanumerik olmayan karakterleri tire ile değiştir
    base_slug := REGEXP_REPLACE(base_slug, '[^a-z0-9]+', '-', 'g');
    
    -- Baştaki ve sondaki tireleri kaldır
    base_slug := TRIM(BOTH '-' FROM base_slug);
    
    -- Eğer slug boşsa, rastgele bir değer ata
    IF base_slug = '' THEN
        base_slug := 'isletme-' || FLOOR(RANDOM() * 1000)::TEXT;
    END IF;
    
    -- Slug'ı kontrol et ve benzersiz olmasını sağla
    new_slug := base_slug;
    WHILE EXISTS (SELECT 1 FROM isletmeler2 WHERE url_slug = new_slug AND id != NEW.id) LOOP
        counter := counter + 1;
        new_slug := base_slug || '-' || counter::TEXT;
    END LOOP;
    
    NEW.url_slug := new_slug;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_url_slug_for_isletmeler2
BEFORE INSERT OR UPDATE OF isletme_adi ON isletmeler2
FOR EACH ROW
WHEN (NEW.url_slug IS NULL OR NEW.url_slug = '')
EXECUTE FUNCTION generate_url_slug_for_isletmeler2();

-- Mevcut tablodan veri aktarma (eğer gerekirse)
-- INSERT INTO isletmeler2 (
--     id, isletme_adi, slug, adres, telefon, website, email, aciklama, 
--     harita_linki, koordinatlar, kategori, alt_kategori, sunulan_hizmetler,
--     sosyal_medya, seo_baslik, seo_aciklama, seo_anahtar_kelimeler, 
--     fotograf_url, kullanici_id, created_at, updated_at, fiyat_araligi,
--     sehir, ilce, url_slug, one_cikan
-- )
-- SELECT 
--     id, isletme_adi, slug, adres, telefon, website, email, aciklama, 
--     harita_linki, koordinatlar, kategori, alt_kategori, sunulan_hizmetler,
--     COALESCE(sosyal_medya::JSONB, '{}'::JSONB), seo_baslik, seo_aciklama, seo_anahtar_kelimeler, 
--     fotograf_url, kullanici_id, created_at, updated_at, fiyat_araligi,
--     sehir, ilce, url_slug, one_cikan
-- FROM isletmeler;

-- Yorum: Eğer fotograflar alanı string array ise, JSON array'e dönüştürmek için:
-- UPDATE isletmeler2 
-- SET fotograflar = (
--     SELECT COALESCE(json_agg(json_build_object('url', url, 'order', row_number() OVER ())), '[]'::JSONB)
--     FROM (
--         SELECT unnest(fotograflar) as url 
--         FROM isletmeler 
--         WHERE id = isletmeler2.id
--     ) t
-- )
-- WHERE fotograflar IS NULL OR fotograflar = '[]'::JSONB;
