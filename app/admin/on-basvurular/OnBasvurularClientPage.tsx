"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Loader2,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  AlertCircle,
  DollarSign,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

// Başvuru tipi - mevcut tabloya göre güncellendi
type Basvuru = {
  id: string
  isletme_adi: string
  kategori: string | null
  telefon: string
  email: string
  website: string | null
  adres: string | null
  sehir: string
  yetkili_adi: string
  yetkili_soyadi: string
  yetkili_telefon: string
  yetkili_email: string
  paket_turu: string
  paket_adi: string
  notlar: string | null
  durum: string
  created_at: string
  updated_at: string
  atanan_temsilci: string | null
  odeme_durumu: string
  isletme_id: string | null
}

// Başvuru durumu için renk belirleme
const getDurumBadgeColor = (durum: string) => {
  switch (durum.toLowerCase()) {
    case "beklemede":
      return "bg-blue-500"
    case "inceleniyor":
      return "bg-yellow-500"
    case "onaylandi":
    case "onaylandı":
      return "bg-green-500"
    case "reddedildi":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

// Durum değerini Türkçe'ye çevirme
const getDurumAdi = (durum: string) => {
  switch (durum.toLowerCase()) {
    case "beklemede":
      return "Beklemede"
    case "inceleniyor":
      return "İnceleniyor"
    case "onaylandi":
    case "onaylandı":
      return "Onaylandı"
    case "reddedildi":
      return "Reddedildi"
    default:
      return durum
  }
}

// Ödeme durumu için renk belirleme
const getOdemeDurumBadgeColor = (durum: string) => {
  switch (durum.toLowerCase()) {
    case "beklemede":
      return "bg-blue-500"
    case "odendi":
    case "ödendi":
      return "bg-green-500"
    case "iptal":
      return "bg-red-500"
    default:
      return "bg-gray-500"
  }
}

// Ödeme durumu değerini Türkçe'ye çevirme
const getOdemeDurumAdi = (durum: string) => {
  switch (durum.toLowerCase()) {
    case "beklemede":
      return "Beklemede"
    case "odendi":
    case "ödendi":
      return "Ödendi"
    case "iptal":
      return "İptal"
    default:
      return durum
  }
}

export function OnBasvurularClientPage() {
  const [basvurular, setBasvurular] = useState<Basvuru[]>([])
  const [filteredBasvurular, setFilteredBasvurular] = useState<Basvuru[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedBasvuru, setSelectedBasvuru] = useState<Basvuru | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [notlar, setNotlar] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [retryFetch, setRetryFetch] = useState(false)

  // Başvuruları getir
  const fetchBasvurular = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      // Toplam sayıyı al
      const { count, error: countError } = await supabase
        .from("on_basvurular")
        .select("*", { count: "exact", head: true })

      if (countError) throw countError

      setTotalCount(count || 0)

      // Sayfalanmış veriyi al
      const { data, error } = await supabase
        .from("on_basvurular")
        .select("*")
        .order("created_at", { ascending: false })
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1)

      if (error) throw error

      setBasvurular(data || [])
      setFilteredBasvurular(data || [])
    } catch (error) {
      console.error("Başvurular getirilirken hata oluştu:", error)

      // Daha açıklayıcı hata mesajları
      let errorMessage = "Başvurular yüklenirken bir sorun oluştu."

      if (error instanceof Error) {
        if (error.message.includes("network")) {
          errorMessage = "Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin."
        } else if (error.message.includes("timeout")) {
          errorMessage = "Sunucu yanıt vermiyor. Lütfen daha sonra tekrar deneyin."
        } else if (error.message.includes("permission")) {
          errorMessage = "Bu verilere erişim izniniz yok. Lütfen yönetici ile iletişime geçin."
        }
      }

      toast({
        title: "Hata",
        description: errorMessage,
        variant: "destructive",
      })

      // Yeniden deneme butonu göster
      setRetryFetch(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBasvurular()
  }, [currentPage, pageSize])

  // Filtreleme işlemi
  useEffect(() => {
    let result = basvurular

    // Arama filtresi
    if (searchTerm) {
      result = result.filter(
        (basvuru) =>
          basvuru.isletme_adi.toLowerCase().includes(searchTerm.toLowerCase()) ||
          basvuru.yetkili_adi.toLowerCase().includes(searchTerm.toLowerCase()) ||
          basvuru.yetkili_soyadi.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (basvuru.yetkili_email && basvuru.yetkili_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (basvuru.telefon && basvuru.telefon.includes(searchTerm)) ||
          (basvuru.yetkili_telefon && basvuru.yetkili_telefon.includes(searchTerm)),
      )
    }

    // Durum filtresi
    if (statusFilter !== "all") {
      result = result.filter((basvuru) => basvuru.durum === statusFilter)
    }

    setFilteredBasvurular(result)
  }, [searchTerm, statusFilter, basvurular])

  // Başvuru durumunu güncelle
  const updateBasvuruDurum = async (id: string, durum: string) => {
    try {
      setIsUpdating(true)
      const supabase = createClient()

      const { error } = await supabase
        .from("on_basvurular")
        .update({
          durum,
          notlar: notlar || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error

      // Başvuruları güncelle
      setBasvurular((prev) =>
        prev.map((basvuru) =>
          basvuru.id === id ? { ...basvuru, durum, notlar, updated_at: new Date().toISOString() } : basvuru,
        ),
      )

      toast({
        title: "Başarılı",
        description: "Başvuru durumu güncellendi.",
      })

      // Dialog'u kapat
      setIsDialogOpen(false)
      setNotlar("")
    } catch (error) {
      console.error("Başvuru durumu güncellenirken hata oluştu:", error)
      toast({
        title: "Hata",
        description: "Başvuru durumu güncellenirken bir sorun oluştu.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Ödeme durumunu güncelle
  const updateOdemeDurum = async (id: string, odeme_durumu: string) => {
    try {
      setIsUpdating(true)
      const supabase = createClient()

      const { error } = await supabase
        .from("on_basvurular")
        .update({
          odeme_durumu,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error

      // Başvuruları güncelle
      setBasvurular((prev) =>
        prev.map((basvuru) =>
          basvuru.id === id ? { ...basvuru, odeme_durumu, updated_at: new Date().toISOString() } : basvuru,
        ),
      )

      toast({
        title: "Başarılı",
        description: "Ödeme durumu güncellendi.",
      })
    } catch (error) {
      console.error("Ödeme durumu güncellenirken hata oluştu:", error)
      toast({
        title: "Hata",
        description: "Ödeme durumu güncellenirken bir sorun oluştu.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  // Başvuru detaylarını göster
  const showBasvuruDetails = (basvuru: Basvuru) => {
    setSelectedBasvuru(basvuru)
    setNotlar(basvuru.notlar || "")
    setIsDialogOpen(true)
  }

  // Bekleyen başvuru sayısı
  const bekleyenBasvuruSayisi = basvurular.filter((b) => b.durum === "beklemede").length

  return (
    <>
      <div className="p-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <CardTitle>Ön Başvurular</CardTitle>
                <CardDescription>
                  İşletme yönetim sistemine yapılan ön başvuruları görüntüleyin ve yönetin.
                </CardDescription>
              </div>
              {bekleyenBasvuruSayisi > 0 && (
                <Badge className="bg-blue-500 self-start">{bekleyenBasvuruSayisi} Bekleyen Başvuru</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="İşletme adı, yetkili adı veya e-posta ara..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Durum Filtrele" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Başvurular</SelectItem>
                    <SelectItem value="beklemede">Beklemede</SelectItem>
                    <SelectItem value="inceleniyor">İnceleniyor</SelectItem>
                    <SelectItem value="onaylandi">Onaylandı</SelectItem>
                    <SelectItem value="reddedildi">Reddedildi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : retryFetch ? (
              <div className="flex flex-col justify-center items-center py-12 space-y-4">
                <AlertCircle className="h-12 w-12 text-amber-500" />
                <p className="text-center text-gray-500">Veriler yüklenemedi.</p>
                <Button
                  onClick={() => {
                    setRetryFetch(false)
                    fetchBasvurular()
                  }}
                >
                  Yeniden Dene
                </Button>
              </div>
            ) : filteredBasvurular.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                {searchTerm || statusFilter !== "all"
                  ? "Arama kriterlerinize uygun başvuru bulunamadı."
                  : "Henüz hiç başvuru yapılmamış."}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>İşletme Adı</TableHead>
                      <TableHead>Paket</TableHead>
                      <TableHead>Yetkili</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Ödeme</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBasvurular.map((basvuru) => (
                      <TableRow key={basvuru.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{basvuru.isletme_adi}</span>
                            <span className="text-xs text-gray-500">{basvuru.kategori}</span>
                          </div>
                        </TableCell>
                        <TableCell>{basvuru.paket_adi}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{`${basvuru.yetkili_adi} ${basvuru.yetkili_soyadi}`}</span>
                            <span className="text-xs text-gray-500">{basvuru.yetkili_telefon}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {basvuru.created_at
                            ? format(new Date(basvuru.created_at), "dd MMM yyyy HH:mm", {
                                locale: tr,
                              })
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge className={getDurumBadgeColor(basvuru.durum)}>{getDurumAdi(basvuru.durum)}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getOdemeDurumBadgeColor(basvuru.odeme_durumu)}>
                            {getOdemeDurumAdi(basvuru.odeme_durumu)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Menü</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => showBasvuruDetails(basvuru)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Detayları Görüntüle
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Durum Güncelle</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedBasvuru(basvuru)
                                  setNotlar(basvuru.notlar || "")
                                  updateBasvuruDurum(basvuru.id, "inceleniyor")
                                }}
                              >
                                <Search className="mr-2 h-4 w-4" />
                                İncelemeye Al
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedBasvuru(basvuru)
                                  setNotlar(basvuru.notlar || "")
                                  updateBasvuruDurum(basvuru.id, "onaylandi")
                                }}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Onayla
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedBasvuru(basvuru)
                                  setNotlar(basvuru.notlar || "")
                                  updateBasvuruDurum(basvuru.id, "reddedildi")
                                }}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                Reddet
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Ödeme Durumu</DropdownMenuLabel>
                              <DropdownMenuItem
                                onClick={() => {
                                  updateOdemeDurum(basvuru.id, "odendi")
                                }}
                              >
                                <DollarSign className="mr-2 h-4 w-4" />
                                Ödendi Olarak İşaretle
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  updateOdemeDurum(basvuru.id, "beklemede")
                                }}
                              >
                                <AlertCircle className="mr-2 h-4 w-4" />
                                Beklemede Olarak İşaretle
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  updateOdemeDurum(basvuru.id, "iptal")
                                }}
                              >
                                <XCircle className="mr-2 h-4 w-4" />
                                İptal Olarak İşaretle
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            {!loading && filteredBasvurular.length > 0 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-500">
                  Toplam {totalCount} başvurudan {(currentPage - 1) * pageSize + 1} -{" "}
                  {Math.min(currentPage * pageSize, totalCount)} arası gösteriliyor
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Önceki
                  </Button>
                  <div className="text-sm">
                    Sayfa {currentPage} / {Math.ceil(totalCount / pageSize)}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => (prev * pageSize < totalCount ? prev + 1 : prev))}
                    disabled={currentPage * pageSize >= totalCount}
                  >
                    Sonraki
                  </Button>
                  <Select
                    value={pageSize.toString()}
                    onValueChange={(value) => {
                      setPageSize(Number(value))
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Sayfa boyutu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 adet</SelectItem>
                      <SelectItem value="10">10 adet</SelectItem>
                      <SelectItem value="25">25 adet</SelectItem>
                      <SelectItem value="50">50 adet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Başvuru Detay Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Başvuru Detayları</DialogTitle>
            <DialogDescription>{selectedBasvuru?.isletme_adi} işletmesinin başvuru bilgileri</DialogDescription>
          </DialogHeader>

          {selectedBasvuru && (
            <div className="space-y-6">
              {/* İşletme Bilgileri */}
              <div>
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5 text-blue-500" />
                  İşletme Bilgileri
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">İşletme Adı</h4>
                    <p className="font-medium">{selectedBasvuru.isletme_adi}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Kategori</h4>
                    <p>{selectedBasvuru.kategori || "-"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Telefon</h4>
                    <p>{selectedBasvuru.telefon}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">E-posta</h4>
                    <p>{selectedBasvuru.email}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Web Sitesi</h4>
                    <p>{selectedBasvuru.website || "-"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Şehir</h4>
                    <p>{selectedBasvuru.sehir}</p>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <h4 className="text-sm font-medium text-gray-500">Adres</h4>
                    <p>{selectedBasvuru.adres || "-"}</p>
                  </div>
                </div>
              </div>

              {/* Yetkili Bilgileri */}
              <div>
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5 text-green-500" />
                  Yetkili Bilgileri
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Ad Soyad</h4>
                    <p className="font-medium">{`${selectedBasvuru.yetkili_adi} ${selectedBasvuru.yetkili_soyadi}`}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Telefon</h4>
                    <p>{selectedBasvuru.yetkili_telefon}</p>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <h4 className="text-sm font-medium text-gray-500">E-posta</h4>
                    <p>{selectedBasvuru.yetkili_email}</p>
                  </div>
                </div>
              </div>

              {/* Paket ve Durum Bilgileri */}
              <div>
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5 text-purple-500" />
                  Paket ve Durum Bilgileri
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Paket Türü</h4>
                    <p className="font-medium">{selectedBasvuru.paket_turu}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Paket Adı</h4>
                    <p>{selectedBasvuru.paket_adi}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Durum</h4>
                    <Badge className={getDurumBadgeColor(selectedBasvuru.durum)}>
                      {getDurumAdi(selectedBasvuru.durum)}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Ödeme Durumu</h4>
                    <Badge className={getOdemeDurumBadgeColor(selectedBasvuru.odeme_durumu)}>
                      {getOdemeDurumAdi(selectedBasvuru.odeme_durumu)}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Başvuru Tarihi</h4>
                    <p>
                      {selectedBasvuru.created_at
                        ? format(new Date(selectedBasvuru.created_at), "dd MMMM yyyy HH:mm", {
                            locale: tr,
                          })
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Son Güncelleme</h4>
                    <p>
                      {selectedBasvuru.updated_at
                        ? format(new Date(selectedBasvuru.updated_at), "dd MMMM yyyy HH:mm", {
                            locale: tr,
                          })
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Notlar ve İşlemler */}
              <div>
                <h3 className="text-lg font-medium mb-3">Notlar ve İşlemler</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="notlar" className="block text-sm font-medium text-gray-700 mb-1">
                      Notlar
                    </label>
                    <Textarea
                      id="notlar"
                      rows={3}
                      className="w-full"
                      placeholder="Başvuru ile ilgili notlarınızı buraya ekleyebilirsiniz..."
                      value={notlar}
                      onChange={(e) => setNotlar(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isUpdating}>
                      Kapat
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-300"
                      onClick={() => updateBasvuruDurum(selectedBasvuru.id, "inceleniyor")}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          İşleniyor...
                        </>
                      ) : (
                        <>
                          <Search className="mr-2 h-4 w-4" />
                          İncelemeye Al
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-green-50 hover:bg-green-100 text-green-700 border-green-300"
                      onClick={() => updateBasvuruDurum(selectedBasvuru.id, "onaylandi")}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          İşleniyor...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Onayla
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="bg-red-50 hover:bg-red-100 text-red-700 border-red-300"
                      onClick={() => updateBasvuruDurum(selectedBasvuru.id, "reddedildi")}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          İşleniyor...
                        </>
                      ) : (
                        <>
                          <XCircle className="mr-2 h-4 w-4" />
                          Reddet
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
