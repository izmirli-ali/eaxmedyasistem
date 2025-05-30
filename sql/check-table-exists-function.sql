-- Tablo varlığını kontrol eden fonksiyon (düzeltilmiş)
CREATE OR REPLACE FUNCTION public.check_table_exists(p_table_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  table_exists boolean;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public'
    AND table_name = p_table_name
  ) INTO table_exists;
  
  RETURN table_exists;
END;
$$;

-- Fonksiyona erişim izni
GRANT EXECUTE ON FUNCTION public.check_table_exists TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_table_exists TO anon;
GRANT EXECUTE ON FUNCTION public.check_table_exists TO service_role;
