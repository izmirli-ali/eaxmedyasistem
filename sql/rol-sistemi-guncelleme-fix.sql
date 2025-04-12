-- Kullanıcılar tablosundaki rol alanı için yeni değerler tanımlama
-- Mevcut roller: 'admin', 'user'
-- Yeni rol: 'sales' (satış temsilcisi)

-- Rol tipi için enum oluşturma (opsiyonel)
DO $
BEGIN
   IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kullanici_rol_tipi') THEN
       CREATE TYPE kullanici_rol_tipi AS ENUM ('admin', 'user', 'sales');
   END IF;
EXCEPTION
   WHEN duplicate_object THEN
       NULL;
END$;

-- Eğer enum kullanmak istemiyorsanız, bu kısmı atlayabilirsiniz
-- Rol alanı için check constraint ekleyelim
ALTER TABLE public.kullanicilar 
DROP CONSTRAINT IF EXISTS kullanicilar_rol_check;

ALTER TABLE public.kullanicilar
ADD CONSTRAINT kullanicilar_rol_check 
CHECK (rol IN ('admin', 'user', 'sales'));

-- Önce mevcut politikaları kaldır
DROP POLICY IF EXISTS "Satış temsilcileri işletmeleri okuyabilir" ON public.isletmeler;
DROP POLICY IF EXISTS "Satış temsilcileri işletme ekleyebilir" ON public.isletmeler;
DROP POLICY IF EXISTS "Satış temsilcileri kendi ekledikleri işletmeleri güncelleyebilir" ON public.isletmeler;

-- Kullanıcılar tablosu için RLS politikalarını düzelt
ALTER TABLE public.kullanicilar ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar tablosu için temel politikalar
DROP POLICY IF EXISTS "Kullanıcılar kendi profillerini görebilir" ON public.kullanicilar;
CREATE POLICY "Kullanıcılar kendi profillerini görebilir" ON public.kullanicilar
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Adminler tüm kullanıcıları görebilir" ON public.kullanicilar;
CREATE POLICY "Adminler tüm kullanıcıları görebilir" ON public.kullanicilar
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid() AND auth.users.is_super_admin = true
        )
    );

-- İşletmeler tablosu için güvenli politikalar
CREATE POLICY "Herkes işletmeleri okuyabilir" ON public.isletmeler
    FOR SELECT USING (true);

CREATE POLICY "Adminler işletmeleri yönetebilir" ON public.isletmeler
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid() AND auth.users.is_super_admin = true
        )
    );

CREATE POLICY "Satış temsilcileri işletme ekleyebilir" ON public.isletmeler
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid() AND auth.users.email LIKE '%@sales.example.com'
        )
    );

CREATE POLICY "Satış temsilcileri kendi ekledikleri işletmeleri güncelleyebilir" ON public.isletmeler
    FOR UPDATE USING (
        kullanici_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid() AND auth.users.email LIKE '%@sales.example.com'
        )
    );
