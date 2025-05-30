import { createClient } from "@/lib/supabase/client"

export class ImageUploadService {
  /**
   * Birden fazla resmi Supabase Storage'a yükler
   * @param files Yüklenecek dosyalar
   * @param folderPath Yüklenecek klasör yolu
   * @param onProgress İlerleme durumu callback fonksiyonu
   * @returns Yüklenen dosyaların URL'leri ve hataları
   */
  static async uploadMultipleImages(
    files: File[],
    folderPath = "isletme-fotograflari",
    onProgress?: (fileName: string, progress: number) => void,
  ): Promise<{ urls: string[]; errors: string[] }> {
    const supabase = createClient()
    const urls: string[] = []
    const errors: string[] = []

    // Yeni bucket adı: isletme-fotograflari2
    const bucketName = "isletme-fotograflari2"

    for (const file of files) {
      try {
        // Dosya adını benzersiz yap
        const fileExt = file.name.split(".").pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`
        const filePath = `${folderPath}/${fileName}`

        // İlerleme durumunu başlat
        if (onProgress) {
          onProgress(file.name, 0)
        }

        // Dosyayı yükle
        const { data, error } = await supabase.storage.from(bucketName).upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })

        if (error) {
          console.error("Dosya yükleme hatası:", error)
          errors.push(`${file.name}: ${error.message}`)
          continue
        }

        // İlerleme durumunu güncelle
        if (onProgress) {
          onProgress(file.name, 50)
        }

        // Dosya URL'sini oluştur
        const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filePath)

        if (urlData) {
          urls.push(urlData.publicUrl)
        } else {
          errors.push(`${file.name}: URL oluşturulamadı`)
        }

        // İlerleme durumunu tamamla
        if (onProgress) {
          onProgress(file.name, 100)
        }
      } catch (error: any) {
        console.error("Beklenmeyen hata:", error)
        errors.push(`${file.name}: ${error.message || "Beklenmeyen bir hata oluştu"}`)
      }
    }

    return { urls, errors }
  }

  /**
   * Bir resmi Supabase Storage'dan siler
   * @param url Silinecek resmin URL'si
   * @returns İşlem başarılı mı?
   */
  static async deleteImage(url: string): Promise<boolean> {
    try {
      const supabase = createClient()

      // Yeni bucket adı: isletme-fotograflari2
      const bucketName = "isletme-fotograflari2"

      // URL'den dosya yolunu çıkar
      const urlParts = url.split(`/storage/v1/object/public/${bucketName}/`)

      if (urlParts.length !== 2) {
        console.error("Geçersiz dosya URL'si:", url)
        return false
      }

      const filePath = urlParts[1]

      // Dosyayı sil
      const { error } = await supabase.storage.from(bucketName).remove([filePath])

      if (error) {
        console.error("Dosya silme hatası:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Beklenmeyen hata:", error)
      return false
    }
  }
}
