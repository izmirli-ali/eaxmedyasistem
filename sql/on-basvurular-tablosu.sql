-- Ön başvurular tablosu
CREATE TABLE IF NOT EXISTS public.on_basvurular (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  basvuru_tarihi TIMESTAMP WITH TIME ZONE DEFAULT now(),
  isletme_adi TEXT NOT NULL,
  kategori TEXT,
  isletme_adresi TEXT,
  isletme_telefonu TEXT,
  sehir TEXT,
  ilce TEXT,
  yetkili_adi TEXT NOT NULL,
  yetkili_soyadi TEXT NOT NULL,
  yetkili_telefonu TEXT NOT NULL,
  yetkili_email TEXT,
  website TEXT,
  aciklama TEXT,
  paket_turu TEXT NOT NULL,
  durum TEXT NOT NULL DEFAULT 'yeni', -- yeni, inceleniyor, onaylandi, reddedildi
  notlar TEXT,
  atanan_kullanici UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Eğer tablo zaten varsa ve alan adları farklıysa, alanları güncelle
DO $$
BEGIN
    -- isletme_turu alanını kategori olarak yeniden adlandır
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'on_basvurular' AND column_name = 'isletme_turu') THEN
        ALTER TABLE public.on_basvurular RENAME COLUMN isletme_turu TO kategori;
    END IF;
    
    -- paket_tipi alanını paket_turu olarak yeniden adlandır
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'on_basvurular' AND column_name = 'paket_tipi') THEN
        ALTER TABLE public.on_basvurular RENAME COLUMN paket_tipi TO paket_turu;
    END IF;
    
    -- isletme_email alanını yetkili_email olarak yeniden adlandır
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'on_basvurular' AND column_name = 'isletme_email') THEN
        ALTER TABLE public.on_basvurular RENAME COLUMN isletme_email TO yetkili_email;
    END IF;
    
    -- isletme_website alanını website olarak yeniden adlandır
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'on_basvurular' AND column_name = 'isletme_website') THEN
        ALTER TABLE public.on_basvurular RENAME COLUMN isletme_website TO website;
    END IF;
    
    -- ek_bilgiler alanını aciklama olarak yeniden adlandır
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'on_basvurular' AND column_name = 'ek_bilgiler') THEN
        ALTER TABLE public.on_basvurular RENAME COLUMN ek_bilgiler TO aciklama;
    END IF;
    
    -- Eksik sütunları ekle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'on_basvurular' AND column_name = 'sehir') THEN
        ALTER TABLE public.on_basvurular ADD COLUMN sehir TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'on_basvurular' AND column_name = 'ilce') THEN
        ALTER TABLE public.on_basvurular ADD COLUMN ilce TEXT;
    END IF;
END $$;

-- RLS politikaları
ALTER TABLE public.on_basvurular ENABLE ROW LEVEL SECURITY;

-- Admin kullanıcıları için politikalar
CREATE POLICY "Adminler tüm başvuruları görebilir" ON public.on_basvurular
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin')
  );

CREATE POLICY "Adminler başvuru ekleyebilir" ON public.on_basvurular
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin')
  );

CREATE POLICY "Adminler başvuru güncelleyebilir" ON public.on_basvurular
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin')
  );

CREATE POLICY "Adminler başvuru silebilir" ON public.on_basvurular
  FOR DELETE USING (
    auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin')
  );

-- Herkes başvuru ekleyebilir (anonim kullanıcılar dahil)
CREATE POLICY "Herkes başvuru ekleyebilir" ON public.on_basvurular
  FOR INSERT WITH CHECK (true);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_on_basvurular_basvuru_tarihi ON public.on_basvurular (basvuru_tarihi);
CREATE INDEX IF NOT EXISTS idx_on_basvurular_durum ON public.on_basvurular (durum);
CREATE INDEX IF NOT EXISTS idx_on_basvurular_isletme_adi ON public.on_basvurular (isletme_adi);
CREATE INDEX IF NOT EXISTS idx_on_basvurular_kategori ON public.on_basvurular (kategori);
