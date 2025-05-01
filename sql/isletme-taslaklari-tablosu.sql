-- İşletme taslakları tablosu
CREATE TABLE IF NOT EXISTS public.isletme_taslaklari (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    form_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_isletme_taslaklari_user_id ON public.isletme_taslaklari(user_id);

-- Yetkilendirme
ALTER TABLE public.isletme_taslaklari ENABLE ROW LEVEL SECURITY;

-- Politikalar
CREATE POLICY "Kullanıcılar kendi taslaklarını görebilir" 
    ON public.isletme_taslaklari FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi taslaklarını ekleyebilir" 
    ON public.isletme_taslaklari FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi taslaklarını güncelleyebilir" 
    ON public.isletme_taslaklari FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi taslaklarını silebilir" 
    ON public.isletme_taslaklari FOR DELETE 
    USING (auth.uid() = user_id);

-- Açıklama
COMMENT ON TABLE public.isletme_taslaklari IS 'İşletme kayıt formlarının taslak olarak saklandığı tablo';
