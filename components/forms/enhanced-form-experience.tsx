"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Save, AlertCircle, CheckCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { formatPhoneNumber, unformatPhoneNumber } from "@/utils/format-helpers"

// Form şeması
const formSchema = z.object({
  isletme_adi: z
    .string()
    .min(3, { message: "İşletme adı en az 3 karakter olmalıdır" })
    .max(100, { message: "İşletme adı en fazla 100 karakter olabilir" }),
  kategori: z.string({ required_error: "Kategori seçimi zorunludur" }),
  alt_kategori: z.string().optional(),
  telefon: z
    .string()
    .min(10, { message: "Geçerli bir telefon numarası giriniz" })
    .refine((val) => /^(\+90|0)?[0-9]{10}$/.test(unformatPhoneNumber(val)), {
      message: "Geçerli bir telefon numarası giriniz",
    }),
  email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz" }).optional().or(z.literal("")),
  website: z.string().url({ message: "Geçerli bir website adresi giriniz" }).optional().or(z.literal("")),
  adres: z.string().min(10, { message: "Adres en az 10 karakter olmalıdır" }),
  sehir: z.string({ required_error: "Şehir seçimi zorunludur" }),
  ilce: z.string().optional(),
  aciklama: z
    .string()
    .min(20, { message: "Açıklama en az 20 karakter olmalıdır" })
    .max(1000, { message: "Açıklama en fazla 1000 karakter olabilir" }),
  wifi: z.boolean().optional(),
  otopark: z.boolean().optional(),
  kredi_karti: z.boolean().optional(),
  engelli_erisim: z.boolean().optional(),
  rezervasyon: z.boolean().optional(),
  paket_servis: z.boolean().optional(),
})

// Form tipi
type FormValues = z.infer<typeof formSchema>

// Kategori verileri
const KATEGORILER = [
  { id: "restoran", name: "Restoran" },
  { id: "kafe", name: "Kafe" },
  { id: "bar", name: "Bar & Gece Kulübü" },
  { id: "konaklama", name: "Konaklama" },
  { id: "saglik", name: "Sağlık" },
  { id: "egitim", name: "Eğitim" },
  { id: "alisveris", name: "Alışveriş" },
  { id: "spor", name: "Spor & Fitness" },
  { id: "guzellik", name: "Güzellik & Bakım" },
  { id: "otomotiv", name: "Otomotiv" },
  { id: "emlak", name: "Emlak" },
  { id: "hizmet", name: "Hizmet" },
  { id: "eglence", name: "Eğlence" },
  { id: "turizm", name: "Turizm & Seyahat" },
  { id: "diger", name: "Diğer" },
]

// Şehir verileri
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
]

interface EnhancedFormProps {
  initialData?: Partial<FormValues>
  onSubmit: (data: FormValues) => Promise<void>
  submitButtonText?: string
}

export function EnhancedFormExperience({ initialData = {}, onSubmit, submitButtonText = "Kaydet" }: EnhancedFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [formProgress, setFormProgress] = useState(0)

  // Form tanımlama
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, dirtyFields, touchedFields, isValid },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isletme_adi: "",
      kategori: "",
      alt_kategori: "",
      telefon: "",
      email: "",
      website: "",
      adres: "",
      sehir: "",
      ilce: "",
      aciklama: "",
      wifi: false,
      otopark: false,
      kredi_karti: false,
      engelli_erisim: false,
      rezervasyon: false,
      paket_servis: false,
      ...initialData,
    },
    mode: "onChange",
  })

  // Form verilerini izle
  const formValues = watch()

  // Form ilerleme durumunu hesapla
  useEffect(() => {
    const requiredFields = ["isletme_adi", "kategori", "telefon", "adres", "sehir", "aciklama"]
    const optionalFields = [
      "alt_kategori",
      "email",
      "website",
      "ilce",
      "wifi",
      "otopark",
      "kredi_karti",
      "engelli_erisim",
      "rezervasyon",
      "paket_servis",
    ]

    const requiredFieldsCount = requiredFields.length
    const optionalFieldsCount = optionalFields.length

    // Doldurulmuş zorunlu alan sayısı
    const filledRequiredFields = requiredFields.filter((field) => {
      const value = formValues[field as keyof FormValues]
      return typeof value === "string" ? value.trim() !== "" : value !== undefined
    }).length

    // Doldurulmuş isteğe bağlı alan sayısı
    const filledOptionalFields = optionalFields.filter((field) => {
      const value = formValues[field as keyof FormValues]
      return typeof value === "string" ? value.trim() !== "" : value !== undefined && value !== false
    }).length

    // İlerleme hesaplama (zorunlu alanlar %70, isteğe bağlı alanlar %30 ağırlıklı)
    const requiredProgress = (filledRequiredFields / requiredFieldsCount) * 70
    const optionalProgress = (filledOptionalFields / optionalFieldsCount) * 30

    setFormProgress(Math.round(requiredProgress + optionalProgress))
  }, [formValues])

  // Başlangıç verilerini yükle
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      reset(initialData as FormValues)
    }

    // LocalStorage'dan taslak kontrolü
    const savedDraft = localStorage.getItem("formDraft")
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft)
        const savedTime = new Date(draftData.timestamp)
        const now = new Date()

        // Son 24 saat içinde kaydedilmiş taslak varsa yükle
        if (now.getTime() - savedTime.getTime() < 24 * 60 * 60 * 1000) {
          toast({
            title: "Taslak bulundu",
            description: `Son kaydedilen taslak yüklendi (${savedTime.toLocaleString()})`,
            duration: 5000,
          })

          reset(draftData.formData)
          setLastSaved(savedTime)
        } else {
          // 24 saatten eski taslağı sil
          localStorage.removeItem("formDraft")
        }
      } catch (error) {
        console.error("Taslak yükleme hatası:", error)
        localStorage.removeItem("formDraft")
      }
    }
  }, [initialData, reset, toast])

  // Otomatik kaydetme
  useEffect(() => {
    const debounceSave = setTimeout(() => {
      // Form değiştiğinde ve geçerli olduğunda otomatik kaydet
      if (Object.keys(dirtyFields).length > 0 && isValid) {
        const saveFormDraft = async () => {
          try {
            setAutoSaveStatus("saving")

            // LocalStorage'a kaydet
            localStorage.setItem(
              "formDraft",
              JSON.stringify({
                formData: formValues,
                timestamp: new Date().toISOString(),
              }),
            )

            // Supabase'e kaydet (kullanıcı oturum açmışsa)
            const supabase = createClient()
            const {
              data: { session },
            } = await supabase.auth.getSession()

            if (session?.user) {
              await supabase.from("form_drafts").upsert({
                user_id: session.user.id,
                form_type: "isletme_kayit",
                form_data: formValues,
                updated_at: new Date().toISOString(),
              })
            }

            setLastSaved(new Date())
            setAutoSaveStatus("saved")

            // 3 saniye sonra durumu sıfırla
            setTimeout(() => {
              setAutoSaveStatus("idle")
            }, 3000)
          } catch (error) {
            console.error("Otomatik kaydetme hatası:", error)
            setAutoSaveStatus("error")

            // 3 saniye sonra durumu sıfırla
            setTimeout(() => {
              setAutoSaveStatus("idle")
            }, 3000)
          }
        }

        saveFormDraft()
      }
    }, 2000) // 2 saniye gecikme

    return () => clearTimeout(debounceSave)
  }, [formValues, dirtyFields, isValid])

  // Form gönderimi
  const handleFormSubmit = async (data: FormValues) => {
    setIsSubmitting(true)

    try {
      // Telefon numarasını formatla
      data.telefon = unformatPhoneNumber(data.telefon)

      await onSubmit(data)

      // Başarılı gönderim sonrası taslağı temizle
      localStorage.removeItem("formDraft")

      // Supabase'den taslağı temizle
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        await supabase.from("form_drafts").delete().eq("user_id", session.user.id).eq("form_type", "isletme_kayit")
      }

      toast({
        title: "Başarılı!",
        description: "Form başarıyla gönderildi.",
      })
    } catch (error: any) {
      console.error("Form gönderme hatası:", error)
      toast({
        title: "Hata!",
        description: error.message || "Form gönderilirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Telefon numarası formatla
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("telefon", formatPhoneNumber(e.target.value), { shouldValidate: true, shouldDirty: true })
  }

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="flex justify-between items-center">
          <span>İşletme Bilgileri</span>
          <div className="text-sm font-normal flex items-center">
            {autoSaveStatus === "saving" && (
              <span className="flex items-center text-amber-600">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Kaydediliyor...
              </span>
            )}
            {autoSaveStatus === "saved" && (
              <span className="flex items-center text-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Kaydedildi: {lastSaved?.toLocaleTimeString()}
              </span>
            )}
            {autoSaveStatus === "error" && (
              <span className="flex items-center text-red-600">
                <AlertCircle className="h-3 w-3 mr-1" />
                Kaydetme hatası
              </span>
            )}
          </div>
        </CardTitle>

        {/* İlerleme çubuğu */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Form tamamlanma durumu</span>
            <span>{formProgress}%</span>
          </div>
          <Progress value={formProgress} className="h-2" />
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <CardContent className="space-y-6">
          {/* Temel Bilgiler */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Temel Bilgiler</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="isletme_adi" className={errors.isletme_adi ? "text-destructive" : ""}>
                  İşletme Adı *
                </Label>
                <Input
                  id="isletme_adi"
                  {...register("isletme_adi")}
                  className={errors.isletme_adi ? "border-destructive" : ""}
                  placeholder="İşletme adını girin"
                />
                {errors.isletme_adi && <p className="text-xs text-destructive">{errors.isletme_adi.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefon" className={errors.telefon ? "text-destructive" : ""}>
                  Telefon *
                </Label>
                <Input
                  id="telefon"
                  {...register("telefon")}
                  onChange={handlePhoneChange}
                  className={errors.telefon ? "border-destructive" : ""}
                  placeholder="(___) ___ __ __"
                />
                {errors.telefon && <p className="text-xs text-destructive">{errors.telefon.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kategori" className={errors.kategori ? "text-destructive" : ""}>
                  Kategori *
                </Label>
                <Controller
                  name="kategori"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="kategori" className={errors.kategori ? "border-destructive" : ""}>
                        <SelectValue placeholder="Kategori seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {KATEGORILER.map((kategori) => (
                          <SelectItem key={kategori.id} value={kategori.name}>
                            {kategori.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.kategori && <p className="text-xs text-destructive">{errors.kategori.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="alt_kategori">
                  Alt Kategori <span className="text-muted-foreground text-xs">(opsiyonel)</span>
                </Label>
                <Input id="alt_kategori" {...register("alt_kategori")} placeholder="Alt kategori" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email" className={errors.email ? "text-destructive" : ""}>
                  E-posta <span className="text-muted-foreground text-xs">(opsiyonel)</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className={errors.email ? "border-destructive" : ""}
                  placeholder="ornek@domain.com"
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className={errors.website ? "text-destructive" : ""}>
                  Website <span className="text-muted-foreground text-xs">(opsiyonel)</span>
                </Label>
                <Input
                  id="website"
                  {...register("website")}
                  className={errors.website ? "border-destructive" : ""}
                  placeholder="https://example.com"
                />
                {errors.website && <p className="text-xs text-destructive">{errors.website.message}</p>}
              </div>
            </div>
          </div>

          {/* Konum Bilgileri */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-medium">Konum Bilgileri</h3>

            <div className="space-y-2">
              <Label htmlFor="adres" className={errors.adres ? "text-destructive" : ""}>
                Adres *
              </Label>
              <Textarea
                id="adres"
                {...register("adres")}
                className={errors.adres ? "border-destructive" : ""}
                placeholder="İşletme adresini girin"
                rows={3}
              />
              {errors.adres && <p className="text-xs text-destructive">{errors.adres.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sehir" className={errors.sehir ? "text-destructive" : ""}>
                  Şehir *
                </Label>
                <Controller
                  name="sehir"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
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
                  )}
                />
                {errors.sehir && <p className="text-xs text-destructive">{errors.sehir.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="ilce">
                  İlçe <span className="text-muted-foreground text-xs">(opsiyonel)</span>
                </Label>
                <Input id="ilce" {...register("ilce")} placeholder="İlçe" />
              </div>
            </div>
          </div>

          {/* Açıklama */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-medium">İşletme Açıklaması</h3>

            <div className="space-y-2">
              <Label htmlFor="aciklama" className={errors.aciklama ? "text-destructive" : ""}>
                Açıklama *
              </Label>
              <Textarea
                id="aciklama"
                {...register("aciklama")}
                className={errors.aciklama ? "border-destructive" : ""}
                placeholder="İşletmenizi detaylı bir şekilde tanıtın"
                rows={5}
              />
              {errors.aciklama && <p className="text-xs text-destructive">{errors.aciklama.message}</p>}
              <p className="text-xs text-muted-foreground">
                Kalan karakter: {1000 - (formValues.aciklama?.length || 0)}
              </p>
            </div>
          </div>

          {/* Özellikler */}
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-lg font-medium">İşletme Özellikleri</h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Controller
                  name="wifi"
                  control={control}
                  render={({ field }) => <Checkbox id="wifi" checked={field.value} onCheckedChange={field.onChange} />}
                />
                <Label htmlFor="wifi">Ücretsiz Wi-Fi</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Controller
                  name="otopark"
                  control={control}
                  render={({ field }) => (
                    <Checkbox id="otopark" checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
                <Label htmlFor="otopark">Otopark</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Controller
                  name="kredi_karti"
                  control={control}
                  render={({ field }) => (
                    <Checkbox id="kredi_karti" checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
                <Label htmlFor="kredi_karti">Kredi Kartı</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Controller
                  name="engelli_erisim"
                  control={control}
                  render={({ field }) => (
                    <Checkbox id="engelli_erisim" checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
                <Label htmlFor="engelli_erisim">Engelli Erişimi</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Controller
                  name="rezervasyon"
                  control={control}
                  render={({ field }) => (
                    <Checkbox id="rezervasyon" checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
                <Label htmlFor="rezervasyon">Rezervasyon</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Controller
                  name="paket_servis"
                  control={control}
                  render={({ field }) => (
                    <Checkbox id="paket_servis" checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
                <Label htmlFor="paket_servis">Paket Servis</Label>
              </div>
            </div>
          </div>

          {/* Form Durumu */}
          {!isValid && Object.keys(touchedFields).length > 0 && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Lütfen formdaki hataları düzeltin.</AlertDescription>
            </Alert>
          )}
        </CardContent>

        <CardFooter className="flex justify-between border-t pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (window.confirm("Form verileriniz silinecek. Emin misiniz?")) {
                reset()
                localStorage.removeItem("formDraft")
                toast({
                  title: "Form temizlendi",
                  description: "Tüm form verileri silindi.",
                })
              }
            }}
          >
            Formu Temizle
          </Button>

          <Button type="submit" disabled={isSubmitting || !isValid}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {submitButtonText}
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
