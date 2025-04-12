-- Kullanıcı rolünü güvenli bir şekilde almak için stored procedure
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER -- Bu önemli, fonksiyonu çağıran kullanıcının yetkilerini değil, fonksiyonu oluşturan kullanıcının yetkilerini kullanır
AS $$
DECLARE
    user_role TEXT;
BEGIN
    -- Doğrudan kullanıcı tablosundan rol bilgisini al
    SELECT rol INTO user_role FROM public.kullanicilar WHERE id = user_id;
    
    -- Eğer rol bulunamazsa varsayılan olarak 'user' döndür
    IF user_role IS NULL THEN
        RETURN 'user';
    END IF;
    
    RETURN user_role;
END;
$$;
