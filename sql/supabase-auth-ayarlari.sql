-- Supabase Auth ayarlarını güncellemek için SQL
-- Bu SQL, Supabase'in auth.users tablosunu doğrudan değiştirmez, sadece bilgi amaçlıdır

-- NOT: Bu SQL'i çalıştırmayın, bunun yerine Supabase Dashboard'dan ayarları yapın:
-- 1. Supabase Dashboard'a gidin
-- 2. Authentication > Settings bölümüne gidin
-- 3. "Email Auth" bölümünde "Enable email confirmations" seçeneğini kapatın
-- 4. Veya "Confirm email template" ayarlarını düzenleyin

-- Alternatif olarak, kullanıcı oluşturma sırasında admin API kullanarak
-- doğrudan doğrulanmış kullanıcılar oluşturabilirsiniz (bu örnekte gösterilmemiştir)

-- Mevcut kullanıcıları doğrulanmış olarak işaretlemek için (sadece referans amaçlı):
-- UPDATE auth.users SET email_confirmed_at = NOW() WHERE email_confirmed_at IS NULL;

-- Bu SQL'i çalıştırmak yerine, kullanıcı arayüzünde eklediğimiz
-- "E-posta doğrulaması olmadan hemen giriş yapabilsin" seçeneğini kullanın
