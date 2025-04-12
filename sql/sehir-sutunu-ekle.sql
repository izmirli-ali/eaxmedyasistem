-- İşletmeler tablosuna sehir ve url_slug sütunlarını ekle
ALTER TABLE isletmeler 
ADD COLUMN IF NOT EXISTS sehir TEXT,
ADD COLUMN IF NOT EXISTS url_slug TEXT;

-- Mevcut kayıtlar için varsayılan değerler atama
UPDATE isletmeler 
SET sehir = 'İstanbul' 
WHERE sehir IS NULL;

-- URL slug oluşturma fonksiyonu
CREATE OR REPLACE FUNCTION generate_url_slug(isletme_adi TEXT, sehir TEXT) 
RETURNS TEXT AS $$
DECLARE
  slug TEXT;
BEGIN
  -- Türkçe karakterleri değiştir ve küçük harfe çevir
  slug := lower(isletme_adi);
  slug := replace(slug, 'ı', 'i');
  slug := replace(slug, 'ğ', 'g');
  slug := replace(slug, 'ü', 'u');
  slug := replace(slug, 'ş', 's');
  slug := replace(slug, 'ö', 'o');
  slug := replace(slug, 'ç', 'c');
  
  -- Alfanumerik olmayan karakterleri tire ile değiştir
  slug := regexp_replace(slug, '[^a-z0-9]', '-', 'g');
  
  -- Birden fazla tireyi tek tire yap
  slug := regexp_replace(slug, '-+', '-', 'g');
  
  -- Baştaki ve sondaki tireleri kaldır
  slug := trim(both '-' from slug);
  
  -- Şehir adını da aynı şekilde işle
  sehir := lower(sehir);
  sehir := replace(sehir, 'ı', 'i');
  sehir := replace(sehir, 'ğ', 'g');
  sehir := replace(sehir, 'ü', 'u');
  sehir := replace(sehir, 'ş', 's');
  sehir := replace(sehir, 'ö', 'o');
  sehir := replace(sehir, 'ç', 'c');
  sehir := regexp_replace(sehir, '[^a-z0-9]', '-', 'g');
  sehir := regexp_replace(sehir, '-+', '-', 'g');
  sehir := trim(both '-' from sehir);
  
  -- Şehir ve işletme adını birleştir
  RETURN sehir || '/' || slug;
END;
$$ LANGUAGE plpgsql;

-- Mevcut kayıtlar için url_slug oluştur
UPDATE isletmeler 
SET url_slug = generate_url_slug(isletme_adi, sehir) 
WHERE url_slug IS NULL;

-- Trigger oluştur - işletme adı veya şehir değiştiğinde url_slug otomatik güncellensin
CREATE OR REPLACE FUNCTION update_url_slug() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.url_slug := generate_url_slug(NEW.isletme_adi, NEW.sehir);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_url_slug
BEFORE INSERT OR UPDATE OF isletme_adi, sehir ON isletmeler
FOR EACH ROW
EXECUTE FUNCTION update_url_slug();
