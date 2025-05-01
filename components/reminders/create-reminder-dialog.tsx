"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { ReminderType, ReminderPriority } from "@/lib/content-reminder-service"

interface CreateReminderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isletmeler: Array<{ id: string; isletme_adi: string }>
  onSuccess: () => void
}

export function CreateReminderDialog({ open, onOpenChange, isletmeler, onSuccess }: CreateReminderDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    isletmeId: "",
    type: ReminderType.BUSINESS_INFO_UPDATE,
    title: "",
    description: "",
    priority: ReminderPriority.MEDIUM,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    recurrence: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.isletmeId || !formData.type || !formData.title || !formData.description) {
      toast({
        title: "Hata",
        description: "Lütfen tüm zorunlu alanları doldurun",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      // Vade tarihini kontrol et
      if (formData.dueDate) {
        const dueDate = new Date(formData.dueDate)
        const today = new Date()
        if (dueDate < today) {
          toast({
            title: "Uyarı",
            description: "Vade tarihi geçmiş bir tarih olamaz.",
            variant: "destructive",
          })
          setLoading(false)
          return
        }
      }

      const response = await fetch("/api/reminders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Hatırlatma oluşturulurken bir hata oluştu")
      }

      toast({
        title: "Başarılı",
        description: "Hatırlatma başarıyla oluşturuldu",
      })

      // Formu temizle
      setFormData({
        isletmeId: "",
        type: ReminderType.BUSINESS_INFO_UPDATE,
        title: "",
        description: "",
        priority: ReminderPriority.MEDIUM,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        recurrence: "",
      })

      // Başarı callback'ini çağır
      onSuccess()

      // Dialog'u kapat
      onOpenChange(false)
    } catch (error) {
      console.error("Hatırlatma oluşturulurken hata:", error)
      toast({
        title: "Hata",
        description: error.message || "Hatırlatma oluşturulurken bir hata oluştu",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Yeni Hatırlatma Oluştur</DialogTitle>
          <DialogDescription>
            İşletmeniz için içerik güncelliği hatırlatması oluşturun. Bu hatırlatmalar, işletme bilgilerinizin güncel
            kalmasına yardımcı olur.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="isletmeId">İşletme *</Label>
              <Select
                name="isletmeId"
                value={formData.isletmeId}
                onValueChange={(value) => handleSelectChange("isletmeId", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="İşletme seçin" />
                </SelectTrigger>
                <SelectContent>
                  {isletmeler.map((isletme) => (
                    <SelectItem key={isletme.id} value={isletme.id}>
                      {isletme.isletme_adi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">Hatırlatma Türü *</Label>
              <Select
                name="type"
                value={formData.type}
                onValueChange={(value) => handleSelectChange("type", value)}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Hatırlatma türü seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ReminderType.BUSINESS_INFO_UPDATE}>İşletme Bilgisi Güncelleme</SelectItem>
                  <SelectItem value={ReminderType.PHOTO_UPDATE}>Fotoğraf Güncelleme</SelectItem>
                  <SelectItem value={ReminderType.OPENING_HOURS_CHECK}>Çalışma Saatleri Kontrolü</SelectItem>
                  <SelectItem value={ReminderType.SERVICES_UPDATE}>Hizmetler Güncelleme</SelectItem>
                  <SelectItem value={ReminderType.CONTACT_INFO_CHECK}>İletişim Bilgileri Kontrolü</SelectItem>
                  <SelectItem value={ReminderType.DESCRIPTION_UPDATE}>Açıklama Güncelleme</SelectItem>
                  <SelectItem value={ReminderType.REVIEW_RESPONSE}>Yorum Yanıtlama</SelectItem>
                  <SelectItem value={ReminderType.GOOGLE_POSTS}>Google Gönderileri</SelectItem>
                  <SelectItem value={ReminderType.SEO_OPTIMIZATION}>SEO Optimizasyonu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="title">Başlık *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Hatırlatma başlığı"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Açıklama *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Hatırlatma açıklaması"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="priority">Öncelik</Label>
              <Select
                name="priority"
                value={formData.priority}
                onValueChange={(value) => handleSelectChange("priority", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Öncelik seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ReminderPriority.LOW}>Düşük</SelectItem>
                  <SelectItem value={ReminderPriority.MEDIUM}>Orta</SelectItem>
                  <SelectItem value={ReminderPriority.HIGH}>Yüksek</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dueDate">Vade Tarihi</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="recurrence">Tekrarlama</Label>
              <Select
                name="recurrence"
                value={formData.recurrence}
                onValueChange={(value) => handleSelectChange("recurrence", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tekrarlama seçin (isteğe bağlı)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tekrarlama Yok</SelectItem>
                  <SelectItem value="daily">Günlük</SelectItem>
                  <SelectItem value="weekly">Haftalık</SelectItem>
                  <SelectItem value="monthly">Aylık</SelectItem>
                  <SelectItem value="quarterly">3 Aylık</SelectItem>
                  <SelectItem value="yearly">Yıllık</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hatırlatma Oluştur
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
