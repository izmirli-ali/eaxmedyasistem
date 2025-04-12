"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Save, Database, AlertCircle, Globe } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { BackupTab } from "@/components/backup-tab"

export default function AyarlarPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [siteSettings, setSiteSettings] = useState({
    site_adi: "İşletme Yönetim Sistemi",
    site_aciklama:
      "İşletme Yönetim Sistemi ile işletmenizi Google Haritalar'da öne çıkarın, müşteri sayınızı artırın ve işletmenizi büyütün.",
    iletisim_email: "eaxmedya@gmail.com",
    iletisim_telefon: "05377781883",
    iletisim_adres: "Afyonkarahisar / Merkez",
    logo_url: "",
    footer_text: "© 2024 İşletme Yönetim Sistemi. Tüm hakları saklıdır.",
    seo_title: "İşletme Yönetim Sistemi | Google Haritalar Optimizasyonu",
    seo_description:
      "İşletme Yönetim Sistemi ile Google Haritalar'da üst sıralara çıkın, müşteri sayınızı artırın ve işletmenizi büyütün. Hemen kaydolun ve işletmenizi öne çıkarın!",
    seo_keywords:
      "işletme yönetimi, google haritalar, seo, yerel seo, işletme kaydı, müşteri artırma, google maps, işletme optimizasyonu, google benim işletmem",
  })
  const [tableExists, setTableExists] = useState({
    site_ayarlari: false,
    backups: false,
  })

  // Supabase istemcisini oluştur
  const supabase = createClient()

  // Site ayarlarını yükle
  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true)
        setError(null)

        // Site ayarları tablosunun varlığını kontrol et
        try {
          const { data: siteTableCheck, error: siteTableError } = await supabase
            .from("site_ayarlari")
            .select("id")
            .limit(1)
            .maybeSingle()

          setTableExists((prev) => ({ ...prev, site_ayarlari: !siteTableError }))

          // Site ayarlarını getir (tablo varsa)
          if (!siteTableError) {
            const { data: siteData, error: siteError } = await supabase.from("site_ayarlari").select("*").single()

            if (!siteError && siteData) {
              setSiteSettings({
                site_adi: siteData.site_adi || "İşletme Yönetim Sistemi",
                site_aciklama:
                  siteData.site_aciklama ||
                  "İşletme Yönetim Sistemi ile işletmenizi Google Haritalar'da öne çıkarın, müşteri sayınızı artırın ve işletmenizi büyütün.",
                iletisim_email: siteData.iletisim_email || "eaxmedya@gmail.com",
                iletisim_telefon: siteData.iletisim_telefon || "05377781883",
                iletisim_adres: siteData.iletisim_adres || "Afyonkarahisar / Merkez",
                logo_url: siteData.logo_url || "",
                footer_text: siteData.footer_text || "© 2024 İşletme Yönetim Sistemi. Tüm hakları saklıdır.",
                seo_title: siteData.seo_title || "İşletme Yönetim Sistemi | Google Haritalar Optimizasyonu",
                seo_description:
                  siteData.seo_description ||
                  "İşletme Yönetim Sistemi ile Google Haritalar'da üst sıralara çıkın, müşteri sayınızı artırın ve işletmenizi büyütün. Hemen kaydolun ve işletmenizi öne çıkarın!",
                seo_keywords:
                  siteData.seo_keywords ||
                  "işletme yönetimi, google haritalar, seo, yerel seo, işletme kaydı, müşteri artırma, google maps, işletme optimizasyonu, google benim işletmem",
              })
            }
          }
        } catch (siteError) {
          console.warn("Site ayarları tablosu kontrolünde hata:", siteError)
          // Hata olsa bile devam et
        }

        // Backups tablosunun varlığını kontrol et
        try {
          const { data: backupsTableCheck, error: backupsTableError } = await supabase
            .from("backups")
            .select("id")
            .limit(1)
            .maybeSingle()

          setTableExists((prev) => ({ ...prev, backups: !backupsTableError }))
        } catch (backupsError) {
          console.warn("Backups tablosu kontrolünde hata:", backupsError)
          // Hata olsa bile devam et
        }
      } catch (error) {
        console.error("Ayarlar yüklenirken hata:", error)
        setError("Ayarlar yüklenirken bir hata oluştu: " + error.message)
        toast({
          title: "Hata",
          description: "Ayarlar yüklenirken bir hata oluştu.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [supabase, toast])

  // Site ayarları değişikliklerini işle
  const handleSiteSettingChange = (e) => {
    const { name, value } = e.target
    setSiteSettings((prev) => ({ ...prev, [name]: value }))
  }

  // Site ayarlarını kaydet
  const handleSaveSiteSettings = async () => {
    if (!tableExists.site_ayarlari) {
      toast({
        title: "Hata",
        description: "Site ayarları tablosu bulunamadı. Lütfen veritabanı yapılandırmasını kontrol edin.",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)

      // Site ayarlarını güncelle veya oluştur
      const { error } = await supabase.from("site_ayarlari").upsert([
        {
          id: 1, // Tek bir kayıt olduğu için sabit ID
          ...siteSettings,
          updated_at: new Date().toISOString(),
        },
      ])

      if (error) {
        console.error("Site ayarları kaydedilirken veritabanı hatası:", error)
        throw new Error("Site ayarları kaydedilirken bir veritabanı hatası oluştu: " + error.message)
      }

      toast({
        title: "Başarılı",
        description: "Site ayarları başarıyla kaydedildi.",
      })
    } catch (error) {
      console.error("Site ayarları kaydedilirken genel hata:", error)
      toast({
        title: "Hata",
        description: "Site ayarları kaydedilirken bir hata oluştu: " + error.message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Google önizlemesi için yardımcı bileşen
  const GooglePreview = () => (
    <div className="border p-4 rounded-md bg-white">
      <div className="text-blue-800 text-xl font-medium mb-1 truncate">
        {siteSettings.seo_title || siteSettings.site_adi}
      </div>
      <div className="text-green-700 text-sm mb-1 truncate">{window.location.origin}</div>
      <div className="text-gray-600 text-sm">{siteSettings.seo_description || siteSettings.site_aciklama}</div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-bold mb-2">Yükleniyor</h2>
          <p>Ayarlar yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ayarlar</h1>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Hata</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!tableExists.site_ayarlari && (
        <Alert variant="warning" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Uyarı</AlertTitle>
          <AlertDescription>
            Site ayarları tablosu bulunamadı. Lütfen veritabanı yapılandırmasını kontrol edin. SQL dosyasını
            çalıştırarak tabloyu oluşturabilirsiniz.
          </AlertDescription>
        </Alert>
      )}

      {!tableExists.backups && (
        <Alert variant="warning" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Uyarı</AlertTitle>
          <AlertDescription>
            Yedekleme tablosu bulunamadı. Lütfen veritabanı yapılandırmasını kontrol edin. SQL dosyasını çalıştırarak
            tabloyu oluşturabilirsiniz.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="site" className="space-y-4">
        <TabsList>
          <TabsTrigger value="site">
            <Globe className="h-4 w-4 mr-2" />
            Site Ayarları
          </TabsTrigger>
          <TabsTrigger value="yedekleme">
            <Database className="h-4 w-4 mr-2" />
            Veri Yedekleme
          </TabsTrigger>
        </TabsList>

        <TabsContent value="site">
          {/* Tablo yoksa SQL kodunu göster */}
          {!tableExists.site_ayarlari ? (
            <Card>
              <CardHeader>
                <CardTitle>Site Ayarları</CardTitle>
                <CardDescription>Site ayarları tablosu bulunamadı.</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Tablo Bulunamadı</AlertTitle>
                  <AlertDescription>
                    Site ayarları tablosu veritabanında bulunamadı. Lütfen SQL dosyasını çalıştırarak tabloyu oluşturun.
                  </AlertDescription>
                </Alert>
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Tablo Oluşturma SQL Kodu</h3>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
                    {`-- Site ayarları tablosu oluşturma
CREATE TABLE IF NOT EXISTS public.site_ayarlari (
id INTEGER PRIMARY KEY DEFAULT 1,
site_adi TEXT NOT NULL DEFAULT 'İşletme Yönetim Sistemi',
site_aciklama TEXT DEFAULT 'SEO odaklı işletme yönetim sistemi',
iletisim_email TEXT,
iletisim_telefon TEXT,
iletisim_adres TEXT,
logo_url TEXT,
footer_text TEXT DEFAULT '© 2023 İşletme Yönetim Sistemi. Tüm hakları saklıdır.',
seo_title TEXT,
seo_description TEXT,
seo_keywords TEXT,
created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Varsayılan site ayarlarını ekle
INSERT INTO public.site_ayarlari (id, site_adi, site_aciklama, footer_text)
VALUES (1, 'İşletme Yönetim Sistemi', 'SEO odaklı işletme yönetim sistemi', '© 2023 İşletme Yönetim Sistemi. Tüm hakları saklıdır.')
ON CONFLICT (id) DO NOTHING;

-- RLS politikaları
ALTER TABLE public.site_ayarlari ENABLE ROW LEVEL SECURITY;

-- Admin kullanıcıları için politikalar
CREATE POLICY "Adminler site ayarlarını okuyabilir" ON public.site_ayarlari
FOR SELECT USING (
  auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin')
);

CREATE POLICY "Adminler site ayarlarını güncelleyebilir" ON public.site_ayarlari
FOR UPDATE USING (
  auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin')
);

CREATE POLICY "Adminler site ayarlarını ekleyebilir" ON public.site_ayarlari
FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin')
);`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Genel Site Ayarları</CardTitle>
                  <CardDescription>Temel site bilgilerini yapılandırın.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="site_adi">Site Adı</Label>
                      <Input
                        id="site_adi"
                        name="site_adi"
                        value={siteSettings.site_adi}
                        onChange={handleSiteSettingChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="site_aciklama">Site Açıklaması</Label>
                      <Input
                        id="site_aciklama"
                        name="site_aciklama"
                        value={siteSettings.site_aciklama}
                        onChange={handleSiteSettingChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="iletisim_email">İletişim E-posta</Label>
                      <Input
                        id="iletisim_email"
                        name="iletisim_email"
                        type="email"
                        value={siteSettings.iletisim_email}
                        onChange={handleSiteSettingChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="iletisim_telefon">İletişim Telefon</Label>
                      <Input
                        id="iletisim_telefon"
                        name="iletisim_telefon"
                        value={siteSettings.iletisim_telefon}
                        onChange={handleSiteSettingChange}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="iletisim_adres">İletişim Adresi</Label>
                      <Textarea
                        id="iletisim_adres"
                        name="iletisim_adres"
                        value={siteSettings.iletisim_adres}
                        onChange={handleSiteSettingChange}
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="logo_url">Logo URL</Label>
                      <Input
                        id="logo_url"
                        name="logo_url"
                        value={siteSettings.logo_url}
                        onChange={handleSiteSettingChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="footer_text">Footer Metni</Label>
                      <Input
                        id="footer_text"
                        name="footer_text"
                        value={siteSettings.footer_text}
                        onChange={handleSiteSettingChange}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>SEO Ayarları</CardTitle>
                  <CardDescription>Google ve diğer arama motorları için SEO ayarlarını yapılandırın.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="seo_title">SEO Başlığı</Label>
                      <Input
                        id="seo_title"
                        name="seo_title"
                        value={siteSettings.seo_title}
                        onChange={handleSiteSettingChange}
                        placeholder="Anasayfa için SEO başlığı (60 karakterden az olmalı)"
                        maxLength={60}
                      />
                      <p className="text-xs text-muted-foreground">
                        Karakter sayısı: {siteSettings.seo_title.length}/60
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="seo_description">SEO Açıklaması</Label>
                      <Textarea
                        id="seo_description"
                        name="seo_description"
                        value={siteSettings.seo_description}
                        onChange={handleSiteSettingChange}
                        placeholder="Anasayfa için SEO açıklaması (160 karakterden az olmalı)"
                        maxLength={160}
                        rows={3}
                      />
                      <p className="text-xs text-muted-foreground">
                        Karakter sayısı: {siteSettings.seo_description.length}/160
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="seo_keywords">SEO Anahtar Kelimeleri</Label>
                      <Textarea
                        id="seo_keywords"
                        name="seo_keywords"
                        value={siteSettings.seo_keywords}
                        onChange={handleSiteSettingChange}
                        placeholder="Anahtar kelimeler (virgülle ayırın)"
                        rows={2}
                      />
                      <p className="text-xs text-muted-foreground">
                        Anahtar kelimeleri virgülle ayırın. Örn: işletme yönetimi, müşteri takibi, sipariş yönetimi
                      </p>
                    </div>

                    <div className="mt-6">
                      <h3 className="text-lg font-medium mb-2">Google Önizlemesi</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Sitenizin Google arama sonuçlarında nasıl görüneceğine dair önizleme:
                      </p>
                      <GooglePreview />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={handleSaveSiteSettings} disabled={saving} className="w-full md:w-auto">
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Tüm Ayarları Kaydet
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="yedekleme">
          {/* Yedekleme tablosu yoksa SQL kodunu göster */}
          {!tableExists.backups ? (
            <Card>
              <CardHeader>
                <CardTitle>Veri Yedekleme</CardTitle>
                <CardDescription>Yedekleme tablosu bulunamadı.</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Tablo Bulunamadı</AlertTitle>
                  <AlertDescription>
                    Yedekleme tablosu veritabanında bulunamadı. Lütfen SQL dosyasını çalıştırarak tabloyu oluşturun.
                  </AlertDescription>
                </Alert>
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Tablo Oluşturma SQL Kodu</h3>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-sm">
                    {`-- Yedekleme tablosu oluşturma
CREATE TABLE IF NOT EXISTS public.backups (
id UUID PRIMARY KEY,
created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
status TEXT NOT NULL,
file_name TEXT,
file_size BIGINT,
tables TEXT[] NOT NULL,
error TEXT,
completed_at TIMESTAMP WITH TIME ZONE
);

-- RLS politikaları
ALTER TABLE public.backups ENABLE ROW LEVEL SECURITY;

-- Admin kullanıcıları için politikalar
CREATE POLICY "Adminler yedeklemeleri görüntüleyebilir" ON public.backups
FOR SELECT USING (
  auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin')
);

CREATE POLICY "Adminler yedekleme ekleyebilir" ON public.backups
FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin')
);

CREATE POLICY "Adminler yedekleme güncelleyebilir" ON public.backups
FOR UPDATE USING (
  auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin')
);

CREATE POLICY "Adminler yedekleme silebilir" ON public.backups
FOR DELETE USING (
  auth.uid() IN (SELECT id FROM public.kullanicilar WHERE rol = 'admin')
);`}
                  </pre>
                  <p className="mt-4 text-sm text-gray-600">
                    Ayrıca, Supabase Dashboard'dan "backups" adında bir Storage bucket oluşturmanız ve bu bucket için
                    uygun RLS politikalarını ayarlamanız gerekiyor.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <BackupTab />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
