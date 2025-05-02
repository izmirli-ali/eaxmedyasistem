"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ShoppingCart, Plus, Trash2, Edit, Save, X, MoveUp, MoveDown, ImageIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { v4 as uuidv4 } from "uuid"

interface OneCikanUrunlerFormProps {
  formData: any
  onChange: (field: string, value: any) => void
  errors: Record<string, string>
}

interface UrunType {
  id: string
  baslik: string
  aciklama: string
  fiyat: string
  gorsel_url: string
  link?: string
}

export function OneCikanUrunlerForm({ formData, onChange, errors }: OneCikanUrunlerFormProps) {
  const [urunler, setUrunler] = useState<UrunType[]>(() => {
    try {
      if (formData.one_cikan_urunler) {
        if (typeof formData.one_cikan_urunler === "string") {
          return JSON.parse(formData.one_cikan_urunler)
        }
        if (Array.isArray(formData.one_cikan_urunler)) {
          return formData.one_cikan_urunler
        }
      }
      return []
    } catch (error) {
      console.error("Ürünler yüklenemedi:", error)
      return []
    }
  })

  const [editingUrun, setEditingUrun] = useState<UrunType | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Boş ürün şablonu
  const emptyUrun: UrunType = {
    id: "",
    baslik: "",
    aciklama: "",
    fiyat: "",
    gorsel_url: "",
    link: "",
  }

  // Yeni ürün ekle
  const handleAddUrun = () => {
    setEditingUrun({ ...emptyUrun, id: uuidv4() })
    setIsEditing(true)
  }

  // Ürün düzenle
  const handleEditUrun = (urun: UrunType) => {
    setEditingUrun({ ...urun })
    setIsEditing(true)
  }

  // Ürün sil
  const handleDeleteUrun = (id: string) => {
    const newUrunler = urunler.filter((urun) => urun.id !== id)
    setUrunler(newUrunler)
    updateFormData(newUrunler)
  }

  // Ürün kaydet
  const handleSaveUrun = () => {
    if (!editingUrun) return

    // Validasyon
    if (!editingUrun.baslik.trim()) {
      alert("Ürün başlığı zorunludur.")
      return
    }

    if (!editingUrun.fiyat.trim()) {
      alert("Ürün fiyatı zorunludur.")
      return
    }

    const existingIndex = urunler.findIndex((urun) => urun.id === editingUrun.id)
    let newUrunler: UrunType[]

    if (existingIndex >= 0) {
      // Mevcut ürünü güncelle
      newUrunler = [...urunler]
      newUrunler[existingIndex] = editingUrun
    } else {
      // Yeni ürün ekle
      newUrunler = [...urunler, editingUrun]
    }

    setUrunler(newUrunler)
    updateFormData(newUrunler)
    setEditingUrun(null)
    setIsEditing(false)
  }

  // İptal et
  const handleCancel = () => {
    setEditingUrun(null)
    setIsEditing(false)
  }

  // Ürünü yukarı taşı
  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const newUrunler = [...urunler]
    const temp = newUrunler[index]
    newUrunler[index] = newUrunler[index - 1]
    newUrunler[index - 1] = temp
    setUrunler(newUrunler)
    updateFormData(newUrunler)
  }

  // Ürünü aşağı taşı
  const handleMoveDown = (index: number) => {
    if (index === urunler.length - 1) return
    const newUrunler = [...urunler]
    const temp = newUrunler[index]
    newUrunler[index] = newUrunler[index + 1]
    newUrunler[index + 1] = temp
    setUrunler(newUrunler)
    updateFormData(newUrunler)
  }

  // Form verisini güncelle
  const updateFormData = (newUrunler: UrunType[]) => {
    onChange("one_cikan_urunler", newUrunler)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-lg font-medium text-primary">
        <ShoppingCart className="h-5 w-5" />
        <h3>Öne Çıkan Ürünler</h3>
      </div>

      <div className="space-y-4">
        {/* Ürün Listesi */}
        {urunler.length > 0 ? (
          <div className="space-y-3">
            {urunler.map((urun, index) => (
              <Card key={urun.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    {urun.gorsel_url && (
                      <div className="w-full md:w-24 h-24 bg-gray-100 rounded-md overflow-hidden relative flex-shrink-0">
                        <div
                          className="w-full h-full bg-center bg-cover"
                          style={{ backgroundImage: `url(${urun.gorsel_url})` }}
                        ></div>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold">{urun.baslik}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">{urun.aciklama}</p>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {urun.fiyat} ₺
                        </Badge>
                      </div>
                      {urun.link && (
                        <div className="mt-2 text-sm text-blue-600 truncate">
                          <a href={urun.link} target="_blank" rel="noopener noreferrer">
                            {urun.link}
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
                      disabled={index === urunler.length - 1}
                    >
                      <MoveDown className="h-4 w-4" />
                      <span className="sr-only">Aşağı Taşı</span>
                    </Button>
                  </div>
                  <div className="flex gap-1">
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleEditUrun(urun)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Düzenle</span>
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleDeleteUrun(urun.id)}>
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
            <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500">Henüz öne çıkan ürün eklenmemiş.</p>
            <p className="text-gray-500 text-sm mt-1">
              İşletmenizin öne çıkan ürünlerini ekleyerek müşterilerinize daha fazla bilgi verebilirsiniz.
            </p>
          </div>
        )}

        {/* Ürün Ekleme/Düzenleme Formu */}
        {isEditing && editingUrun && (
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <h4 className="font-bold mb-4">{editingUrun.id ? "Ürün Düzenle" : "Yeni Ürün Ekle"}</h4>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="urun_baslik">Ürün Başlığı *</Label>
                  <Input
                    id="urun_baslik"
                    value={editingUrun.baslik}
                    onChange={(e) => setEditingUrun({ ...editingUrun, baslik: e.target.value })}
                    placeholder="Ürün adı"
                  />
                </div>
                <div>
                  <Label htmlFor="urun_aciklama">Ürün Açıklaması</Label>
                  <Textarea
                    id="urun_aciklama"
                    value={editingUrun.aciklama}
                    onChange={(e) => setEditingUrun({ ...editingUrun, aciklama: e.target.value })}
                    placeholder="Ürün hakkında kısa açıklama"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="urun_fiyat">Fiyat *</Label>
                  <Input
                    id="urun_fiyat"
                    value={editingUrun.fiyat}
                    onChange={(e) => setEditingUrun({ ...editingUrun, fiyat: e.target.value })}
                    placeholder="99.90"
                  />
                </div>
                <div>
                  <Label htmlFor="urun_gorsel">Görsel URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="urun_gorsel"
                      value={editingUrun.gorsel_url}
                      onChange={(e) => setEditingUrun({ ...editingUrun, gorsel_url: e.target.value })}
                      placeholder="https://example.com/urun.jpg"
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
                  <Label htmlFor="urun_link">Ürün Bağlantısı (İsteğe Bağlı)</Label>
                  <Input
                    id="urun_link"
                    value={editingUrun.link || ""}
                    onChange={(e) => setEditingUrun({ ...editingUrun, link: e.target.value })}
                    placeholder="https://example.com/urun-detay"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between p-4 pt-0">
              <Button type="button" variant="ghost" onClick={handleCancel}>
                <X className="h-4 w-4 mr-1" />
                İptal
              </Button>
              <Button type="button" onClick={handleSaveUrun}>
                <Save className="h-4 w-4 mr-1" />
                Kaydet
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Ürün Ekleme Butonu */}
        {!isEditing && (
          <Button type="button" onClick={handleAddUrun} className="w-full">
            <Plus className="h-4 w-4 mr-1" />
            Yeni Ürün Ekle
          </Button>
        )}

        {errors.one_cikan_urunler && <p className="text-sm text-red-500">{errors.one_cikan_urunler}</p>}
        <p className="text-xs text-muted-foreground">
          En fazla 10 adet öne çıkan ürün ekleyebilirsiniz. Ürünlerinizi sürükleyerek sıralayabilirsiniz.
        </p>
      </div>
    </div>
  )
}
