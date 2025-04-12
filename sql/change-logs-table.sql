-- Değişiklik günlüğü tablosu
CREATE TABLE IF NOT EXISTS public.change_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version TEXT NOT NULL,
  change_type TEXT NOT NULL CHECK (change_type IN ('feature', 'bugfix', 'improvement', 'database', 'security', 'other')),
  description TEXT NOT NULL,
  details TEXT,
  affected_components TEXT[],
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_major BOOLEAN DEFAULT false
);

-- RLS politikaları
ALTER TABLE public.change_logs ENABLE ROW LEVEL SECURITY;

-- Herkes değişiklik kayıtlarını okuyabilir
CREATE POLICY "Herkes değişiklik kayıtlarını okuyabilir" ON public.change_logs
  FOR SELECT USING (true);

-- Sadece adminler değişiklik kaydı ekleyebilir
CREATE POLICY "Adminler değişiklik kaydı ekleyebilir" ON public.change_logs
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin')
  );

-- Sadece adminler değişiklik kaydı güncelleyebilir
CREATE POLICY "Adminler değişiklik kaydı güncelleyebilir" ON public.change_logs
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin')
  );

-- İlk sürüm kaydını ekle
INSERT INTO public.change_logs (version, change_type, description, created_by, is_major)
VALUES ('1.0.0', 'feature', 'İlk sürüm', 'Sistem', true)
ON CONFLICT DO NOTHING;
