-- Kullanıcı geri bildirimleri için tablo oluştur
CREATE TABLE IF NOT EXISTS public.user_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  rating SMALLINT,
  page_url TEXT NOT NULL,
  browser_info TEXT,
  screen_size TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'new',
  admin_response TEXT,
  admin_response_at TIMESTAMP WITH TIME ZONE,
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Geri bildirim türleri için indeks
CREATE INDEX IF NOT EXISTS idx_user_feedback_type ON public.user_feedback(type);

-- Kullanıcı ID'si için indeks
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON public.user_feedback(user_id);

-- Durum için indeks
CREATE INDEX IF NOT EXISTS idx_user_feedback_status ON public.user_feedback(status);

-- Form taslakları için tablo oluştur
CREATE TABLE IF NOT EXISTS public.form_drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  form_type TEXT NOT NULL,
  form_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kullanıcı ID'si ve form türü için birleşik indeks
CREATE UNIQUE INDEX IF NOT EXISTS idx_form_drafts_user_form ON public.form_drafts(user_id, form_type);
