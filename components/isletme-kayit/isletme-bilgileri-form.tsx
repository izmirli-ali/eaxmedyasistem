"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Building, Info } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatPhoneNumber } from "@/utils/format-helpers"

// Kategori ve alt kategori verileri
const KATEGORILER = [
  {
    id: "restoran",
    name: "Restoran",
    altKategoriler: [
      "Türk Mutfağı",
      "İtalyan Mutfağı",
      "Çin Mutfağı",
      "Japon Mutfağı",
      "Fast Food",
      "Deniz Ürünleri",
      "Vejetaryen",
      "Vegan",
      "Kebap",
      "Pide & Lahmacun",
      "Dünya Mutfağı",
    ],
  },
  {
    id: "kafe",
    name: "Kafe",
    altKategoriler: ["Kahve Dükkanı", "Pastane", "Tatlıcı", "Çay Bahçesi", "Nargile Kafe", "Brunch"],
  },
  {
    id: "bar",
    name: "Bar & Gece Kulübü",
    altKategoriler: ["Bar", "Pub", "Gece Kulübü", "Canlı Müzik", "Kokteyl Bar", "Bira Evi"],
  },
  {
    id: "konaklama",
    name: "Konaklama",
    altKategoriler: ["Otel", "Pansiyon", "Apart", "Butik Otel", "Tatil Köyü", "Dağ Evi", "Villa"],
  },
  {
    id: "saglik",
    name: "Sağlık",
    altKategoriler: ["Hastane", "Klinik", "Diş Hekimi", "Eczane", "Fizik Tedavi", "Psikolog", "Veteriner"],
  },
  {
    id: "egitim",
    name: "Eğitim",
    altKategoriler: ["Okul", "Kurs", "Dil Okulu", "Anaokulu", "Üniversite", "Özel Ders", "Sanat Kursu"],
  },
  {
    id: "alisveris",
    name: "Alışveriş",
    altKategoriler: ["AVM", "Mağaza", "Butik", "Market", "Elektronik", "Mobilya", "Giyim", "Kuyumcu"],
  },
  {
    id: "spor",
    name: "Spor & Fitness",
    altKategoriler: ["Spor Salonu", "Yüzme Havuzu", "Tenis Kortu", "Futbol Sahası", "Yoga Stüdyosu", "Pilates"],
  },
  {
    id: "guzellik",
    name: "Güzellik & Bakım",
    altKategoriler: ["Kuaför", "Güzellik Merkezi", "SPA", "Masaj Salonu", "Cilt Bakımı", "Tırnak Bakımı"],
  },
  {
    id: "otomotiv",
    name: "Otomotiv",
    altKategoriler: ["Oto Servis", "Oto Yıkama", "Oto Galeri", "Lastikçi", "Oto Kiralama", "Oto Ekspertiz"],
  },
  {
    id: "emlak",
    name: "Emlak",
    altKategoriler: ["Emlak Ofisi", "Müteahhit", "Mimarlık Bürosu", "İnşaat Şirketi", "Dekorasyon"],
  },
  {
    id: "hizmet",
    name: "Hizmet",
    altKategoriler: ["Temizlik", "Tamir", "Nakliyat", "Danışmanlık", "Organizasyon", "Matbaa", "Terzi"],
  },
  {
    id: "eglence",
    name: "Eğlence",
    altKategoriler: ["Sinema", "Tiyatro", "Bowling", "Bilardo", "Lunapark", "Oyun Salonu", "Paintball"],
  },
  {
    id: "turizm",
    name: "Turizm & Seyahat",
    altKategoriler: ["Tur Şirketi", "Seyahat Acentesi", "Müze", "Tarihi Mekan", "Doğal Güzellik"],
  },
  {
    id: "diger",
    name: "Diğer",
    altKategoriler: ["Dernek", "Vakıf", "Kamu Kurumu", "Dini Tesis", "Diğer"],
  },
]

// Fiyat aralığı seçenekleri
const FIYAT_ARALIKLARI = [
  { id: "₺", name: "Ekonomik (₺)" },
  { id: "₺₺", name: "Orta (₺₺)" },
  { id: "₺₺₺", name: "Lüks (₺₺₺)" },
  { id: "₺₺₺₺", name: "Ultra Lüks (₺₺₺₺)" },
]

interface IsletmeBilgileriFormProps {
  formData: any
  onChange: (field: string, value: any) => void
  errors: Record<string, string>
}

export function IsletmeBilgileriForm({ formData, onChange, errors }: IsletmeBilgileriFormProps) {
  const [altKategoriler, setAltKategoriler] = useState<string[]>([])

  // Kategori değiştiğinde alt kategorileri güncelle
  useEffect(() => {
    if (formData.kategori) {
      const kategori = KATEGORILER.find((k) => k.name === formData.kategori)
      if (kategori) {
        setAltKategoriler(kategori.altKategoriler)

        // Eğer seçili alt kategori, yeni kategorinin alt kategorilerinde yoksa sıfırla
        if (formData.alt_kategori && !kategori.altKategoriler.includes(formData.alt_kategori)) {
          onChange("alt_kategori", "")
        }
      } else {
        setAltKategoriler([])
      }
    } else {
      setAltKategoriler([])
    }
  }, [formData.kategori, onChange])

  // Telefon numarası formatla
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatPhoneNumber(e.target.value)
    onChange("telefon", formattedPhone)
  }

  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-0 space-y-6">
        <div className="flex items-center gap-2 text-lg font-medium text-primary">
          <Building className="h-5 w-5" />
          <h3>İşletme Bilgileri</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="isletme_adi" className={errors.isletme_adi ? "text-destructive" : ""}>
              İşletme Adı *
            </Label>
            <Input
              id="isletme_adi"
              value={formData.isletme_adi || ""}
              onChange={(e) => onChange("isletme_adi", e.target.value)}
              placeholder="İşletme adını girin"
              className={errors.isletme_adi ? "border-destructive" : ""}
            />
            {errors.isletme_adi && <p className="text-xs text-destructive mt-1">{errors.isletme_adi}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kategori" className={errors.kategori ? "text-destructive" : ""}>
                Kategori *
              </Label>
              <Select value={formData.kategori || ""} onValueChange={(value) => onChange("kategori", value)}>
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
              {errors.kategori && <p className="text-xs text-destructive mt-1">{errors.kategori}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="alt_kategori">
                Alt Kategori <span className="text-muted-foreground text-xs">(opsiyonel)</span>
              </Label>
              <Select
                value={formData.alt_kategori || ""}
                onValueChange={(value) => onChange("alt_kategori", value)}
                disabled={!formData.kategori || altKategoriler.length === 0}
              >
                <SelectTrigger id="alt_kategori">
                  <SelectValue placeholder="Alt kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {altKategoriler.map((altKategori) => (
                    <SelectItem key={altKategori} value={altKategori}>
                      {altKategori}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefon" className={errors.telefon ? "text-destructive" : ""}>
              Telefon Numarası *
            </Label>
            <Input
              id="telefon"
              value={formData.telefon || ""}
              onChange={handlePhoneChange}
              placeholder="(___) ___ __ __"
              className={errors.telefon ? "border-destructive" : ""}
            />
            {errors.telefon && <p className="text-xs text-destructive mt-1">{errors.telefon}</p>}
            <p className="text-xs text-muted-foreground">Örnek: (555) 123 45 67</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fiyat_araligi">
              Fiyat Aralığı <span className="text-muted-foreground text-xs">(opsiyonel)</span>
            </Label>
            <Select value={formData.fiyat_araligi || ""} onValueChange={(value) => onChange("fiyat_araligi", value)}>
              <SelectTrigger id="fiyat_araligi">
                <SelectValue placeholder="Fiyat aralığı seçin" />
              </SelectTrigger>
              <SelectContent>
                {FIYAT_ARALIKLARI.map((fiyat) => (
                  <SelectItem key={fiyat.id} value={fiyat.id}>
                    {fiyat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sunulan_hizmetler">
              Sunulan Hizmetler <span className="text-muted-foreground text-xs">(opsiyonel)</span>
            </Label>
            <Textarea
              id="sunulan_hizmetler"
              value={formData.sunulan_hizmetler || ""}
              onChange={(e) => onChange("sunulan_hizmetler", e.target.value)}
              placeholder="Sunulan hizmetleri virgülle ayırarak yazın"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">Örnek: Kahvaltı, Öğle Yemeği, Akşam Yemeği, Paket Servis</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="aciklama" className={errors.aciklama ? "text-destructive" : ""}>
              İşletme Açıklaması *
            </Label>
            <Textarea
              id="aciklama"
              value={formData.aciklama || ""}
              onChange={(e) => onChange("aciklama", e.target.value)}
              placeholder="İşletmenizi detaylı bir şekilde tanıtın"
              rows={5}
              className={errors.aciklama ? "border-destructive" : ""}
            />
            {errors.aciklama && <p className="text-xs text-destructive mt-1">{errors.aciklama}</p>}
            <div className="flex items-start gap-2 mt-2 text-amber-600 bg-amber-50 p-2 rounded-md">
              <Info className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <p className="text-xs">
                İşletme açıklaması en az 20 karakter olmalıdır. Detaylı ve açıklayıcı bir tanıtım yazısı, işletmenizin
                daha fazla kişiye ulaşmasını sağlar.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
