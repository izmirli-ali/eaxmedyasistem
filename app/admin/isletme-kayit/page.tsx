"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { supabase } from "@/supabase"
import { MapLocationPicker } from "@/components/map-location-picker"
import { DragDropFileUpload } from "@/components/drag-drop-file-upload"

export default function IsletmeKayit() {
  const [formData, setFormData] = useState({
    isletme_adi: "",
    kategori: "",
    alt_kategori: "",
    adres: "",
    sehir: "",
    ilce: "",
    telefon: "",
    email: "",
    website: "",
    aciklama: "",
    sunulan_hizmetler: "",
    fiyat_araligi: "",
    latitude: "",
    longitude: "",
    harita_linki: "",
    seo_baslik: "",
    seo_aciklama: "",
    seo_anahtar_kelimeler: "",
    fotograf_url: "",
    calisma_saatleri: {
      pazartesi: { acik: true, acilis: "09:00", kapanis: "18:00" },
      sali: { acik: true, acilis: "09:00", kapanis: "18:00" },
      carsamba: { acik: true, acilis: "09:00", kapanis: "18:00" },
      persembe: { acik: true, acilis: "09:00", kapanis: "18:00" },
      cuma: { acik: true, acilis: "09:00", kapanis: "18:00" },
      cumartesi: { acik: false, acilis: "10:00", kapanis: "15:00" },
      pazar: { acik: false, acilis: "10:00", kapanis: "15:00" },
    },
    sosyal_medya: {
      facebook: "",
      instagram: "",
      twitter: "",
      linkedin: "",
      youtube: "",
    },
    ozellikler: {
      wifi: false,
      otopark: false,
      kredi_karti: false,
      engelli_dostu: false,
      cocuk_dostu: false,
      evcil_hayvan_dostu: false,
    },
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLocationChange = (lat: string, lng: string) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }))
  }

  const handleWorkingHoursChange = (day: string, field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      calisma_saatleri: {
        ...prev.calisma_saatleri,
        [day]: {
          ...prev.calisma_saatleri[day as keyof typeof prev.calisma_saatleri],
          [field]: value,
        },
      },
    }))
  }

  const handleSocialMediaChange = (platform: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      sosyal_medya: {
        ...prev.sosyal_medya,
        [platform]: value,
      },
    }))
  }

  const handleFeatureChange = (feature: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      ozellikler: {
        ...prev.ozellikler,
        [feature]: checked,
      },
    }))
  }

  const handleImageUpload = (url: string) => {
    setUploadedImages((prev) => [...prev, url])
    if (!formData.fotograf_url) {
      setFormData((prev) => ({ ...prev, fotograf_url: url }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // İşletme adı kontrolü
      const { data: existingBusinessByName, error: nameCheckError } = await supabase
        .from("isletmeler2")
        .select("isletme_adi")
        .filter("isletme_adi", "eq", formData.isletme_adi)
        .limit(1)

      if (nameCheckError) throw nameCheckError

      if (existingBusinessByName && existingBusinessByName.length > 0) {
        throw new Error("Bu isimde bir işletme zaten mevcut")
      }

      // Koordinatları birleştir
      const koordinatlar = formData.latitude && formData.longitude ? `${formData.latitude},${formData.longitude}` : null

      // Fotoğrafları düzenle
      const fotograflar = uploadedImages.map((url, index) => ({
        url,
        sira: index + 1,
      }))

      // İşletmeyi kaydet
      const { data, error } = await supabase
        .from("isletmeler2")
        .insert([
          {
            isletme_adi: formData.isletme_adi,
            kategori: formData.kategori,
            alt_kategori: formData.alt_kategori,
            adres: formData.adres,
            sehir: formData.sehir,
            ilce: formData.ilce,
            telefon: formData.telefon,
            email: formData.email,
            website: formData.website,
            aciklama: formData.aciklama,
            sunulan_hizmetler: formData.sunulan_hizmetler,
            fiyat_araligi: formData.fiyat_araligi,
            koordinatlar,
            harita_linki: formData.harita_linki,
            seo_baslik: formData.seo_baslik,
            seo_aciklama: formData.seo_aciklama,
            seo_anahtar_kelimeler: formData.seo_anahtar_kelimeler,
            fotograf_url: formData.fotograf_url,
            calisma_saatleri: formData.calisma_saatleri,
            sosyal_medya: formData.sosyal_medya,
            ozellikler: formData.ozellikler,
            fotograflar,
            url_slug: null, // Trigger tarafından oluşturulacak
            taslak_durumu: false,
            taslak_versiyonu: 1,
            goruntulenme_sayisi: 0,
            onay_durumu: "onaylandı",
            aktif: true,
          },
        ])
        .select()

      if (error) throw error

      setSuccess("İşletme başarıyla kaydedildi")
      // Formu sıfırla
      setFormData({
        isletme_adi: "",
        kategori: "",
        alt_kategori: "",
        adres: "",
        sehir: "",
        ilce: "",
        telefon: "",
        email: "",
        website: "",
        aciklama: "",
        sunulan_hizmetler: "",
        fiyat_araligi: "",
        latitude: "",
        longitude: "",
        harita_linki: "",
        seo_baslik: "",
        seo_aciklama: "",
        seo_anahtar_kelimeler: "",
        fotograf_url: "",
        calisma_saatleri: {
          pazartesi: { acik: true, acilis: "09:00", kapanis: "18:00" },
          sali: { acik: true, acilis: "09:00", kapanis: "18:00" },
          carsamba: { acik: true, acilis: "09:00", kapanis: "18:00" },
          persembe: { acik: true, acilis: "09:00", kapanis: "18:00" },
          cuma: { acik: true, acilis: "09:00", kapanis: "18:00" },
          cumartesi: { acik: false, acilis: "10:00", kapanis: "15:00" },
          pazar: { acik: false, acilis: "10:00", kapanis: "15:00" },
        },
        sosyal_medya: {
          facebook: "",
          instagram: "",
          twitter: "",
          linkedin: "",
          youtube: "",
        },
        ozellikler: {
          wifi: false,
          otopark: false,
          kredi_karti: false,
          engelli_dostu: false,
          cocuk_dostu: false,
          evcil_hayvan_dostu: false,
        },
      })
      setUploadedImages([])
    } catch (err: any) {
      setError(`İşletme kaydetme hatası: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Yeni İşletme Ekle</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>
          )}
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="genel">
              <TabsList className="mb-4">
                <TabsTrigger value="genel">Genel Bilgiler</TabsTrigger>
                <TabsTrigger value="konum">Konum Bilgileri</TabsTrigger>
                <TabsTrigger value="iletisim">İletişim Bilgileri</TabsTrigger>
                <TabsTrigger value="calisma">Çalışma Saatleri</TabsTrigger>
                <TabsTrigger value="ozellikler">Özellikler</TabsTrigger>
                <TabsTrigger value="seo">SEO Bilgileri</TabsTrigger>
                <TabsTrigger value="medya">Medya</TabsTrigger>
              </TabsList>

              <TabsContent value="genel">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="isletme_adi">İşletme Adı *</Label>
                    <Input
                      id="isletme_adi"
                      name="isletme_adi"
                      value={formData.isletme_adi}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="kategori">Kategori</Label>
                      <Select
                        value={formData.kategori}
                        onValueChange={(value) => handleSelectChange("kategori", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Kategori seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="restoran">Restoran</SelectItem>
                          <SelectItem value="kafe">Kafe</SelectItem>
                          <SelectItem value="otel">Otel</SelectItem>
                          <SelectItem value="market">Market</SelectItem>
                          <SelectItem value="spor">Spor Salonu</SelectItem>
                          <SelectItem value="saglik">Sağlık</SelectItem>
                          <SelectItem value="egitim">Eğitim</SelectItem>
                          <SelectItem value="diger">Diğer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="alt_kategori">Alt Kategori</Label>
                      <Input
                        id="alt_kategori"
                        name="alt_kategori"
                        value={formData.alt_kategori}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aciklama">Açıklama</Label>
                    <Textarea
                      id="aciklama"
                      name="aciklama"
                      value={formData.aciklama}
                      onChange={handleInputChange}
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sunulan_hizmetler">Sunulan Hizmetler</Label>
                      <Input
                        id="sunulan_hizmetler"
                        name="sunulan_hizmetler"
                        value={formData.sunulan_hizmetler}
                        onChange={handleInputChange}
                        placeholder="Virgülle ayırarak yazın"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fiyat_araligi">Fiyat Aralığı</Label>
                      <Select
                        value={formData.fiyat_araligi}
                        onValueChange={(value) => handleSelectChange("fiyat_araligi", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Fiyat aralığı seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="₺">₺ (Ekonomik)</SelectItem>
                          <SelectItem value="₺₺">₺₺ (Orta)</SelectItem>
                          <SelectItem value="₺₺₺">₺₺₺ (Pahalı)</SelectItem>
                          <SelectItem value="₺₺₺₺">₺₺₺₺ (Lüks)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="konum">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="adres">Adres</Label>
                    <Textarea id="adres" name="adres" value={formData.adres} onChange={handleInputChange} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sehir">Şehir</Label>
                      <Input id="sehir" name="sehir" value={formData.sehir} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ilce">İlçe</Label>
                      <Input id="ilce" name="ilce" value={formData.ilce} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Harita Konumu</Label>
                    <MapLocationPicker
                      onLocationChange={handleLocationChange}
                      initialLat={formData.latitude}
                      initialLng={formData.longitude}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="harita_linki">Google Harita Linki</Label>
                    <Input
                      id="harita_linki"
                      name="harita_linki"
                      value={formData.harita_linki}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="iletisim">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefon">Telefon *</Label>
                    <Input id="telefon" name="telefon" value={formData.telefon} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-posta</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Web Sitesi</Label>
                    <Input id="website" name="website" value={formData.website} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Sosyal Medya</h3>
                    <div className="space-y-2">
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input
                        id="facebook"
                        value={formData.sosyal_medya.facebook}
                        onChange={(e) => handleSocialMediaChange("facebook", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <Input
                        id="instagram"
                        value={formData.sosyal_medya.instagram}
                        onChange={(e) => handleSocialMediaChange("instagram", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="twitter">Twitter</Label>
                      <Input
                        id="twitter"
                        value={formData.sosyal_medya.twitter}
                        onChange={(e) => handleSocialMediaChange("twitter", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        value={formData.sosyal_medya.linkedin}
                        onChange={(e) => handleSocialMediaChange("linkedin", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="youtube">YouTube</Label>
                      <Input
                        id="youtube"
                        value={formData.sosyal_medya.youtube}
                        onChange={(e) => handleSocialMediaChange("youtube", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="calisma">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Çalışma Saatleri</h3>
                  {Object.entries(formData.calisma_saatleri).map(([day, hours]) => (
                    <div key={day} className="flex items-center space-x-4">
                      <div className="w-24">
                        <Label>{day.charAt(0).toUpperCase() + day.slice(1)}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={hours.acik}
                          onChange={(e) => handleWorkingHoursChange(day, "acik", e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <span>Açık</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label>Açılış:</Label>
                        <Input
                          type="time"
                          value={hours.acilis}
                          onChange={(e) => handleWorkingHoursChange(day, "acilis", e.target.value)}
                          disabled={!hours.acik}
                          className="w-24"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label>Kapanış:</Label>
                        <Input
                          type="time"
                          value={hours.kapanis}
                          onChange={(e) => handleWorkingHoursChange(day, "kapanis", e.target.value)}
                          disabled={!hours.acik}
                          className="w-24"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="ozellikler">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">İşletme Özellikleri</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="wifi"
                        checked={formData.ozellikler.wifi}
                        onChange={(e) => handleFeatureChange("wifi", e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="wifi">Ücretsiz Wi-Fi</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="otopark"
                        checked={formData.ozellikler.otopark}
                        onChange={(e) => handleFeatureChange("otopark", e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="otopark">Otopark</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="kredi_karti"
                        checked={formData.ozellikler.kredi_karti}
                        onChange={(e) => handleFeatureChange("kredi_karti", e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="kredi_karti">Kredi Kartı</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="engelli_dostu"
                        checked={formData.ozellikler.engelli_dostu}
                        onChange={(e) => handleFeatureChange("engelli_dostu", e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="engelli_dostu">Engelli Dostu</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="cocuk_dostu"
                        checked={formData.ozellikler.cocuk_dostu}
                        onChange={(e) => handleFeatureChange("cocuk_dostu", e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="cocuk_dostu">Çocuk Dostu</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="evcil_hayvan_dostu"
                        checked={formData.ozellikler.evcil_hayvan_dostu}
                        onChange={(e) => handleFeatureChange("evcil_hayvan_dostu", e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="evcil_hayvan_dostu">Evcil Hayvan Dostu</Label>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="seo">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="seo_baslik">SEO Başlık</Label>
                    <Input id="seo_baslik" name="seo_baslik" value={formData.seo_baslik} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seo_aciklama">SEO Açıklama</Label>
                    <Textarea
                      id="seo_aciklama"
                      name="seo_aciklama"
                      value={formData.seo_aciklama}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seo_anahtar_kelimeler">SEO Anahtar Kelimeler</Label>
                    <Input
                      id="seo_anahtar_kelimeler"
                      name="seo_anahtar_kelimeler"
                      value={formData.seo_anahtar_kelimeler}
                      onChange={handleInputChange}
                      placeholder="Virgülle ayırarak yazın"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="medya">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Fotoğraflar</Label>
                    <DragDropFileUpload onUpload={handleImageUpload} uploadedFiles={uploadedImages} />
                  </div>
                  {uploadedImages.length > 0 && (
                    <div className="space-y-2">
                      <Label>Yüklenen Fotoğraflar</Label>
                      <div className="grid grid-cols-3 gap-4">
                        {uploadedImages.map((url, index) => (
                          <div key={index} className="relative">
                            <img
                              src={url || "/placeholder.svg"}
                              alt={`Fotoğraf ${index + 1}`}
                              className="w-full h-32 object-cover rounded"
                            />
                            {index === 0 && (
                              <div className="absolute top-0 left-0 bg-green-500 text-white px-2 py-1 text-xs rounded">
                                Ana Fotoğraf
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Kaydediliyor..." : "İşletmeyi Kaydet"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
