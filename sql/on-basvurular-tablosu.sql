-- Ön başvurular tablosu
CREATE TABLE IF NOT EXISTS public.on_basvurular (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  basvuru_tarihi TIMESTAMP WITH TIME ZONE DEFAULT now(),
  isletme_adi TEXT NOT NULL,
  isletme_turu TEXT,
  isletme_adresi TEXT,
  isletme_telefonu TEXT,
  isletme_email TEXT,
  isletme_website TEXT,
  yetkili_adi TEXT NOT NULL,
  yetkili_telefonu TEXT NOT NULL,
  yetkili_email TEXT,
  ek_bilgiler TEXT,
  paket_tipi TEXT NOT NULL,
  durum TEXT NOT NULL DEFAULT 'yeni', -- yeni, inceleniyor, onaylandi, reddedildi
  notlar TEXT,
  atanan_kullanici UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

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
