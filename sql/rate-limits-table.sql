-- Rate limiting için tablo oluşturma
CREATE TABLE IF NOT EXISTS public.rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip TEXT NOT NULL UNIQUE,
    requests JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeks oluşturma
CREATE INDEX IF NOT EXISTS idx_rate_limits_ip ON public.rate_limits (ip);

-- RLS politikaları
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Sadece admin kullanıcıların erişimine izin ver
CREATE POLICY admin_rate_limits_policy ON public.rate_limits
    USING (auth.uid() IN (
        SELECT id FROM public.kullanicilar WHERE rol = 'admin'
    ));

-- Otomatik updated_at güncellemesi için trigger
CREATE OR REPLACE FUNCTION update_rate_limits_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rate_limits_timestamp
BEFORE UPDATE ON public.rate_limits
FOR EACH ROW
EXECUTE FUNCTION update_rate_limits_updated_at();

-- Eski kayıtları temizlemek için fonksiyon
CREATE OR REPLACE FUNCTION clean_old_rate_limits()
RETURNS void AS $$
BEGIN
    -- 1 günden eski kayıtları temizle
    DELETE FROM public.rate_limits
    WHERE updated_at < NOW() - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- Temizleme fonksiyonunu çağırmak için cron job (pgcron eklentisi gerektirir)
-- SELECT cron.schedule('0 0 * * *', 'SELECT clean_old_rate_limits()');
