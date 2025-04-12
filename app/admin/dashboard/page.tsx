"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import {
  Building,
  CreditCard,
  TrendingUp,
  Calendar,
  ArrowRight,
  Loader2,
  BarChart,
  MapPin,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import IsletmeHaritasi from "@/components/isletme-haritasi"
// Kategori ve Şehir Dağılımı bileşenlerini ekleyelim
import { KategoriDagilimi } from "@/components/dashboard/kategori-dagilimi"
import { SehirDagilimi } from "@/components/dashboard/sehir-dagilimi"

export default function DashboardPage() {
  const { toast } = useToast()
  // stats state'ini güncelleyelim
  const [stats, setStats] = useState({
    isletmeSayisi: 0,
    isletmeSayisiToplam: 0,
    toplamOdeme: 0,
    bekleyenOdeme: 0,
    sonEklenenIsletmeler: [],
    yaklasakBitenSozlesmeler: [],
    koordinatliIsletmeler: [],
    kategoriDagilimi: {},
    sehirDagilimi: {},
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Supabase istemcisini oluştur
  const supabase = createClient()

  // loadStats fonksiyonunu useCallback ile optimize edelim
  const loadStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Bu hafta eklenen işletme sayısı
      const bugun = new Date()
      const haftaninIlkGunu = new Date(bugun)
      haftaninIlkGunu.setDate(bugun.getDate() - bugun.getDay()) // Pazar gününe ayarla
      haftaninIlkGunu.setHours(0, 0, 0, 0) // Günün başlangıcına ayarla

      const { data: buHaftaEklenenIsletmeler, error: isletmeError } = await supabase
        .from("isletmeler")
        .select("id")
        .gte("created_at", haftaninIlkGunu.toISOString())

      if (isletmeError) throw isletmeError

      const isletmeSayisi = buHaftaEklenenIsletmeler?.length || 0

      // Toplam işletme sayısı
      const { count: isletmeSayisiToplam, error: isletmeSayisiError } = await supabase
        .from("isletmeler")
        .select("*", { count: "exact", head: true })

      if (isletmeSayisiError) throw isletmeSayisiError

      // Son eklenen işletmeler
      const { data: sonIsletmeler, error: sonIsletmeError } = await supabase
        .from("isletmeler")
        .select("id, isletme_adi, kategori, created_at")
        .order("created_at", { ascending: false })
        .limit(5)

      if (sonIsletmeError) throw sonIsletmeError

      // Toplam ve bekleyen ödemeler
      const { data: odemeler, error: odemeError } = await supabase
        .from("musteriler")
        .select("odeme_tutari, odeme_durumu")

      if (odemeError) throw odemeError

      const toplamOdeme =
        odemeler
          ?.filter((odeme) => odeme.odeme_durumu === "odendi")
          .reduce((total, odeme) => total + (Number(odeme.odeme_tutari) || 0), 0) || 0

      const bekleyenOdeme =
        odemeler
          ?.filter((odeme) => odeme.odeme_durumu === "beklemede")
          .reduce((total, odeme) => total + (Number(odeme.odeme_tutari) || 0), 0) || 0

      // Yaklaşan biten sözleşmeler
      const today = new Date()
      const birAySonra = new Date()
      birAySonra.setMonth(birAySonra.getMonth() + 1)

      const { data: yaklasakBitenSozlesmeler, error: sozlesmeError } = await supabase
        .from("musteriler")
        .select("id, isletme_adi, yetkili_kisi, sozlesme_bitis")
        .gte("sozlesme_bitis", today.toISOString().split("T")[0])
        .lte("sozlesme_bitis", birAySonra.toISOString().split("T")[0])
        .order("sozlesme_bitis", { ascending: true })
        .limit(5)

      if (sozlesmeError) throw sozlesmeError

      // Koordinat bilgisi olan işletmeleri al
      const { data: koordinatliIsletmeler, error: koordinatError } = await supabase
        .from("isletmeler")
        .select("id, isletme_adi, kategori, sehir, koordinatlar")
        .not("koordinatlar", "is", null)
        .limit(50)

      if (koordinatError) throw koordinatError

      // Kategori dağılımını hesapla
      const { data: isletmeler, error: isletmelerError } = await supabase.from("isletmeler").select("kategori, sehir")

      if (isletmelerError) throw isletmelerError

      const kategoriDagilimi = isletmeler.reduce((acc, isletme) => {
        const kategori = isletme.kategori || "Belirtilmemiş"
        acc[kategori] = (acc[kategori] || 0) + 1
        return acc
      }, {})

      // Şehir dağılımını hesapla
      const sehirDagilimi = isletmeler.reduce((acc, isletme) => {
        const sehir = isletme.sehir || "Belirtilmemiş"
        acc[sehir] = (acc[sehir] || 0) + 1
        return acc
      }, {})

      // İstatistikleri güncelle
      setStats({
        isletmeSayisi: isletmeSayisi || 0,
        isletmeSayisiToplam: isletmeSayisiToplam || 0,
        toplamOdeme,
        bekleyenOdeme,
        sonEklenenIsletmeler: sonIsletmeler || [],
        yaklasakBitenSozlesmeler: yaklasakBitenSozlesmeler || [],
        koordinatliIsletmeler: koordinatliIsletmeler || [],
        kategoriDagilimi,
        sehirDagilimi,
      })
    } catch (error) {
      console.error("İstatistikler yüklenirken hata:", error)
      setError(error.message || "İstatistikler yüklenirken bir hata oluştu")
      toast({
        title: "Hata",
        description: "İstatistikler yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [supabase, toast])

  // useEffect hook'unu güncelleyelim
  useEffect(() => {
    loadStats()

    // Sayfa görünür olduğunda verileri yeniden yükle
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadStats()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [loadStats])

  // Tarih formatla
  const formatDate = (dateString) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadStats} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Verileri Yenile
          </Button>
          <Button asChild>
            <Link href="/admin/isletme-kayit">
              <Building className="mr-2 h-4 w-4" />
              Yeni İşletme Ekle
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Hata</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Veriler yükleniyor...</span>
        </div>
      ) : (
        <>
          {/* İstatistik Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Bu Hafta Eklenen İşletme</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.isletmeSayisi}</div>
                <p className="text-xs text-muted-foreground">Bu hafta içinde sisteme eklenen işletme sayısı</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Toplam İşletme</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.isletmeSayisiToplam}</div>
                <p className="text-xs text-muted-foreground">Sistemde kayıtlı toplam işletme sayısı</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Toplam Ödeme</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.toplamOdeme.toLocaleString("tr-TR")} ₺</div>
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <p className="text-xs text-green-500">Tamamlanan ödemeler</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Bekleyen Ödeme</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.bekleyenOdeme.toLocaleString("tr-TR")} ₺</div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-amber-500 mr-1" />
                  <p className="text-xs text-amber-500">Bekleyen ödemeler</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="isletmeler" className="space-y-4">
            <TabsList>
              <TabsTrigger value="isletmeler">Son Eklenen İşletmeler</TabsTrigger>
              <TabsTrigger value="harita">İşletme Haritası</TabsTrigger>
              <TabsTrigger value="sozlesmeler">Yaklaşan Sözleşme Bitişleri</TabsTrigger>
            </TabsList>

            <TabsContent value="isletmeler">
              <Card>
                <CardHeader>
                  <CardTitle>Son Eklenen İşletmeler</CardTitle>
                  <CardDescription>Sisteme son eklenen 5 işletme</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.sonEklenenIsletmeler.length > 0 ? (
                    <div className="space-y-4">
                      {stats.sonEklenenIsletmeler.map((isletme) => (
                        <div key={isletme.id} className="flex items-center justify-between border-b pb-2">
                          <div>
                            <h3 className="font-medium">{isletme.isletme_adi}</h3>
                            <p className="text-sm text-muted-foreground">
                              {isletme.kategori || "Kategori belirtilmemiş"}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <p className="text-sm text-muted-foreground mr-4">{formatDate(isletme.created_at)}</p>
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/isletme/${isletme.id}`}>
                                <ArrowRight className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">Henüz işletme bulunmuyor</p>
                  )}
                  <div className="mt-4 text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/admin/isletme-listesi">
                        Tüm İşletmeleri Görüntüle
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="harita">
              {/* İşletme Haritası bileşenini ekleyelim */}
              <IsletmeHaritasi isletmeler={stats.koordinatliIsletmeler} />
            </TabsContent>

            <TabsContent value="sozlesmeler">
              <Card>
                <CardHeader>
                  <CardTitle>Yaklaşan Sözleşme Bitişleri</CardTitle>
                  <CardDescription>Önümüzdeki 30 gün içinde sözleşmesi bitecek müşteriler</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.yaklasakBitenSozlesmeler.length > 0 ? (
                    <div className="space-y-4">
                      {stats.yaklasakBitenSozlesmeler.map((musteri) => (
                        <div key={musteri.id} className="flex items-center justify-between border-b pb-2">
                          <div>
                            <h3 className="font-medium">{musteri.isletme_adi}</h3>
                            <p className="text-sm text-muted-foreground">
                              {musteri.yetkili_kisi || "Yetkili belirtilmemiş"}
                            </p>
                          </div>
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-red-600 mr-4">
                              {formatDate(musteri.sozlesme_bitis)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center py-4 text-muted-foreground">Yaklaşan sözleşme bitişi bulunmuyor</p>
                  )}
                  <div className="mt-4 text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/admin/musteri-yonetimi">
                        Tüm Müşterileri Görüntüle
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Hızlı Erişim Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">İşletme Yönetimi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  İşletme kayıtlarını yönetin, yeni işletmeler ekleyin ve düzenleyin.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/admin/isletme-listesi">
                      <Building className="mr-2 h-4 w-4" />
                      İşletme Listesi
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/admin/isletme-kayit">
                      <MapPin className="mr-2 h-4 w-4" />
                      Yeni İşletme Ekle
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Ödeme Yönetimi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  İşletme ödemelerini yönetin, ödemeleri takip edin ve sözleşmeleri düzenleyin.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/admin/musteri-yonetimi">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Ödeme Listesi
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/admin/musteri-yonetimi">
                      <Calendar className="mr-2 h-4 w-4" />
                      Sözleşme Takibi
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Raporlar</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Sistem istatistiklerini görüntüleyin ve detaylı raporlar alın.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href="/admin/raporlar">
                      <BarChart className="mr-2 h-4 w-4" />
                      Detaylı Raporlar
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
      {/* Return kısmına Kategori ve Şehir Dağılımı bileşenlerini ekleyelim */}
      {/* Tabs bileşeninden sonra aşağıdaki kodu ekleyin: */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <KategoriDagilimi kategoriler={stats.kategoriDagilimi} />
        <SehirDagilimi sehirler={stats.sehirDagilimi} />
      </div>
    </div>
  )
}
