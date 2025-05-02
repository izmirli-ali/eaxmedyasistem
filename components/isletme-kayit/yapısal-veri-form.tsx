"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Award, Languages, CreditCard, CheckCircle, Plus, X } from "lucide-react"
import { useState } from "react"

interface YapisalVeriFormProps {
  formData: any
  onChange: (field: string, value: any) => void
  errors: Record<string, string>
}

export function YapisalVeriForm({ formData, onChange, errors }: YapisalVeriFormProps) {
  const [newOdeme, setNewOdeme] = useState("")
  const [newDil, setNewDil] = useState("")
  const [newSertifika, setNewSertifika] = useState("")
  const [newOdul, setNewOdul] = useState("")

  // Ödeme yöntemleri
  const handleAddOdeme = () => {
    if (!newOdeme.trim()) return

    const currentOdemeler = Array.isArray(formData.kabul_edilen_odeme_yontemleri)
      ? [...formData.kabul_edilen_odeme_yontemleri]
      : []

    if (!currentOdemeler.includes(newOdeme)) {
      const updatedOdemeler = [...currentOdemeler, newOdeme]
      onChange("kabul_edilen_odeme_yontemleri", updatedOdemeler)
      setNewOdeme("")
    }
  }

  const handleRemoveOdeme = (odeme: string) => {
    const currentOdemeler = Array.isArray(formData.kabul_edilen_odeme_yontemleri)
      ? [...formData.kabul_edilen_odeme_yontemleri]
      : []

    const updatedOdemeler = currentOdemeler.filter((item) => item !== odeme)
    onChange("kabul_edilen_odeme_yontemleri", updatedOdemeler)
  }

  // Diller
  const handleAddDil = () => {
    if (!newDil.trim()) return

    const currentDiller = Array.isArray(formData.diller) ? [...formData.diller] : []

    if (!currentDiller.includes(newDil)) {
      const updatedDiller = [...currentDiller, newDil]
      onChange("diller", updatedDiller)
      setNewDil("")
    }
  }

  const handleRemoveDil = (dil: string) => {
    const currentDiller = Array.isArray(formData.diller) ? [...formData.diller] : []

    const updatedDiller = currentDiller.filter((item) => item !== dil)
    onChange("diller", updatedDiller)
  }

  // Sertifikalar
  const handleAddSertifika = () => {
    if (!newSertifika.trim()) return

    const currentSertifikalar = Array.isArray(formData.sertifikalar) ? [...formData.sertifikalar] : []

    if (!currentSertifikalar.includes(newSertifika)) {
      const updatedSertifikalar = [...currentSertifikalar, newSertifika]
      onChange("sertifikalar", updatedSertifikalar)
      setNewSertifika("")
    }
  }

  const handleRemoveSertifika = (sertifika: string) => {
    const currentSertifikalar = Array.isArray(formData.sertifikalar) ? [...formData.sertifikalar] : []

    const updatedSertifikalar = currentSertifikalar.filter((item) => item !== sertifika)
    onChange("sertifikalar", updatedSertifikalar)
  }

  // Ödüller
  const handleAddOdul = () => {
    if (!newOdul.trim()) return

    const currentOduller = Array.isArray(formData.odullar) ? [...formData.odullar] : []

    if (!currentOduller.includes(newOdul)) {
      const updatedOduller = [...currentOduller, newOdul]
      onChange("odullar", updatedOduller)
      setNewOdul("")
    }
  }

  const handleRemoveOdul = (odul: string) => {
    const currentOduller = Array.isArray(formData.odullar) ? [...formData.odullar] : []

    const updatedOduller = currentOduller.filter((item) => item !== odul)
    onChange("odullar", updatedOduller)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-lg font-medium text-primary">
        <CheckCircle className="h-5 w-5" />
        <h3>Yapısal Veri Bilgileri</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="kurulus_yili">Kuruluş Yılı</Label>
          <Input
            id="kurulus_yili"
            type="number"
            value={formData.kurulus_yili || ""}
            onChange={(e) => onChange("kurulus_yili", e.target.value ? Number.parseInt(e.target.value) : "")}
            placeholder="2010"
            min="1900"
            max={new Date().getFullYear()}
          />
          {errors.kurulus_yili && <p className="text-sm text-red-500">{errors.kurulus_yili}</p>}
          <p className="text-xs text-muted-foreground">İşletmenizin kuruluş yılını girin.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="kabul_edilen_odeme_yontemleri">Kabul Edilen Ödeme Yöntemleri</Label>
          <div className="flex gap-2">
            <Input
              id="kabul_edilen_odeme_yontemleri"
              value={newOdeme}
              onChange={(e) => setNewOdeme(e.target.value)}
              placeholder="Nakit, Kredi Kartı, vb."
              className="flex-1"
            />
            <Button type="button" onClick={handleAddOdeme} disabled={!newOdeme.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {errors.kabul_edilen_odeme_yontemleri && (
            <p className="text-sm text-red-500">{errors.kabul_edilen_odeme_yontemleri}</p>
          )}

          {Array.isArray(formData.kabul_edilen_odeme_yontemleri) &&
            formData.kabul_edilen_odeme_yontemleri.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.kabul_edilen_odeme_yontemleri.map((odeme: string, index: number) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    <CreditCard className="h-3 w-3" />
                    {odeme}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => handleRemoveOdeme(odeme)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="diller">Konuşulan Diller</Label>
          <div className="flex gap-2">
            <Input
              id="diller"
              value={newDil}
              onChange={(e) => setNewDil(e.target.value)}
              placeholder="Türkçe, İngilizce, vb."
              className="flex-1"
            />
            <Button type="button" onClick={handleAddDil} disabled={!newDil.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {errors.diller && <p className="text-sm text-red-500">{errors.diller}</p>}

          {Array.isArray(formData.diller) && formData.diller.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.diller.map((dil: string, index: number) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  <Languages className="h-3 w-3" />
                  {dil}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => handleRemoveDil(dil)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="sertifikalar">Sertifikalar</Label>
          <div className="flex gap-2">
            <Input
              id="sertifikalar"
              value={newSertifika}
              onChange={(e) => setNewSertifika(e.target.value)}
              placeholder="ISO 9001, TSE, vb."
              className="flex-1"
            />
            <Button type="button" onClick={handleAddSertifika} disabled={!newSertifika.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {errors.sertifikalar && <p className="text-sm text-red-500">{errors.sertifikalar}</p>}

          {Array.isArray(formData.sertifikalar) && formData.sertifikalar.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.sertifikalar.map((sertifika: string, index: number) => (
                <Badge key={index} variant="outline" className="bg-green-50 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  {sertifika}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => handleRemoveSertifika(sertifika)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="odullar">Ödüller</Label>
          <div className="flex gap-2">
            <Input
              id="odullar"
              value={newOdul}
              onChange={(e) => setNewOdul(e.target.value)}
              placeholder="En İyi Hizmet Ödülü 2023, vb."
              className="flex-1"
            />
            <Button type="button" onClick={handleAddOdul} disabled={!newOdul.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {errors.odullar && <p className="text-sm text-red-500">{errors.odullar}</p>}

          {Array.isArray(formData.odullar) && formData.odullar.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.odullar.map((odul: string, index: number) => (
                <Badge key={index} variant="outline" className="bg-amber-50 flex items-center gap-1">
                  <Award className="h-3 w-3 text-amber-600" />
                  {odul}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-1"
                    onClick={() => handleRemoveOdul(odul)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
