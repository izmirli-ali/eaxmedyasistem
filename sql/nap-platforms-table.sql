-- NAP Platformları Tablosu
CREATE TABLE IF NOT EXISTS public.nap_platforms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  isletme_id UUID NOT NULL REFERENCES public.isletmeler2(id) ON DELETE CASCADE,
  platform_adi TEXT NOT NULL,
  platform_url TEXT NOT NULL,
  nap_verileri JSONB NOT NULL, -- İsim, adres, telefon bilgilerini içerir
  son_kontrol_tarihi TIMESTAMP WITH TIME ZONE,
  tutarli_mi BOOLEAN DEFAULT FALSE,
  olusturulma_tarihi TIMESTAMP WITH TIME ZONE DEFAULT now(),
  guncelleme_tarihi TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS nap_platforms_isletme_id_idx ON public.nap_platforms(isletme_id);

-- RLS Politikaları
ALTER TABLE public.nap_platforms ENABLE ROW LEVEL SECURITY;

-- Okuma politikası
CREATE POLICY "Kullanıcılar kendi işletmelerinin NAP platformlarını okuyabilir" ON public.nap_platforms
  FOR SELECT USING (
    auth.uid() IN (
      SELECT kullanici_id FROM public.isletmeler2 WHERE id = isletme_id
    ) OR 
    EXISTS (
      SELECT 1 FROM public.kullanicilar 
      WHERE id = auth.uid() AND rol IN ('admin', 'super_admin')
    )
  );

-- Yazma politikası
CREATE POLICY "Kullanıcılar kendi işletmelerinin NAP platformlarını ekleyebilir" ON public.nap_platforms
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT kullanici_id FROM public.isletmeler2 WHERE id = isletme_id
    ) OR 
    EXISTS (
      SELECT 1 FROM public.kullanicilar 
      WHERE id = auth.uid() AND rol IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Kullanıcılar kendi işletmelerinin NAP platformlarını güncelleyebilir" ON public.nap_platforms
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT kullanici_id FROM public.isletmeler2 WHERE id = isletme_id
    ) OR 
    EXISTS (
      SELECT 1 FROM public.kullanicilar 
      WHERE id = auth.uid() AND rol IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "Kullanıcılar kendi işletmelerinin NAP platformlarını silebilir" ON public.nap_platforms
  FOR DELETE USING (
    auth.uid() IN (
      SELECT kullanici_id FROM public.isletmeler2 WHERE id = isletme_id
    ) OR 
    EXISTS (
      SELECT 1 FROM public.kullanicilar 
      WHERE id = auth.uid() AND rol IN ('admin', 'super_admin')
    )
  );

-- Tetikleyici fonksiyonu - güncelleme tarihini otomatik günceller
CREATE OR REPLACE FUNCTION update_nap_platform_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.guncelleme_tarihi = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_nap_platform_updated_at_trigger
BEFORE UPDATE ON public.nap_platforms
FOR EACH ROW
EXECUTE FUNCTION update_nap_platform_updated_at();
