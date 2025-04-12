"use client"

import { useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface BasvuruFormProps {
  paketTipi?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export function BasvuruForm({ paketTipi = "", onSuccess, onCancel }: BasvuruFormProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    isletme_adi: "",
    isletme_turu: "",
    isletme_adresi: "",
    isletme_telefonu: "",
    isletme_email: "",
    isletme_website: "",
    yetkili_adi: "",
    yetkili_telefonu: "",
    yetkili_email: "",
    ek_bilgiler: "",
    paket_tipi: paketTipi === "tek-seferlik" ? "Tek Seferlik Paket" : paketTipi === "aylik" ? "Aylık Abonelik" : "",
  })

  // Form değişikliklerini işle
  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }, [])

  // Select değişikliklerini işle
  const handleSelectChange = useCallback((name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }, [])

  // Form gönderimi
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Form doğrulama
      if (!formData.isletme_adi || !formData.yetkili_adi || !formData.yetkili_telefonu) {
        throw new Error("Lütfen zorunlu alanları doldurun.")
      }

      // Supabase istemcisini oluştur
      const supabase = createClient()

      // Başvuruyu kaydet
      const { data, error } = await supabase
        .from("on_basvurular")
        .insert([
          {
            ...formData,
            basvuru_tarihi: new Date().toISOString(),
            durum: "yeni",
          },
        ])
        .select()

      if (error) throw error

      // Başarılı mesajı göster
      setSuccess(true)
      toast({
        title: "Başvurunuz Alındı",
        description: "Başvurunuz başarıyla alındı. En kısa sürede sizinle iletişime geçeceğiz.",
      })

      // Callback'i çağır
      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
        }, 2000) // 2 saniye sonra kapat
      }

      // Formu sıfırla
      setFormData({
        isletme_adi: "",
        isletme_turu: "",
        isletme_adresi: "",
        isletme_telefonu: "",
        isletme_email: "",
        isletme_website: "",
        yetkili_adi: "",
        yetkili_telefonu: "",
        yetkili_email: "",
        ek_bilgiler: "",
        paket_tipi: formData.paket_tipi,
      })
    } catch (error) {
      console.error("Başvuru gönderilirken hata:", error)
      toast({
        title: "Hata",
        description: error.message || "Başvuru gönderilirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Başarılı başvuru ekranı
  if (success) {
    return (
      <div className="py-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Başvurunuz Alındı</h2>
          <p className="text-gray-600 mb-6">
            Başvurunuz başarıyla alındı. Ekibimiz en kısa sürede sizinle iletişime geçecektir.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-h-[80vh] overflow-y-auto px-1">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">İşletme Bilgileri</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="isletme_adi">
                İşletme Adı <span className="text-red-500">*</span>
              </Label>
              <Input
                id="isletme_adi"
                name="isletme_adi"
                value={formData.isletme_adi}
                onChange={handleChange}
                placeholder="İşletme adını girin"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="isletme_turu">İşletme Türü</Label>
              <Select
                value={formData.isletme_turu}
                onValueChange={(value) => handleSelectChange("isletme_turu", value)}
              >
                <SelectTrigger id="isletme_turu">
                  <SelectValue placeholder="İşletme türünü seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="restoran">Restoran / Kafe</SelectItem>
                  <SelectItem value="konaklama">Otel / Konaklama</SelectItem>
                  <SelectItem value="saglik">Sağlık Hizmetleri</SelectItem>
                  <SelectItem value="guzellik">Güzellik / Bakım</SelectItem>
                  <SelectItem value="egitim">Eğitim</SelectItem>
                  <SelectItem value="perakende">Perakende / Mağaza</SelectItem>
                  <SelectItem value="hizmet">Hizmet Sektörü</SelectItem>
                  <SelectItem value="diger">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="isletme_adresi">İşletme Adresi</Label>
              <Textarea
                id="isletme_adresi"
                name="isletme_adresi"
                value={formData.isletme_adresi}
                onChange={handleChange}
                placeholder="İşletme adresini girin"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="isletme_telefonu">İşletme Telefonu</Label>
              <Input
                id="isletme_telefonu"
                name="isletme_telefonu"
                value={formData.isletme_telefonu}
                onChange={handleChange}
                placeholder="0555 555 5555"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="isletme_email">İşletme E-posta</Label>
              <Input
                id="isletme_email"
                name="isletme_email"
                type="email"
                value={formData.isletme_email}
                onChange={handleChange}
                placeholder="isletme@ornek.com"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="isletme_website">İşletme Web Sitesi</Label>
              <Input
                id="isletme_website"
                name="isletme_website"
                value={formData.isletme_website}
                onChange={handleChange}
                placeholder="https://www.isletmeniz.com"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Yetkili Kişi Bilgileri</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="yetkili_adi">
                Yetkili Adı Soyadı <span className="text-red-500">*</span>
              </Label>
              <Input
                id="yetkili_adi"
                name="yetkili_adi"
                value={formData.yetkili_adi}
                onChange={handleChange}
                placeholder="Yetkili kişinin adı soyadı"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="yetkili_telefonu">
                Yetkili Telefonu <span className="text-red-500">*</span>
              </Label>
              <Input
                id="yetkili_telefonu"
                name="yetkili_telefonu"
                value={formData.yetkili_telefonu}
                onChange={handleChange}
                placeholder="0555 555 5555"
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="yetkili_email">Yetkili E-posta</Label>
              <Input
                id="yetkili_email"
                name="yetkili_email"
                type="email"
                value={formData.yetkili_email}
                onChange={handleChange}
                placeholder="yetkili@ornek.com"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="ek_bilgiler">Ek Bilgiler / Notlar</Label>
          <Textarea
            id="ek_bilgiler"
            name="ek_bilgiler"
            value={formData.ek_bilgiler}
            onChange={handleChange}
            placeholder="Eklemek istediğiniz bilgiler veya sorularınız"
            rows={3}
          />
        </div>

        <Alert>
          <AlertTitle>Bilgilendirme</AlertTitle>
          <AlertDescription>
            Başvurunuz alındıktan sonra ekibimiz en kısa sürede sizinle iletişime geçecektir. Tüm bilgileriniz gizli
            tutulacaktır.
          </AlertDescription>
        </Alert>

        <div className="flex gap-3">
          {onCancel && (
            <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
              İptal
            </Button>
          )}
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              "Başvuruyu Gönder"
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
