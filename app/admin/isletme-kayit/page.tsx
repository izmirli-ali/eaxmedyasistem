"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { IsletmeBilgileriForm } from "@/components/isletme-kayit/isletme-bilgileri-form"
import { KonumBilgileriForm } from "@/components/isletme-kayit/konum-bilgileri-form"
import { IletisimBilgileriForm } from "@/components/isletme-kayit/iletisim-bilgileri-form"
import { CalismaSaatleriForm } from "@/components/isletme-kayit/calisma-saatleri-form"
import { OzelliklerForm } from "@/components/isletme-kayit/ozellikler-form"
import { SEOBilgileriForm } from "@/components/isletme-kayit/seo-bilgileri-form"
import { FotograflarForm } from "@/components/isletme-kayit/fotograflar-form"
import FormOnizleme from "@/components/isletme-kayit/form-onizleme"
import { TaslakYonetimi } from "@/components/isletme-kayit/taslak-yonetimi"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import type { IsletmeType } from "@/lib/supabase-schema"
// İlk olarak, ImageUploadService'i import edelim
import { ImageUploadService } from "@/lib/image-upload-service"

export default function IsletmeKayitPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("isletme-bilgileri")
  const [progress, setProgress] = useState(0)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]) // Dosya yükleme için state
  const [uploadingPhotos, setUploadingPhotos] = useState(false) // Yükleme durumu
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({}) // Yükleme ilerleme durumu
  const [isSaving, setIsSaving] = useState(false) // Kaydetme durumu

  const [formData, setFormData] = useState({
    isletme_adi: "",
    kategori: "",
    alt_kategori: "",
    aciklama: "",
    adres: "",
    sehir: "",
    ilce: "",
    konum: { lat: 0, lng: 0 },
    telefon: "",
    email: "",
    website: "",
    sosyal_medya: {
      facebook: "",
      instagram: "",
      twitter: "",
      linkedin: "",
      youtube: "",
    },
    calisma_saatleri: "",
    calisma_gunleri: {
      pazartesi: { acik: true, acilis: "09:00", kapanis: "18:00" },
      sali: { acik: true, acilis: "09:00", kapanis: "18:00" },
      carsamba: { acik: true, acilis: "09:00", kapanis: "18:00" },
      persembe: { acik: true, acilis: "09:00", kapanis: "18:00" },
      cuma: { acik: true, acilis: "09:00", kapanis: "18:00" },
      cumartesi: { acik: false, acilis: "10:00", kapanis: "15:00" },
      pazar: { acik: false, acilis: "10:00", kapanis: "15:00" },
    },
    wifi: false,
    otopark: false,
    kredi_karti: false,
    engelli_erisim: false,
    rezervasyon: false,
    paket_servis: false,
    one_cikan: false,
    sunulan_hizmetler: "",
    seo_baslik: "",
    seo_aciklama: "",
    seo_anahtar_kelimeler: "",
    fotograf_url: "",
    fotograflar: [],
    fiyat_araligi: "",
  })

  // Sekme değiştiğinde ilerleme çubuğunu güncelle
  useEffect(() => {
    const tabOrder = [
      "isletme-bilgileri",
      "konum-bilgileri",
      "iletisim-bilgileri",
      "calisma-saatleri",
      "ozellikler",
      "seo-bilgileri",
      "fotograflar",
      "onizleme",
    ]
    const currentIndex = tabOrder.indexOf(activeTab)
    setProgress(((currentIndex + 1) / tabOrder.length) * 100)
  }, [activeTab])

  // Form verilerini güncelle
  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => {
      // Eğer sosyal_medya alanı güncelleniyorsa, özel işlem yap
      if (field === "sosyal_medya") {
        return {
          ...prev,
          sosyal_medya: {
            ...prev.sosyal_medya,
            ...value,
          },
        }
      }

      // Diğer alanlar için normal güncelleme
      return {
        ...prev,
        [field]: value,
      }
    })
  }

  // URL slug oluştur
  const generateSlug = (isletmeAdi: string, sehir: string): string => {
    if (!isletmeAdi || !sehir) return ""

    const turkishChars: { [key: string]: string } = {
      ç: "c",
      ğ: "g",
      ı: "i",
      ö: "o",
      ş: "s",
      ü: "u",
      Ç: "C",
      Ğ: "G",
      İ: "I",
      Ö: "O",
      Ş: "S",
      Ü: "U",
    }

    const normalizedSehir = sehir
      .toLowerCase()
      .replace(/[çğıöşüÇĞİÖŞÜ]/g, (char) => turkishChars[char] || char)
      .trim()

    const normalizedIsletmeAdi = isletmeAdi
      .toLowerCase()
      .replace(/[çğıöşüÇĞİÖŞÜ]/g, (char) => turkishChars[char] || char)
      .trim()
      .replace(/\s+/g, "-") // Boşlukları tire ile değiştir
      .replace(/[^a-z0-9-]/g, "") // Alfanümerik olmayan karakterleri kaldır
      .replace(/-+/g, "-") // Birden fazla tireyi tek tire ile değiştir
      .replace(/^-|-$/g, "") // Baştaki ve sondaki tireleri kaldır

    return `${normalizedSehir}/${normalizedIsletmeAdi}`
  }

  // saveFormData fonksiyonunu güncelleyelim - bu fonksiyonu tamamen değiştirin
  const saveFormData = async () => {
    try {
      setIsSaving(true)

      // URL slug oluştur
      const slug = generateSlug(formData.isletme_adi, formData.sehir)

      // Supabase'e kaydet
      const supabase = createClient()

      // Önce görselleri yükle
      let uploadedImageUrls: string[] = []

      if (selectedFiles && selectedFiles.length > 0) {
        setUploadingPhotos(true)

        // ImageUploadService kullanarak görselleri yükle - yeni bucket adını kullan
        const uploadResult = await ImageUploadService.uploadMultipleImages(
          selectedFiles,
          "isletmeler", // klasör adı
          (fileName, progress) => {
            setUploadProgress((prev) => ({
              ...prev,
              [fileName]: progress,
            }))
          },
        )

        uploadedImageUrls = uploadResult.urls

        if (uploadResult.errors.length > 0) {
          console.error("Bazı görseller yüklenemedi:", uploadResult.errors)
          toast({
            title: "Uyarı",
            description: "Bazı görseller yüklenemedi. Lütfen daha sonra tekrar deneyin.",
            variant: "destructive",
          })
        }

        setUploadingPhotos(false)
      }

      // Mevcut fotograflar ve yeni yüklenen görselleri birleştir
      const allPhotos = [...formData.fotograflar, ...uploadedImageUrls]

      // Ana görsel URL'sini belirle
      const mainPhotoUrl = formData.fotograf_url || (allPhotos.length > 0 ? allPhotos[0] : null)

      // Özellikleri bir nesne olarak topla
      const ozellikler = {
        wifi: formData.wifi || false,
        otopark: formData.otopark || false,
        kredi_karti: formData.kredi_karti || false,
        engelli_dostu: formData.engelli_erisim || false, // engelli_erisim -> engelli_dostu olarak değiştirildi
        rezervasyon: formData.rezervasyon || false,
        paket_servis: formData.paket_servis || false,
      }

      // Konum bilgilerini koordinatlar olarak birleştir
      const koordinatlar = formData.konum.lat && formData.konum.lng ? `${formData.konum.lat},${formData.konum.lng}` : ""

      // Verileri hazırla - IsletmeType'a göre doğru alanları kullan
      const preparedData: Partial<IsletmeType> = {
        isletme_adi: formData.isletme_adi,
        kategori: formData.kategori,
        alt_kategori: formData.alt_kategori,
        aciklama: formData.aciklama,
        adres: formData.adres,
        sehir: formData.sehir,
        ilce: formData.ilce,
        koordinatlar: koordinatlar,
        telefon: formData.telefon,
        email: formData.email,
        website: formData.website,
        sosyal_medya: formData.sosyal_medya,
        calisma_saatleri: formData.calisma_gunleri,
        ozellikler: ozellikler,
        one_cikan: formData.one_cikan,
        sunulan_hizmetler: formData.sunulan_hizmetler,
        seo_baslik: formData.seo_baslik,
        seo_aciklama: formData.seo_aciklama,
        seo_anahtar_kelimeler: formData.seo_anahtar_kelimeler,
        fotograf_url: mainPhotoUrl,
        fotograflar: allPhotos.map((url, index) => ({ url, order: index })),
        fiyat_araligi: formData.fiyat_araligi,
        url_slug: slug,
        aktif: true,
        onay_durumu: "onaylandı", // Admin tarafından eklendiği için otomatik onaylı
      }

      // JSON alanlarını string'e dönüştür
      const finalData = {
        ...preparedData,
        sosyal_medya:
          typeof preparedData.sosyal_medya === "object"
            ? JSON.stringify(preparedData.sosyal_medya)
            : preparedData.sosyal_medya,
        calisma_saatleri:
          typeof preparedData.calisma_saatleri === "object"
            ? JSON.stringify(preparedData.calisma_saatleri)
            : preparedData.calisma_saatleri,
        ozellikler:
          typeof preparedData.ozellikler === "object"
            ? JSON.stringify(preparedData.ozellikler)
            : preparedData.ozellikler,
        fotograflar: Array.isArray(preparedData.fotograflar)
          ? JSON.stringify(preparedData.fotograflar)
          : preparedData.fotograflar,
      }

      console.log("Kaydedilecek veriler:", finalData)

      // İşletmeyi veritabanına ekle
      const { data, error } = await supabase.from("isletmeler2").insert([finalData]).select()

      if (error) {
        console.error("Kayıt hatası:", error)
        throw new Error(`İşletme kaydedilirken bir hata oluştu: ${error.message}`)
      }

      console.log("Kaydedilen veri:", data)

      toast({
        title: "Başarılı!",
        description: "İşletme bilgileri başarıyla kaydedildi.",
      })

      // İşletme listesine yönlendir
      router.push("/admin/isletme-listesi")
    } catch (error: any) {
      console.error("Kayıt hatası:", error)
      toast({
        title: "Hata!",
        description: error.message || "İşletme bilgileri kaydedilirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
      setUploadingPhotos(false)
    }
  }

  // Sonraki sekmeye geç
  const nextTab = () => {
    const tabOrder = [
      "isletme-bilgileri",
      "konum-bilgileri",
      "iletisim-bilgileri",
      "calisma-saatleri",
      "ozellikler",
      "seo-bilgileri",
      "fotograflar",
      "onizleme",
    ]
    const currentIndex = tabOrder.indexOf(activeTab)
    if (currentIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentIndex + 1])
    }
  }

  // Önceki sekmeye geç
  const prevTab = () => {
    const tabOrder = [
      "isletme-bilgileri",
      "konum-bilgileri",
      "iletisim-bilgileri",
      "calisma-saatleri",
      "ozellikler",
      "seo-bilgileri",
      "fotograflar",
      "onizleme",
    ]
    const currentIndex = tabOrder.indexOf(activeTab)
    if (currentIndex > 0) {
      setActiveTab(tabOrder[currentIndex - 1])
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">İşletme Ekle</h1>
          <p className="text-muted-foreground">İşletme bilgilerini girerek yeni bir işletme ekleyin.</p>
        </div>
        <TaslakYonetimi formData={formData} setFormData={setFormData} />
      </div>

      <Progress value={progress} className="h-2" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="isletme-bilgileri">İşletme</TabsTrigger>
                  <TabsTrigger value="konum-bilgileri">Konum</TabsTrigger>
                  <TabsTrigger value="iletisim-bilgileri">İletişim</TabsTrigger>
                  <TabsTrigger value="calisma-saatleri">Çalışma</TabsTrigger>
                </TabsList>
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="ozellikler">Özellikler</TabsTrigger>
                  <TabsTrigger value="seo-bilgileri">SEO</TabsTrigger>
                  <TabsTrigger value="fotograflar">Fotoğraflar</TabsTrigger>
                  <TabsTrigger value="onizleme">Önizleme</TabsTrigger>
                </TabsList>

                <TabsContent value="isletme-bilgileri">
                  <IsletmeBilgileriForm formData={formData} onChange={updateFormData} errors={{}} />
                </TabsContent>

                <TabsContent value="konum-bilgileri">
                  <KonumBilgileriForm formData={formData} onChange={updateFormData} errors={{}} />
                </TabsContent>

                <TabsContent value="iletisim-bilgileri">
                  <IletisimBilgileriForm formData={formData} onChange={updateFormData} errors={{}} />
                </TabsContent>

                <TabsContent value="calisma-saatleri">
                  <CalismaSaatleriForm formData={formData} onChange={updateFormData} errors={{}} />
                </TabsContent>

                <TabsContent value="ozellikler">
                  <OzelliklerForm formData={formData} onChange={updateFormData} errors={{}} />
                </TabsContent>

                <TabsContent value="seo-bilgileri">
                  <SEOBilgileriForm formData={formData} onChange={updateFormData} errors={{}} />
                </TabsContent>

                <TabsContent value="fotograflar">
                  <FotograflarForm
                    formData={formData}
                    onChange={updateFormData}
                    errors={{}}
                    selectedFiles={selectedFiles}
                    setSelectedFiles={setSelectedFiles}
                    uploadingPhotos={uploadingPhotos}
                    uploadProgress={uploadProgress}
                  />
                </TabsContent>

                <TabsContent value="onizleme">
                  <div className="space-y-6">
                    <div className="text-center">
                      <h2 className="text-xl font-semibold">İşletme Önizleme</h2>
                      <p className="text-muted-foreground">İşletmenizin nasıl görüneceğini önizleyin.</p>
                    </div>
                    <FormOnizleme formData={formData} />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={prevTab} disabled={activeTab === "isletme-bilgileri"}>
                  Önceki
                </Button>
                {activeTab === "onizleme" ? (
                  <Button onClick={saveFormData} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Kaydediliyor...
                      </>
                    ) : (
                      "Kaydet"
                    )}
                  </Button>
                ) : (
                  <Button onClick={nextTab}>Sonraki</Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <FormOnizleme formData={formData} />
        </div>
      </div>
    </div>
  )
}
