-- Müşteri tablosu oluşturma
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

-- RLS politikaları
ALTER TABLE public.musteriler ENABLE ROW LEVEL SECURITY;

-- Admin kullanıcıları için politikalar
CREATE POLICY "Adminler tüm müşterileri okuyabilir" ON public.musteriler
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin')
  );

CREATE POLICY "Adminler müşteri ekleyebilir" ON public.musteriler
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin')
  );

CREATE POLICY "Adminler müşteri güncelleyebilir" ON public.musteriler
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin')
  );

CREATE POLICY "Adminler müşteri silebilir" ON public.musteriler
  FOR DELETE USING (
    auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin')
  );

-- Satış temsilcileri için politikalar
CREATE POLICY "Satış temsilcileri tüm müşterileri okuyabilir" ON public.musteriler
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'sales')
  );

CREATE POLICY "Satış temsilcileri müşteri ekleyebilir" ON public.musteriler
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'sales')
  );

CREATE POLICY "Satış temsilcileri kendi ekledikleri müşterileri güncelleyebilir" ON public.musteriler
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'sales') AND
    kullanici_id = auth.uid()
  );

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_musteriler_isletme_adi ON public.musteriler (isletme_adi);
CREATE INDEX IF NOT EXISTS idx_musteriler_sehir ON public.musteriler (sehir);
CREATE INDEX IF NOT EXISTS idx_musteriler_odeme_durumu ON public.musteriler (odeme_durumu);
CREATE INDEX IF NOT EXISTS idx_musteriler_sozlesme_bitis ON public.musteriler (sozlesme_bitis);
