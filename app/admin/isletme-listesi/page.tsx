"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Search, Edit, Trash2, Eye, Plus, RefreshCw, AlertCircle, Download, QrCode } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import Link from "next/link"
import QRCode from "qrcode"

export default function IsletmeListesiPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [isletmeler, setIsletmeler] = useState([])
  const [filteredIsletmeler, setFilteredIsletmeler] = useState([])
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "")
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("kategori") || "")
  const [selectedCity, setSelectedCity] = useState(searchParams.get("sehir") || "")
  const [categories, setCategories] = useState([])
  const [cities, setCities] = useState([])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedIsletme, setSelectedIsletme] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10

  // Supabase istemcisini oluştur
  const supabase = createClient()

  // fetchIsletmeler fonksiyonunu useCallback ile optimize edelim
  const fetchIsletmeler = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Kategorileri ve şehirleri çek
      const { data: kategoriData, error: kategoriError } = await supabase
        .from("isletmeler")
        .select("kategori")
        .not("kategori", "is", null)
        .order("kategori")

      if (kategoriError) throw kategoriError

      const uniqueCategories = [...new Set(kategoriData?.map((item) => item.kategori).filter(Boolean))]
      setCategories(uniqueCategories)

      const { data: sehirData, error: sehirError } = await supabase
        .from("isletmeler")
        .select("sehir")
        .not("sehir", "is", null)
        .order("sehir")

      if (sehirError) throw sehirError

      const uniqueCities = [...new Set(sehirData?.map((item) => item.sehir).filter(Boolean))]
      setCities(uniqueCities)

      // İşletmeleri çek
      let query = supabase
        .from("isletmeler")
        .select("id, isletme_adi, kategori, adres, fotograf_url, sehir, url_slug, created_at")
        .order("created_at", { ascending: false })

      // Arama filtresi
      if (searchTerm) {
        query = query.ilike("isletme_adi", `%${searchTerm}%`)
      }

      // Şehir filtresi
      if (selectedCity && selectedCity !== "all") {
        query = query.eq("sehir", selectedCity)
      }

      // Kategori filtresi
      if (selectedCategory && selectedCategory !== "all") {
        query = query.eq("kategori", selectedCategory)
      }

      const { data, error } = await query

      if (error) throw error

      setIsletmeler(data || [])

      // Pagination için toplam sayfa sayısını hesapla
      const totalItems = data?.length || 0
      setTotalPages(Math.ceil(totalItems / itemsPerPage))

      // Filtrelenmiş işletmeleri ayarla
      const startIndex = (currentPage - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      setFilteredIsletmeler(data?.slice(startIndex, endIndex) || [])
    } catch (error) {
      console.error("İşletmeler yüklenirken hata:", error.message)
      setError(error.message)
      toast({
        title: "Hata",
        description: "İşletmeler yüklenirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [searchTerm, selectedCity, selectedCategory, currentPage, supabase, toast])

  // useEffect hook'unu güncelleyelim
  useEffect(() => {
    fetchIsletmeler()

    // Sayfa görünür olduğunda verileri yeniden yükle
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchIsletmeler()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [fetchIsletmeler])

  // Sayfa değiştiğinde
  useEffect(() => {
    if (isletmeler.length > 0) {
      const startIndex = (currentPage - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      setFilteredIsletmeler(isletmeler.slice(startIndex, endIndex))
    }
  }, [currentPage, isletmeler])

  // Arama işlemi
  const handleSearch = useCallback(
    (e) => {
      e.preventDefault()
      setCurrentPage(1) // Aramada ilk sayfaya dön

      // URL parametrelerini güncelle
      const params = new URLSearchParams()
      if (searchTerm) params.append("q", searchTerm)
      if (selectedCity && selectedCity !== "all") params.append("sehir", selectedCity)
      if (selectedCategory && selectedCategory !== "all") params.append("kategori", selectedCategory)

      router.push(`/admin/isletme-listesi?${params.toString()}`)

      // Verileri yeniden yükle
    },
    [searchTerm, selectedCity, selectedCategory, router],
  )

  // İşletme silme için dialogu aç
  const openDeleteDialog = (isletme) => {
    setSelectedIsletme(isletme)
    setIsDeleteDialogOpen(true)
  }

  // İşletme sil
  const handleDeleteIsletme = async () => {
    if (!selectedIsletme) return

    try {
      setSaving(true)

      // İşletmeyi sil
      const { error } = await supabase.from("isletmeler").delete().eq("id", selectedIsletme.id)

      if (error) throw error

      toast({
        title: "Başarılı",
        description: "İşletme başarıyla silindi.",
      })

      // Seçili işletmeyi sıfırla ve dialogu kapat
      setSelectedIsletme(null)
      setIsDeleteDialogOpen(false)

      // Silme işleminden sonra tam veri yenilemesi yapalım
      fetchIsletmeler()
    } catch (error) {
      console.error("İşletme silinirken hata:", error.message)
      toast({
        title: "Hata",
        description: error.message || "İşletme silinirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

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

  // Excel'e aktar
  const exportToExcel = () => {
    // Basit CSV formatı oluştur
    const headers = ["İşletme Adı", "Kategori", "Şehir", "Adres", "Telefon", "Eklenme Tarihi"]
    const csvContent = [
      headers.join(","),
      ...isletmeler.map((isletme) =>
        [
          `"${isletme.isletme_adi || ""}"`,
          `"${isletme.kategori || ""}"`,
          `"${isletme.sehir || ""}"`,
          `"${isletme.adres || ""}"`,
          `"${isletme.telefon || ""}"`,
          `"${formatDate(isletme.created_at)}"`,
        ].join(","),
      ),
    ].join("\n")

    // CSV dosyasını indir
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `isletme-listesi-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // QR kod oluşturma ve indirme fonksiyonu
  const generateAndDownloadQRCode = async (isletme) => {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://isletmenionecikar.com"
    const googleMapsRedirectUrl = `${baseUrl}/api/google-maps-redirect?id=${isletme.id}`

    try {
      const qrCodeDataUrl = await QRCode.toDataURL(googleMapsRedirectUrl, {
        errorCorrectionLevel: "H",
        margin: 2,
        width: 256,
        color: {
          dark: "#000",
          light: "#fff",
        },
      })

      // İndirme bağlantısı oluştur
      const downloadLink = document.createElement("a")
      downloadLink.href = qrCodeDataUrl
      downloadLink.download = `${isletme.isletme_adi}-qr-code.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    } catch (error) {
      console.error("QR Code oluşturulurken hata:", error)
      toast({
        title: "Hata",
        description: "QR Code oluşturulurken bir hata oluştu.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto py-6">
      {/* Başlık ve Butonlar */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">İşletme Listesi</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportToExcel} disabled={loading || isletmeler.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Excel'e Aktar
          </Button>
          <Button variant="outline" onClick={fetchIsletmeler} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Yenile
          </Button>
          <Button onClick={() => router.push("/admin/isletme-kayit")}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni İşletme Ekle
          </Button>
        </div>
      </div>

      {/* Hata Mesajı */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Hata</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filtreler */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtreler</CardTitle>
          <CardDescription>İşletmeleri filtrelemek için aşağıdaki alanları kullanın.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Arama</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="İşletme adı, adres veya telefon ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Kategori</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Tüm Kategoriler" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Kategoriler</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Şehir</Label>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger>
                  <SelectValue placeholder="Tüm Şehirler" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Şehirler</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3 flex justify-end">
              <Button type="submit" disabled={loading}>
                <Search className="mr-2 h-4 w-4" />
                Filtrele
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* İşletme Listesi */}
      <Card>
        <CardHeader>
          <CardTitle>İşletmeler</CardTitle>
          <CardDescription>
            Toplam {isletmeler.length} işletme {searchTerm || selectedCategory || selectedCity ? "(filtrelenmiş)" : ""}
          </CardDescription>
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
                    <TableHead>İşletme Adı</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Şehir</TableHead>
                    <TableHead>Eklenme Tarihi</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIsletmeler.length > 0 ? (
                    filteredIsletmeler.map((isletme) => (
                      <TableRow key={isletme.id}>
                        <TableCell className="font-medium">{isletme.isletme_adi}</TableCell>
                        <TableCell>
                          {isletme.kategori ? (
                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">{isletme.kategori}</Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>{isletme.sehir || "-"}</TableCell>
                        <TableCell>{formatDate(isletme.created_at)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/admin/isletme/${isletme.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/admin/isletme-duzenle/${isletme.id}`)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(isletme)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Link href={`/${isletme.url_slug}`} target="_blank" rel="noopener noreferrer">
                              <Button variant="secondary" size="sm">
                                Siteye Göz At
                              </Button>
                            </Link>
                            <Button variant="secondary" size="sm" onClick={() => generateAndDownloadQRCode(isletme)}>
                              <QrCode className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        {searchTerm || selectedCategory || selectedCity
                          ? "Arama kriterlerine uygun işletme bulunamadı"
                          : "Henüz işletme bulunmuyor"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination className="mt-4">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      />
                    </PaginationItem>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink onClick={() => setCurrentPage(page)} isActive={currentPage === page}>
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* İşletme Silme Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>İşletme Sil</DialogTitle>
            <DialogDescription>
              Bu işletmeyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500">
              <strong>{selectedIsletme?.isletme_adi}</strong> işletmesini silmek üzeresiniz.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              İptal
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteIsletme} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Siliniyor...
                </>
              ) : (
                "Sil"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
