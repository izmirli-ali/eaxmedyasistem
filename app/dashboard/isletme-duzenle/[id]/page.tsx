"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface FormData {
  ad: string
  adres: string
  telefon: string
  web_sitesi: string
  aciklama: string
  kategori: string
  latitude: string
  longitude: string
  harita_linki: string
}

const IsletmeDuzenleSayfasi = () => {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()
  const [formData, setFormData] = useState<FormData>({
    ad: "",
    adres: "",
    telefon: "",
    web_sitesi: "",
    aciklama: "",
    kategori: "",
    latitude: "",
    longitude: "",
    harita_linki: "",
  })
  const { toast } = useToast()
  const [kategoriler, setKategoriler] = useState<string[]>([])

  useEffect(() => {
    const fetchIsletme = async () => {
      try {
        const response = await fetch(`/api/isletmeler/${id}`)
        if (!response.ok) {
          throw new Error("İşletme bilgileri alınamadı")
        }
        const data = await response.json()
        setFormData(data)
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Hata!",
          description: error.message,
        })
        console.error("İşletme bilgileri alınırken hata oluştu:", error)
      }
    }

    const fetchKategoriler = async () => {
      try {
        const response = await fetch("/api/kategoriler")
        if (!response.ok) {
          throw new Error("Kategoriler alınamadı")
        }
        const data = await response.json()
        setKategoriler(data)
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Hata!",
          description: error.message,
        })
        console.error("Kategoriler alınırken hata oluştu:", error)
      }
    }

    if (id) {
      fetchIsletme()
      fetchKategoriler()
    }
  }, [id, toast])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      kategori: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch(`/api/isletmeler/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Başarılı!",
          description: "İşletme başarıyla güncellendi.",
        })
        router.push("/dashboard/isletmeler")
      } else {
        throw new Error("İşletme güncellenemedi")
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata!",
        description: error.message,
      })
      console.error("İşletme güncellenirken hata oluştu:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>İşletme Düzenle</CardTitle>
        <CardDescription>Aşağıdaki formu kullanarak işletme bilgilerini düzenleyebilirsiniz.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ad">İşletme Adı</Label>
            <Input id="ad" name="ad" placeholder="İşletme adı" value={formData.ad} onChange={handleInputChange} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kategori">Kategori</Label>
            <Select onValueChange={handleSelectChange} defaultValue={formData.kategori}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Bir kategori seçin" />
              </SelectTrigger>
              <SelectContent>
                {kategoriler.map((kategori) => (
                  <SelectItem key={kategori} value={kategori}>
                    {kategori}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="adres">Adres</Label>
            <Input
              id="adres"
              name="adres"
              placeholder="İşletme adresi"
              value={formData.adres}
              onChange={handleInputChange}
            />
          </div>
          {/* Harita bilgileri bölümü */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Enlem (Latitude)</Label>
              <Input
                id="latitude"
                name="latitude"
                placeholder="Örn: 41.0082"
                value={formData.latitude || ""}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Boylam (Longitude)</Label>
              <Input
                id="longitude"
                name="longitude"
                placeholder="Örn: 28.9784"
                value={formData.longitude || ""}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="harita_linki">Google Harita Linki (iFrame)</Label>
            <Input
              id="harita_linki"
              name="harita_linki"
              placeholder="Google Harita Embed Linki"
              value={formData.harita_linki || ""}
              onChange={handleInputChange}
            />
            <p className="text-sm text-gray-500">
              Google Haritalar'da konumu bulun, "Paylaş" &gt; "Haritayı yerleştir" seçeneğinden HTML kodunu kopyalayıp
              buraya yapıştırın.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="telefon">Telefon</Label>
            <Input
              id="telefon"
              name="telefon"
              placeholder="İşletme telefon numarası"
              value={formData.telefon}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="web_sitesi">Web Sitesi</Label>
            <Input
              id="web_sitesi"
              name="web_sitesi"
              placeholder="İşletme web sitesi"
              value={formData.web_sitesi}
              onChange={handleInputChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="aciklama">Açıklama</Label>
            <Textarea
              id="aciklama"
              name="aciklama"
              placeholder="İşletme açıklaması"
              value={formData.aciklama}
              onChange={handleInputChange}
            />
          </div>
          <Button type="submit">Güncelle</Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default IsletmeDuzenleSayfasi
