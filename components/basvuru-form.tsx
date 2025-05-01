"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import {
  Loader2,
  Send,
  CheckCircle,
  MapPin,
  User,
  Building,
  Package,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
} from "lucide-react"
import { validatePhoneNumber } from "@/utils/phone-validation-helper"
import { handleError } from "@/lib/error-handler"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { unformatPhoneNumber } from "@/utils/phone-formatter"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BasvuruBasari } from "./basvuru-basari"

// Şehir listesi
const SEHIRLER = [
  "Adana",
  "Adıyaman",
  "Afyonkarahisar",
  "Ağrı",
  "Amasya",
  "Ankara",
  "Antalya",
  "Artvin",
  "Aydın",
  "Balıkesir",
  "Bilecik",
  "Bingöl",
  "Bitlis",
  "Bolu",
  "Burdur",
  "Bursa",
  "Çanakkale",
  "Çankırı",
  "Çorum",
  "Denizli",
  "Diyarbakır",
  "Edirne",
  "Elazığ",
  "Erzincan",
  "Erzurum",
  "Eskişehir",
  "Gaziantep",
  "Giresun",
  "Gümüşhane",
  "Hakkari",
  "Hatay",
  "Isparta",
  "Mersin",
  "İstanbul",
  "İzmir",
  "Kars",
  "Kastamonu",
  "Kayseri",
  "Kırklareli",
  "Kırşehir",
  "Kocaeli",
  "Konya",
  "Kütahya",
  "Malatya",
  "Manisa",
  "Kahramanmaraş",
  "Mardin",
  "Muğla",
  "Muş",
  "Nevşehir",
  "Niğde",
  "Ordu",
  "Rize",
  "Sakarya",
  "Samsun",
  "Siirt",
  "Sinop",
  "Sivas",
  "Tekirdağ",
  "Tokat",
  "Trabzon",
  "Tunceli",
  "Şanlıurfa",
  "Uşak",
  "Van",
  "Yozgat",
  "Zonguldak",
  "Aksaray",
  "Bayburt",
  "Karaman",
  "Kırıkkale",
  "Batman",
  "Şırnak",
  "Bartın",
  "Ardahan",
  "Iğdır",
  "Yalova",
  "Karabük",
  "Kilis",
  "Osmaniye",
  "Düzce",
].sort()

// Kategori listesi
const KATEGORILER = [
  "Restoran",
  "Kafe",
  "Bar",
  "Otel",
  "Pansiyon",
  "Kuaför",
  "Güzellik Salonu",
  "Spor Salonu",
  "Market",
  "Bakkal",
  "Elektronik",
  "Giyim",
  "Mobilya",
  "Kırtasiye",
  "Eczane",
  "Hastane",
  "Klinik",
  "Diş Hekimi",
  "Veteriner",
  "Avukat",
  "Mali Müşavir",
  "Mimar",
  "Mühendis",
  "Emlak",
  "Oto Servis",
  "Oto Yıkama",
  "Kuru Temizleme",
  "Terzi",
  "Ayakkabıcı",
  "Kuyumcu",
  "Fırın",
  "Pastane",
  "Tatlıcı",
  "Kasap",
  "Manav",
  "Balıkçı",
  "Oyuncak",
  "Kitapçı",
  "Çiçekçi",
  "Petshop",
  "Bijuteri",
  "Optik",
  "Beyaz Eşya",
  "Züccaciye",
  "Hırdavat",
  "Yapı Market",
  "Halı Yıkama",
  "Anaokulu",
  "Dershane",
  "Dil Kursu",
  "Müzik Kursu",
  "Dans Kursu",
  "Sanat Galerisi",
  "Müze",
  "Sinema",
  "Tiyatro",
  "Konser Salonu",
].sort()

// Form veri tipi
interface BasvuruFormData {
  isletme_adi: string
  kategori: string
  isletme_telefonu: string
  isletme_adresi: string
  sehir: string
  ilce: string
  yetkili_adi: string
  yetkili_soyadi: string
  yetkili_telefonu: string
  yetkili_email: string
  paket_tipi: string
  onay: boolean
  website?: string
  aciklama?: string
}

// Başlangıç değerleri
const initialFormData: BasvuruFormData = {
  isletme_adi: "",
  kategori: "",
  isletme_telefonu: "",
  isletme_adresi: "",
  sehir: "",
  ilce: "",
  yetkili_adi: "",
  yetkili_soyadi: "",
  yetkili_telefonu: "",
  yetkili_email: "",
  paket_tipi: "",
  onay: false,
  website: "",
  aciklama: "",
}

// Paket bilgileri
const PAKETLER = [
  {
    id: "yillik",
    title: "Yıllık Paket",
    price: "₺2,000 + KDV",
    description: "Yıllık ödeme ile %20 indirim",
    features: ["Sınırsız işletme kaydı", "7/24 destek", "Özel panel", "SEO optimizasyonu"],
  },
  {
    id: "aylik",
    title: "Aylık Paket",
    price: "₺200 + KDV",
    description: "Aylık ödeme, taahhüt yok",
    features: ["5 işletme kaydı", "Mesai saatleri destek", "Standart panel", "Temel SEO"],
  },
  {
    id: "tek-seferlik",
    title: "Tek Seferlik",
    price: "₺1,000 + KDV",
    description: "Tek seferlik ödeme",
    features: ["1 işletme kaydı", "30 gün destek", "Temel panel", "Manuel SEO"],
  },
]

interface BasvuruFormProps {
  paketTipi?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function BasvuruForm({ paketTipi = "", onSuccess, onCancel }: BasvuruFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<BasvuruFormData>({
    ...initialFormData,
    paket_tipi: paketTipi || "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [savedData, setSavedData] = useState<BasvuruFormData | null>(null)
  const [isFormChanged, setIsFormChanged] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle")
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const [ilceler, setIlceler] = useState<string[]>([])
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false)
  const [formProgress, setFormProgress] = useState(0)
  const [submittedBusinessName, setSubmittedBusinessName] = useState("")

  // Form adımları
  const steps = [
    { title: "İşletme Bilgileri", icon: <Building className="h-4 w-4" /> },
    { title: "Konum Bilgileri", icon: <MapPin className="h-4 w-4" /> },
    { title: "Yetkili Bilgileri", icon: <User className="h-4 w-4" /> },
    { title: "Paket Seçimi", icon: <Package className="h-4 w-4" /> },
  ]

  // Form ilk yüklendiğinde localStorage'dan veri kontrolü
  useEffect(() => {
    const savedFormData = localStorage.getItem("basvuruFormData")
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData)
        setFormData(parsedData)
        setSavedData(parsedData)
        toast({
          title: "Form verisi bulundu",
          description: "Daha önce doldurduğunuz form verisi yüklendi.",
          duration: 3000,
        })
      } catch (error) {
        console.error("Form verisi yüklenemedi:", error)
        localStorage.removeItem("basvuruFormData")
      }
    }
  }, [toast])

  // Otomatik kaydetme
  useEffect(() => {
    if (isFormChanged) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }

      autoSaveTimerRef.current = setTimeout(() => {
        setAutoSaveStatus("saving")
        localStorage.setItem("basvuruFormData", JSON.stringify(formData))

        setTimeout(() => {
          setAutoSaveStatus("saved")
          setSavedData(formData)
          setIsFormChanged(false)

          setTimeout(() => {
            setAutoSaveStatus("idle")
          }, 2000)
        }, 500)
      }, 1000)
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
  }, [formData, isFormChanged])

  // Form ilerleme durumunu hesapla
  useEffect(() => {
    const totalFields = Object.keys(initialFormData).length
    const filledFields = Object.entries(formData).filter(([key, value]) => {
      if (key === "onay") return value === true
      if (typeof value === "string") return value.trim() !== ""
      return value !== null && value !== undefined
    }).length

    const progress = Math.min(Math.round((filledFields / totalFields) * 100), 100)
    setFormProgress(progress)
  }, [formData])

  // Şehir seçildiğinde ilçeleri getir
  useEffect(() => {
    if (formData.sehir) {
      // Normalde burada API'den ilçeler çekilir, şimdilik örnek veri
      const mockIlceler = [
        "Merkez",
        "Aladağ",
        "Ceyhan",
        "Çukurova",
        "Feke",
        "İmamoğlu",
        "Karaisalı",
        "Karataş",
        "Kozan",
        "Pozantı",
        "Saimbeyli",
        "Sarıçam",
        "Seyhan",
        "Tufanbeyli",
        "Yumurtalık",
        "Yüreğir",
      ]
      setIlceler(mockIlceler)
    } else {
      setIlceler([])
    }
  }, [formData.sehir])

  // Form değişikliği
  const handleChange = (field: keyof BasvuruFormData, value: any) => {
    let processedValue = value

    // İşletme adı için ilk harfleri büyük yapma
    if (field === "isletme_adi" && typeof value === "string") {
      processedValue = value.replace(/\b\w/g, (char) => char.toUpperCase())
    }

    // Ad ve soyad için ilk harfleri büyük yapma
    if ((field === "yetkili_adi" || field === "yetkili_soyadi") && typeof value === "string") {
      processedValue = value.replace(/\b\w/g, (char) => char.toUpperCase())
    }

    // Telefon numarası formatlaması
    if ((field === "isletme_telefonu" || field === "yetkili_telefonu") && typeof value === "string") {
      // Sadece rakamları al
      const digitsOnly = value.replace(/\D/g, "")

      // Format: (0xxx) xxx xx xx
      if (digitsOnly.length <= 11) {
        if (digitsOnly.length === 0) {
          processedValue = ""
        } else if (digitsOnly.length <= 4) {
          processedValue = `(${digitsOnly}`
        } else if (digitsOnly.length <= 7) {
          processedValue = `(${digitsOnly.substring(0, 4)}) ${digitsOnly.substring(4)}`
        } else if (digitsOnly.length <= 9) {
          processedValue = `(${digitsOnly.substring(0, 4)}) ${digitsOnly.substring(4, 7)} ${digitsOnly.substring(7)}`
        } else {
          processedValue = `(${digitsOnly.substring(0, 4)}) ${digitsOnly.substring(4, 7)} ${digitsOnly.substring(7, 9)} ${digitsOnly.substring(9)}`
        }
      } else {
        // Maksimum 11 rakam
        return
      }
    }

    setFormData((prev) => ({ ...prev, [field]: processedValue }))
    setIsFormChanged(true)

    // Hata varsa temizle
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }

    // İşletme adı için benzersizlik kontrolü
    if (field === "isletme_adi" && processedValue.length > 3) {
      checkDuplicateBusinessName(processedValue)
    }
  }

  // İşletme adı benzersizlik kontrolü
  const checkDuplicateBusinessName = async (businessName: string) => {
    if (!businessName || businessName.length < 3) return

    setIsCheckingDuplicate(true)

    try {
      const supabase = createClient()
      const { data } = await supabase.from("isletmeler").select("id").ilike("isletme_adi", businessName).limit(1)

      if (data && data.length > 0) {
        setErrors((prev) => ({
          ...prev,
          isletme_adi: "Bu isimde bir işletme zaten kayıtlı",
        }))
      }
    } catch (error) {
      console.error("İşletme adı kontrolü sırasında hata:", error)
    } finally {
      setIsCheckingDuplicate(false)
    }
  }

  // Form doğrulama
  const validateForm = (step?: number) => {
    const newErrors: Record<string, string> = {}
    let isValid = true

    // Doğrulanacak adımı belirle
    const validateStep = step !== undefined ? step : currentStep

    // Adım 0: İşletme Bilgileri
    if (validateStep === 0) {
      if (!formData.isletme_adi.trim()) {
        newErrors.isletme_adi = "İşletme adı zorunludur"
        isValid = false
      }

      if (!formData.kategori) {
        newErrors.kategori = "İşletme kategorisi zorunludur"
        isValid = false
      }

      if (!formData.isletme_telefonu) {
        newErrors.isletme_telefonu = "İşletme telefon numarası zorunludur"
        isValid = false
      } else if (!validatePhoneNumber(formData.isletme_telefonu).valid) {
        newErrors.isletme_telefonu = "Geçerli bir telefon numarası giriniz"
        isValid = false
      }
    }

    // Adım 1: Konum Bilgileri
    if (validateStep === 1) {
      if (!formData.isletme_adresi.trim()) {
        newErrors.isletme_adresi = "İşletme adresi zorunludur"
        isValid = false
      }

      if (!formData.sehir) {
        newErrors.sehir = "Şehir seçimi zorunludur"
        isValid = false
      }
    }

    // Adım 2: Yetkili Bilgileri
    if (validateStep === 2) {
      if (!formData.yetkili_adi.trim()) {
        newErrors.yetkili_adi = "Yetkili kişi adı zorunludur"
        isValid = false
      }

      if (!formData.yetkili_soyadi.trim()) {
        newErrors.yetkili_soyadi = "Yetkili kişi soyadı zorunludur"
        isValid = false
      }

      if (!formData.yetkili_telefonu) {
        newErrors.yetkili_telefonu = "Yetkili kişi telefon numarası zorunludur"
        isValid = false
      } else if (!validatePhoneNumber(formData.yetkili_telefonu).valid) {
        newErrors.yetkili_telefonu = "Geçerli bir telefon numarası giriniz"
        isValid = false
      }

      if (formData.yetkili_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.yetkili_email)) {
        newErrors.yetkili_email = "Geçerli bir e-posta adresi giriniz"
        isValid = false
      }
    }

    // Adım 3: Paket Seçimi
    if (validateStep === 3) {
      if (!formData.paket_tipi) {
        newErrors.paket_tipi = "Lütfen bir paket seçimi yapınız. Bu alan zorunludur."
        isValid = false
      }

      if (!formData.onay) {
        newErrors.onay = "Kullanım koşullarını kabul etmelisiniz"
        isValid = false
      }
    }

    setErrors(newErrors)
    return isValid
  }

  // Sonraki adıma geç
  const handleNextStep = () => {
    if (validateForm(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
    }
  }

  // Önceki adıma dön
  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  // Form gönderimi
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Hata",
        description: "Lütfen formdaki hataları düzeltin.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      const supabase = createClient()

      // Telefon numaralarını temizle
      const cleanedIsletmeTelefonu = unformatPhoneNumber(formData.isletme_telefonu)
      const cleanedYetkiliTelefonu = unformatPhoneNumber(formData.yetkili_telefonu)

      // CSRF token al
      const csrfResponse = await fetch("/api/csrf-token")
      const { token } = await csrfResponse.json()

      // Başvuruyu ekle
      const { data, error } = await supabase
        .from("on_basvurular")
        .insert([
          {
            isletme_adi: formData.isletme_adi.trim(),
            kategori: formData.kategori,
            isletme_telefonu: cleanedIsletmeTelefonu,
            isletme_adresi: formData.isletme_adresi.trim(),
            sehir: formData.sehir,
            ilce: formData.ilce || null,
            yetkili_adi: formData.yetkili_adi.trim(),
            yetkili_soyadi: formData.yetkili_soyadi.trim(),
            yetkili_telefonu: cleanedYetkiliTelefonu,
            yetkili_email: formData.yetkili_email || null,
            paket_turu: formData.paket_tipi, // Alan adı tutarlılığı için
            website: formData.website || null,
            aciklama: formData.aciklama || null,
            durum: "yeni",
            basvuru_tarihi: new Date().toISOString(),
          },
        ])
        .select()

      if (error) throw error

      // Başarılı kayıt kontrolü
      if (!data || data.length === 0) {
        throw new Error("Başvuru kaydedildi ancak veri döndürülemedi.")
      }

      // İşletme adını kaydet
      setSubmittedBusinessName(formData.isletme_adi)

      // Başarı durumunu güncelle
      setSuccess(true)

      // Bildirim göster
      toast({
        title: "Başvurunuz Başarıyla Alındı",
        description: "1-3 iş günü içerisinde verdiğiniz bilgiler kontrol edilip sizinle iletişime geçilecektir.",
        duration: 5000, // 5 saniye göster
      })

      // LocalStorage'dan formu temizle
      localStorage.removeItem("basvuruFormData")

      // Bildirim gönder
      try {
        await supabase.from("notifications").insert([
          {
            user_id: null, // Admin kullanıcılarına gönderilecek
            type: "new_application",
            title: "Yeni Başvuru",
            message: `${formData.isletme_adi} adlı işletme için yeni başvuru alındı.`,
            related_id: data[0].id,
            related_type: "on_basvurular",
            is_read: false,
            created_at: new Date().toISOString(),
          },
        ])
      } catch (notificationError) {
        console.error("Bildirim gönderme hatası:", notificationError)
      }

      // Başarı callback'i
      if (onSuccess) {
        onSuccess()
      }

      // 5 saniye sonra sayfayı yeniden yükle
      setTimeout(() => {
        window.location.reload()
      }, 5000)
    } catch (error) {
      const errorResponse = handleError(error, "basvuru-form")

      toast({
        title: "Hata",
        description: errorResponse.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Formu iptal et
  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
  }

  // Formu temizle
  const handleClearForm = () => {
    if (window.confirm("Form verileriniz silinecek. Emin misiniz?")) {
      setFormData(initialFormData)
      setSavedData(null)
      localStorage.removeItem("basvuruFormData")
      setErrors({})
      setCurrentStep(0)
      toast({
        title: "Form temizlendi",
        description: "Tüm form verileri silindi.",
      })
    }
  }

  // Yeni başvuru yapmak için
  const handleNewApplication = () => {
    setSuccess(false)
    setFormData(initialFormData)
    setCurrentStep(0)
  }

  // Başarılı başvuru durumunda başarı ekranını göster
  if (success) {
    return <BasvuruBasari isletmeAdi={submittedBusinessName} onYeniBasvuru={handleNewApplication} />
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">İşletme Başvuru Formu</CardTitle>
            <CardDescription className="mt-2">
              İşletmenizi sistemimize eklemek için aşağıdaki formu doldurun. En kısa sürede sizinle iletişime geçeceğiz.
            </CardDescription>
          </div>
          {autoSaveStatus !== "idle" && (
            <div className="flex items-center text-sm">
              {autoSaveStatus === "saving" ? (
                <span className="flex items-center text-amber-600">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Kaydediliyor...
                </span>
              ) : (
                <span className="flex items-center text-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Kaydedildi
                </span>
              )}
            </div>
          )}
        </div>

        {/* İlerleme çubuğu */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Form tamamlanma durumu</span>
            <span>{formProgress}%</span>
          </div>
          <Progress value={formProgress} className="h-2" />
        </div>

        {/* Adım göstergesi */}
        <div className="flex justify-between mt-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className={cn(
                "flex flex-col items-center space-y-1 relative",
                index <= currentStep ? "text-primary" : "text-muted-foreground",
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border",
                  index < currentStep
                    ? "bg-primary text-primary-foreground"
                    : index === currentStep
                      ? "border-primary"
                      : "border-muted",
                )}
              >
                {index < currentStep ? <CheckCircle className="h-4 w-4" /> : step.icon}
              </div>
              <span className="text-xs font-medium">{step.title}</span>

              {/* Bağlantı çizgisi */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute top-4 w-[calc(100%-2rem)] h-[2px] left-[calc(50%+1rem)]",
                    index < currentStep ? "bg-primary" : "bg-muted",
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </CardHeader>

      <form ref={formRef} onSubmit={handleSubmit}>
        <CardContent className="p-6">
          {/* Adım 0: İşletme Bilgileri */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <Building className="mr-2 h-5 w-5" />
                İşletme Bilgileri
              </h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="isletme_adi" className={errors.isletme_adi ? "text-destructive" : ""}>
                    İşletme Adı *
                  </Label>
                  <div className="relative">
                    <Input
                      id="isletme_adi"
                      value={formData.isletme_adi}
                      onChange={(e) => handleChange("isletme_adi", e.target.value)}
                      className={errors.isletme_adi ? "border-destructive pr-10" : ""}
                      placeholder="Örn: Akdeniz Restaurant"
                    />
                    {isCheckingDuplicate && (
                      <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                  {errors.isletme_adi && <p className="text-xs text-destructive mt-1">{errors.isletme_adi}</p>}
                </div>

                <div>
                  <Label htmlFor="kategori" className={errors.kategori ? "text-destructive" : ""}>
                    İşletme Kategorisi *
                  </Label>
                  <Select value={formData.kategori} onValueChange={(value) => handleChange("kategori", value)}>
                    <SelectTrigger id="kategori" className={errors.kategori ? "border-destructive" : ""}>
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {KATEGORILER.map((kategori) => (
                        <SelectItem key={kategori} value={kategori}>
                          {kategori}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.kategori && <p className="text-xs text-destructive mt-1">{errors.kategori}</p>}
                </div>

                <div>
                  <Label htmlFor="isletme_telefonu" className={errors.isletme_telefonu ? "text-destructive" : ""}>
                    İşletme Telefon Numarası *
                  </Label>
                  <Input
                    id="isletme_telefonu"
                    value={formData.isletme_telefonu}
                    onChange={(e) => handleChange("isletme_telefonu", e.target.value)}
                    className={errors.isletme_telefonu ? "border-destructive" : ""}
                    placeholder="(05XX) XXX XX XX"
                  />
                  {errors.isletme_telefonu && (
                    <p className="text-xs text-destructive mt-1">{errors.isletme_telefonu}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="website">
                    Web Sitesi <span className="text-muted-foreground text-xs">(opsiyonel)</span>
                  </Label>
                  <Input
                    id="website"
                    value={formData.website || ""}
                    onChange={(e) => handleChange("website", e.target.value)}
                    placeholder="https://www.orneksite.com"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Adım 1: Konum Bilgileri */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <MapPin className="mr-2 h-5 w-5" />
                Konum Bilgileri
              </h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="isletme_adresi" className={errors.isletme_adresi ? "text-destructive" : ""}>
                    İşletme Adresi *
                  </Label>
                  <Textarea
                    id="isletme_adresi"
                    value={formData.isletme_adresi}
                    onChange={(e) => handleChange("isletme_adresi", e.target.value)}
                    className={errors.isletme_adresi ? "border-destructive" : ""}
                    placeholder="Mahalle, Cadde, Sokak, No, Daire vb."
                    rows={3}
                  />
                  {errors.isletme_adresi && <p className="text-xs text-destructive mt-1">{errors.isletme_adresi}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sehir" className={errors.sehir ? "text-destructive" : ""}>
                      Şehir *
                    </Label>
                    <Select value={formData.sehir} onValueChange={(value) => handleChange("sehir", value)}>
                      <SelectTrigger id="sehir" className={errors.sehir ? "border-destructive" : ""}>
                        <SelectValue placeholder="Şehir seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {SEHIRLER.map((sehir) => (
                          <SelectItem key={sehir} value={sehir}>
                            {sehir}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.sehir && <p className="text-xs text-destructive mt-1">{errors.sehir}</p>}
                  </div>

                  <div>
                    <Label htmlFor="ilce">
                      İlçe <span className="text-muted-foreground text-xs">(opsiyonel)</span>
                    </Label>
                    <Select
                      value={formData.ilce}
                      onValueChange={(value) => handleChange("ilce", value)}
                      disabled={!formData.sehir || ilceler.length === 0}
                    >
                      <SelectTrigger id="ilce">
                        <SelectValue placeholder="İlçe seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {ilceler.map((ilce) => (
                          <SelectItem key={ilce} value={ilce}>
                            {ilce}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="aciklama">
                    Ek Açıklama <span className="text-muted-foreground text-xs">(opsiyonel)</span>
                  </Label>
                  <Textarea
                    id="aciklama"
                    value={formData.aciklama || ""}
                    onChange={(e) => handleChange("aciklama", e.target.value)}
                    placeholder="İşletmeniz hakkında ek bilgiler..."
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Adım 2: Yetkili Bilgileri */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <User className="mr-2 h-5 w-5" />
                Yetkili Bilgileri
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="yetkili_adi" className={errors.yetkili_adi ? "text-destructive" : ""}>
                      Yetkili Adı *
                    </Label>
                    <Input
                      id="yetkili_adi"
                      value={formData.yetkili_adi}
                      onChange={(e) => handleChange("yetkili_adi", e.target.value)}
                      className={errors.yetkili_adi ? "border-destructive" : ""}
                      placeholder="Adı"
                    />
                    {errors.yetkili_adi && <p className="text-xs text-destructive mt-1">{errors.yetkili_adi}</p>}
                  </div>

                  <div>
                    <Label htmlFor="yetkili_soyadi" className={errors.yetkili_soyadi ? "text-destructive" : ""}>
                      Yetkili Soyadı *
                    </Label>
                    <Input
                      id="yetkili_soyadi"
                      value={formData.yetkili_soyadi}
                      onChange={(e) => handleChange("yetkili_soyadi", e.target.value)}
                      className={errors.yetkili_soyadi ? "border-destructive" : ""}
                      placeholder="Soyadı"
                    />
                    {errors.yetkili_soyadi && <p className="text-xs text-destructive mt-1">{errors.yetkili_soyadi}</p>}
                  </div>
                </div>

                <div>
                  <Label htmlFor="yetkili_telefonu" className={errors.yetkili_telefonu ? "text-destructive" : ""}>
                    Yetkili Telefon Numarası *
                  </Label>
                  <Input
                    id="yetkili_telefonu"
                    value={formData.yetkili_telefonu}
                    onChange={(e) => handleChange("yetkili_telefonu", e.target.value)}
                    className={errors.yetkili_telefonu ? "border-destructive" : ""}
                    placeholder="(05XX) XXX XX XX"
                  />
                  {errors.yetkili_telefonu && (
                    <p className="text-xs text-destructive mt-1">{errors.yetkili_telefonu}</p>
                  )}

                  {formData.yetkili_telefonu &&
                    formData.isletme_telefonu &&
                    formData.yetkili_telefonu === formData.isletme_telefonu && (
                      <p className="text-xs text-amber-600 mt-1">
                        <AlertCircle className="h-3 w-3 inline mr-1" />
                        Yetkili telefonu işletme telefonu ile aynı. Farklı bir numara girmeniz önerilir.
                      </p>
                    )}
                </div>

                <div>
                  <Label htmlFor="yetkili_email" className={errors.yetkili_email ? "text-destructive" : ""}>
                    E-posta Adresi <span className="text-muted-foreground text-xs">(opsiyonel)</span>
                  </Label>
                  <Input
                    id="yetkili_email"
                    type="email"
                    value={formData.yetkili_email || ""}
                    onChange={(e) => handleChange("yetkili_email", e.target.value)}
                    className={errors.yetkili_email ? "border-destructive" : ""}
                    placeholder="ornek@mail.com"
                  />
                  {errors.yetkili_email && <p className="text-xs text-destructive mt-1">{errors.yetkili_email}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Adım 3: Paket Seçimi */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center">
                <Package className="mr-2 h-5 w-5" />
                Paket Seçimi *
              </h3>

              <div className={cn("space-y-4", errors.paket_tipi ? "border border-destructive rounded-md p-4" : "")}>
                <p className="text-sm text-muted-foreground mb-2">Lütfen aşağıdaki paketlerden birini seçin *</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {PAKETLER.map((paket) => (
                    <div
                      key={paket.id}
                      className={cn(
                        "border rounded-lg p-4 cursor-pointer transition-all",
                        formData.paket_tipi === paket.id
                          ? "border-primary bg-primary/5"
                          : "hover:border-muted-foreground",
                      )}
                      onClick={() => handleChange("paket_tipi", paket.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{paket.title}</h4>
                        <div
                          className={cn(
                            "w-4 h-4 rounded-full border",
                            formData.paket_tipi === paket.id
                              ? "border-4 border-primary"
                              : "border border-muted-foreground",
                          )}
                        />
                      </div>
                      <p className="text-lg font-bold">{paket.price}</p>
                      <p className="text-sm text-muted-foreground mb-3">{paket.description}</p>
                      <ul className="text-sm space-y-1">
                        {paket.features.map((feature, i) => (
                          <li key={i} className="flex items-center">
                            <CheckCircle className="h-3 w-3 mr-2 text-green-600" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                {errors.paket_tipi && <p className="text-xs text-destructive font-medium mt-1">{errors.paket_tipi}</p>}
              </div>

              <div className="flex items-start space-x-2 pt-4">
                <Checkbox
                  id="onay"
                  checked={formData.onay}
                  onCheckedChange={(checked) => handleChange("onay", checked === true)}
                  className={errors.onay ? "border-destructive" : ""}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="onay"
                    className={cn(
                      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                      errors.onay ? "text-destructive" : "",
                    )}
                  >
                    Kullanım koşullarını ve gizlilik politikasını kabul ediyorum *
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Kişisel verileriniz, başvurunuzu değerlendirmek ve sizinle iletişime geçmek amacıyla
                    kullanılacaktır.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 border-t p-6">
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button type="button" variant="outline" onClick={handlePrevStep} disabled={loading}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Geri
              </Button>
            )}

            {savedData && (
              <Button type="button" variant="outline" onClick={handleClearForm} disabled={loading}>
                Formu Temizle
              </Button>
            )}

            {onCancel && (
              <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
                İptal
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {currentStep < steps.length - 1 ? (
              <Button type="button" onClick={handleNextStep} disabled={loading}>
                İleri
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={loading || success} className="min-w-[120px]">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gönderiliyor...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Başvuru Alındı
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Başvuru Yap
                  </>
                )}
              </Button>
            )}
          </div>
        </CardFooter>
      </form>
    </Card>
  )
}
