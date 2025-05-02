"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IsletmeBilgileriForm } from "@/components/isletme-kayit/isletme-bilgileri-form"
import { KonumBilgileriForm } from "@/components/isletme-kayit/konum-bilgileri-form"
import { IletisimBilgileriForm } from "@/components/isletme-kayit/iletisim-bilgileri-form"
import { SEOBilgileriForm } from "@/components/isletme-kayit/seo-bilgileri-form"
import { FotograflarForm } from "@/components/isletme-kayit/fotograflar-form"
import { OzelliklerForm } from "@/components/isletme-kayit/ozellikler-form"
import { CalismaSaatleriForm } from "@/components/isletme-kayit/calisma-saatleri-form"
import { useAutoSave } from "@/hooks/use-auto-save"
import { unformatPhoneNumber } from "@/utils/format-helpers"
import {
  CheckCircle,
  AlertTriangle,
  Save,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Building,
  MapPin,
  Phone,
  Search,
  ImageIcon,
  Clock,
  Settings,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { validateAndImproveAddress } from "@/utils/location-helpers"
import { createClient } from "@/lib/supabase/client"
import { slugify } from "@/lib/utils"

// Geçerli dosya türleri
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"]
const MAX_FILE_SIZE = 5 // MB
const MAX_FILES = 10 // Maksimum dosya sayısı

// Form veri tipi - isletmeler2 tablosuna uygun
interface FormValues {
  isletme_adi: string
  slug?: string
  adres: string
  telefon: string
  website?: string
  email?: string
  aciklama: string
  harita_linki?: string
  koordinatlar?: string
  latitude?: string
  longitude?: string
  kategori: string
  alt_kategori?: string
  sunulan_hizmetler?: string
  calisma_saatleri?: string
  calisma_gunleri?: Record<string, any>
  sosyal_medya?: {
    facebook?: string
    instagram?: string
    twitter?: string
    youtube?: string
    linkedin?: string
  }
  seo_baslik?: string
  seo_aciklama?: string
  seo_anahtar_kelimeler?: string
  seo_canonical?: string
  fotograf_url?: string
  fotograflar?: string[]
  fiyat_araligi?: string
  sehir: string
  ilce?: string
  url_slug?: string
  // Özellikler
  engelli_erisim?: boolean
  wifi?: boolean
  otopark?: boolean
  kredi_karti?: boolean
  rezervasyon?: boolean
  paket_servis?: boolean
  one_cikan?: boolean
  bebek_dostu?: boolean
  evcil_hayvan_dostu?: boolean
  sigara_alani?: boolean
  canli_muzik?: boolean
  kahvalti?: boolean
  aksam_yemegi?: boolean
  tv?: boolean
  ucretsiz_teslimat?: boolean
  nakit_odeme?: boolean
  online_odeme?: boolean
  temassiz_odeme?: boolean
  organik_urunler?: boolean
  glutensiz_secenekler?: boolean
  vegan_secenekler?: boolean
  // Diğer alanlar
  aktif?: boolean
  onay_durumu?: string
  goruntulenme_sayisi?: number
  [key: string]: any
}

// Form adımları - Kullanıcının istediği şekilde güncellendi
const formSteps = [
  { id: "isletme-bilgileri", title: "İşletme Bilgileri", icon: Building },
  { id: "konum-bilgileri", title: "Konum Bilgileri", icon: MapPin },
  { id: "iletisim-bilgileri", title: "İletişim Bilgileri", icon: Phone },
  { id: "calisma-saatleri", title: "Çalışma Saatleri", icon: Clock },
  { id: "ozellikler", title: "Özellikler", icon: Settings },
  { id: "seo-bilgileri", title: "SEO Bilgileri", icon: Search },
  { id: "isletme-gorselleri", title: "İşletme Görselleri", icon: ImageIcon },
]

// Başlangıç değerleri
const initialFormData: FormValues = {
  isletme_adi: "",
  slug: "",
  adres: "",
  telefon: "",
  website: "",
  email: "",
  aciklama: "",
  harita_linki: "",
  koordinatlar: "",
  latitude: "",
  longitude: "",
  kategori: "",
  alt_kategori: "",
  sunulan_hizmetler: "",
  calisma_saatleri: "",
  calisma_gunleri: {
    pazartesi: { acik: true, acilis: "09:00", kapanis: "18:00", mola_var: false },
    sali: { acik: true, acilis: "09:00", kapanis: "18:00", mola_var: false },
    carsamba: { acik: true, acilis: "09:00", kapanis: "18:00", mola_var: false },
    persembe: { acik: true, acilis: "09:00", kapanis: "18:00", mola_var: false },
    cuma: { acik: true, acilis: "09:00", kapanis: "18:00", mola_var: false },
    cumartesi: { acik: true, acilis: "10:00", kapanis: "16:00", mola_var: false },
    pazar: { acik: true, acilis: "10:00", kapanis: "16:00", mola_var: false },
  },
  sosyal_medya: {
    facebook: "",
    instagram: "",
    twitter: "",
    youtube: "",
    linkedin: "",
  },
  seo_baslik: "",
  seo_aciklama: "",
  seo_anahtar_kelimeler: "",
  seo_canonical: "",
  fotograf_url: "",
  fotograflar: [],
  fiyat_araligi: "",
  sehir: "",
  ilce: "",
  url_slug: "",
  engelli_erisim: false,
  wifi: false,
  otopark: false,
  kredi_karti: false,
  rezervasyon: false,
  paket_servis: false,
  one_cikan: false,
  bebek_dostu: false,
  evcil_hayvan_dostu: false,
  sigara_alani: false,
  canli_muzik: false,
  kahvalti: false,
  aksam_yemegi: false,
  tv: false,
  ucretsiz_teslimat: false,
  nakit_odeme: false,
  online_odeme: false,
  temassiz_odeme: false,
  organik_urunler: false,
  glutensiz_secenekler: false,
  vegan_secenekler: false,
  aktif: true,
  onay_durumu: "beklemede",
  goruntulenme_sayisi: 0,
}

export default function IsletmeEkleForm() {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const abortControllerRef = useRef<AbortController | null>(null)

  const [formData, setFormData] = useState<FormValues>(initialFormData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [activeTab, setActiveTab] = useState("isletme-bilgileri")
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [addressWarning, setAddressWarning] = useState<string | null>(null)
  const [addressSuggestion, setAddressSuggestion] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [formProgress, setFormProgress] = useState(0)

  // Form taslak kaydetme
  const { isSaving, lastSaved, save } = useAutoSave({
    data: formData,
    onSave: async (data) => {
      try {
        // Kullanıcı oturumunu kontrol et
        const { data: sessionData } = await supabase.auth.getSession()
        if (!sessionData.session) {
          toast({
            title: "Oturum hatası",
            description: "Taslak kaydetmek için oturum açmanız gerekiyor.",
            variant: "destructive",
          })
          return
        }

        // Taslak kaydetme işlemi
        const { error } = await supabase.from("isletme_taslaklari").upsert({
          user_id: sessionData.session.user.id,
          form_data: data,
          updated_at: new Date().toISOString(),
        })

        if (error) throw error

        toast({
          title: "Taslak kaydedildi",
          description: "İşletme bilgileri otomatik olarak kaydedildi.",
        })
      } catch (error: any) {
        console.error("Taslak kaydedilirken hata:", error)
        toast({
          title: "Hata",
          description: "Taslak kaydedilirken bir hata oluştu.",
          variant: "destructive",
        })
      }
    },
    interval: 60000, // 1 dakika
    debounce: 3000, // 3 saniye
  })

  // Form ilk yüklendiğinde localStorage'dan veri kontrolü
  useEffect(() => {
    const savedFormData = localStorage.getItem("isletmeEkleFormData")
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData)
        setFormData(parsedData)
        toast({
          title: "Form verisi bulundu",
          description: "Daha önce doldurduğunuz form verisi yüklendi.",
          duration: 3000,
        })
      } catch (error) {
        console.error("Form verisi yüklenemedi:", error)
        localStorage.removeItem("isletmeEkleFormData")
      }
    }

    // Taslak verileri kontrol et
    const checkDrafts = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        if (!sessionData.session) return

        const { data, error } = await supabase
          .from("isletme_taslaklari")
          .select("*")
          .eq("user_id", sessionData.session.user.id)
          .single()

        if (error) {
          if (error.code !== "PGRST116") {
            // not found error
            console.error("Taslak verisi alınırken hata:", error)
          }
          return
        }

        if (data && data.form_data) {
          setFormData(data.form_data)
          toast({
            title: "Taslak bulundu",
            description: `Son kaydedilen taslak yüklendi (${new Date(data.updated_at).toLocaleString()})`,
            duration: 5000,
          })
        }
      } catch (error) {
        console.error("Taslak kontrolü sırasında hata:", error)
      }
    }

    checkDrafts()
  }, [supabase, toast])

  // Form ilerleme durumunu hesapla
  useEffect(() => {
    const totalFields = Object.keys(initialFormData).length
    const filledFields = Object.entries(formData).filter(([key, value]) => {
      if (typeof value === "boolean") return true
      if (typeof value === "string") return value.trim() !== ""
      if (typeof value === "object" && value !== null) {
        if (Array.isArray(value)) return value.length > 0
        return Object.values(value).some((v) => typeof v === "string" && v.trim() !== "")
      }
      return value !== null && value !== undefined
    }).length

    const progress = Math.min(Math.round((filledFields / totalFields) * 100), 100)
    setFormProgress(progress)
  }, [formData])

  // Adres doğrulama
  useEffect(() => {
    const validateAddress = async () => {
      if (formData.adres && formData.adres.length > 10) {
        try {
          const result = await validateAndImproveAddress(formData.adres)

          if (!result.isValid) {
            setAddressWarning("Bu adres doğrulanamadı. Lütfen kontrol ediniz.")
            setAddressSuggestion(null)
          } else if (result.improvedAddress && result.improvedAddress !== formData.adres) {
            setAddressWarning(null)
            setAddressSuggestion(result.improvedAddress)
          } else {
            setAddressWarning(null)
            setAddressSuggestion(null)
          }
        } catch (error) {
          console.error("Adres doğrulama hatası:", error)
          setAddressWarning("Adres doğrulanamadı. Lütfen manuel olarak kontrol edin.")
          setAddressSuggestion(null)
        }
      }
    }

    validateAddress()
  }, [formData.adres])

  // Form değişikliği
  const handleChange = (field: string, value: any) => {
    // Nested fields için (örn: sosyal_medya.facebook)
    if (field.includes(".")) {
      const [parent, child] = field.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }

    // Hata varsa temizle
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }

    // LocalStorage'a kaydet
    localStorage.setItem(
      "isletmeEkleFormData",
      JSON.stringify({
        ...formData,
        [field]: field.includes(".") ? undefined : value,
      }),
    )
  }

  // Form doğrulama
  const validateForm = (tabId?: string) => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    // Doğrulanacak sekmeyi belirle
    const validateTab = tabId || activeTab

    // İşletme Bilgileri
    if (validateTab === "isletme-bilgileri") {
      if (!formData.isletme_adi.trim()) {
        newErrors.isletme_adi = "İşletme adı zorunludur"
        isValid = false
      }

      if (!formData.kategori) {
        newErrors.kategori = "İşletme kategorisi zorunludur"
        isValid = false
      }

      if (!formData.telefon) {
        newErrors.telefon = "İşletme telefon numarası zorunludur"
        isValid = false
      }

      if (!formData.aciklama || formData.aciklama.length < 20) {
        newErrors.aciklama = "Açıklama en az 20 karakter olmalıdır"
        isValid = false
      }
    }

    // Konum Bilgileri
    if (validateTab === "konum-bilgileri") {
      if (!formData.adres.trim()) {
        newErrors.adres = "İşletme adresi zorunludur"
        isValid = false
      }

      if (!formData.sehir) {
        newErrors.sehir = "Şehir seçimi zorunludur"
        isValid = false
      }
    }

    // İletişim Bilgileri
    if (validateTab === "iletisim-bilgileri") {
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Geçerli bir e-posta adresi giriniz"
        isValid = false
      }

      if (formData.website && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(formData.website)) {
        newErrors.website = "Geçerli bir website adresi giriniz"
        isValid = false
      }

      // Sosyal medya URL kontrolü
      const socialMediaFields = ["facebook", "instagram", "twitter", "youtube", "linkedin"]
      socialMediaFields.forEach((platform) => {
        const url = formData.sosyal_medya?.[platform as keyof typeof formData.sosyal_medya]
        if (url && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(url)) {
          newErrors[`sosyal_medya.${platform}`] = `Geçerli bir ${platform} URL'si giriniz`
          isValid = false
        }
      })
    }

    setErrors(newErrors)
    return isValid
  }

  // Sekme değişikliği
  const handleTabChange = (tabId: string) => {
    if (validateForm(activeTab)) {
      setActiveTab(tabId)
    } else {
      toast({
        title: "Form Hatası",
        description: "Lütfen formdaki hataları düzeltin.",
        variant: "destructive",
      })
    }
  }

  // Sonraki sekmeye geç
  const handleNextTab = () => {
    const currentIndex = formSteps.findIndex((step) => step.id === activeTab)
    if (currentIndex < formSteps.length - 1 && validateForm()) {
      setActiveTab(formSteps[currentIndex + 1].id)
    }
  }

  // Önceki sekmeye dön
  const handlePrevTab = () => {
    const currentIndex = formSteps.findIndex((step) => step.id === activeTab)
    if (currentIndex > 0) {
      setActiveTab(formSteps[currentIndex - 1].id)
    }
  }

  // Resim yükleme fonksiyonu
  const uploadImages = async (files: File[]): Promise<string[]> => {
    const urls: string[] = []
    const uploadPromises: Promise<any>[] = []

    for (const file of files) {
      const fileExt = file.name.split(".").pop()
      const filePath = `isletme-fotograflari/${Date.now()}-${Math.random()}.${fileExt}`

      setUploadProgress((prevProgress) => ({
        ...prevProgress,
        [file.name]: 0,
      }))

      const uploadPromise = supabase.storage
        .from("bucket-dosyalar")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        })
        .then((uploadResult) => {
          if (uploadResult.error) {
            console.error("Dosya yükleme hatası:", uploadResult.error)
            toast({
              title: "Dosya yükleme hatası",
              description: `Dosya yüklenirken bir hata oluştu: ${file.name}`,
              variant: "destructive",
            })
            return null // Hata durumunda null döndür
          }

          const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/bucket-dosyalar/${filePath}`
          urls.push(url)
          return url // Başarılı durumda URL döndür
        })
        .finally(() => {
          // Yükleme tamamlandığında progress'i sil
          setUploadProgress((prevProgress) => {
            const newProgress = { ...prevProgress }
            delete newProgress[file.name]
            return newProgress
          })
        })

      uploadPromises.push(uploadPromise)
    }

    // Tüm yüklemelerin tamamlanmasını bekle
    const results = await Promise.all(uploadPromises)

    // Başarısız olan yüklemeleri filtrele
    const successfulUrls = results.filter((url): url is string => url !== null)

    return successfulUrls
  }

  // Boş string değerlerini null'a çevir
  const cleanFormData = (data: any): any => {
    const cleanedData: any = {}

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === "string") {
        cleanedData[key] = value.trim() === "" ? null : value
      } else if (typeof value === "object" && value !== null) {
        if (Array.isArray(value)) {
          cleanedData[key] = value.length === 0 ? null : value
        } else {
          cleanedData[key] = cleanFormData(value)
        }
      } else {
        cleanedData[key] = value
      }
    }

    return cleanedData
  }

  // Form gönderimi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Tüm sekmeleri doğrula
    let isFormValid = true
    for (const step of formSteps) {
      if (!validateForm(step.id)) {
        isFormValid = false
        setActiveTab(step.id)
        break
      }
    }

    if (!isFormValid) {
      toast({
        title: "Form Hatası",
        description: "Lütfen formdaki hataları düzeltin.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Kullanıcı oturumunu kontrol et
      const { data: sessionData } = await supabase.auth.getSession()
      if (!sessionData.session) {
        toast({
          title: "Oturum hatası",
          description: "İşletme eklemek için oturum açmanız gerekiyor.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Form verilerini işle
      let isletmeData = {
        ...formData,
        telefon: unformatPhoneNumber(formData.telefon), // Telefon numarasını formatla
        kullanici_id: sessionData.session.user.id, // Kullanıcı ID'sini ekle
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        slug: formData.url_slug || slugify(formData.isletme_adi), // Slug oluştur
        url_slug: `${formData.sehir.toLowerCase()}/${slugify(formData.isletme_adi)}`, // URL slug oluştur
      }

      // Boş string değerlerini null'a çevir
      isletmeData = cleanFormData(isletmeData)

      // Resimleri yükle
      let uploadedUrls: string[] = []
      if (selectedFiles.length > 0) {
        setUploadingPhotos(true)
        uploadedUrls = await uploadImages(selectedFiles)
        setUploadingPhotos(false)

        // Resim yükleme başarısız olursa uyarı ver
        if (uploadedUrls.length < selectedFiles.length) {
          toast({
            title: "Uyarı",
            description: `${selectedFiles.length - uploadedUrls.length} adet resim yüklenemedi.`,
            variant: "warning",
          })
        }
      }

      // Veritabanına kaydet - isletmeler2 tablosuna
      const { data, error } = await supabase
        .from("isletmeler2")
        .insert([
          {
            ...isletmeData,
            fotograflar: uploadedUrls.length > 0 ? uploadedUrls : null, // Yüklenen resimlerin URL'lerini ekle
            fotograf_url: uploadedUrls.length > 0 ? uploadedUrls[0] : isletmeData.fotograf_url || null, // İlk resmi ana resim olarak ayarla
          },
        ])
        .select()

      if (error) {
        console.error("İşletme kaydetme hatası:", error)
        toast({
          title: "İşletme kaydetme hatası",
          description: error.message || "İşletme kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Taslağı temizle
      try {
        await supabase.from("isletme_taslaklari").delete().eq("user_id", sessionData.session.user.id)
        localStorage.removeItem("isletmeEkleFormData")
      } catch (cleanupError) {
        // Taslak temizleme hatası kritik değil, sadece loglayalım
        console.error("Taslak temizleme hatası:", cleanupError)
      }

      // Başarılı kayıt
      toast({
        title: "İşletme başarıyla kaydedildi",
        description: "İşletme başarıyla kaydedildi.",
      })

      // Yönlendirme
      router.push("/admin/isletme-listesi")
      router.refresh()
    } catch (error: any) {
      console.error("İşletme kaydetme hatası:", error)
      toast({
        title: "İşletme kaydetme hatası",
        description: error.message || "İşletme kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Formu temizle
  const handleClearForm = () => {
    if (window.confirm("Form verileriniz silinecek. Emin misiniz?")) {
      setFormData(initialFormData)
      localStorage.removeItem("isletmeEkleFormData")
      setErrors({})
      setActiveTab("isletme-bilgileri")
      toast({
        title: "Form temizlendi",
        description: "Tüm form verileri silindi.",
      })
    }
  }

  // Manuel kaydet
  const handleSaveManually = async () => {
    await save(formData)
  }

  return (
    <div className="container mx-auto py-6">
      <Card className="rounded-lg shadow-lg border-t-4 border-t-primary">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold">İşletme Ekle</CardTitle>
              <CardDescription className="mt-1">
                İşletme bilgilerini eksiksiz doldurarak sisteme kaydedin.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {isSaving ? (
                <span className="flex items-center text-amber-600">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Kaydediliyor...
                </span>
              ) : lastSaved ? (
                <span className="flex items-center text-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Son kayıt: {new Date(lastSaved).toLocaleTimeString()}
                </span>
              ) : null}
              <Button variant="outline" size="sm" onClick={handleSaveManually} disabled={isSaving}>
                <Save className="h-3 w-3 mr-1" />
                Kaydet
              </Button>
            </div>
          </div>

          {/* İlerleme çubuğu */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Form tamamlanma durumu</span>
              <span>{formProgress}%</span>
            </div>
            <Progress value={formProgress} className="h-2" />
          </div>
        </CardHeader>

        {/* Adres Uyarısı */}
        {addressWarning && (
          <div className="px-6">
            <Alert variant="warning" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Adres Doğrulama Uyarısı</AlertTitle>
              <AlertDescription>{addressWarning}</AlertDescription>
            </Alert>
          </div>
        )}

        {/* Adres Önerisi */}
        {addressSuggestion && (
          <div className="px-6">
            <Alert className="mb-4">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Adres Önerisi</AlertTitle>
              <AlertDescription>
                Sistemimiz daha iyi bir adres buldu: {addressSuggestion}. Bu adresi kullanmak ister misiniz?
                <Button
                  variant="link"
                  className="ml-2 p-0 h-auto text-primary"
                  onClick={() => {
                    handleChange("adres", addressSuggestion)
                    setAddressSuggestion(null)
                    setAddressWarning(null)
                  }}
                >
                  Evet, kullan
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid grid-cols-2 md:grid-cols-7 mb-6">
                {formSteps.map((step) => (
                  <TabsTrigger key={step.id} value={step.id} className="text-xs md:text-sm">
                    {step.icon === ImageIcon ? (
                      <ImageIcon className="h-4 w-4 mr-2 hidden md:inline" />
                    ) : (
                      <step.icon className="h-4 w-4 mr-2 hidden md:inline" />
                    )}
                    <span>{step.title}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="isletme-bilgileri">
                <IsletmeBilgileriForm formData={formData} onChange={handleChange} errors={errors} />
              </TabsContent>

              <TabsContent value="konum-bilgileri">
                <KonumBilgileriForm formData={formData} onChange={handleChange} errors={errors} />
              </TabsContent>

              <TabsContent value="iletisim-bilgileri">
                <IletisimBilgileriForm formData={formData} onChange={handleChange} errors={errors} />
              </TabsContent>

              <TabsContent value="calisma-saatleri">
                <CalismaSaatleriForm formData={formData} onChange={handleChange} errors={errors} />
              </TabsContent>

              <TabsContent value="ozellikler">
                <OzelliklerForm formData={formData} onChange={handleChange} errors={errors} />
              </TabsContent>

              <TabsContent value="seo-bilgileri">
                <SEOBilgileriForm formData={formData} onChange={handleChange} errors={errors} />
              </TabsContent>

              <TabsContent value="isletme-gorselleri">
                <FotograflarForm
                  formData={formData}
                  onChange={handleChange}
                  errors={errors}
                  selectedFiles={selectedFiles}
                  setSelectedFiles={setSelectedFiles}
                  uploadingPhotos={uploadingPhotos}
                  uploadProgress={uploadProgress}
                  maxFiles={MAX_FILES}
                />
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 border-t p-6">
            <div className="flex gap-2">
              {activeTab !== formSteps[0].id && (
                <Button type="button" variant="outline" onClick={handlePrevTab} disabled={isSubmitting}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Geri
                </Button>
              )}

              <Button type="button" variant="outline" onClick={handleClearForm} disabled={isSubmitting}>
                Formu Temizle
              </Button>
            </div>

            <div className="flex gap-2">
              {activeTab !== formSteps[formSteps.length - 1].id ? (
                <Button type="button" onClick={handleNextTab} disabled={isSubmitting}>
                  İleri
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      İşletmeyi Kaydet
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
