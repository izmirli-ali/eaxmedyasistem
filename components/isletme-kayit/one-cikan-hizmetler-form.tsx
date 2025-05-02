"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Briefcase, Plus, Trash2, Edit, Save, X, MoveUp, MoveDown, ImageIcon, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { v4 as uuidv4 } from "uuid"

interface OneCikanHizmetlerFormProps {
  formData: any
  onChange: (field: string, value: any) => void
  errors: Record<string, string>
}

interface HizmetType {
  id: string
  baslik: string
  aciklama: string
  fiyat: string
  gorsel_url: string
  sure?: string
  link?: string
}

export function OneCikanHizmetlerForm({ formData, onChange, errors }: OneCikanHizmetlerFormProps) {
  const [hizmetler, setHizmetler] = useState<HizmetType[]>(() => {
    try {
      if (formData.one_cikan_hizmetler) {
        if (typeof formData.one_cikan_hizmetler === "string") {
          return JSON.parse(formData.one_cikan_hizmetler)
        }
        if (Array.isArray(formData.one_cikan_hizmetler)) {
          return formData.one_cikan_hizmetler
        }
      }
      return []
    } catch (error) {
      console.error("Hizmetler yüklenemedi:", error)
      return []
    }
  })

  const [editingHizmet, setEditingHizmet] = useState<HizmetType | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Boş hizmet şablonu
  const emptyHizmet: HizmetType = {
    id: "",
    baslik: "",
    aciklama: "",
    fiyat: "",
    gorsel_url: "",
    sure: "",
    link: "",
  }

  // Yeni hizmet ekle
  const handleAddHizmet = () => {
    setEditingHizmet({ ...emptyHizmet, id: uuidv4() })
    setIsEditing(true)
  }

  // Hizmet düzenle
  const handleEditHizmet = (hizmet: HizmetType) => {
    setEditingHizmet({ ...hizmet })
    setIsEditing(true)
  }

  // Hizmet sil
  const handleDeleteHizmet = (id: string) => {
    const newHizmetler = hizmetler.filter((hizmet) => hizmet.id !== id)
    setHizmetler(newHizmetler)
    updateFormData(newHizmetler)
  }

  // Hizmet kaydet
  const handleSaveHizmet = () => {
    if (!editingHizmet) return

    // Validasyon
    if (!editingHizmet.baslik.trim()) {
      alert("Hizmet başlığı zorunludur.")
      return
    }

    if (!editingHizmet.fiyat.trim()) {
      alert("Hizmet fiyatı zorunludur.")
      return
    }

    const existingIndex = hizmetler.findIndex((hizmet) => hizmet.id === editingHizmet.id)
    let newHizmetler: HizmetType[]

    if (existingIndex >= 0) {
      // Mevcut hizmeti güncelle
      newHizmetler = [...hizmetler]
      newHizmetler[existingIndex] = editingHizmet
    } else {
      // Yeni hizmet ekle
      newHizmetler = [...hizmetler, editingHizmet]
    }

    setHizmetler(newHizmetler)
    updateFormData(newHizmetler)
    setEditingHizmet(null)
    setIsEditing(false)
  }

  // İptal et
  const handleCancel = () => {
    setEditingHizmet(null)
    setIsEditing(false)
  }

  // Hizmeti yukarı taşı
  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const newHizmetler = [...hizmetler]
    const temp = newHizmetler[index]
    newHizmetler[index] = newHizmetler[index - 1]
    newHizmetler[index - 1] = temp
    setHizmetler(newHizmetler)
    updateFormData(newHizmetler)
  }

  // Hizmeti aşağı taşı
  const handleMoveDown = (index: number) => {
    if (index === hizmetler.length - 1) return
    const newHizmetler = [...hizmetler]
    const temp = newHizmetler[index]
    newHizmetler[index] = newHizmetler[index + 1]
    newHizmetler[index + 1] = temp
    setHizmetler(newHizmetler)
    updateFormData(newHizmetler)
  }

  // Form verisini güncelle
  const updateFormData = (newHizmetler: HizmetType[]) => {
    onChange("one_cikan_hizmetler", newHizmetler)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-lg font-medium text-primary">
        <Briefcase className="h-5 w-5" />
        <h3>Öne Çıkan Hizmetler</h3>
      </div>

      <div className="space-y-4">
        {/* Hizmet Listesi */}
        {hizmetler.length > 0 ? (
          <div className="space-y-3">
            {hizmetler.map((hizmet, index) => (
              <Card key={hizmet.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    {hizmet.gorsel_url && (
                      <div className="w-full md:w-24 h-24 bg-gray-100 rounded-md overflow-hidden relative flex-shrink-0">
                        <div
                          className="w-full h-full bg-center bg-cover"
                          style={{ backgroundImage: `url(${hizmet.gorsel_url})` }}
                        ></div>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold">{hizmet.baslik}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">{hizmet.aciklama}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant="outline" className="ml-2">
                            {hizmet.fiyat} ₺
                          </Badge>
                          {hizmet.sure && (
                            <Badge variant="secondary" className="flex items-center text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {hizmet.sure}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {hizmet.link && (
                        <div className="mt-2 text-sm text-blue-600 truncate">
                          <a href={hizmet.link} target="_blank" rel="noopener noreferrer">
                            {hizmet.link}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-2 bg-gray-50 flex justify-between">
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                    >
                      <MoveUp className="h-4 w-4" />
                      <span className="sr-only">Yukarı Taşı</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === hizmetler.length - 1}
                    >
                      <MoveDown className="h-4 w-4" />
                      <span className="sr-only">Aşağı Taşı</span>
                    </Button>
                  </div>
                  <div className="flex gap-1">
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleEditHizmet(hizmet)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Düzenle</span>
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleDeleteHizmet(hizmet.id)}>
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Sil</span>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <Briefcase className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500">Henüz öne çıkan hizmet eklenmemiş.</p>
            <p className="text-gray-500 text-sm mt-1">
              İşletmenizin öne çıkan hizmetlerini ekleyerek müşterilerinize daha fazla bilgi verebilirsiniz.
            </p>
          </div>
        )}

        {/* Hizmet Ekleme/Düzenleme Formu */}
        {isEditing && editingHizmet && (
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <h4 className="font-bold mb-4">{editingHizmet.id ? "Hizmet Düzenle" : "Yeni Hizmet Ekle"}</h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="hizmet_baslik">Hizmet Başlığı *</Label>
                  <Input
                    id="hizmet_baslik"
                    value={editingHizmet.baslik}
                    onChange={(e) => setEditingHizmet({ ...editingHizmet, baslik: e.target.value })}
                    placeholder="Hizmet adı"
                  />
                </div>
                <div>
                  <Label htmlFor="hizmet_aciklama">Hizmet Açıklaması</Label>
                  <Textarea
                    id="hizmet_aciklama"
                    value={editingHizmet.aciklama}
                    onChange={(e) => setEditingHizmet({ ...editingHizmet, aciklama: e.target.value })}
                    placeholder="Hizmet hakkında kısa açıklama"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="hizmet_fiyat">Fiyat *</Label>
                    <Input
                      id="hizmet_fiyat"
                      value={editingHizmet.fiyat}
                      onChange={(e) => setEditingHizmet({ ...editingHizmet, fiyat: e.target.value })}
                      placeholder="199.90"
                    />
                  </div>
                  <div>
                    <Label htmlFor="hizmet_sure">Süre</Label>
                    <Input
                      id="hizmet_sure"
                      value={editingHizmet.sure || ""}
                      onChange={(e) => setEditingHizmet({ ...editingHizmet, sure: e.target.value })}
                      placeholder="60 dakika"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="hizmet_gorsel">Görsel URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="hizmet_gorsel"
                      value={editingHizmet.gorsel_url}
                      onChange={(e) => setEditingHizmet({ ...editingHizmet, gorsel_url: e.target.value })}
                      placeholder="https://example.com/hizmet.jpg"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="flex-shrink-0"
                      onClick={() => {
                        // Görsel seçme işlevi burada olacak
                        alert("Görsel yükleme özelliği yakında eklenecek.")
                      }}
                    >
                      <ImageIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="hizmet_link">Hizmet Bağlantısı (İsteğe Bağlı)</Label>
                  <Input
                    id="hizmet_link"
                    value={editingHizmet.link || ""}
                    onChange={(e) => setEditingHizmet({ ...editingHizmet, link: e.target.value })}
                    placeholder="https://example.com/hizmet-detay"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between p-4 pt-0">
              <Button type="button" variant="ghost" onClick={handleCancel}>
                <X className="h-4 w-4 mr-1" />
                İptal
              </Button>
              <Button type="button" onClick={handleSaveHizmet}>
                <Save className="h-4 w-4 mr-1" />
                Kaydet
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Hizmet Ekleme Butonu */}
        {!isEditing && (
          <Button type="button" onClick={handleAddHizmet} className="w-full">
            <Plus className="h-4 w-4 mr-1" />
            Yeni Hizmet Ekle
          </Button>
        )}

        {errors.one_cikan_hizmetler && <p className="text-sm text-red-500">{errors.one_cikan_hizmetler}</p>}
        <p className="text-xs text-muted-foreground">
          En fazla 10 adet öne çıkan hizmet ekleyebilirsiniz. Hizmetlerinizi sürükleyerek sıralayabilirsiniz.
        </p>
      </div>
    </div>
  )
}
