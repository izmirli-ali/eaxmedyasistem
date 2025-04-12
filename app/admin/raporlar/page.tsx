"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Download, Calendar, DollarSign, Users, Building, TrendingUp, TrendingDown } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns"
import { tr } from "date-fns/locale"

export default function Raporlar() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [isletmeler, setIsletmeler] = useState([])
  const [musteriler, setMusteriler] = useState([])
  const [selectedPeriod, setSelectedPeriod] = useState("bu-ay")
  const [stats, setStats] = useState({
    toplamIsletme: 0,
    yeniIsletme: 0,
    toplamMusteri: 0,
    yeniMusteri: 0,
    toplamOdeme: 0,
    bekleyenOdeme: 0,
    bitenSozlesmeler: 0,
  })

  // Supabase istemcisini oluştur
  const supabase = createClient()

  // Verileri yükle
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // İşletmeleri çek
        const { data: isletmeData, error: isletmeError } = await supabase
          .from("isletmeler")
          .select("*")
          .order("created_at", { ascending: false })

        if (isletmeError) throw isletmeError

        // Müşterileri çek
        const { data: musteriData, error: musteriError } = await supabase
          .from("musteriler")
          .select("*")
          .order("created_at", { ascending: false })

        if (musteriError) throw musteriError

        setIsletmeler(isletmeData || [])
        setMusteriler(musteriData || [])

        // İstatistikleri hesapla
        calculateStats(isletmeData || [], musteriData || [], selectedPeriod)
      } catch (error) {
        console.error("Veriler yüklenirken hata:", error)
        toast({
          title: "Hata",
          description: "Veriler yüklenirken bir hata oluştu.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [supabase, toast])

  // Periyot değiştiğinde istatistikleri güncelle
  useEffect(() => {
    calculateStats(isletmeler, musteriler, selectedPeriod)
  }, [selectedPeriod, isletmeler, musteriler])

  // İstatistikleri hesapla
  const calculateStats = (isletmeData, musteriData, period) => {
    // Tarih aralığını belirle
    const now = new Date()
    let startDate, endDate

    switch (period) {
      case "bu-ay":
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
        break
      case "son-3-ay":
        startDate = startOfMonth(subMonths(now, 2))
        endDate = endOfMonth(now)
        break
      case "son-6-ay":
        startDate = startOfMonth(subMonths(now, 5))
        endDate = endOfMonth(now)
        break
      case "son-1-yil":
        startDate = startOfMonth(subMonths(now, 11))
        endDate = endOfMonth(now)
        break
      default:
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
    }

    // Yeni işletmeler
    const yeniIsletmeler = isletmeData.filter((isletme) => {
      const createdAt = parseISO(isletme.created_at)
      return isWithinInterval(createdAt, { start: startDate, end: endDate })
    })

    // Yeni müşteriler
    const yeniMusteriler = musteriData.filter((musteri) => {
      const createdAt = parseISO(musteri.created_at)
      return isWithinInterval(createdAt, { start: startDate, end: endDate })
    })

    // Toplam ödemeler
    const toplamOdeme = musteriData
      .filter((musteri) => musteri.odeme_durumu === "odendi")
      .reduce((total, musteri) => total + (Number(musteri.odeme_tutari) || 0), 0)

    // Bekleyen ödemeler
    const bekleyenOdeme = musteriData
      .filter((musteri) => musteri.odeme_durumu === "beklemede")
      .reduce((total, musteri) => total + (Number(musteri.odeme_tutari) || 0), 0)

    // Biten sözleşmeler
    const bitenSozlesmeler = musteriData.filter((musteri) => {
      if (!musteri.sozlesme_bitis) return false
      const bitisTarihi = parseISO(musteri.sozlesme_bitis)
      return isWithinInterval(bitisTarihi, { start: startDate, end: endDate })
    }).length

    setStats({
      toplamIsletme: isletmeData.length,
      yeniIsletme: yeniIsletmeler.length,
      toplamMusteri: musteriData.length,
      yeniMusteri: yeniMusteriler.length,
      toplamOdeme,
      bekleyenOdeme,
      bitenSozlesmeler,
    })
  }

  // Rapor indir
  const handleDownloadReport = () => {
    try {
      // Rapor verilerini oluştur
      const reportData = {
        tarih: format(new Date(), "dd MMMM yyyy, HH:mm", { locale: tr }),
        donem: selectedPeriod,
        istatistikler: stats,
        isletmeler: isletmeler.map((isletme) => ({
          id: isletme.id,
          isletme_adi: isletme.isletme_adi,
          sehir: isletme.sehir,
          kategori: isletme.kategori,
          created_at: isletme.created_at,
        })),
        musteriler: musteriler.map((musteri) => ({
          id: musteri.id,
          isletme_adi: musteri.isletme_adi,
          yetkili_kisi: musteri.yetkili_kisi,
          sehir: musteri.sehir,
          odeme_durumu: musteri.odeme_durumu,
          odeme_tutari: musteri.odeme_tutari,
          sozlesme_bitis: musteri.sozlesme_bitis,
        })),
      }

      // JSON dosyası olarak indir
      const dataStr = JSON.stringify(reportData, null, 2)
      const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
      const exportFileDefaultName = `rapor-${format(new Date(), "yyyy-MM-dd")}.json`

      const linkElement = document.createElement("a")
      linkElement.setAttribute("href", dataUri)
      linkElement.setAttribute("download", exportFileDefaultName)
      linkElement.click()

      toast({
        title: "Rapor İndirildi",
        description: "Rapor başarıyla indirildi.",
      })
    } catch (error) {
      console.error("Rapor indirilirken hata:", error)
      toast({
        title: "Hata",
        description: "Rapor indirilirken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Raporlar</h1>
        <div className="flex items-center space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Dönem seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bu-ay">Bu Ay</SelectItem>
              <SelectItem value="son-3-ay">Son 3 Ay</SelectItem>
              <SelectItem value="son-6-ay">Son 6 Ay</SelectItem>
              <SelectItem value="son-1-yil">Son 1 Yıl</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleDownloadReport} disabled={loading}>
            <Download className="mr-2 h-4 w-4" />
            Rapor İndir
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Veriler yükleniyor...</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Toplam İşletme</CardTitle>
                <Building className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.toplamIsletme}</div>
                <p className="text-xs text-muted-foreground">Bu dönemde {stats.yeniIsletme} yeni işletme eklendi</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Toplam Ödeme Yapan İşletme</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.toplamMusteri}</div>
                <p className="text-xs text-muted-foreground">
                  Bu dönemde {stats.yeniMusteri} yeni ödeme yapan işletme eklendi
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Toplam Ödeme</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
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
                  <TrendingDown className="h-4 w-4 text-amber-500 mr-1" />
                  <p className="text-xs text-amber-500">{stats.bitenSozlesmeler} sözleşme bu dönemde bitiyor</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="isletmeler">
            <TabsList>
              <TabsTrigger value="isletmeler">İşletmeler</TabsTrigger>
              <TabsTrigger value="musteriler">Ödemeler</TabsTrigger>
              <TabsTrigger value="odemeler">Ödemeler</TabsTrigger>
            </TabsList>

            <TabsContent value="isletmeler">
              <Card>
                <CardHeader>
                  <CardTitle>İşletme İstatistikleri</CardTitle>
                  <CardDescription>Sistemde kayıtlı işletmelerin istatistikleri</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Kategori Dağılımı</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Object.entries(
                          isletmeler.reduce((acc, isletme) => {
                            const kategori = isletme.kategori || "Belirtilmemiş"
                            acc[kategori] = (acc[kategori] || 0) + 1
                            return acc
                          }, {}),
                        )
                          .sort((a, b) => b[1] - a[1])
                          .map(([kategori, sayi]) => (
                            <Card key={kategori} className="p-4">
                              <div className="font-medium">{kategori}</div>
                              <div className="text-2xl font-bold">{sayi}</div>
                            </Card>
                          ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Şehir Dağılımı</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Object.entries(
                          isletmeler.reduce((acc, isletme) => {
                            const sehir = isletme.sehir || "Belirtilmemiş"
                            acc[sehir] = (acc[sehir] || 0) + 1
                            return acc
                          }, {}),
                        )
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 8)
                          .map(([sehir, sayi]) => (
                            <Card key={sehir} className="p-4">
                              <div className="font-medium">{sehir}</div>
                              <div className="text-2xl font-bold">{sayi}</div>
                            </Card>
                          ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="musteriler">
              <Card>
                <CardHeader>
                  <CardTitle>Ödeme İstatistikleri</CardTitle>
                  <CardDescription>Sistemde kayıtlı işletme ödemelerinin istatistikleri</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Ödeme Durumu Dağılımı</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(
                          musteriler.reduce((acc, musteri) => {
                            const durum = musteri.odeme_durumu || "Belirtilmemiş"
                            acc[durum] = (acc[durum] || 0) + 1
                            return acc
                          }, {}),
                        ).map(([durum, sayi]) => (
                          <Card key={durum} className="p-4">
                            <div className="font-medium">
                              {durum === "odendi"
                                ? "Ödendi"
                                : durum === "beklemede"
                                  ? "Beklemede"
                                  : durum === "iptal"
                                    ? "İptal"
                                    : durum}
                            </div>
                            <div className="text-2xl font-bold">{sayi}</div>
                          </Card>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Şehir Dağılımı</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {Object.entries(
                          musteriler.reduce((acc, musteri) => {
                            const sehir = musteri.sehir || "Belirtilmemiş"
                            acc[sehir] = (acc[sehir] || 0) + 1
                            return acc
                          }, {}),
                        )
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 8)
                          .map(([sehir, sayi]) => (
                            <Card key={sehir} className="p-4">
                              <div className="font-medium">{sehir}</div>
                              <div className="text-2xl font-bold">{sayi}</div>
                            </Card>
                          ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="odemeler">
              <Card>
                <CardHeader>
                  <CardTitle>Ödeme İstatistikleri</CardTitle>
                  <CardDescription>Sistemde kayıtlı ödemelerin istatistikleri</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Ödeme Durumu</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="p-4 bg-green-50 border-green-200">
                          <div className="font-medium text-green-800">Tamamlanan Ödemeler</div>
                          <div className="text-2xl font-bold text-green-700">
                            {stats.toplamOdeme.toLocaleString("tr-TR")} ₺
                          </div>
                          <div className="text-sm text-green-600 mt-1">
                            {musteriler.filter((m) => m.odeme_durumu === "odendi").length} müşteri
                          </div>
                        </Card>

                        <Card className="p-4 bg-amber-50 border-amber-200">
                          <div className="font-medium text-amber-800">Bekleyen Ödemeler</div>
                          <div className="text-2xl font-bold text-amber-700">
                            {stats.bekleyenOdeme.toLocaleString("tr-TR")} ₺
                          </div>
                          <div className="text-sm text-amber-600 mt-1">
                            {musteriler.filter((m) => m.odeme_durumu === "beklemede").length} müşteri
                          </div>
                        </Card>

                        <Card className="p-4 bg-red-50 border-red-200">
                          <div className="font-medium text-red-800">İptal Edilen Ödemeler</div>
                          <div className="text-2xl font-bold text-red-700">
                            {musteriler
                              .filter((m) => m.odeme_durumu === "iptal")
                              .reduce((total, m) => total + (Number(m.odeme_tutari) || 0), 0)
                              .toLocaleString("tr-TR")}{" "}
                            ₺
                          </div>
                          <div className="text-sm text-red-600 mt-1">
                            {musteriler.filter((m) => m.odeme_durumu === "iptal").length} müşteri
                          </div>
                        </Card>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Sözleşme Durumu</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="p-4">
                          <div className="font-medium">Aktif Sözleşmeler</div>
                          <div className="text-2xl font-bold">
                            {
                              musteriler.filter((m) => {
                                if (!m.sozlesme_bitis) return false
                                return new Date(m.sozlesme_bitis) > new Date()
                              }).length
                            }
                          </div>
                        </Card>

                        <Card className="p-4">
                          <div className="font-medium">Sona Eren Sözleşmeler</div>
                          <div className="text-2xl font-bold">
                            {
                              musteriler.filter((m) => {
                                if (!m.sozlesme_bitis) return false
                                return new Date(m.sozlesme_bitis) <= new Date()
                              }).length
                            }
                          </div>
                        </Card>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
