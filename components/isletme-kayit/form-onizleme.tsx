"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Building,
  MapPin,
  Phone,
  Globe,
  Mail,
  Clock,
  Calendar,
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
  Package,
  Accessibility,
} from "lucide-react"

interface FormOnizlemeProps {
  formData: any
}

export function FormOnizleme({ formData }: FormOnizlemeProps) {
  const [activeTab, setActiveTab] = useState("genel")
  const [isSticky, setIsSticky] = useState(false)

  // Scroll olayını dinle
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY
      setIsSticky(offset > 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Özellikleri filtrele
  const aktifOzellikler = Object.entries(formData)
    .filter(([key, value]) => typeof value === "boolean" && value === true && !["one_cikan"].includes(key))
    .map(([key]) => key)

  // Özellik ikonlarını belirle
  const ozellikIkonlari: Record<string, any> = {
    wifi: { icon: Wifi, label: "Ücretsiz Wi-Fi" },
    otopark: { icon: Car, label: "Otopark" },
    kredi_karti: { icon: CreditCard, label: "Kredi Kartı" },
    rezervasyon: { icon: Calendar, label: "Rezervasyon" },
    paket_servis: { icon: Package, label: "Paket Servis" },
    engelli_erisim: { icon: Accessibility, label: "Engelli Erişimi" },
  }

  return (
    <Card className={`border shadow-md ${isSticky ? "sticky top-4 transition-all duration-300" : ""}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">İşletme Önizleme</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="genel">Genel</TabsTrigger>
            <TabsTrigger value="iletisim">İletişim</TabsTrigger>
            <TabsTrigger value="ozellikler">Özellikler</TabsTrigger>
          </TabsList>

          <TabsContent value="genel" className="space-y-4">
            {formData.fotograf_url && (
              <div className="aspect-video rounded-md overflow-hidden bg-muted">
                <img
                  src={formData.fotograf_url || "/placeholder.svg"}
                  alt={formData.isletme_adi || "İşletme görseli"}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="space-y-3">
              {formData.isletme_adi && (
                <div className="flex items-start gap-2">
                  <Building className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium">{formData.isletme_adi}</h3>
                    {formData.one_cikan && (
                      <Badge variant="secondary" className="mt-1">
                        <Star className="h-3 w-3 mr-1 text-yellow-500" /> Öne Çıkan
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {formData.kategori && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {formData.kategori}
                    {formData.alt_kategori && ` / ${formData.alt_kategori}`}
                  </span>
                </div>
              )}

              {formData.adres && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="text-sm">
                    {formData.adres}
                    {formData.sehir && `, ${formData.sehir}`}
                    {formData.ilce && ` / ${formData.ilce}`}
                  </span>
                </div>
              )}

              {formData.calisma_saatleri && (
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm whitespace-pre-line">{formData.calisma_saatleri}</div>
                </div>
              )}

              {formData.aciklama && (
                <div className="pt-2 text-sm">
                  {formData.aciklama.length > 150 ? `${formData.aciklama.substring(0, 150)}...` : formData.aciklama}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="iletisim" className="space-y-3">
            {formData.telefon && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{formData.telefon}</span>
              </div>
            )}

            {formData.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{formData.email}</span>
              </div>
            )}

            {formData.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{formData.website}</span>
              </div>
            )}

            {formData.sosyal_medya && (
              <div className="pt-2">
                <h4 className="text-sm font-medium mb-2">Sosyal Medya</h4>
                <div className="flex flex-wrap gap-2">
                  {formData.sosyal_medya.facebook && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Facebook className="h-3 w-3" />
                      <span className="text-xs">Facebook</span>
                    </Badge>
                  )}
                  {formData.sosyal_medya.instagram && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Instagram className="h-3 w-3" />
                      <span className="text-xs">Instagram</span>
                    </Badge>
                  )}
                  {formData.sosyal_medya.twitter && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Twitter className="h-3 w-3" />
                      <span className="text-xs">Twitter</span>
                    </Badge>
                  )}
                  {formData.sosyal_medya.linkedin && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Linkedin className="h-3 w-3" />
                      <span className="text-xs">LinkedIn</span>
                    </Badge>
                  )}
                  {formData.sosyal_medya.youtube && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Youtube className="h-3 w-3" />
                      <span className="text-xs">YouTube</span>
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="ozellikler">
            {aktifOzellikler.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {aktifOzellikler.map((ozellik) => {
                  const ozellikBilgi = ozellikIkonlari[ozellik]
                  if (!ozellikBilgi) return null

                  const OzellikIkon = ozellikBilgi.icon
                  return (
                    <div key={ozellik} className="flex items-center gap-2">
                      <OzellikIkon className="h-4 w-4 text-primary" />
                      <span className="text-sm">{ozellikBilgi.label}</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Henüz özellik seçilmedi.</p>
            )}

            {formData.sunulan_hizmetler && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Sunulan Hizmetler</h4>
                <div className="flex flex-wrap gap-1">
                  {formData.sunulan_hizmetler.split(",").map((hizmet: string, index: number) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {hizmet.trim()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
