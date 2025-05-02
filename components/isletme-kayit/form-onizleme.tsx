"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  MapPin,
  Phone,
  Globe,
  Mail,
  Clock,
  Tag,
  Star,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Wifi,
  Car,
  CreditCard,
  Accessibility,
  Calendar,
  Package,
} from "lucide-react"

interface FormOnizlemeProps {
  formData: any
}

// Named export ekleyelim
export function FormOnizleme({ formData }: FormOnizlemeProps) {
  // Sosyal medya ikonları
  const sosyalMedyaIkonlari: Record<string, any> = {
    facebook: { icon: Facebook, color: "text-blue-600" },
    instagram: { icon: Instagram, color: "text-pink-600" },
    twitter: { icon: Twitter, color: "text-blue-400" },
    linkedin: { icon: Linkedin, color: "text-blue-700" },
    youtube: { icon: Youtube, color: "text-red-600" },
  }

  // Özellik ikonları
  const ozellikIkonlari: Record<string, any> = {
    wifi: { icon: Wifi, label: "Wi-Fi" },
    otopark: { icon: Car, label: "Otopark" },
    kredi_karti: { icon: CreditCard, label: "Kredi Kartı" },
    engelli_erisim: { icon: Accessibility, label: "Engelli Erişimi" },
    rezervasyon: { icon: Calendar, label: "Rezervasyon" },
    paket_servis: { icon: Package, label: "Paket Servis" },
    one_cikan: { icon: Star, label: "Öne Çıkan" },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">İşletme Önizleme</h3>
        <Badge variant="outline" className="text-xs">
          Önizleme
        </Badge>
      </div>

      <ScrollArea className="h-[600px] rounded-md border p-4">
        <div className="space-y-8">
          {/* Ana Görsel */}
          <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
            {formData.fotograf_url ? (
              <img
                src={formData.fotograf_url || "/placeholder.svg"}
                alt={formData.isletme_adi || "İşletme görseli"}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">Görsel eklenmedi</div>
            )}
          </div>

          {/* İşletme Adı ve Kategori */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{formData.isletme_adi || "İşletme Adı"}</h1>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{formData.kategori || "Kategori"}</Badge>
              {formData.alt_kategori && <Badge variant="outline">{formData.alt_kategori}</Badge>}
              {formData.fiyat_araligi && (
                <Badge variant="outline" className="font-mono">
                  {formData.fiyat_araligi}
                </Badge>
              )}
            </div>
          </div>

          {/* Açıklama */}
          <div className="space-y-2">
            <h2 className="text-lg font-medium">Hakkında</h2>
            <p className="text-muted-foreground">{formData.aciklama || "İşletme açıklaması henüz girilmedi."}</p>
          </div>

          <Separator />

          {/* İletişim Bilgileri */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium">İletişim Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Adres */}
              <div className="flex items-start gap-2">
                <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Adres</p>
                  <p className="text-sm text-muted-foreground">
                    {formData.adres || "Adres girilmedi"}
                    {formData.sehir && (
                      <>
                        <br />
                        {formData.ilce && `${formData.ilce}, `}
                        {formData.sehir}
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Telefon */}
              <div className="flex items-start gap-2">
                <Phone className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Telefon</p>
                  <p className="text-sm text-muted-foreground">{formData.telefon || "Telefon girilmedi"}</p>
                </div>
              </div>

              {/* E-posta */}
              {formData.email && (
                <div className="flex items-start gap-2">
                  <Mail className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">E-posta</p>
                    <p className="text-sm text-muted-foreground">{formData.email}</p>
                  </div>
                </div>
              )}

              {/* Website */}
              {formData.website && (
                <div className="flex items-start gap-2">
                  <Globe className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Web Sitesi</p>
                    <p className="text-sm text-muted-foreground">{formData.website}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Sosyal Medya */}
            {formData.sosyal_medya && Object.entries(formData.sosyal_medya).some(([_, value]) => value) && (
              <div className="mt-4">
                <p className="font-medium mb-2">Sosyal Medya</p>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(formData.sosyal_medya).map(
                    ([platform, url]) =>
                      url && (
                        <div
                          key={platform}
                          className={`flex items-center gap-1 text-sm ${
                            sosyalMedyaIkonlari[platform]?.color || "text-muted-foreground"
                          }`}
                        >
                          {sosyalMedyaIkonlari[platform]?.icon &&
                            // Düzeltilmiş dinamik bileşen kullanımı
                            React.createElement(sosyalMedyaIkonlari[platform].icon, { className: "h-4 w-4" })}
                          <span>{platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
                        </div>
                      ),
                  )}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Çalışma Saatleri */}
          {formData.calisma_saatleri && (
            <>
              <div className="space-y-4">
                <h2 className="text-lg font-medium flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Çalışma Saatleri
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {formData.calisma_gunleri &&
                    Object.entries(formData.calisma_gunleri).map(([gun, saatler]: [string, any]) => (
                      <div key={gun} className="flex justify-between text-sm">
                        <span className="font-medium">{gun.charAt(0).toUpperCase() + gun.slice(1)}</span>
                        <span>
                          {saatler.acik ? (
                            `${saatler.acilis} - ${saatler.kapanis}`
                          ) : (
                            <span className="text-muted-foreground">Kapalı</span>
                          )}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Özellikler */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Özellikler</h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(formData)
                .filter(([key, value]) => typeof value === "boolean" && value === true && ozellikIkonlari[key])
                .map(([key]) => (
                  <Badge key={key} variant="secondary" className="flex items-center gap-1">
                    {ozellikIkonlari[key].icon &&
                      // Düzeltilmiş dinamik bileşen kullanımı
                      React.createElement(ozellikIkonlari[key].icon, { className: "h-3 w-3" })}
                    <span>{ozellikIkonlari[key].label}</span>
                  </Badge>
                ))}
              {!Object.entries(formData).some(
                ([key, value]) => typeof value === "boolean" && value === true && ozellikIkonlari[key],
              ) && <p className="text-sm text-muted-foreground">Özellik seçilmedi</p>}
            </div>
          </div>

          <Separator />

          {/* SEO Bilgileri */}
          {(formData.seo_baslik || formData.seo_aciklama || formData.seo_anahtar_kelimeler) && (
            <>
              <div className="space-y-4">
                <h2 className="text-lg font-medium">SEO Bilgileri</h2>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {formData.seo_baslik || formData.isletme_adi || "İşletme Adı"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 pt-0">
                    <p className="text-sm text-muted-foreground">
                      {formData.seo_aciklama || formData.aciklama?.substring(0, 160) || "İşletme açıklaması"}
                    </p>
                    {formData.seo_anahtar_kelimeler && (
                      <div className="flex flex-wrap gap-1">
                        {formData.seo_anahtar_kelimeler.split(",").map((keyword: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {keyword.trim()}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              <Separator />
            </>
          )}

          {/* Fotoğraflar */}
          {formData.fotograflar && formData.fotograflar.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Fotoğraflar</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {formData.fotograflar.map((url: string, index: number) => (
                  <div key={index} className="aspect-square rounded-md overflow-hidden bg-muted">
                    <img
                      src={url || "/placeholder.svg"}
                      alt={`İşletme fotoğrafı ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

// Default export'u da koruyalım
export default FormOnizleme
