"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Globe, Facebook, Instagram, Twitter, Youtube, Linkedin } from "lucide-react"

interface IletisimBilgileriFormProps {
  formData: any
  onChange: (field: string, value: any) => void
  errors: Record<string, string>
}

export function IletisimBilgileriForm({ formData, onChange, errors }: IletisimBilgileriFormProps) {
  // Sosyal medya değerlerini güncelleme fonksiyonu
  const handleSosyalMedyaChange = (platform: string, value: string) => {
    // Mevcut sosyal medya değerlerini al
    const sosyalMedya = { ...(formData.sosyal_medya || {}) }
    // Yeni değeri güncelle
    sosyalMedya[platform] = value
    // Tüm sosyal medya nesnesini güncelle
    onChange("sosyal_medya", sosyalMedya)
  }

  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-0 space-y-6">
        <div className="flex items-center gap-2 text-lg font-medium text-primary">
          <Mail className="h-5 w-5" />
          <h3>İletişim Bilgileri</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="email" className={errors.email ? "text-destructive" : ""}>
              E-posta
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={formData.email || ""}
                onChange={(e) => onChange("email", e.target.value)}
                className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
                placeholder="ornek@mail.com"
              />
            </div>
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="website" className={errors.website ? "text-destructive" : ""}>
              Web Sitesi
            </Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="website"
                value={formData.website || ""}
                onChange={(e) => onChange("website", e.target.value)}
                className={`pl-10 ${errors.website ? "border-destructive" : ""}`}
                placeholder="https://www.example.com"
              />
            </div>
            {errors.website && <p className="text-xs text-destructive mt-1">{errors.website}</p>}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-medium">Sosyal Medya Hesapları</h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="facebook" className={errors["sosyal_medya.facebook"] ? "text-destructive" : ""}>
                Facebook
              </Label>
              <div className="relative">
                <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="facebook"
                  value={formData.sosyal_medya?.facebook || ""}
                  onChange={(e) => handleSosyalMedyaChange("facebook", e.target.value)}
                  className={`pl-10 ${errors["sosyal_medya.facebook"] ? "border-destructive" : ""}`}
                  placeholder="https://www.facebook.com/sayfaadi"
                />
              </div>
              {errors["sosyal_medya.facebook"] && (
                <p className="text-xs text-destructive mt-1">{errors["sosyal_medya.facebook"]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram" className={errors["sosyal_medya.instagram"] ? "text-destructive" : ""}>
                Instagram
              </Label>
              <div className="relative">
                <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="instagram"
                  value={formData.sosyal_medya?.instagram || ""}
                  onChange={(e) => handleSosyalMedyaChange("instagram", e.target.value)}
                  className={`pl-10 ${errors["sosyal_medya.instagram"] ? "border-destructive" : ""}`}
                  placeholder="https://www.instagram.com/kullaniciadi"
                />
              </div>
              {errors["sosyal_medya.instagram"] && (
                <p className="text-xs text-destructive mt-1">{errors["sosyal_medya.instagram"]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter" className={errors["sosyal_medya.twitter"] ? "text-destructive" : ""}>
                Twitter
              </Label>
              <div className="relative">
                <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="twitter"
                  value={formData.sosyal_medya?.twitter || ""}
                  onChange={(e) => handleSosyalMedyaChange("twitter", e.target.value)}
                  className={`pl-10 ${errors["sosyal_medya.twitter"] ? "border-destructive" : ""}`}
                  placeholder="https://twitter.com/kullaniciadi"
                />
              </div>
              {errors["sosyal_medya.twitter"] && (
                <p className="text-xs text-destructive mt-1">{errors["sosyal_medya.twitter"]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="youtube" className={errors["sosyal_medya.youtube"] ? "text-destructive" : ""}>
                YouTube
              </Label>
              <div className="relative">
                <Youtube className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="youtube"
                  value={formData.sosyal_medya?.youtube || ""}
                  onChange={(e) => handleSosyalMedyaChange("youtube", e.target.value)}
                  className={`pl-10 ${errors["sosyal_medya.youtube"] ? "border-destructive" : ""}`}
                  placeholder="https://www.youtube.com/channel/..."
                />
              </div>
              {errors["sosyal_medya.youtube"] && (
                <p className="text-xs text-destructive mt-1">{errors["sosyal_medya.youtube"]}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="linkedin" className={errors["sosyal_medya.linkedin"] ? "text-destructive" : ""}>
                LinkedIn
              </Label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="linkedin"
                  value={formData.sosyal_medya?.linkedin || ""}
                  onChange={(e) => handleSosyalMedyaChange("linkedin", e.target.value)}
                  className={`pl-10 ${errors["sosyal_medya.linkedin"] ? "border-destructive" : ""}`}
                  placeholder="https://www.linkedin.com/company/..."
                />
              </div>
              {errors["sosyal_medya.linkedin"] && (
                <p className="text-xs text-destructive mt-1">{errors["sosyal_medya.linkedin"]}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
