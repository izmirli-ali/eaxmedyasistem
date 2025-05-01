-- Kullanıcılar tablosunu güncelleme
-- updated_at sütunu yoksa ekle

DO $$
BEGIN
  -- updated_at sütunu var mı kontrol et
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'kullanicilar' 
    AND column_name = 'updated_at'
  ) THEN
    -- updated_at sütunu yoksa ekle
    ALTER TABLE kullanicilar 
    ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();
  END IF;
END
$$;

-- updated_at alanını otomatik güncellemek için trigger
CREATE OR REPLACE FUNCTION update_kullanicilar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger varsa kaldır ve yeniden oluştur
DROP TRIGGER IF EXISTS update_kullanicilar_updated_at ON kullanicilar;

CREATE TRIGGER update_kullanicilar_updated_at
BEFORE UPDATE ON kullanicilar
FOR EACH ROW
EXECUTE FUNCTION update_kullanicilar_updated_at();

-- Rol alanı için check constraint ekle
ALTER TABLE kullanicilar 
DROP CONSTRAINT IF EXISTS kullanicilar_rol_check;

ALTER TABLE kullanicilar
ADD CONSTRAINT kullanicilar_rol_check 
CHECK (rol IN ('admin', 'user', 'sales'));
