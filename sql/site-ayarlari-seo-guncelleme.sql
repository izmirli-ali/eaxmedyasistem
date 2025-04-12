-- Site ayarları tablosuna SEO alanları ekleme
ALTER TABLE public.site_ayarlari 
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS seo_keywords TEXT;

-- Eğer mevcut kayıt varsa, varsayılan değerlerle güncelle
UPDATE public.site_ayarlari
SET 
 seo_title = COALESCE(seo_title, site_adi),
 seo_description = COALESCE(seo_description, site_aciklama),
 seo_keywords = COALESCE(seo_keywords, 'işletme yönetimi, işletme listesi, işletme rehberi')
WHERE id = 1;
