-- Site ayarları tablosu oluşturma
CREATE TABLE IF NOT EXISTS public.site_ayarlari (
  id INTEGER PRIMARY KEY DEFAULT 1, -- Tek bir kayıt olacağı için sabit ID
  site_adi TEXT NOT NULL DEFAULT 'İşletme Yönetim Sistemi',
  site_aciklama TEXT DEFAULT 'SEO odaklı işletme yönetim sistemi',
  iletisim_email TEXT,
  iletisim_telefon TEXT,
  iletisim_adres TEXT,
  logo_url TEXT,
  footer_text TEXT DEFAULT '© 2023 İşletme Yönetim Sistemi. Tüm hakları saklıdır.',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Varsayılan site ayarlarını ekle
INSERT INTO public.site_ayarlari (id, site_adi, site_aciklama, footer_text)
VALUES (1, 'İşletme Yönetim Sistemi', 'SEO odaklı işletme yönetim sistemi', '© 2023 İşletme Yönetim Sistemi. Tüm hakları saklıdır.')
ON CONFLICT (id) DO NOTHING;

-- RLS politikaları
ALTER TABLE public.site_ayarlari ENABLE ROW LEVEL SECURITY;

-- Admin kullanıcıları için politikalar
CREATE POLICY "Adminler site ayarlarını okuyabilir" ON public.site_ayarlari
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin')
  );

CREATE POLICY "Adminler site ayarlarını güncelleyebilir" ON public.site_ayarlari
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin')
  );

CREATE POLICY "Adminler site ayarlarını ekleyebilir" ON public.site_ayarlari
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin')
  );
