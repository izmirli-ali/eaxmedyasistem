-- Kullanıcılar tablosundaki rol alanı için yeni değerler tanımlama
-- Mevcut roller: 'admin', 'user'
-- Yeni rol: 'sales' (satış temsilcisi)

-- Rol tipi için enum oluşturma (opsiyonel)
DO $$
BEGIN
   IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kullanici_rol_tipi') THEN
       CREATE TYPE kullanici_rol_tipi AS ENUM ('admin', 'user', 'sales');
   END IF;
EXCEPTION
   WHEN duplicate_object THEN
       NULL;
END$$;

-- Eğer enum kullanmak istemiyorsanız, bu kısmı atlayabilirsiniz
-- Rol alanı için check constraint ekleyelim
ALTER TABLE public.kullanicilar 
DROP CONSTRAINT IF EXISTS kullanicilar_rol_check;

ALTER TABLE public.kullanicilar
ADD CONSTRAINT kullanicilar_rol_check 
CHECK (rol IN ('admin', 'user', 'sales'));

-- Satış temsilcisi rolü için RLS politikaları
-- İşletme listesini görüntüleme yetkisi
CREATE POLICY IF NOT EXISTS "Satış temsilcileri işletmeleri okuyabilir" ON public.isletmeler
FOR SELECT USING (
   auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'sales')
);

-- İşletme ekleme yetkisi
CREATE POLICY IF NOT EXISTS "Satış temsilcileri işletme ekleyebilir" ON public.isletmeler
FOR INSERT WITH CHECK (
   auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'sales')
);

-- Satış temsilcilerinin kendi ekledikleri işletmeleri güncelleyebilmesi
CREATE POLICY IF NOT EXISTS "Satış temsilcileri kendi ekledikleri işletmeleri güncelleyebilir" ON public.isletmeler
FOR UPDATE USING (
   auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'sales') AND
   kullanici_id = auth.uid()
);
