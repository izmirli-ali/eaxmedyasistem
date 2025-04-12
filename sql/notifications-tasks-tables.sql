-- Bildirimler tablosu oluşturma
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id TEXT,
  related_type TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Görevler tablosu oluşturma
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,
  priority TEXT NOT NULL,
  due_date DATE,
  assigned_to UUID REFERENCES auth.users(id),
  assigned_by UUID NOT NULL REFERENCES auth.users(id),
  related_id TEXT,
  related_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- RLS politikaları
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Bildirimler için RLS politikaları
CREATE POLICY "Kullanıcılar kendi bildirimlerini görebilir" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Adminler tüm bildirimleri görebilir" ON public.notifications
  FOR SELECT USING (auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin'));

CREATE POLICY "Adminler bildirim ekleyebilir" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin'));

CREATE POLICY "Kullanıcılar kendi bildirimlerini güncelleyebilir" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Görevler için RLS politikaları
CREATE POLICY "Kullanıcılar kendilerine atanan görevleri görebilir" ON public.tasks
  FOR SELECT USING (auth.uid() = assigned_to OR auth.uid() = assigned_by);

CREATE POLICY "Adminler tüm görevleri görebilir" ON public.tasks
  FOR SELECT USING (auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin'));

CREATE POLICY "Adminler ve satış temsilcileri görev ekleyebilir" ON public.tasks
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol IN ('admin', 'sales')));

CREATE POLICY "Adminler tüm görevleri güncelleyebilir" ON public.tasks
  FOR UPDATE USING (auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin'));

CREATE POLICY "Kullanıcılar kendilerine atanan görevleri güncelleyebilir" ON public.tasks
  FOR UPDATE USING (auth.uid() = assigned_to);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
