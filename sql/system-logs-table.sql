-- Sistem logları tablosu
CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    action TEXT NOT NULL,
    status TEXT NOT NULL,
    details JSONB,
    user_id UUID REFERENCES auth.users(id)
);

-- RLS politikaları
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Sadece adminler tüm logları görebilir
CREATE POLICY "Adminler tüm sistem loglarını görebilir" ON public.system_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.kullanicilar
            WHERE kullanicilar.id = auth.uid() AND kullanicilar.rol = 'admin'
        )
    );

-- Sadece adminler log ekleyebilir (manuel olarak)
CREATE POLICY "Adminler log ekleyebilir" ON public.system_logs
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.kullanicilar
            WHERE kullanicilar.id = auth.uid() AND kullanicilar.rol = 'admin'
        )
    );

-- Servis rolü her zaman log ekleyebilir (otomatik işlemler için)
CREATE POLICY "Servis rolü log ekleyebilir" ON public.system_logs
    FOR INSERT
    WITH CHECK (auth.role() = 'service_role');

-- İndeks oluştur
CREATE INDEX IF NOT EXISTS system_logs_action_idx ON public.system_logs (action);
CREATE INDEX IF NOT EXISTS system_logs_status_idx ON public.system_logs (status);
CREATE INDEX IF NOT EXISTS system_logs_created_at_idx ON public.system_logs (created_at);
