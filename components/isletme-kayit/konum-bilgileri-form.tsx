"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Loader2, Map, Navigation } from "lucide-react"
import { MapLocationPicker } from "@/components/map-location-picker"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { AddressAutocomplete } from "@/components/address-autocomplete"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Şehir listesi
const SEHIRLER = [
  "Adana",
  "Adıyaman",
  "Afyonkarahisar",
  "Ağrı",
  "Amasya",
  "Ankara",
  "Antalya",
  "Artvin",
  "Aydın",
  "Balıkesir",
  "Bilecik",
  "Bingöl",
  "Bitlis",
  "Bolu",
  "Burdur",
  "Bursa",
  "Çanakkale",
  "Çankırı",
  "Çorum",
  "Denizli",
  "Diyarbakır",
  "Edirne",
  "Elazığ",
  "Erzincan",
  "Erzurum",
  "Eskişehir",
  "Gaziantep",
  "Giresun",
  "Gümüşhane",
  "Hakkari",
  "Hatay",
  "Isparta",
  "Mersin",
  "İstanbul",
  "İzmir",
  "Kars",
  "Kastamonu",
  "Kayseri",
  "Kırklareli",
  "Kırşehir",
  "Kocaeli",
  "Konya",
  "Kütahya",
  "Malatya",
  "Manisa",
  "Kahramanmaraş",
  "Mardin",
  "Muğla",
  "Muş",
  "Nevşehir",
  "Niğde",
  "Ordu",
  "Rize",
  "Sakarya",
  "Samsun",
  "Siirt",
  "Sinop",
  "Sivas",
  "Tekirdağ",
  "Tokat",
  "Trabzon",
  "Tunceli",
  "Şanlıurfa",
  "Uşak",
  "Van",
  "Yozgat",
  "Zonguldak",
  "Aksaray",
  "Bayburt",
  "Karaman",
  "Kırıkkale",
  "Batman",
  "Şırnak",
  "Bartın",
  "Ardahan",
  "Iğdır",
  "Yalova",
  "Karabük",
  "Kilis",
  "Osmaniye",
  "Düzce",
].sort()

interface KonumBilgileriFormProps {
  formData: any
  onChange: (field: string, value: any) => void
  errors: Record<string, string>
}

export function KonumBilgileriForm({ formData, onChange, errors }: KonumBilgileriFormProps) {
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("harita")
  const [ilceler, setIlceler] = useState<string[]>([])

  // Konum alma fonksiyonu
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Tarayıcınız konum özelliğini desteklemiyor.")
      return
    }

    setLoading(true)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange("latitude", position.coords.latitude.toString())
        onChange("longitude", position.coords.longitude.toString())
        onChange("koordinatlar", `${position.coords.latitude},${position.coords.longitude}`)
        setLoading(false)
      },
      (error) => {
        console.error("Konum alınamadı:", error)
        alert("Konum alınamadı. Lütfen manuel olarak girin.")
        setLoading(false)
      },
    )
  }

  // Haritadan konum seçildiğinde
  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    onChange("latitude", lat.toString())
    onChange("longitude", lng.toString())
    onChange("koordinatlar", `${lat},${lng}`)
    onChange("adres", address)
  }

  // Adres otomatik tamamlama işleyicisi
  const handleAddressChange = (address: string, placeData?: any) => {
    onChange("adres", address)

    if (placeData && placeData.geometry && placeData.geometry.location) {
      const lat = placeData.geometry.location.lat()
      const lng = placeData.geometry.location.lng()

      onChange("latitude", lat.toString())
      onChange("longitude", lng.toString())
      onChange("koordinatlar", `${lat},${lng}`)

      // Şehir ve ilçe bilgilerini çıkar
      if (placeData.address_components) {
        const addressComponents = placeData.address_components

        // Şehir bilgisi
        const cityComponent = addressComponents.find((component: any) =>
          component.types.includes("administrative_area_level_1"),
        )

        // İlçe bilgisi
        const districtComponent = addressComponents.find((component: any) =>
          component.types.includes("administrative_area_level_2"),
        )

        if (cityComponent) {
          onChange("sehir", cityComponent.long_name)

          // İlçeleri güncelle
          fetchIlceler(cityComponent.long_name)
        }

        if (districtComponent) {
          onChange("ilce", districtComponent.long_name)
        }
      }
    }
  }

  // Şehir seçildiğinde ilçeleri getir
  const fetchIlceler = (sehir: string) => {
    // Gerçek uygulamada API'den ilçeler çekilir
    // Şimdilik örnek veri kullanıyoruz
    const mockIlceler: Record<string, string[]> = {
      İstanbul: [
        "Adalar",
        "Arnavutköy",
        "Ataşehir",
        "Avcılar",
        "Bağcılar",
        "Bahçelievler",
        "Bakırköy",
        "Başakşehir",
        "Bayrampaşa",
        "Beşiktaş",
        "Beykoz",
        "Beylikdüzü",
        "Beyoğlu",
        "Büyükçekmece",
        "Çatalca",
        "Çekmeköy",
        "Esenler",
        "Esenyurt",
        "Eyüpsultan",
        "Fatih",
        "Gaziosmanpaşa",
        "Güngören",
        "Kadıköy",
        "Kağıthane",
        "Kartal",
        "Küçükçekmece",
        "Maltepe",
        "Pendik",
        "Sancaktepe",
        "Sarıyer",
        "Silivri",
        "Sultanbeyli",
        "Sultangazi",
        "Şile",
        "Şişli",
        "Tuzla",
        "Ümraniye",
        "Üsküdar",
        "Zeytinburnu",
      ],
      Ankara: [
        "Akyurt",
        "Altındağ",
        "Ayaş",
        "Balâ",
        "Beypazarı",
        "Çamlıdere",
        "Çankaya",
        "Çubuk",
        "Elmadağ",
        "Etimesgut",
        "Evren",
        "Gölbaşı",
        "Güdül",
        "Haymana",
        "Kalecik",
        "Kahramankazan",
        "Keçiören",
        "Kızılcahamam",
        "Mamak",
        "Nallıhan",
        "Polatlı",
        "Pursaklar",
        "Sincan",
        "Şereflikoçhisar",
        "Yenimahalle",
      ],
      İzmir: [
        "Aliağa",
        "Balçova",
        "Bayındır",
        "Bayraklı",
        "Bergama",
        "Beydağ",
        "Bornova",
        "Buca",
        "Çeşme",
        "Çiğli",
        "Dikili",
        "Foça",
        "Gaziemir",
        "Güzelbahçe",
        "Karabağlar",
        "Karaburun",
        "Karşıyaka",
        "Kemalpaşa",
        "Kınık",
        "Kiraz",
        "Konak",
        "Menderes",
        "Menemen",
        "Narlıdere",
        "Ödemiş",
        "Seferihisar",
        "Selçuk",
        "Tire",
        "Torbalı",
        "Urla",
      ],
    }

    setIlceler(mockIlceler[sehir] || [])
  }

  // Şehir değiştiğinde ilçeleri güncelle
  const handleSehirChange = (value: string) => {
    onChange("sehir", value)
    onChange("ilce", "") // İlçeyi sıfırla
    fetchIlceler(value)
  }

  return (
    <Card className="border-none shadow-none">
      <CardContent className="p-0 space-y-6">
        <div className="flex items-center gap-2 text-lg font-medium text-primary">
          <MapPin className="h-5 w-5" />
          <h3>Konum Bilgileri</h3>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="harita" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              <span>Harita ile Seç</span>
            </TabsTrigger>
            <TabsTrigger value="manuel" className="flex items-center gap-2">
              <Navigation className="h-4 w-4" />
              <span>Manuel Giriş</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="harita" className="space-y-4">
            <div className="border rounded-lg p-4 bg-muted/20">
              <MapLocationPicker
                initialPosition={
                  formData.latitude && formData.longitude
                    ? [Number.parseFloat(formData.latitude), Number.parseFloat(formData.longitude)]
                    : undefined
                }
                onLocationSelect={handleLocationSelect}
                defaultAddress={formData.adres}
                height="400px"
              />
            </div>
          </TabsContent>

          <TabsContent value="manuel" className="space-y-4">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="adres" className={errors.adres ? "text-destructive" : ""}>
                    Adres *
                  </Label>
                  <AddressAutocomplete
                    value={formData.adres || ""}
                    onChange={handleAddressChange}
                    placeholder="İşletme adresini girin"
                    error={errors.adres}
                  />
                  {errors.adres && <p className="text-xs text-destructive mt-1">{errors.adres}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Enlem (Latitude)</Label>
                    <Input
                      id="latitude"
                      type="text"
                      value={formData.latitude || ""}
                      onChange={(e) => {
                        onChange("latitude", e.target.value)
                        if (formData.longitude) {
                          onChange("koordinatlar", `${e.target.value},${formData.longitude}`)
                        }
                      }}
                      placeholder="Örn: 41.0082"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longitude">Boylam (Longitude)</Label>
                    <Input
                      id="longitude"
                      type="text"
                      value={formData.longitude || ""}
                      onChange={(e) => {
                        onChange("longitude", e.target.value)
                        if (formData.latitude) {
                          onChange("koordinatlar", `${formData.latitude},${e.target.value}`)
                        }
                      }}
                      placeholder="Örn: 28.9784"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={getCurrentLocation}
                      disabled={loading}
                      className="w-full sm:w-auto"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Konum Alınıyor...
                        </>
                      ) : (
                        <>
                          <MapPin className="mr-2 h-4 w-4" />
                          Mevcut Konumu Al
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              <Label htmlFor="harita_linki">Google Harita Linki (iFrame)</Label>
              <Textarea
                id="harita_linki"
                value={formData.harita_linki || ""}
                onChange={(e) => onChange("harita_linki", e.target.value)}
                placeholder="<iframe src='https://www.google.com/maps/embed?...'></iframe>"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                Google Haritalar'da konumu bulun, "Paylaş" &gt; "Haritayı yerleştir" seçeneğinden HTML kodunu kopyalayıp
                buraya yapıştırın.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="sehir" className={errors.sehir ? "text-destructive" : ""}>
              Şehir *
            </Label>
            <Select value={formData.sehir || ""} onValueChange={handleSehirChange}>
              <SelectTrigger id="sehir" className={errors.sehir ? "border-destructive" : ""}>
                <SelectValue placeholder="Şehir seçin" />
              </SelectTrigger>
              <SelectContent>
                {SEHIRLER.map((sehir) => (
                  <SelectItem key={sehir} value={sehir}>
                    {sehir}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.sehir && <p className="text-xs text-destructive mt-1">{errors.sehir}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="ilce">
              İlçe <span className="text-muted-foreground text-xs">(opsiyonel)</span>
            </Label>
            <Select
              value={formData.ilce || ""}
              onValueChange={(value) => onChange("ilce", value)}
              disabled={!formData.sehir || ilceler.length === 0}
            >
              <SelectTrigger id="ilce">
                <SelectValue placeholder="İlçe seçin" />
              </SelectTrigger>
              <SelectContent>
                {ilceler.map((ilce) => (
                  <SelectItem key={ilce} value={ilce}>
                    {ilce}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {formData.latitude && formData.longitude && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Konum Önizleme</h4>
            <div className="aspect-video w-full rounded-md overflow-hidden border">
              <iframe
                title="Konum Önizleme"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number.parseFloat(formData.longitude) - 0.01},${
                  Number.parseFloat(formData.latitude) - 0.01
                },${Number.parseFloat(formData.longitude) + 0.01},${
                  Number.parseFloat(formData.latitude) + 0.01
                }&layer=mapnik&marker=${formData.latitude},${formData.longitude}`}
              ></iframe>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <a
                href={`https://www.openstreetmap.org/?mlat=${formData.latitude}&mlon=${formData.longitude}#map=16/${formData.latitude}/${formData.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Büyük haritada görüntüle
              </a>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
