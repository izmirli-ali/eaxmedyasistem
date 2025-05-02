"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Building,
  CreditCard,
  TrendingUp,
  Calendar,
  ArrowRight,
  BarChart,
  MapPin,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { IsletmeHaritasi } from "@/components/dashboard/isletme-haritasi"
import { KategoriDagilimi } from "@/components/dashboard/kategori-dagilimi"
import { SehirDagilimi } from "@/components/dashboard/sehir-dagilimi"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"

export default function DashboardPage() {
  const [stats, setStats] = useState({
    isletmeSayisi: 0,
    isletmeSayisiToplam: 0,
    toplamOdeme: 0,
    bekleyenOdeme: 0,
    sonEklenenIsletmeler: [],
    yaklasakBitenSozlesmeler: [],
    koordinatliIsletmeler: [],
    kategoriDagilimi: [],
    sehirDagilimi: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  // Varsayılan sekmeyi "harita" olarak değiştirdik
  const [activeTab, setActiveTab] = useState("harita")

  // Diğer kodlar aynı kalacak...

  // Supabase istemcisini useMemo ile optimize edelim
  const supabase = useMemo(() => createClient(), [])

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

  // Skeleton yükleyici bileşeni
  const StatCardSkeleton = () => (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  )

  // Veri yükleme fonksiyonlarını ayrı ayrı tanımlayalım
  const loadBasicStats = useCallback(async () => {
    try {
      // Bu hafta eklenen işletme sayısı ve toplam işletme sayısı
      const bugun = new Date()
      const haftaninIlkGunu = new Date(bugun)
      haftaninIlkGunu.setDate(bugun.getDate() - bugun.getDay())
      haftaninIlkGunu.setHours(0, 0, 0, 0)

      const [buHaftaEklenenResult, toplamIsletmeResult] = await Promise.all([
        supabase.from("isletmeler2").select("id").gte("created_at", haftaninIlkGunu.toISOString()),
        supabase.from("isletmeler2").select("*", { count: "exact", head: true }),
      ])

      return {
        isletmeSayisi: buHaftaEklenenResult.data?.length || 0,
        isletmeSayisiToplam: toplamIsletmeResult.count || 0,
      }
    } catch (error) {
      console.error("Temel istatistikler yüklenirken hata:", error)
      throw error
    }
  }, [supabase])

  const loadPaymentStats = useCallback(async () => {
    try {
      const { data: odemeler, error } = await supabase.from("musteriler").select("odeme_tutari, odeme_durumu")

      if (error) throw error

      const toplamOdeme =
        odemeler
          ?.filter((odeme) => odeme.odeme_durumu === "odendi")
          .reduce((total, odeme) => total + (Number(odeme.odeme_tutari) || 0), 0) || 0

      const bekleyenOdeme =
        odemeler
          ?.filter((odeme) => odeme.odeme_durumu === "beklemede")
          .reduce((total, odeme) => total + (Number(odeme.odeme_tutari) || 0), 0) || 0

      return { toplamOdeme, bekleyenOdeme }
    } catch (error) {
      console.error("Ödeme istatistikleri yüklenirken hata:", error)
      throw error
    }
  }, [supabase])

  const loadRecentBusinesses = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("isletmeler2")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Son eklenen işletmeler yüklenirken hata:", error)
      throw error
    }
  }, [supabase])

  const loadUpcomingContracts = useCallback(async () => {
    try {
      const otuzGunSonra = new Date()
      otuzGunSonra.setDate(otuzGunSonra.getDate() + 30)

      const { data, error } = await supabase
        .from("musteriler")
        .select("id, isletme_adi, yetkili_kisi, sozlesme_bitis")
        .lte("sozlesme_bitis", otuzGunSonra.toISOString())
        .order("sozlesme_bitis", { ascending: true })
        .limit(5)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error("Yaklaşan sözleşme bitişleri yüklenirken hata:", error)
      throw error
    }
  }, [supabase])

  const loadMapData = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("isletmeler2")
        .select("id, isletme_adi, koordinatlar")
        .not("koordinatlar", "is", null)

      if (error) throw error

      // Transform the data to include latitude and longitude for the map component
      const transformedData =
        data
          ?.map((item) => {
            // koordinatlar might be in format "lat,lng" or stored as a string
            let latitude = null
            let longitude = null

            if (item.koordinatlar) {
              const coords = item.koordinatlar.split(",")
              if (coords.length === 2) {
                latitude = Number.parseFloat(coords[0].trim())
                longitude = Number.parseFloat(coords[1].trim())
              }
            }

            return {
              ...item,
              latitude,
              longitude,
            }
          })
          .filter((item) => item.latitude && item.longitude) || []

      return transformedData
    } catch (error) {
      console.error("Harita verisi yüklenirken hata:", error)
      throw error
    }
  }, [supabase])

  const loadDistributionData = useCallback(async () => {
    try {
      const [kategoriResult, sehirResult] = await Promise.all([
        supabase.from("isletmeler2").select("kategori").not("kategori", "is", null),
        supabase.from("isletmeler2").select("sehir").not("sehir", "is", null),
      ])

      if (kategoriResult.error) throw kategoriResult.error
      if (sehirResult.error) throw sehirResult.error

      const kategoriDagilimi = kategoriResult.data?.reduce((acc, curr) => {
        const kategori = curr.kategori || "Belirtilmemiş"
        acc[kategori] = (acc[kategori] || 0) + 1
        return acc
      }, {})

      const sehirDagilimi = sehirResult.data?.reduce((acc, curr) => {
        const sehir = curr.sehir || "Belirtilmemiş"
        acc[sehir] = (acc[sehir] || 0) + 1
        return acc
      }, {})

      return { kategoriDagilimi, sehirDagilimi }
    } catch (error) {
      console.error("Dağılım verileri yüklenirken hata:", error)
      throw error
    }
  }, [supabase])

  // Ana loadStats fonksiyonu
  const loadStats = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Tüm veri yükleme işlemlerini paralel olarak çalıştır
      const [basicStats, paymentStats, recentBusinesses, upcomingContracts, mapData, distributionData] =
        await Promise.all([
          loadBasicStats(),
          loadPaymentStats(),
          loadRecentBusinesses(),
          loadUpcomingContracts(),
          loadMapData(),
          loadDistributionData(),
        ])

      // Tüm verileri birleştir
      setStats({
        ...basicStats,
        ...paymentStats,
        sonEklenenIsletmeler: recentBusinesses,
        yaklasakBitenSozlesmeler: upcomingContracts,
        koordinatliIsletmeler: mapData,
        ...distributionData,
      })
    } catch (error) {
      console.error("İstatistikler yüklenirken hata:", error)
      setError(error.message || "İstatistikler yüklenirken bir hata oluştu")
    } finally {
      setLoading(false)
    }
  }, [loadBasicStats, loadPaymentStats, loadRecentBusinesses, loadUpcomingContracts, loadMapData, loadDistributionData])

  useEffect(() => {
    loadStats()
  }, [loadStats])

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

      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="harita">İşletme Haritası</TabsTrigger>
          <TabsTrigger value="isletmeler">Son Eklenen İşletmeler</TabsTrigger>
          <TabsTrigger value="sozlesmeler">Yaklaşan Sözleşme Bitişleri</TabsTrigger>
        </TabsList>

        <TabsContent value="harita">
          {/* İşletme Haritası bileşeni */}
          {loading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <div className="w-full h-[400px] bg-gray-100 animate-pulse rounded-md"></div>
              </CardContent>
            </Card>
          ) : (
            <IsletmeHaritasi isletmeler={stats.koordinatliIsletmeler} />
          )}
        </TabsContent>

        <TabsContent value="isletmeler">
          <Card>
            <CardHeader>
              <CardTitle>Son Eklenen İşletmeler</CardTitle>
              <CardDescription>Sisteme son eklenen 5 işletme</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="flex items-center justify-between border-b pb-2">
                        <div>
                          <Skeleton className="h-5 w-40 mb-2" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <div className="flex items-center">
                          <Skeleton className="h-4 w-24 mr-4" />
                          <Skeleton className="h-8 w-8 rounded-md" />
                        </div>
                      </div>
                    ))}
                </div>
              ) : stats.sonEklenenIsletmeler.length > 0 ? (
                <div className="space-y-4">
                  {stats.sonEklenenIsletmeler.map((isletme) => (
                    <div key={isletme.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <h3 className="font-medium">{isletme.isletme_adi}</h3>
                        <p className="text-sm text-muted-foreground">{isletme.kategori || "Kategori belirtilmemiş"}</p>
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

        <TabsContent value="sozlesmeler">
          <Card>
            <CardHeader>
              <CardTitle>Yaklaşan Sözleşme Bitişleri</CardTitle>
              <CardDescription>Önümüzdeki 30 gün içinde sözleşmesi bitecek müşteriler</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="flex items-center justify-between border-b pb-2">
                        <div>
                          <Skeleton className="h-5 w-40 mb-2" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <div>
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </div>
                    ))}
                </div>
              ) : stats.yaklasakBitenSozlesmeler.length > 0 ? (
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
                        <p className="text-sm font-medium text-red-600 mr-4">{formatDate(musteri.sozlesme_bitis)}</p>
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

      {/* Kategori ve Şehir Dağılımı */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {loading ? (
          <>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-56" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array(8)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="p-4 border rounded-md">
                        <Skeleton className="h-4 w-16 mb-2" />
                        <Skeleton className="h-6 w-8" />
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-56" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array(8)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="p-4 border rounded-md">
                        <Skeleton className="h-4 w-16 mb-2" />
                        <Skeleton className="h-6 w-8" />
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <KategoriDagilimi kategoriler={stats.kategoriDagilimi} />
            <SehirDagilimi sehirler={stats.sehirDagilimi} />
          </>
        )}
      </div>

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
            <CardTitle className="text-lg">Ayarlar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Sistem ayarlarını yapılandırın ve yedekleme işlemlerini yönetin.
            </p>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/ayarlar">
                  <BarChart className="mr-2 h-4 w-4" />
                  Site Ayarları
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
