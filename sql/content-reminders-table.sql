-- İçerik güncelliği hatırlatmaları için tablo
CREATE TABLE IF NOT EXISTS public.content_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  isletme_id UUID NOT NULL REFERENCES public.isletmeler(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  recurrence TEXT,
  metadata JSONB
);

-- İndeksler
CREATE INDEX IF NOT EXISTS content_reminders_user_id_idx ON public.content_reminders(user_id);
CREATE INDEX IF NOT EXISTS content_reminders_isletme_id_idx ON public.content_reminders(isletme_id);
CREATE INDEX IF NOT EXISTS content_reminders_status_idx ON public.content_reminders(status);
CREATE INDEX IF NOT EXISTS content_reminders_due_date_idx ON public.content_reminders(due_date);

-- RLS politikaları
ALTER TABLE public.content_reminders ENABLE ROW LEVEL SECURITY;

-- Kullanıcılar kendi hatırlatmalarını okuyabilir
CREATE POLICY "Kullanıcılar kendi hatırlatmalarını okuyabilir" ON public.content_reminders
  FOR SELECT USING (auth.uid() = user_id);

-- Kullanıcılar kendi hatırlatmalarını ekleyebilir
CREATE POLICY "Kullanıcılar kendi hatırlatmalarını ekleyebilir" ON public.content_reminders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Kullanıcılar kendi hatırlatmalarını güncelleyebilir
CREATE POLICY "Kullanıcılar kendi hatırlatmalarını güncelleyebilir" ON public.content_reminders
  FOR UPDATE USING (auth.uid() = user_id);

-- Kullanıcılar kendi hatırlatmalarını silebilir
CREATE POLICY "Kullanıcılar kendi hatırlatmalarını silebilir" ON public.content_reminders
  FOR DELETE USING (auth.uid() = user_id);

-- Adminler tüm hatırlatmaları okuyabilir
CREATE POLICY "Adminler tüm hatırlatmaları okuyabilir" ON public.content_reminders
  FOR SELECT USING (auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin'));

-- Adminler tüm hatırlatmaları ekleyebilir
CREATE POLICY "Adminler tüm hatırlatmaları ekleyebilir" ON public.content_reminders
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin'));

-- Adminler tüm hatırlatmaları güncelleyebilir
CREATE POLICY "Adminler tüm hatırlatmaları güncelleyebilir" ON public.content_reminders
  FOR UPDATE USING (auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin'));

-- Adminler tüm hatırlatmaları silebilir
CREATE POLICY "Adminler tüm hatırlatmaları silebilir" ON public.content_reminders
  FOR DELETE USING (auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin'));
