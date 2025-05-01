"use client"
import { Input } from "@/components/ui/input"
import type React from "react"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building, Phone, FileText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface IsletmeBilgileriFormProps {
  formData: any
  onChange: (field: string, value: any) => void
  errors: Record<string, string>
}

export function IsletmeBilgileriForm({ formData, onChange, errors }: IsletmeBilgileriFormProps) {
  // Telefon numarası formatlama
  const formatPhoneNumber = (value: string) => {
    // Sadece rakamları al
    const digitsOnly = value.replace(/\D/g, "")

    // Format: (0xxx) xxx xx xx
    if (digitsOnly.length <= 11) {
      if (digitsOnly.length === 0) {
        return ""
      } else if (digitsOnly.length <= 4) {
        return `(${digitsOnly}`
      } else if (digitsOnly.length <= 7) {
        return `(${digitsOnly.substring(0, 4)}) ${digitsOnly.substring(4)}`
      } else if (digitsOnly.length <= 9) {
        return `(${digitsOnly.substring(0, 4)}) ${digitsOnly.substring(4, 7)} ${digitsOnly.substring(7)}`
      } else {
        return `(${digitsOnly.substring(0, 4)}) ${digitsOnly.substring(4, 7)} ${digitsOnly.substring(7, 9)} ${digitsOnly.substring(9)}`
      }
    }
    return value
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhoneNumber(e.target.value)
    onChange("telefon", formattedValue)
  }

  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-0 space-y-6">
        <div className="flex items-center gap-2 text-lg font-medium text-primary">
          <Building className="h-5 w-5" />
          <h3>Temel Bilgiler</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="isletme_adi" className={errors.isletme_adi ? "text-destructive" : ""}>
              İşletme Adı *
            </Label>
            <Input
              id="isletme_adi"
              value={formData.isletme_adi || ""}
              onChange={(e) => onChange("isletme_adi", e.target.value)}
              className={errors.isletme_adi ? "border-destructive" : ""}
              placeholder="Örn: Akdeniz Restaurant"
            />
            {errors.isletme_adi && <p className="text-xs text-destructive mt-1">{errors.isletme_adi}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug (URL)</Label>
            <Input
              id="slug"
              value={formData.slug || ""}
              onChange={(e) => onChange("slug", e.target.value)}
              placeholder="isletme-adi (boş bırakılırsa otomatik oluşturulur)"
            />
            <p className="text-xs text-muted-foreground">Boş bırakılırsa işletme adından otomatik oluşturulur</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="kategori" className={errors.kategori ? "text-destructive" : ""}>
              Kategori *
            </Label>
            <Select value={formData.kategori || ""} onValueChange={(value) => onChange("kategori", value)}>
              <SelectTrigger id="kategori" className={errors.kategori ? "border-destructive" : ""}>
                <SelectValue placeholder="Kategori seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Restoran">Restoran</SelectItem>
                <SelectItem value="Kafe">Kafe</SelectItem>
                <SelectItem value="Market">Market</SelectItem>
                <SelectItem value="Otel">Otel</SelectItem>
                <SelectItem value="Kuaför">Kuaför</SelectItem>
                <SelectItem value="Diğer">Diğer</SelectItem>
              </SelectContent>
            </Select>
            {errors.kategori && <p className="text-xs text-destructive mt-1">{errors.kategori}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="alt_kategori">Alt Kategori</Label>
            <Input
              id="alt_kategori"
              value={formData.alt_kategori || ""}
              onChange={(e) => onChange("alt_kategori", e.target.value)}
              placeholder="Örn: İtalyan Mutfağı"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefon" className={errors.telefon ? "text-destructive" : ""}>
              Telefon *
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="telefon"
                value={formData.telefon || ""}
                onChange={handlePhoneChange}
                className={`pl-10 ${errors.telefon ? "border-destructive" : ""}`}
                placeholder="(05XX) XXX XX XX"
              />
            </div>
            {errors.telefon && <p className="text-xs text-destructive mt-1">{errors.telefon}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fiyat_araligi">Fiyat Aralığı</Label>
            <Select value={formData.fiyat_araligi || ""} onValueChange={(value) => onChange("fiyat_araligi", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Fiyat aralığı seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="₺">₺ (Ekonomik)</SelectItem>
                <SelectItem value="₺₺">₺₺ (Orta)</SelectItem>
                <SelectItem value="₺₺₺">₺₺₺ (Pahalı)</SelectItem>
                <SelectItem value="₺₺₺₺">₺₺₺₺ (Lüks)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="aciklama" className={errors.aciklama ? "text-destructive" : ""}>
              Açıklama *
            </Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="aciklama"
                value={formData.aciklama || ""}
                onChange={(e) => onChange("aciklama", e.target.value)}
                className={`pl-10 ${errors.aciklama ? "border-destructive" : ""}`}
                placeholder="İşletmeniz hakkında detaylı bilgi verin..."
                rows={4}
              />
            </div>
            {errors.aciklama && <p className="text-xs text-destructive mt-1">{errors.aciklama}</p>}
            <p className="text-xs text-muted-foreground">En az 20 karakter olmalıdır</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
