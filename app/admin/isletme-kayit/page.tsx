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

export default function IsletmeKayitPage() {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("isletme-bilgileri")
  const [progress, setProgress] = useState(0)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]) // Dosya yükleme için state
  const [uploadingPhotos, setUploadingPhotos] = useState(false) // Yükleme durumu
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({}) // Yükleme ilerleme durumu

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
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  // Form verilerini kaydet
  const saveFormData = async () => {
    try {
      const supabase = createClient()

      // Burada Supabase'e kaydetme işlemi yapılacak
      // Örnek: await supabase.from('isletmeler').insert([formData])

      toast({
        title: "Başarılı!",
        description: "İşletme bilgileri kaydedildi.",
      })
    } catch (error) {
      console.error("Kayıt hatası:", error)
      toast({
        title: "Hata!",
        description: "İşletme bilgileri kaydedilirken bir hata oluştu.",
        variant: "destructive",
      })
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

                <TabsContent value="konum-bilgileri"></TabsContent>

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
                  <Button onClick={saveFormData}>Kaydet</Button>
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
