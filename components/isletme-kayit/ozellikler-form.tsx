"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Wifi,
  Car,
  CreditCard,
  CalendarClock,
  Package,
  Accessibility,
  Star,
  Baby,
  PawPrint,
  Cigarette,
  Music,
  Utensils,
  Tv,
  Truck,
  Coffee,
  Banknote,
  Smartphone,
  Leaf,
} from "lucide-react"

interface OzelliklerFormProps {
  formData: any
  onChange: (field: string, value: any) => void
  errors: Record<string, string>
}

// Özellik grupları
const OZELLIK_GRUPLARI = [
  {
    baslik: "Temel Özellikler",
    ozellikler: [
      { id: "wifi", label: "Ücretsiz Wi-Fi", icon: Wifi },
      { id: "otopark", label: "Otopark", icon: Car },
      { id: "kredi_karti", label: "Kredi Kartı", icon: CreditCard },
      { id: "rezervasyon", label: "Rezervasyon", icon: CalendarClock },
      { id: "paket_servis", label: "Paket Servis", icon: Package },
      { id: "engelli_erisim", label: "Engelli Erişimi", icon: Accessibility },
      { id: "one_cikan", label: "Öne Çıkan", icon: Star },
    ],
  },
  {
    baslik: "Konfor ve Hizmetler",
    ozellikler: [
      { id: "bebek_dostu", label: "Bebek Dostu", icon: Baby },
      { id: "evcil_hayvan_dostu", label: "Evcil Hayvan Dostu", icon: PawPrint },
      { id: "sigara_alani", label: "Sigara İçme Alanı", icon: Cigarette },
      { id: "canli_muzik", label: "Canlı Müzik", icon: Music },
      { id: "kahvalti", label: "Kahvaltı", icon: Coffee },
      { id: "aksam_yemegi", label: "Akşam Yemeği", icon: Utensils },
      { id: "tv", label: "TV", icon: Tv },
    ],
  },
  {
    baslik: "Ödeme ve Teslimat",
    ozellikler: [
      { id: "ucretsiz_teslimat", label: "Ücretsiz Teslimat", icon: Truck },
      { id: "nakit_odeme", label: "Nakit Ödeme", icon: Banknote },
      { id: "online_odeme", label: "Online Ödeme", icon: Smartphone },
      { id: "temassiz_odeme", label: "Temassız Ödeme", icon: CreditCard },
    ],
  },
  {
    baslik: "Diğer Özellikler",
    ozellikler: [
      { id: "organik_urunler", label: "Organik Ürünler", icon: Leaf },
      { id: "glutensiz_secenekler", label: "Glutensiz Seçenekler", icon: Utensils },
      { id: "vegan_secenekler", label: "Vegan Seçenekler", icon: Leaf },
    ],
  },
]

export function OzelliklerForm({ formData, onChange, errors }: OzelliklerFormProps) {
  // Tüm özellikleri bir grupta topla
  const handleGrupDegistir = (grupIndex: number, checked: boolean) => {
    const grup = OZELLIK_GRUPLARI[grupIndex]
    const yeniFormData = { ...formData }

    grup.ozellikler.forEach((ozellik) => {
      yeniFormData[ozellik.id] = checked
    })

    // Her bir özelliği tek tek güncelle
    Object.keys(yeniFormData).forEach((key) => {
      if (grup.ozellikler.some((o) => o.id === key)) {
        onChange(key, yeniFormData[key])
      }
    })
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">İşletme Özellikleri</h3>

      {OZELLIK_GRUPLARI.map((grup, grupIndex) => (
        <div key={grup.baslik} className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-medium text-primary">{grup.baslik}</h4>
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`grup-${grupIndex}-hepsi`}
                checked={grup.ozellikler.every((o) => formData[o.id])}
                onCheckedChange={(checked) => handleGrupDegistir(grupIndex, !!checked)}
              />
              <Label htmlFor={`grup-${grupIndex}-hepsi`}>Tümünü Seç</Label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {grup.ozellikler.map((ozellik) => (
              <div key={ozellik.id} className="flex items-center space-x-2">
                <Checkbox
                  id={ozellik.id}
                  checked={formData[ozellik.id] || false}
                  onCheckedChange={(checked) => onChange(ozellik.id, checked)}
                />
                <div className="flex items-center space-x-2">
                  {ozellik.icon && <ozellik.icon className="h-4 w-4 text-muted-foreground" />}
                  <Label htmlFor={ozellik.id}>{ozellik.label}</Label>
                </div>
              </div>
            ))}
          </div>

          {grupIndex < OZELLIK_GRUPLARI.length - 1 && <Separator className="my-4" />}
        </div>
      ))}
    </div>
  )
}
