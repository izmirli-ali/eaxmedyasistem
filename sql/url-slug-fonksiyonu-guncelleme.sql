-- URL slug oluşturma fonksiyonunu güncelleme
CREATE OR REPLACE FUNCTION generate_url_slug(isletme_adi TEXT, sehir TEXT) 
RETURNS TEXT AS $$
DECLARE
  slug TEXT;
BEGIN
  -- Türkçe karakterleri değiştir ve küçük harfe çevir
  slug := lower(isletme_adi);
  slug := replace(slug, 'ı'::text, 'i'::text);
  slug := replace(slug, 'ğ'::text, 'g'::text);
  slug := replace(slug, 'ü'::text, 'u'::text);
  slug := replace(slug, 'ş'::text, 's'::text);
  slug := replace(slug, 'ö'::text, 'o'::text);
  slug := replace(slug, 'ç'::text, 'c'::text);
  
  -- Alfanumerik olmayan karakterleri tire ile değiştir
  slug := regexp_replace(slug::text, '[^a-z0-9]'::text, '-'::text, 'g'::text);
  
  -- Birden fazla tireyi tek tire yap
  slug := regexp_replace(slug::text, '-+'::text, '-'::text, 'g'::text);
  
  -- Baştaki ve sondaki tireleri kaldır
  slug := trim(both '-' from slug);
  
  -- Şehir adını da aynı şekilde işle
  sehir := lower(sehir);
  sehir := replace(sehir, 'ı'::text, 'i'::text);
  sehir := replace(sehir, 'ğ'::text, 'g'::text);
  sehir := replace(sehir, 'ü'::text, 'u'::text);
  sehir := replace(sehir, 'ş'::text, 's'::text);
  sehir := replace(sehir, 'ö'::text, 'o'::text);
  sehir := replace(sehir, 'ç'::text, 'c'::text);
  sehir := regexp_replace(sehir::text, '[^a-z0-9]'::text, '-'::text, 'g'::text);
  sehir := regexp_replace(sehir::text, '-+'::text, '-'::text, 'g'::text);
  sehir := trim(both '-' from sehir);
  
  -- Şehir ve işletme adını birleştir
  RETURN sehir || '/' || slug;
END;
$$ LANGUAGE plpgsql;
