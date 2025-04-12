-- Otomatik yedekleme zamanlama tablosu
CREATE TABLE IF NOT EXISTS public.backup_schedules (
  id INTEGER PRIMARY KEY DEFAULT 1, -- Tek bir kayıt olacağı için sabit ID
  enabled BOOLEAN DEFAULT false,
  frequency TEXT DEFAULT 'daily', -- daily, weekly, monthly
  time_of_day TIME DEFAULT '03:00:00', -- Günün hangi saatinde çalışacak
  day_of_week INTEGER DEFAULT 1, -- Haftanın hangi günü (1-7, Pazartesi-Pazar)
  day_of_month INTEGER DEFAULT 1, -- Ayın hangi günü (1-31)
  tables TEXT[] DEFAULT ARRAY['isletmeler', 'kullanicilar', 'musteriler', 'site_ayarlari']::TEXT[],
  retention_count INTEGER DEFAULT 10, -- Saklanacak maksimum yedek sayısı
  last_run TIMESTAMP WITH TIME ZONE,
  next_run TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Varsayılan zamanlama kaydını ekle
INSERT INTO public.backup_schedules (id, enabled, frequency, time_of_day)
VALUES (1, false, 'daily', '03:00:00')
ON CONFLICT (id) DO NOTHING;

-- RLS politikaları
ALTER TABLE public.backup_schedules ENABLE ROW LEVEL SECURITY;

-- Admin kullanıcıları için politikalar
CREATE POLICY "Adminler yedekleme zamanlamalarını okuyabilir" ON public.backup_schedules
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin')
  );

CREATE POLICY "Adminler yedekleme zamanlamalarını güncelleyebilir" ON public.backup_schedules
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin')
  );

CREATE POLICY "Adminler yedekleme zamanlaması ekleyebilir" ON public.backup_schedules
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin')
  );
