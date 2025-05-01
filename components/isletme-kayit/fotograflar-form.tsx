"use client"

import type React from "react"

import { useState, useCallback, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Trash2, Upload, ImageIcon, ImagePlus, Move, Edit2, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface FotograflarFormProps {
  formData: any
  onChange: (field: string, value: any) => void
  errors: Record<string, string>
  selectedFiles: File[]
  setSelectedFiles: React.Dispatch<React.SetStateAction<File[]>>
  uploadingPhotos: boolean
  uploadProgress: Record<string, number>
  maxFiles: number
}

export function FotograflarForm({
  formData,
  onChange,
  errors,
  selectedFiles,
  setSelectedFiles,
  uploadingPhotos,
  uploadProgress,
  maxFiles,
}: FotograflarFormProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null)
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null)
  const [anaGorselIndex, setAnaGorselIndex] = useState<number>(0)
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null)
  const [editingImageSettings, setEditingImageSettings] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    rotation: 0,
  })

  // useRef kullanarak onChange fonksiyonunu saklayalım
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  // Dosya yükleme işleyicisi
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    handleFiles(files)
  }

  // Dosyaları işle
  const handleFiles = (files: FileList) => {
    if (selectedFiles.length + files.length > maxFiles) {
      alert(`En fazla ${maxFiles} dosya yükleyebilirsiniz.`)
      return
    }

    const newFiles: File[] = []
    const newPreviewUrls: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Dosya türü kontrolü
      if (!file.type.startsWith("image/")) {
        alert(`${file.name} bir görsel dosyası değil.`)
        continue
      }

      // Dosya boyutu kontrolü (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} dosyası çok büyük. Maksimum 5MB olmalıdır.`)
        continue
      }

      newFiles.push(file)
      newPreviewUrls.push(URL.createObjectURL(file))
    }

    setSelectedFiles((prev) => [...prev, ...newFiles])
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls])
  }

  // Dosya kaldırma işleyicisi
  const handleRemoveFile = (index: number) => {
    const newSelectedFiles = [...selectedFiles]
    newSelectedFiles.splice(index, 1)
    setSelectedFiles(newSelectedFiles)

    const newPreviewUrls = [...previewUrls]
    URL.revokeObjectURL(newPreviewUrls[index]) // Bellek temizliği
    newPreviewUrls.splice(index, 1)
    setPreviewUrls(newPreviewUrls)

    // Ana görsel indeksini güncelle
    if (index === anaGorselIndex) {
      setAnaGorselIndex(0)
    } else if (index < anaGorselIndex) {
      setAnaGorselIndex(anaGorselIndex - 1)
    }
  }

  // Sürükle bırak işleyicileri
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }, [])

  // Görsel sıralama işleyicileri
  const handleDragStart = (index: number) => {
    setDraggingIndex(index)
  }

  const handleDragEnter = (index: number) => {
    setDropTargetIndex(index)
  }

  const handleDragEnd = () => {
    if (draggingIndex !== null && dropTargetIndex !== null && draggingIndex !== dropTargetIndex) {
      // Dosyaları yeniden sırala
      const newSelectedFiles = [...selectedFiles]
      const newPreviewUrls = [...previewUrls]

      const [movedFile] = newSelectedFiles.splice(draggingIndex, 1)
      const [movedPreview] = newPreviewUrls.splice(draggingIndex, 1)

      newSelectedFiles.splice(dropTargetIndex, 0, movedFile)
      newPreviewUrls.splice(dropTargetIndex, 0, movedPreview)

      setSelectedFiles(newSelectedFiles)
      setPreviewUrls(newPreviewUrls)

      // Ana görsel indeksini güncelle
      if (anaGorselIndex === draggingIndex) {
        setAnaGorselIndex(dropTargetIndex)
      } else if (
        (draggingIndex < anaGorselIndex && dropTargetIndex >= anaGorselIndex) ||
        (draggingIndex > anaGorselIndex && dropTargetIndex <= anaGorselIndex)
      ) {
        // Ana görsel indeksi değişti
        if (draggingIndex < anaGorselIndex) {
          setAnaGorselIndex(anaGorselIndex - 1)
        } else {
          setAnaGorselIndex(anaGorselIndex + 1)
        }
      }
    }

    setDraggingIndex(null)
    setDropTargetIndex(null)
  }

  // Ana görsel seçme
  const handleSetAnaGorsel = (index: number) => {
    setAnaGorselIndex(index)
  }

  // Görsel düzenleme
  const handleEditImage = (index: number) => {
    setEditingImageIndex(index)
    setEditingImageSettings({
      brightness: 100,
      contrast: 100,
      saturation: 100,
      rotation: 0,
    })
  }

  const handleSaveEditedImage = () => {
    setEditingImageIndex(null)
    // Burada gerçek bir görsel düzenleme işlemi yapılabilir
    // Şu an için sadece dialog'u kapatıyoruz
  }

  // Ana görsel değiştiğinde form verisini güncelle - sonsuz döngü sorununu düzelttik
  useEffect(() => {
    if (previewUrls.length > 0 && anaGorselIndex < previewUrls.length) {
      // useRef ile saklanan onChange fonksiyonunu kullanıyoruz
      onChangeRef.current("fotograf_url", previewUrls[anaGorselIndex])
    }
  }, [anaGorselIndex, previewUrls])

  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-0 space-y-6">
        <div className="flex items-center gap-2 text-lg font-medium text-primary">
          <ImageIcon className="h-5 w-5" />
          <h3>İşletme Görselleri</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fotograf_url">Ana Görsel URL</Label>
            <div className="relative">
              <ImageIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="fotograf_url"
                value={formData.fotograf_url || ""}
                onChange={(e) => onChange("fotograf_url", e.target.value)}
                placeholder="https://example.com/fotograf.jpg"
                className="pl-10"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              İşletmenizin ana görseli için bir URL girin veya aşağıdan görsel yükleyin
            </p>
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/20"
            }`}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
          >
            <Input
              id="fotograflar"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />

            <ImagePlus className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-sm font-medium">Görselleri buraya sürükleyin veya seçin</p>
            <p className="text-xs text-muted-foreground mt-1">
              PNG, JPG, GIF veya WEBP formatında, maksimum 5MB boyutunda
            </p>

            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById("fotograflar")?.click()}
              className="mt-4"
              disabled={uploadingPhotos || selectedFiles.length >= maxFiles}
            >
              <Upload className="mr-2 h-4 w-4" />
              Görsel Seç
            </Button>

            <p className="text-xs text-muted-foreground mt-2">
              Maksimum {maxFiles} görsel yükleyebilirsiniz. {selectedFiles.length}/{maxFiles} görsel seçildi.
            </p>
          </div>

          {uploadingPhotos && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Görseller yükleniyor...</p>
              <Progress value={50} className="h-2" />
            </div>
          )}

          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Seçilen Görseller ({selectedFiles.length})</h4>
                <p className="text-xs text-muted-foreground">Görselleri sıralamak için sürükleyip bırakın</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {previewUrls.map((url, index) => (
                  <Card
                    key={index}
                    className={`overflow-hidden ${index === anaGorselIndex ? "ring-2 ring-primary" : ""} ${
                      index === dropTargetIndex ? "border-dashed border-2 border-primary" : ""
                    }`}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragEnter={() => handleDragEnter(index)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <CardContent className="p-2">
                      <div className="relative aspect-square">
                        <img
                          src={url || "/placeholder.svg"}
                          alt={`Görsel ${index + 1}`}
                          className="w-full h-full object-cover rounded"
                        />
                        <div className="absolute top-2 right-2 flex space-x-1">
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleRemoveFile(index)}
                            disabled={uploadingPhotos}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>

                          <Button
                            type="button"
                            variant="secondary"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleEditImage(index)}
                            disabled={uploadingPhotos}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <Button
                          type="button"
                          variant={index === anaGorselIndex ? "default" : "secondary"}
                          size="icon"
                          className="absolute bottom-2 right-2 h-6 w-6"
                          onClick={() => handleSetAnaGorsel(index)}
                          disabled={uploadingPhotos || index === anaGorselIndex}
                        >
                          <Star className="h-4 w-4" />
                        </Button>

                        <div className="absolute top-2 left-2 bg-black/50 text-white text-xs p-1 rounded">
                          {index === anaGorselIndex ? "Ana Görsel" : `Görsel ${index + 1}`}
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute inset-0 w-full h-full bg-transparent cursor-move opacity-0 hover:opacity-10"
                          tabIndex={-1}
                        >
                          <Move className="h-6 w-6" />
                        </Button>

                        {uploadProgress[selectedFiles[index]?.name] !== undefined && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1">
                            <Progress value={uploadProgress[selectedFiles[index].name]} className="h-1" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs truncate mt-1">{selectedFiles[index]?.name}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>

      {/* Görsel Düzenleme Dialog */}
      <Dialog open={editingImageIndex !== null} onOpenChange={(open) => !open && setEditingImageIndex(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Görsel Düzenle</DialogTitle>
          </DialogHeader>

          {editingImageIndex !== null && (
            <div className="space-y-4">
              <div className="aspect-square overflow-hidden rounded-md">
                <img
                  src={previewUrls[editingImageIndex] || "/placeholder.svg"}
                  alt="Düzenlenen görsel"
                  className="w-full h-full object-cover"
                  style={{
                    filter: `brightness(${editingImageSettings.brightness}%) contrast(${editingImageSettings.contrast}%) saturate(${editingImageSettings.saturation}%)`,
                    transform: `rotate(${editingImageSettings.rotation}deg)`,
                  }}
                />
              </div>

              <Tabs defaultValue="brightness">
                <TabsList className="grid grid-cols-4">
                  <TabsTrigger value="brightness">Parlaklık</TabsTrigger>
                  <TabsTrigger value="contrast">Kontrast</TabsTrigger>
                  <TabsTrigger value="saturation">Doygunluk</TabsTrigger>
                  <TabsTrigger value="rotation">Döndürme</TabsTrigger>
                </TabsList>

                <TabsContent value="brightness" className="space-y-2">
                  <Label>Parlaklık: {editingImageSettings.brightness}%</Label>
                  <Slider
                    value={[editingImageSettings.brightness]}
                    min={0}
                    max={200}
                    step={1}
                    onValueChange={(value) =>
                      setEditingImageSettings({ ...editingImageSettings, brightness: value[0] })
                    }
                  />
                </TabsContent>

                <TabsContent value="contrast" className="space-y-2">
                  <Label>Kontrast: {editingImageSettings.contrast}%</Label>
                  <Slider
                    value={[editingImageSettings.contrast]}
                    min={0}
                    max={200}
                    step={1}
                    onValueChange={(value) => setEditingImageSettings({ ...editingImageSettings, contrast: value[0] })}
                  />
                </TabsContent>

                <TabsContent value="saturation" className="space-y-2">
                  <Label>Doygunluk: {editingImageSettings.saturation}%</Label>
                  <Slider
                    value={[editingImageSettings.saturation]}
                    min={0}
                    max={200}
                    step={1}
                    onValueChange={(value) =>
                      setEditingImageSettings({ ...editingImageSettings, saturation: value[0] })
                    }
                  />
                </TabsContent>

                <TabsContent value="rotation" className="space-y-2">
                  <Label>Döndürme: {editingImageSettings.rotation}°</Label>
                  <Slider
                    value={[editingImageSettings.rotation]}
                    min={0}
                    max={360}
                    step={90}
                    onValueChange={(value) => setEditingImageSettings({ ...editingImageSettings, rotation: value[0] })}
                  />
                </TabsContent>
              </Tabs>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditingImageIndex(null)}>
                  İptal
                </Button>
                <Button onClick={handleSaveEditedImage}>Kaydet</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  )
}
