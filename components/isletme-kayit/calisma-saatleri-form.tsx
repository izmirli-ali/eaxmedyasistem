"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Copy } from "lucide-react"
import { Switch } from "@/components/ui/switch"

interface CalismaSaatleriFormProps {
  formData: any
  onChange: (field: string, value: any) => void
  errors: Record<string, string>
}

const GUNLER = [
  { id: "pazartesi", label: "Pazartesi" },
  { id: "sali", label: "Salı" },
  { id: "carsamba", label: "Çarşamba" },
  { id: "persembe", label: "Perşembe" },
  { id: "cuma", label: "Cuma" },
  { id: "cumartesi", label: "Cumartesi" },
  { id: "pazar", label: "Pazar" },
]

export function CalismaSaatleriForm({ formData, onChange, errors }: CalismaSaatleriFormProps) {
  const [calismaGunleri, setCalismaGunleri] = useState<Record<string, any>>(
    formData.calisma_gunleri ||
      GUNLER.reduce((acc, gun) => {
        acc[gun.id] = {
          acik: true,
          acilis: "09:00",
          kapanis: "18:00",
          mola_var: false,
          mola_baslangic: "13:00",
          mola_bitis: "14:00",
        }
        return acc
      }, {}),
  )

  // Çalışma saatlerini güncelle
  const handleCalismaGunuChange = (gun: string, field: string, value: any) => {
    const yeniCalismaGunleri = {
      ...calismaGunleri,
      [gun]: {
        ...calismaGunleri[gun],
        [field]: value,
      },
    }

    setCalismaGunleri(yeniCalismaGunleri)
    onChange("calisma_gunleri", yeniCalismaGunleri)

    // Ayrıca calisma_saatleri alanını da güncelle (geriye dönük uyumluluk için)
    const formatliCalismaGunleri = Object.entries(yeniCalismaGunleri)
      .map(([gun, deger]: [string, any]) => {
        const gunAdi = GUNLER.find((g) => g.id === gun)?.label || gun
        if (!deger.acik) return `${gunAdi}: Kapalı`

        let saatMetni = `${gunAdi}: ${deger.acilis} - ${deger.kapanis}`
        if (deger.mola_var) {
          saatMetni += ` (Mola: ${deger.mola_baslangic} - ${deger.mola_bitis})`
        }
        return saatMetni
      })
      .join("\n")

    onChange("calisma_saatleri", formatliCalismaGunleri)
  }

  // Bir günün ayarlarını diğer günlere kopyala
  const kopyalaDigerGunlere = (kaynakGun: string) => {
    const kaynakVeri = calismaGunleri[kaynakGun]

    const yeniCalismaGunleri = { ...calismaGunleri }
    GUNLER.forEach((gun) => {
      if (gun.id !== kaynakGun) {
        yeniCalismaGunleri[gun.id] = { ...kaynakVeri }
      }
    })

    setCalismaGunleri(yeniCalismaGunleri)
    onChange("calisma_gunleri", yeniCalismaGunleri)

    // Ayrıca calisma_saatleri alanını da güncelle
    const formatliCalismaGunleri = Object.entries(yeniCalismaGunleri)
      .map(([gun, deger]: [string, any]) => {
        const gunAdi = GUNLER.find((g) => g.id === gun)?.label || gun
        if (!deger.acik) return `${gunAdi}: Kapalı`

        let saatMetni = `${gunAdi}: ${deger.acilis} - ${deger.kapanis}`
        if (deger.mola_var) {
          saatMetni += ` (Mola: ${deger.mola_baslangic} - ${deger.mola_bitis})`
        }
        return saatMetni
      })
      .join("\n")

    onChange("calisma_saatleri", formatliCalismaGunleri)
  }

  // Hafta içi / Hafta sonu ayarla
  const haftaIciHaftaSonuAyarla = (tip: "hafta_ici" | "hafta_sonu", deger: any) => {
    const haftaIciGunler = ["pazartesi", "sali", "carsamba", "persembe", "cuma"]
    const haftaSonuGunler = ["cumartesi", "pazar"]

    const hedefGunler = tip === "hafta_ici" ? haftaIciGunler : haftaSonuGunler

    const yeniCalismaGunleri = { ...calismaGunleri }
    hedefGunler.forEach((gun) => {
      yeniCalismaGunleri[gun] = { ...deger }
    })

    setCalismaGunleri(yeniCalismaGunleri)
    onChange("calisma_gunleri", yeniCalismaGunleri)

    // Ayrıca calisma_saatleri alanını da güncelle
    const formatliCalismaGunleri = Object.entries(yeniCalismaGunleri)
      .map(([gun, deger]: [string, any]) => {
        const gunAdi = GUNLER.find((g) => g.id === gun)?.label || gun
        if (!deger.acik) return `${gunAdi}: Kapalı`

        let saatMetni = `${gunAdi}: ${deger.acilis} - ${deger.kapanis}`
        if (deger.mola_var) {
          saatMetni += ` (Mola: ${deger.mola_baslangic} - ${deger.mola_bitis})`
        }
        return saatMetni
      })
      .join("\n")

    onChange("calisma_saatleri", formatliCalismaGunleri)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-lg font-medium text-primary">
        <Clock className="h-5 w-5" />
        <h3>Çalışma Saatleri</h3>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            haftaIciHaftaSonuAyarla("hafta_ici", {
              acik: true,
              acilis: "09:00",
              kapanis: "18:00",
              mola_var: true,
              mola_baslangic: "13:00",
              mola_bitis: "14:00",
            })
          }
        >
          Hafta İçi Ayarla (09:00-18:00)
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            haftaIciHaftaSonuAyarla("hafta_sonu", {
              acik: true,
              acilis: "10:00",
              kapanis: "16:00",
              mola_var: false,
              mola_baslangic: "13:00",
              mola_bitis: "14:00",
            })
          }
        >
          Hafta Sonu Ayarla (10:00-16:00)
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            haftaIciHaftaSonuAyarla("hafta_sonu", {
              acik: false,
              acilis: "10:00",
              kapanis: "16:00",
              mola_var: false,
              mola_baslangic: "13:00",
              mola_bitis: "14:00",
            })
          }
        >
          Hafta Sonu Kapalı
        </Button>
      </div>

      <div className="grid gap-6">
        {GUNLER.map((gun) => (
          <Card key={gun.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={`${gun.id}-acik`} className="font-medium text-base">
                      {gun.label}
                    </Label>
                    <Switch
                      id={`${gun.id}-acik`}
                      checked={calismaGunleri[gun.id]?.acik}
                      onCheckedChange={(checked) => handleCalismaGunuChange(gun.id, "acik", checked)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {calismaGunleri[gun.id]?.acik ? "Açık" : "Kapalı"}
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => kopyalaDigerGunlere(gun.id)}
                    title="Bu günün ayarlarını diğer günlere kopyala"
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Diğer Günlere Kopyala</span>
                  </Button>
                </div>

                {calismaGunleri[gun.id]?.acik && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor={`${gun.id}-acilis`} className="text-sm">
                          Açılış Saati
                        </Label>
                        <Input
                          id={`${gun.id}-acilis`}
                          type="time"
                          value={calismaGunleri[gun.id]?.acilis || ""}
                          onChange={(e) => handleCalismaGunuChange(gun.id, "acilis", e.target.value)}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`${gun.id}-kapanis`} className="text-sm">
                          Kapanış Saati
                        </Label>
                        <Input
                          id={`${gun.id}-kapanis`}
                          type="time"
                          value={calismaGunleri[gun.id]?.kapanis || ""}
                          onChange={(e) => handleCalismaGunuChange(gun.id, "kapanis", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${gun.id}-mola`}
                          checked={calismaGunleri[gun.id]?.mola_var}
                          onCheckedChange={(checked) => handleCalismaGunuChange(gun.id, "mola_var", !!checked)}
                        />
                        <Label htmlFor={`${gun.id}-mola`} className="text-sm">
                          Mola Saati Var
                        </Label>
                      </div>

                      {calismaGunleri[gun.id]?.mola_var && (
                        <div className="grid grid-cols-2 gap-2 pl-6">
                          <div className="space-y-1">
                            <Label htmlFor={`${gun.id}-mola-baslangic`} className="text-sm">
                              Mola Başlangıç
                            </Label>
                            <Input
                              id={`${gun.id}-mola-baslangic`}
                              type="time"
                              value={calismaGunleri[gun.id]?.mola_baslangic || ""}
                              onChange={(e) => handleCalismaGunuChange(gun.id, "mola_baslangic", e.target.value)}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`${gun.id}-mola-bitis`} className="text-sm">
                              Mola Bitiş
                            </Label>
                            <Input
                              id={`${gun.id}-mola-bitis`}
                              type="time"
                              value={calismaGunleri[gun.id]?.mola_bitis || ""}
                              onChange={(e) => handleCalismaGunuChange(gun.id, "mola_bitis", e.target.value)}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
