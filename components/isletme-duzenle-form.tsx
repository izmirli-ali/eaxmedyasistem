"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { IsletmeBilgileriForm } from "@/components/isletme-kayit/isletme-bilgileri-form"
import { KonumBilgileriForm } from "@/components/isletme-kayit/konum-bilgileri-form"
import { IletisimBilgileriForm } from "@/components/isletme-kayit/iletisim-bilgileri-form"
import { CalismaSaatleriForm } from "@/components/isletme-kayit/calisma-saatleri-form"
import { OzelliklerForm } from "@/components/isletme-kayit/ozellikler-form"
import { FotograflarForm } from "@/components/isletme-kayit/fotograflar-form"
import { SEOBilgileriForm } from "@/components/isletme-kayit/seo-bilgileri-form"
import FormOnizleme from "@/components/isletme-kayit/form-onizleme"
import { useAutoSave } from "@/hooks/use-auto-save"
import { ArrowLeft, Eye, Save, Trash2, AlertTriangle, CheckCircle, Clock, Loader2 } from "lucide-react"
import { slugify } from "@/utils/format-helpers"
import { supabase } from "@/supabase"
import type { Business } from "@/types"

interface IsletmeDuzenleFormProps {
  business: Business
}

export default function IsletmeDuzenleForm({ business }: IsletmeDuzenleFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("temel-bilgiler")
  const [isSaving, setIsSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // İşletme verileri için başlangıç durumu
  const [formData, setFormData] = useState({
    id: business.id,
    isletme_adi: business.isletme_adi || "",
    slug: business.slug || "",
    kategori: business.kategori || "",
    alt_kategori: business.alt_kategori || "",
    adres: business.adres || "",
    sehir: business.sehir || "",
    ilce: business.ilce || "",
    telefon: business.telefon || "",
    website: business.website || "",
    email: business.email || "",
    aciklama: business.aciklama || "",
    latitude: business.latitude || "",
    longitude: business.longitude || "",
    koordinatlar: business.koordinatlar || "",
    harita_linki: business.harita_linki || "",
    calisma_saatleri: business.calisma_saatleri || "",
    calisma_gunleri: business.calisma_gunleri || {},
    sosyal_medya: business.sosyal_medya || {
      facebook: "",
      instagram: "",
      twitter: "",
      youtube: "",
      linkedin: "",
    },
    fotograf_url: business.fotograf_url || "",
    fotograflar: business.fotograflar || [],
    seo_baslik: business.seo_baslik || "",
    seo_aciklama: business.seo_aciklama || "",
    seo_anahtar_kelimeler: business.seo_anahtar_kelimeler || "",
    seo_canonical: business.seo_canonical || "",
    fiyat_araligi: business.fiyat_araligi || "",
    sunulan_hizmetler: business.sunulan_hizmetler || "",
    aktif: business.aktif !== false, // Varsayılan olarak true
    one_cikan: business.one_cikan || false,
    // Özellikler
    wifi: business.wifi || false,
    otopark: business.otopark || false,
    kredi_karti: business.kredi_karti || false,
    rezervasyon: business.rezervasyon || false,
    paket_servis: business.paket_servis || false,
    engelli_erisim: business.engelli_erisim || false,
    bebek_dostu: business.bebek_dostu || false,
    evcil_hayvan_dostu: business.evcil_hayvan_dostu || false,
    sigara_alani: business.sigara_alani || false,
    canli_muzik: business.canli_muzik || false,
    kahvalti: business.kahvalti || false,
    aksam_yemegi: business.aksam_yemegi || false,
    tv: business.tv || false,
    ucretsiz_teslimat: business.ucretsiz_teslimat || false,
    nakit_odeme: business.nakit_odeme || false,
    online_odeme: business.online_odeme || false,
    temassiz_odeme: business.temassiz_odeme || false,
    organik_urunler: business.organik_urunler || false,
    glutensiz_secenekler: business.glutensiz_secenekler || false,
    vegan_secenekler: business.vegan_secenekler || false,
  })

  // Otomatik kaydetme
  useAutoSave({
    data: formData,
    onSave: async (data) => {
      try {
        // Taslak olarak kaydet
        await fetch(`/api/isletmeler2/${business.id}/taslak`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })
        return true
      } catch (error) {
        console.error("Otomatik kaydetme hatası:", error)
        return false
      }
    },
    interval: 60000, // 60 saniyede bir
    enabled: !isSaving, // Kaydederken otomatik kaydetmeyi devre dışı bırak
  })

  // Form alanı değişikliği
  const handleInputChange = (field: string, value: any) => {
    // Noktalı alan adlarını işle (örn: sosyal_medya.facebook)
    if (field.includes(".")) {
      const [parent, child] = field.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value,
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }))
    }

    // Eğer işletme adı değiştiyse ve slug boşsa, slug oluştur
    if (field === "isletme_adi" && !formData.slug) {
      setFormData((prev) => ({
        ...prev,
        slug: slugify(value),
      }))
    }
  }

  // Form doğrulama
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Zorunlu alanları kontrol et
    if (!formData.isletme_adi) newErrors.isletme_adi = "İşletme adı zorunludur"
    if (!formData.kategori) newErrors.kategori = "Kategori seçimi zorunludur"
    if (!formData.telefon) newErrors.telefon = "Telefon numarası zorunludur"
    if (!formData.adres) newErrors.adres = "Adres bilgisi zorunludur"
    if (!formData.sehir) newErrors.sehir = "Şehir seçimi zorunludur"
    if (!formData.aciklama || formData.aciklama.length < 20) {
      newErrors.aciklama = "Açıklama en az 20 karakter olmalıdır"
    }

    // E-posta formatını kontrol et
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Geçerli bir e-posta adresi girin"
    }

    // Website formatını kontrol et
    if (formData.website && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(formData.website)) {
      newErrors.website = "Geçerli bir website adresi girin"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Formu gönder
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      // Hata olan sekmeye git
      const errorFields = Object.keys(errors)
      if (errorFields.length > 0) {
        // Hata olan ilk alanın hangi sekmede olduğunu bul
        const errorField = errorFields[0]

        if (
          ["isletme_adi", "kategori", "alt_kategori", "aciklama", "fiyat_araligi", "sunulan_hizmetler"].includes(
            errorField,
          )
        ) {
          setActiveTab("temel-bilgiler")
        } else if (["adres", "sehir", "ilce", "latitude", "longitude", "harita_linki"].includes(errorField)) {
          setActiveTab("konum")
        } else if (
          [
            "telefon",
            "email",
            "website",
            "sosyal_medya.facebook",
            "sosyal_medya.instagram",
            "sosyal_medya.twitter",
            "sosyal_medya.youtube",
            "sosyal_medya.linkedin",
          ].includes(errorField)
        ) {
          setActiveTab("iletisim")
        } else if (["seo_baslik", "seo_aciklama", "seo_anahtar_kelimeler", "seo_canonical"].includes(errorField)) {
          setActiveTab("seo")
        }
      }

      toast({
        variant: "destructive",
        title: "Form hatası",
        description: "Lütfen form alanlarını kontrol edin.",
      })
      return
    }

    try {
      setIsSaving(true)

      // Önce fotoğrafları yükle
      if (selectedFiles.length > 0) {
        await handleUploadPhotos()
      }

      // URL slug oluştur
      const url_slug = `${formData.sehir?.toLowerCase()}/${formData.slug}`.replace(/\s+/g, "-")

      // İşletme bilgilerini güncelle - isletmeler2 tablosunu kullan
      const { error } = await supabase
        .from("isletmeler2")
        .update({
          ...formData,
          url_slug,
          updated_at: new Date().toISOString(),
        })
        .eq("id", business.id)

      if (error) {
        throw new Error("İşletme güncellenemedi: " + error.message)
      }

      toast({
        title: "Başarılı!",
        description: "İşletme başarıyla güncellendi.",
      })

      // İşletme listesine yönlendir
      router.push("/admin/isletme-listesi")
      router.refresh()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata!",
        description: error.message,
      })
      console.error("İşletme güncellenirken hata oluştu:", error)
    } finally {
      setIsSaving(false)
    }
  }

  // İşletmeyi sil
  const handleDelete = async () => {
    try {
      setIsSaving(true)

      // isletmeler2 tablosundan sil
      const { error } = await supabase.from("isletmeler2").delete().eq("id", business.id)

      if (error) {
        throw new Error("İşletme silinemedi: " + error.message)
      }

      toast({
        title: "Başarılı!",
        description: "İşletme başarıyla silindi.",
      })

      // İşletme listesine yönlendir
      router.push("/admin/isletme-listesi")
      router.refresh()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata!",
        description: error.message,
      })
      console.error("İşletme silinirken hata oluştu:", error)
    } finally {
      setIsSaving(false)
    }
  }

  // Fotoğrafları yükle
  const handleUploadPhotos = async () => {
    if (selectedFiles.length === 0) return

    setUploadingPhotos(true)
    const uploadedPhotos = [...(formData.fotograflar || [])]

    try {
      for (const file of selectedFiles) {
        // Dosya yükleme işlemi simülasyonu
        // Gerçek uygulamada burada dosya yükleme API'si kullanılır

        // Yükleme ilerlemesini güncelle
        setUploadProgress((prev) => ({
          ...prev,
          [file.name]: 0,
        }))

        // Yükleme simülasyonu
        await new Promise<void>((resolve) => {
          let progress = 0
          const interval = setInterval(() => {
            progress += 10
            setUploadProgress((prev) => ({
              ...prev,
              [file.name]: progress,
            }))

            if (progress >= 100) {
              clearInterval(interval)
              resolve()
            }
          }, 200)
        })

        // Dosya URL'sini oluştur (gerçek uygulamada API'den dönen URL kullanılır)
        const fileUrl = URL.createObjectURL(file)

        // Fotoğrafı listeye ekle
        uploadedPhotos.push({
          url: fileUrl,
          order: uploadedPhotos.length,
        })
      }

      // Formdata'yı güncelle
      setFormData((prev) => ({
        ...prev,
        fotograflar: uploadedPhotos,
      }))

      // Seçili dosyaları temizle
      setSelectedFiles([])

      toast({
        title: "Başarılı!",
        description: "Fotoğraflar başarıyla yüklendi.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata!",
        description: "Fotoğraflar yüklenirken bir hata oluştu.",
      })
      console.error("Fotoğraflar yüklenirken hata oluştu:", error)
    } finally {
      setUploadingPhotos(false)
      setUploadProgress({})
    }
  }

  // Aktif/Pasif durumunu değiştir
  const handleAktifDurumDegistir = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      aktif: checked,
    }))

    toast({
      title: checked ? "İşletme aktifleştirildi" : "İşletme pasifleştirildi",
      description: checked
        ? "İşletme artık kullanıcılar tarafından görüntülenebilir."
        : "İşletme artık kullanıcılar tarafından görüntülenemez.",
    })
  }

  // Öne çıkan durumunu değiştir
  const handleOneCikanDegistir = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      one_cikan: checked,
    }))

    toast({
      title: checked ? "İşletme öne çıkarıldı" : "İşletme öne çıkarma kaldırıldı",
      description: checked
        ? "İşletme artık ana sayfada öne çıkan işletmeler arasında gösterilecek."
        : "İşletme artık ana sayfada öne çıkan işletmeler arasında gösterilmeyecek.",
    })
  }

  return (
    <div className="container py-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">İşletme Düzenle</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch id="aktif-durum" checked={formData.aktif} onCheckedChange={handleAktifDurumDegistir} />
            <Label htmlFor="aktif-durum" className="font-medium">
              {formData.aktif ? (
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Aktif
                </span>
              ) : (
                <span className="flex items-center gap-1 text-gray-500">
                  <Clock className="h-4 w-4" />
                  Pasif
                </span>
              )}
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Switch id="one-cikan" checked={formData.one_cikan} onCheckedChange={handleOneCikanDegistir} />
            <Label htmlFor="one-cikan" className="font-medium">
              Öne Çıkan
            </Label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>İşletme Bilgileri</CardTitle>
                <CardDescription>
                  İşletme bilgilerini düzenleyin. Yıldız (*) işaretli alanlar zorunludur.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-3 md:grid-cols-7 mb-4">
                    <TabsTrigger value="temel-bilgiler">Temel Bilgiler</TabsTrigger>
                    <TabsTrigger value="konum">Konum</TabsTrigger>
                    <TabsTrigger value="iletisim">İletişim</TabsTrigger>
                    <TabsTrigger value="calisma-saatleri">Çalışma Saatleri</TabsTrigger>
                    <TabsTrigger value="ozellikler">Özellikler</TabsTrigger>
                    <TabsTrigger value="fotograflar">Fotoğraflar</TabsTrigger>
                    <TabsTrigger value="seo">SEO</TabsTrigger>
                  </TabsList>

                  <TabsContent value="temel-bilgiler">
                    <IsletmeBilgileriForm formData={formData} onChange={handleInputChange} errors={errors} />
                  </TabsContent>

                  <TabsContent value="konum">
                    <KonumBilgileriForm formData={formData} onChange={handleInputChange} errors={errors} />
                  </TabsContent>

                  <TabsContent value="iletisim">
                    <IletisimBilgileriForm formData={formData} onChange={handleInputChange} errors={errors} />
                  </TabsContent>

                  <TabsContent value="calisma-saatleri">
                    <CalismaSaatleriForm formData={formData} onChange={handleInputChange} errors={errors} />
                  </TabsContent>

                  <TabsContent value="ozellikler">
                    <OzelliklerForm formData={formData} onChange={handleInputChange} errors={errors} />
                  </TabsContent>

                  <TabsContent value="fotograflar">
                    <FotograflarForm
                      formData={formData}
                      onChange={handleInputChange}
                      errors={errors}
                      selectedFiles={selectedFiles}
                      setSelectedFiles={setSelectedFiles}
                      uploadingPhotos={uploadingPhotos}
                      uploadProgress={uploadProgress}
                    />
                  </TabsContent>

                  <TabsContent value="seo">
                    <SEOBilgileriForm formData={formData} onChange={handleInputChange} errors={errors} />
                  </TabsContent>
                </Tabs>
              </CardContent>

              <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 border-t pt-6">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" type="button">
                      <Trash2 className="mr-2 h-4 w-4" />
                      İşletmeyi Sil
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>İşletmeyi silmek istediğinize emin misiniz?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bu işlem geri alınamaz. İşletme kalıcı olarak silinecektir.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>İptal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Evet, Sil
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="outline" type="button" onClick={() => router.back()} className="flex-1 sm:flex-none">
                    İptal
                  </Button>

                  <Dialog open={showPreview} onOpenChange={setShowPreview}>
                    <DialogTrigger asChild>
                      <Button variant="outline" type="button" className="flex-1 sm:flex-none">
                        <Eye className="mr-2 h-4 w-4" />
                        Önizleme
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>İşletme Önizleme</DialogTitle>
                        <DialogDescription>İşletme sayfasının nasıl görüneceğini önizleyin.</DialogDescription>
                      </DialogHeader>
                      <FormOnizleme formData={formData} />
                    </DialogContent>
                  </Dialog>

                  <Button type="submit" disabled={isSaving} className="flex-1 sm:flex-none">
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Kaydediliyor...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Kaydet
                      </>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </form>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>İşletme Durumu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Durum:</span>
                <Badge variant={formData.aktif ? "success" : "secondary"}>{formData.aktif ? "Aktif" : "Pasif"}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Öne Çıkan:</span>
                <Badge variant={formData.one_cikan ? "default" : "outline"}>
                  {formData.one_cikan ? "Evet" : "Hayır"}
                </Badge>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="text-sm font-medium">İşletme Bilgileri</h4>
                <div className="text-sm">
                  <p>
                    <span className="font-medium">ID:</span> {business.id}
                  </p>
                  <p>
                    <span className="font-medium">URL Slug:</span> {business.url_slug || "-"}
                  </p>
                  <p>
                    <span className="font-medium">Kategori:</span> {formData.kategori || "-"}
                  </p>
                  <p>
                    <span className="font-medium">Şehir:</span> {formData.sehir || "-"}
                  </p>
                  <p>
                    <span className="font-medium">Oluşturulma:</span>{" "}
                    {business.created_at ? new Date(business.created_at).toLocaleDateString() : "-"}
                  </p>
                  <p>
                    <span className="font-medium">Son Güncelleme:</span>{" "}
                    {business.updated_at ? new Date(business.updated_at).toLocaleDateString() : "-"}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Hızlı Bağlantılar</h4>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => window.open(`/isletme/${business.url_slug || business.id}`, "_blank")}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    İşletme Sayfasını Görüntüle
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push("/admin/isletme-listesi")}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    İşletme Listesine Dön
                  </Button>
                </div>
              </div>

              {Object.keys(errors).length > 0 && (
                <>
                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <h4 className="text-sm font-medium">Form Hataları</h4>
                    </div>

                    <ul className="text-xs text-destructive space-y-1 list-disc pl-5">
                      {Object.entries(errors).map(([field, message]) => (
                        <li key={field}>{message}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
