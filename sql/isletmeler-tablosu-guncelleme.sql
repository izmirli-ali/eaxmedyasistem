-- İşletmeler tablosuna yeni sütunlar ekleme
ALTER TABLE isletmeler 
ADD COLUMN IF NOT EXISTS alt_kategori TEXT,
ADD COLUMN IF NOT EXISTS ilce TEXT;

-- Eğer sosyal_medya sütunu yoksa ekle
DO $$
BEGIN
   IF NOT EXISTS (
       SELECT 1 
       FROM information_schema.columns 
       WHERE table_name = 'isletmeler' 
       AND column_name = 'sosyal_medya'
   ) THEN
       ALTER TABLE isletmeler ADD COLUMN sosyal_medya TEXT;
   END IF;
END $$;
