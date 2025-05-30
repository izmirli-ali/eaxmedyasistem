-- Backlinks Tablosu
CREATE TABLE IF NOT EXISTS public.backlinks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.isletmeler2(id) ON DELETE CASCADE,
  source_url TEXT NOT NULL,
  source_domain TEXT NOT NULL,
  target_url TEXT NOT NULL,
  anchor_text TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  first_detected TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_checked TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  check_frequency TEXT NOT NULL DEFAULT 'weekly',
  notes TEXT,
  da INTEGER, -- Domain Authority
  pa INTEGER, -- Page Authority
  trust_flow INTEGER,
  citation_flow INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- İndeksler
CREATE INDEX IF NOT EXISTS backlinks_business_id_idx ON public.backlinks(business_id);
CREATE INDEX IF NOT EXISTS backlinks_source_domain_idx ON public.backlinks(source_domain);
CREATE INDEX IF NOT EXISTS backlinks_status_idx ON public.backlinks(status);
CREATE INDEX IF NOT EXISTS backlinks_last_checked_idx ON public.backlinks(last_checked);

-- RLS Politikaları
ALTER TABLE public.backlinks ENABLE ROW LEVEL SECURITY;

-- Okuma politikası
CREATE POLICY "Kullanıcılar kendi işletmelerinin backlinklerini okuyabilir" ON public.backlinks
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM public.isletmeler2 WHERE id = business_id
    ) OR 
    auth.uid() IN (
      SELECT id FROM public.kullanicilar WHERE rol = 'admin'
    )
  );

-- Yazma politikası
CREATE POLICY "Kullanıcılar kendi işletmelerinin backlinklerini ekleyebilir" ON public.backlinks
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM public.isletmeler2 WHERE id = business_id
    ) OR 
    auth.uid() IN (
      SELECT id FROM public.kullanicilar WHERE rol = 'admin'
    )
  );

CREATE POLICY "Kullanıcılar kendi işletmelerinin backlinklerini güncelleyebilir" ON public.backlinks
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM public.isletmeler2 WHERE id = business_id
    ) OR 
    auth.uid() IN (
      SELECT id FROM public.kullanicilar WHERE rol = 'admin'
    )
  );

CREATE POLICY "Kullanıcılar kendi işletmelerinin backlinklerini silebilir" ON public.backlinks
  FOR DELETE USING (
    auth.uid() IN (
      SELECT user_id FROM public.isletmeler2 WHERE id = business_id
    ) OR 
    auth.uid() IN (
      SELECT id FROM public.kullanicilar WHERE rol = 'admin'
    )
  );
