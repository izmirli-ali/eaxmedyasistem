-- Blog tablolarını kaldırmak için SQL script

-- Önce tetikleyiciyi kaldır
DROP TRIGGER IF EXISTS update_blog_yazi_updated_at_trigger ON public.blog_yazilar;

-- Sonra fonksiyonları kaldır
DROP FUNCTION IF EXISTS update_blog_yazi_updated_at();
DROP FUNCTION IF EXISTS blog_goruntulenme_artir(UUID);

-- Tabloları kaldır (ilişkiler nedeniyle sıralama önemli)
DROP TABLE IF EXISTS public.blog_yazilar;
DROP TABLE IF EXISTS public.blog_kategoriler;
DROP TABLE IF EXISTS public.blog_etiketler;

-- Varsa indeksleri kaldır (tablolar silindiğinde otomatik silinir, ama emin olmak için)
DROP INDEX IF EXISTS blog_yazilar_isletme_id_idx;
DROP INDEX IF EXISTS blog_yazilar_slug_idx;
DROP INDEX IF EXISTS blog_yazilar_durum_idx;
DROP INDEX IF EXISTS blog_yazilar_yayinlanma_tarihi_idx;
