-- Yedekleme tablosu oluşturma
CREATE TABLE IF NOT EXISTS public.backups (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT NOT NULL,
  file_name TEXT,
  file_size BIGINT,
  tables TEXT[] NOT NULL,
  error TEXT,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- RLS politikaları
ALTER TABLE public.backups ENABLE ROW LEVEL SECURITY;

-- Admin kullanıcıları için politikalar
CREATE POLICY "Adminler yedeklemeleri görüntüleyebilir" ON public.backups
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin')
  );

CREATE POLICY "Adminler yedekleme ekleyebilir" ON public.backups
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin')
  );

CREATE POLICY "Adminler yedekleme güncelleyebilir" ON public.backups
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin')
  );

CREATE POLICY "Adminler yedekleme silebilir" ON public.backups
  FOR DELETE USING (
    auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin')
  );

-- Storage bucket oluşturma
-- NOT: Bu SQL doğrudan çalıştırılamaz, Supabase Dashboard'dan manuel olarak yapılmalıdır
-- 1. Supabase Dashboard'a gidin
-- 2. Storage bölümüne gidin
-- 3. "New Bucket" butonuna tıklayın
-- 4. Bucket adı olarak "backups" girin
-- 5. "Private" seçeneğini işaretleyin
-- 6. "Create" butonuna tıklayın

-- Storage bucket için RLS politikaları
-- NOT: Bu SQL doğrudan çalıştırılamaz, Supabase Dashboard'dan manuel olarak yapılmalıdır
-- 1. Supabase Dashboard'a gidin
-- 2. Storage bölümüne gidin
-- 3. "backups" bucket'ını seçin
-- 4. "Policies" sekmesine tıklayın
-- 5. Aşağıdaki politikaları ekleyin:

-- SELECT (download) politikası
-- SELECT auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin')

-- INSERT (upload) politikası
-- INSERT auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin')

-- UPDATE politikası
-- UPDATE auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin')

-- DELETE politikası
-- DELETE auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin')
