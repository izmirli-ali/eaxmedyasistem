-- Bu SQL dosyası, kullanılmayan kısımları temizlenmiş ve web kodlarıyla uyumlu hale getirilmiş yapıyı içerir

-- İşletmeler tablosu için güncellenmiş yapı
CREATE TABLE IF NOT EXISTS public.isletmeler (
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
  calisma_saatleri TEXT,
  sosyal_medya JSONB,    -- Facebook, Instagram, Twitter, LinkedIn vb. için JSON formatında
  seo_baslik TEXT,
  seo_aciklama TEXT,
  seo_anahtar_kelimeler TEXT,
  fotograf_url TEXT,
  fotograflar TEXT[] DEFAULT '{}',
  kullanici_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  fiyat_araligi TEXT DEFAULT '$$',
  sehir TEXT,
  ilce TEXT,
  url_slug TEXT,
  one_cikan BOOLEAN DEFAULT FALSE
);

-- Kullanıcılar tablosu
CREATE TABLE IF NOT EXISTS public.kullanicilar (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  ad_soyad TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  rol TEXT DEFAULT 'user'
);

-- Müşteri tablosu
CREATE TABLE IF NOT EXISTS public.musteriler (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  isletme_adi TEXT NOT NULL,
  yetkili_kisi TEXT,
  telefon TEXT,
  email TEXT,
  adres TEXT,
  sehir TEXT,
  odeme_durumu TEXT DEFAULT 'beklemede',
  sozlesme_baslangic DATE,
  sozlesme_bitis DATE,
  notlar TEXT,
  odeme_tutari NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  kullanici_id UUID REFERENCES auth.users(id)
);

-- updated_at alanını otomatik güncellemek için trigger
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- İşletmeler tablosu için trigger
DROP TRIGGER IF EXISTS update_isletmeler_updated_at ON public.isletmeler;
CREATE TRIGGER update_isletmeler_updated_at
BEFORE UPDATE ON public.isletmeler
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Kullanıcılar tablosu için trigger
DROP TRIGGER IF EXISTS update_kullanicilar_updated_at ON public.kullanicilar;
CREATE TRIGGER update_kullanicilar_updated_at
BEFORE UPDATE ON public.kullanicilar
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Müşteriler tablosu için trigger
DROP TRIGGER IF EXISTS update_musteriler_updated_at ON public.musteriler;
CREATE TRIGGER update_musteriler_updated_at
BEFORE UPDATE ON public.musteriler
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- URL slug oluşturma fonksiyonu
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

-- Url slug trigger
CREATE OR REPLACE FUNCTION update_url_slug() 
RETURNS TRIGGER AS $$
BEGIN
  NEW.url_slug := generate_url_slug(NEW.isletme_adi, NEW.sehir);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_url_slug ON isletmeler;
CREATE TRIGGER trigger_update_url_slug
BEFORE INSERT OR UPDATE OF isletme_adi, sehir ON isletmeler
FOR EACH ROW
EXECUTE FUNCTION update_url_slug();

-- RLS politikaları için tabloları hazırla
ALTER TABLE public.isletmeler ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kullanicilar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.musteriler ENABLE ROW LEVEL SECURITY;

-- Basitleştirilmiş RLS politikaları
-- Herkes görüntüleyebilir politikaları
CREATE POLICY "İşletmeleri herkes görüntüleyebilir" 
ON isletmeler FOR SELECT 
USING (true);

CREATE POLICY "Herkes kullanıcıları görüntüleyebilir" 
ON kullanicilar FOR SELECT 
USING (true);

CREATE POLICY "Herkes müşterileri görüntüleyebilir" 
ON musteriler FOR SELECT 
USING (true);

-- Admin ve satış temsilcileri için politikalar - İşletmeler
CREATE POLICY "Yetkililer işletme ekleyebilir" 
ON isletmeler FOR INSERT 
TO authenticated 
WITH CHECK (
  (SELECT rol FROM kullanicilar WHERE id = auth.uid()) IN ('admin', 'sales')
);

CREATE POLICY "Yetkililer işletme güncelleyebilir" 
ON isletmeler FOR UPDATE 
TO authenticated 
USING (
  (SELECT rol FROM kullanicilar WHERE id = auth.uid()) IN ('admin', 'sales')
);

CREATE POLICY "Yetkililer işletme silebilir" 
ON isletmeler FOR DELETE 
TO authenticated 
USING (
  (SELECT rol FROM kullanicilar WHERE id = auth.uid()) IN ('admin', 'sales')
);

-- Admin için politikalar - Müşteriler
CREATE POLICY "Yetkililer müşteri ekleyebilir" 
ON musteriler FOR INSERT 
TO authenticated 
WITH CHECK (
  (SELECT rol FROM kullanicilar WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Yetkililer müşteri güncelleyebilir" 
ON musteriler FOR UPDATE 
TO authenticated 
USING (
  (SELECT rol FROM kullanicilar WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Yetkililer müşteri silebilir" 
ON musteriler FOR DELETE 
TO authenticated 
USING (
  (SELECT rol FROM kullanicilar WHERE id = auth.uid()) = 'admin'
);

-- Kullanıcı profili politikaları
CREATE POLICY "Kullanıcı kendi profilini güncelleyebilir" 
ON kullanicilar FOR UPDATE 
TO authenticated 
USING (
  auth.uid() = id OR (SELECT rol FROM kullanicilar WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Yetkililer kullanıcı ekleyebilir" 
ON kullanicilar FOR INSERT 
TO authenticated 
WITH CHECK (
  auth.uid() = id OR (SELECT rol FROM kullanicilar WHERE id = auth.uid()) = 'admin'
);

CREATE POLICY "Yetkililer kullanıcı silebilir" 
ON kullanicilar FOR DELETE 
TO authenticated 
USING (
  (SELECT rol FROM kullanicilar WHERE id = auth.uid()) = 'admin'
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_isletmeler_isletme_adi ON public.isletmeler (isletme_adi);
CREATE INDEX IF NOT EXISTS idx_isletmeler_slug ON public.isletmeler (slug);
CREATE INDEX IF NOT EXISTS idx_isletmeler_url_slug ON public.isletmeler (url_slug);
CREATE INDEX IF NOT EXISTS idx_isletmeler_kategori ON public.isletmeler (kategori);
CREATE INDEX IF NOT EXISTS idx_isletmeler_sehir ON public.isletmeler (sehir);
CREATE INDEX IF NOT EXISTS idx_isletmeler_kullanici_id ON public.isletmeler (kullanici_id);
CREATE INDEX IF NOT EXISTS idx_isletmeler_created_at ON public.isletmeler (created_at);
CREATE INDEX IF NOT EXISTS idx_isletmeler_one_cikan ON public.isletmeler (one_cikan);

CREATE INDEX IF NOT EXISTS idx_musteriler_isletme_adi ON public.musteriler (isletme_adi);
CREATE INDEX IF NOT EXISTS idx_musteriler_sehir ON public.musteriler (sehir);
CREATE INDEX IF NOT EXISTS idx_musteriler_odeme_durumu ON public.musteriler (odeme_durumu);
CREATE INDEX IF NOT EXISTS idx_musteriler_sozlesme_bitis ON public.musteriler (sozlesme_bitis);
