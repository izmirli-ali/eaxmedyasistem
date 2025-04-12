"use client"

import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { CardContent } from "@/components/ui/card"
import { CardDescription } from "@/components/ui/card"
import { CardTitle } from "@/components/ui/card"
import { CardHeader } from "@/components/ui/card"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { useState } from "react"
// ... (Diğer importlar)
import { generateSeoSuggestions } from "@/utils/seo-helpers"
import { Wand2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function IsletmeKayitPage() {
  const { toast } = useToast()
  // ... (Diğer state'ler)
  const [formData, setFormData] = useState({
    // ... (Diğer form alanları)
    seo_baslik: "",
    seo_aciklama: "",
    seo_anahtar_kelimeler: "",
    url_slug: "",
  })

  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [supabase, setSupabase] = useState(null) // You'll likely need to initialize this properly

  const [activeTab, setActiveTab] = useState("detay-bilgiler")

  // Form gönderimi
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setIsSubmitting(true)

    try {
      // ... (Diğer form işlemleri)
      const validatedFormData = formData // Assuming you have validation logic elsewhere

      // İşletmeyi ekle
      const { data, error } = await supabase
        .from("isletmeler")
        .insert([
          {
            ...validatedFormData,
            fotograf_url: "imageUrl", // Replace with actual imageUrl if needed
            kullanici_id: "userId", // Replace with actual userId if needed
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()

      if (error) {
        console.error("İşletme eklenirken hata:", error)
        throw new Error(`İşletme eklenirken bir hata oluştu: ${error.message}`)
      }

      // ... (Diğer işlemler)
    } catch (error) {
      // ... (Hata işlemleri)
    } finally {
      // ... (Finally işlemleri)
      setLoading(false)
      setIsSubmitting(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="container mx-auto py-6">
      {/* ... (Diğer içerikler) */}

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          {/* ... (Diğer tablar) */}

          {/* SEO Bilgileri */}
          <TabsContent value="seo-bilgileri">
            <Card>
              <CardHeader>
                <CardTitle>SEO Bilgileri</CardTitle>
                <CardDescription>
                  İşletmenizin arama motorlarında daha iyi sıralanması için SEO bilgilerini girin.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="mb-4">
                  <Button
                    type="button"
                    variant="default"
                    onClick={() => {
                      const seoSuggestions = generateSeoSuggestions(formData)
                      setFormData((prev) => ({
                        ...prev,
                        seo_baslik: seoSuggestions.title,
                        seo_aciklama: seoSuggestions.description,
                        seo_anahtar_kelimeler: seoSuggestions.keywords.join(", "),
                        url_slug: seoSuggestions.slug || prev.url_slug,
                      }))

                      toast({
                        title: "SEO Önerileri Uygulandı",
                        description: "SEO alanları için otomatik öneriler uygulandı.",
                      })
                    }}
                    className="w-full md:w-auto"
                  >
                    <Wand2 className="mr-2 h-4 w-4" />
                    SEO Önerileri Oluştur
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    İşletme bilgilerine göre otomatik SEO önerileri oluşturur. Temel bilgileri doldurduktan sonra
                    kullanın.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seo_baslik">SEO Başlığı</Label>
                  <Input
                    id="seo_baslik"
                    name="seo_baslik"
                    value={formData.seo_baslik}
                    onChange={handleChange}
                    placeholder="SEO başlığı girin (60 karakter önerilir)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Karakter sayısı: {formData.seo_baslik?.length || 0}/60
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seo_aciklama">SEO Açıklaması</Label>
                  <Textarea
                    id="seo_aciklama"
                    name="seo_aciklama"
                    value={formData.seo_aciklama}
                    onChange={handleChange}
                    placeholder="SEO açıklaması girin (160 karakter önerilir)"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Karakter sayısı: {formData.seo_aciklama?.length || 0}/160
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seo_anahtar_kelimeler">SEO Anahtar Kelimeleri</Label>
                  <Textarea
                    id="seo_anahtar_kelimeler"
                    name="seo_anahtar_kelimeler"
                    value={formData.seo_anahtar_kelimeler}
                    onChange={handleChange}
                    placeholder="Anahtar kelimeleri virgülle ayırarak girin"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url_slug">URL Slug (Opsiyonel)</Label>
                  <Input
                    id="url_slug"
                    name="url_slug"
                    value={formData.url_slug}
                    onChange={handleChange}
                    placeholder="ornek-isletme-adi"
                  />
                  <p className="text-xs text-muted-foreground">
                    Boş bırakırsanız, işletme adı ve şehir bilgisinden otomatik oluşturulur.
                  </p>
                </div>
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("detay-bilgiler")}>
                    Geri
                  </Button>
                  <Button type="button" onClick={() => setActiveTab("gorsel-bilgileri")}>
                    İleri
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ... (Diğer tablar) */}
        </Tabs>
      </form>
    </div>
  )
}
