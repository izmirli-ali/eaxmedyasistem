-- sosyal_medya sütununun veri tipini kontrol et ve gerekirse güncelle
DO $$
BEGIN
  -- Sütun var mı kontrol et
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'isletmeler' 
    AND column_name = 'sosyal_medya'
  ) THEN
    -- Sütun varsa, veri tipini JSONB olarak güncelle
    ALTER TABLE isletmeler 
    ALTER COLUMN sosyal_medya TYPE JSONB USING sosyal_medya::jsonb;
  ELSE
    -- Sütun yoksa ekle
    ALTER TABLE isletmeler 
    ADD COLUMN sosyal_medya JSONB;
  END IF;
END
$$;
