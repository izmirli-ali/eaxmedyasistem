-- İşletmeler tablosuna yeni özellikler eklemek için SQL komutları
-- Bu komutları Supabase SQL editöründe çalıştırabilirsiniz

-- Yeni özellikler için sütunlar ekleniyor
ALTER TABLE isletmeler 
ADD COLUMN IF NOT EXISTS bebek_dostu BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS evcil_hayvan_dostu BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sigara_alani BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS canli_muzik BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS kahvalti BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS aksam_yemegi BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tv BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ucretsiz_teslimat BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS nakit_odeme BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS online_odeme BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS temassiz_odeme BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS organik_urunler BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS glutensiz_secenekler BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS vegan_secenekler BOOLEAN DEFAULT FALSE;

-- Çalışma saatleri için JSON sütunu ekleniyor (mevcut calisma_saatleri string ise)
-- ALTER TABLE isletmeler 
-- ADD COLUMN IF NOT EXISTS calisma_gunleri JSONB DEFAULT '{}'::JSONB;

-- Yorum: Eğer mevcut calisma_saatleri sütununu JSON formatına dönüştürmek isterseniz:
-- ALTER TABLE isletmeler 
-- ALTER COLUMN calisma_saatleri TYPE JSONB USING COALESCE(calisma_saatleri::JSONB, '{}'::JSONB);

-- Taslak yönetimi için sütunlar ekleniyor
ALTER TABLE isletmeler
ADD COLUMN IF NOT EXISTS taslak_durumu BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS taslak_versiyonu INTEGER DEFAULT 1;

-- İstatistikler için sütunlar ekleniyor
ALTER TABLE isletmeler
ADD COLUMN IF NOT EXISTS goruntulenme_sayisi INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS son_guncelleme_tarihi TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS onay_durumu TEXT DEFAULT 'beklemede',
ADD COLUMN IF NOT EXISTS aktif BOOLEAN DEFAULT TRUE;

-- İndeksler ekleniyor
CREATE INDEX IF NOT EXISTS isletmeler_taslak_durumu_idx ON isletmeler (taslak_durumu);
CREATE INDEX IF NOT EXISTS isletmeler_onay_durumu_idx ON isletmeler (onay_durumu);
CREATE INDEX IF NOT EXISTS isletmeler_aktif_idx ON isletmeler (aktif);
