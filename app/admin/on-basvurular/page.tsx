"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, RefreshCw, Eye, CheckCircle, XCircle, Clock } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export default function OnBasvurularPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [basvurular, setBasvurular] = useState([])
  const [selectedBasvuru, setSelectedBasvuru] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [durum, setDurum] = useState("yeni")
  const [notlar, setNotlar] = useState("")
  const [savingStatus, setSavingStatus] = useState(false)

  // Supabase istemcisini oluştur
  const supabase = createClient()

  // Başvuruları yükle
  const loadBasvurular = async () => {
    try {
      setLoading(true)

      const { data, error } = await supabase
        .from("on_basvurular")
        .select("*")
        .order("basvuru_tarihi", { ascending: false })

      if (error) throw error

      setBasvurular(data || [])
    } catch (error) {
      console.error("Başvurular yüklenirken hata:", error)
      toast({
        title: "Hata",
        description: "Başvurular yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Sayfa yüklendiğinde başvuruları getir
  useEffect(() => {
    loadBasvurular()
  }, [])

  // Başvuru detaylarını göster
  const showDetails = (basvuru) => {
    setSelectedBasvuru(basvuru)
    setDurum(basvuru.durum)
    setNotlar(basvuru.notlar || "")
    setIsDetailsOpen(true)
  }

  // Başvuru durumunu güncelle
  const updateBasvuruStatus = async () => {
    if (!selectedBasvuru) return

    try {
      setSavingStatus(true)

      const { error } = await supabase
        .from("on_basvurular")
        .update({
          durum,
          notlar,
          updated_at: new Date().toISOString(),
          atanan_kullanici: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq("id", selectedBasvuru.id)

      if (error) throw error

      toast({
        title: "Başarılı",
        description: "Başvuru durumu güncellendi.",
      })

      // Başvuruları yeniden yükle
      loadBasvurular()
      setIsDetailsOpen(false)
    } catch (error) {
      console.error("Başvuru durumu güncellenirken hata:", error)
      toast({
        title: "Hata",
        description: "Başvuru durumu güncellenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setSavingStatus(false)
    }
  }

  // Durum badge'i
  const getDurumBadge = (durum) => {
    switch (durum) {
      case "yeni":
        return <Badge className="bg-blue-100 text-blue-800">Yeni</Badge>
      case "inceleniyor":
        return <Badge className="bg-yellow-100 text-yellow-800">İnceleniyor</Badge>
      case "onaylandi":
        return <Badge className="bg-green-100 text-green-800">Onaylandı</Badge>
      case "reddedildi":
        return <Badge className="bg-red-100 text-red-800">Reddedildi</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{durum}</Badge>
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Ön Başvurular</h1>
        <Button variant="outline" onClick={loadBasvurular} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Yenile
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Başvuru Listesi</CardTitle>
          <CardDescription>Sisteme gelen ön başvuruları görüntüleyin ve yönetin.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Başvuru Tarihi</TableHead>
                    <TableHead>İşletme Adı</TableHead>
                    <TableHead>Yetkili</TableHead>
                    <TableHead>Paket Tipi</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {basvurular.length > 0 ? (
                    basvurular.map((basvuru) => (
                      <TableRow key={basvuru.id}>
                        <TableCell>
                          {format(new Date(basvuru.basvuru_tarihi), "dd MMMM yyyy HH:mm", { locale: tr })}
                        </TableCell>
                        <TableCell className="font-medium">{basvuru.isletme_adi}</TableCell>
                        <TableCell>{basvuru.yetkili_adi}</TableCell>
                        <TableCell>{basvuru.paket_tipi}</TableCell>
                        <TableCell>{getDurumBadge(basvuru.durum)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm" onClick={() => showDetails(basvuru)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Detaylar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        Henüz başvuru bulunmuyor
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Başvuru Detayları Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Başvuru Detayları</DialogTitle>
            <DialogDescription>Başvuru bilgilerini görüntüleyin ve durumunu güncelleyin.</DialogDescription>
          </DialogHeader>

          {selectedBasvuru && (
            <Tabs defaultValue="detaylar" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="detaylar">Başvuru Detayları</TabsTrigger>
                <TabsTrigger value="durum">Durum Güncelleme</TabsTrigger>
              </TabsList>

              <TabsContent value="detaylar" className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-medium mb-4">İşletme Bilgileri</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500">İşletme Adı</p>
                        <p>{selectedBasvuru.isletme_adi}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">İşletme Türü</p>
                        <p>{selectedBasvuru.isletme_turu || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">İşletme Adresi</p>
                        <p>{selectedBasvuru.isletme_adresi || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">İşletme Telefonu</p>
                        <p>{selectedBasvuru.isletme_telefonu || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">İşletme E-posta</p>
                        <p>{selectedBasvuru.isletme_email || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">İşletme Web Sitesi</p>
                        <p>
                          {selectedBasvuru.isletme_website ? (
                            <a
                              href={selectedBasvuru.isletme_website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {selectedBasvuru.isletme_website}
                            </a>
                          ) : (
                            "-"
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-4">Yetkili Kişi Bilgileri</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Yetkili Adı Soyadı</p>
                        <p>{selectedBasvuru.yetkili_adi}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Yetkili Telefonu</p>
                        <p>
                          <a href={`tel:${selectedBasvuru.yetkili_telefonu}`} className="text-blue-600 hover:underline">
                            {selectedBasvuru.yetkili_telefonu}
                          </a>
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Yetkili E-posta</p>
                        <p>
                          {selectedBasvuru.yetkili_email ? (
                            <a
                              href={`mailto:${selectedBasvuru.yetkili_email}`}
                              className="text-blue-600 hover:underline"
                            >
                              {selectedBasvuru.yetkili_email}
                            </a>
                          ) : (
                            "-"
                          )}
                        </p>
                      </div>
                    </div>

                    <h3 className="text-lg font-medium mt-6 mb-4">Başvuru Bilgileri</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Paket Tipi</p>
                        <p>{selectedBasvuru.paket_tipi}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Başvuru Tarihi</p>
                        <p>
                          {format(new Date(selectedBasvuru.basvuru_tarihi), "dd MMMM yyyy HH:mm", {
                            locale: tr,
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Durum</p>
                        <p>{getDurumBadge(selectedBasvuru.durum)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedBasvuru.ek_bilgiler && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Ek Bilgiler / Notlar</h3>
                    <div className="p-4 bg-gray-50 rounded-md">
                      <p className="whitespace-pre-line">{selectedBasvuru.ek_bilgiler}</p>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="durum" className="space-y-4 py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Başvuru Durumu</label>
                    <Select value={durum} onValueChange={setDurum}>
                      <SelectTrigger>
                        <SelectValue placeholder="Durum seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yeni">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-blue-500" />
                            Yeni
                          </div>
                        </SelectItem>
                        <SelectItem value="inceleniyor">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                            İnceleniyor
                          </div>
                        </SelectItem>
                        <SelectItem value="onaylandi">
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                            Onaylandı
                          </div>
                        </SelectItem>
                        <SelectItem value="reddedildi">
                          <div className="flex items-center">
                            <XCircle className="h-4 w-4 mr-2 text-red-500" />
                            Reddedildi
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Notlar</label>
                    <Textarea
                      value={notlar}
                      onChange={(e) => setNotlar(e.target.value)}
                      placeholder="Başvuru ile ilgili notlarınızı buraya ekleyin..."
                      rows={5}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Kapat
            </Button>
            <Button onClick={updateBasvuruStatus} disabled={savingStatus}>
              {savingStatus ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                "Durumu Güncelle"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
