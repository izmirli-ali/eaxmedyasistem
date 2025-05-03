-- Yeni ön başvuru ve işletme eklendiğinde bildirim oluşturacak fonksiyonlar ve tetikleyiciler

-- Yeni ön başvuru bildirimi oluşturacak fonksiyon
CREATE OR REPLACE FUNCTION public.on_basvuru_bildirim_olustur()
RETURNS TRIGGER AS $$
BEGIN
  -- Admin kullanıcılarına bildirim gönder
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    related_id,
    related_type,
    is_read
  )
  SELECT 
    id as user_id,
    'system' as type,
    'Yeni Ön Başvuru' as title,
    'Yeni bir ön başvuru alındı: ' || NEW.isletme_adi as message,
    NEW.id as related_id,
    'on_basvuru' as related_type,
    false as is_read
  FROM public.kullanicilar
  WHERE rol = 'admin';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Yeni işletme bildirimi oluşturacak fonksiyon
CREATE OR REPLACE FUNCTION public.isletme_bildirim_olustur()
RETURNS TRIGGER AS $$
BEGIN
  -- Admin kullanıcılarına bildirim gönder
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    related_id,
    related_type,
    is_read
  )
  SELECT 
    id as user_id,
    'business_added' as type,
    'Yeni İşletme Eklendi' as title,
    'Yeni bir işletme eklendi: ' || NEW.isletme_adi as message,
    NEW.id as related_id,
    'isletme' as related_type,
    false as is_read
  FROM public.kullanicilar
  WHERE rol = 'admin';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ön başvuru tetikleyicisi
DROP TRIGGER IF EXISTS on_basvuru_bildirim_trigger ON public.on_basvurular;
CREATE TRIGGER on_basvuru_bildirim_trigger
AFTER INSERT ON public.on_basvurular
FOR EACH ROW
EXECUTE FUNCTION public.on_basvuru_bildirim_olustur();

-- İşletme tetikleyicisi
DROP TRIGGER IF EXISTS isletme_bildirim_trigger ON public.isletmeler;
CREATE TRIGGER isletme_bildirim_trigger
AFTER INSERT ON public.isletmeler
FOR EACH ROW
EXECUTE FUNCTION public.isletme_bildirim_olustur();

-- İşletmeler2 tablosu için de tetikleyici (eğer bu tablo kullanılıyorsa)
DROP TRIGGER IF EXISTS isletme2_bildirim_trigger ON public.isletmeler2;
CREATE TRIGGER isletme2_bildirim_trigger
AFTER INSERT ON public.isletmeler2
FOR EACH ROW
EXECUTE FUNCTION public.isletme_bildirim_olustur();
