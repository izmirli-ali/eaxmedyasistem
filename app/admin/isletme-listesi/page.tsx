"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { LoadingOverlay } from "@/components/ui/loading-overlay"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Building,
  Search,
  Plus,
  Edit,
  Eye,
  MapPin,
  Phone,
  Calendar,
  Star,
  Filter,
  X,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Trash2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react"
import { supabase } from "@/supabase"
import type { Business } from "@/types"

export default function IsletmeListesi() {
  const router = useRouter()
  const { toast } = useToast()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [kategoriFilter, setKategoriFilter] = useState("all")
  const [sehirFilter, setSehirFilter] = useState("all")
  const [durumFilter, setDurumFilter] = useState("all")
  const [kategoriler, setKategoriler] = useState<string[]>([])
  const [sehirler, setSehirler] = useState<string[]>([])
  const [sortField, setSortField] = useState("isletme_adi")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)

  useEffect(() => {
    fetchBusinesses()
  }, [])

  const fetchBusinesses = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("isletmeler2").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setBusinesses(data || [])

      // Kategorileri ve şehirleri çıkar
      const uniqueKategoriler = Array.from(new Set(data.map((i: Business) => i.kategori).filter(Boolean)))
      const uniqueSehirler = Array.from(new Set(data.map((i: Business) => i.sehir).filter(Boolean)))

      setKategoriler(uniqueKategoriler as string[])
      setSehirler(uniqueSehirler as string[])
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata!",
        description: "İşletme verileri alınamadı: " + error.message,
      })
      console.error("İşletme verileri alınamadı:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBusiness = async (id: string) => {
    if (!confirm("Bu işletmeyi silmek istediğinizden emin misiniz?")) return

    try {
      const { error } = await supabase.from("isletmeler2").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Başarılı!",
        description: "İşletme başarıyla silindi.",
      })

      fetchBusinesses()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata!",
        description: "İşletme silinirken hata oluştu: " + error.message,
      })
      console.error("İşletme silinirken hata oluştu:", error)
    }
  }

  const handleToggleStatus = async (business: Business) => {
    try {
      const newStatus = business.aktif ? false : true
      const { error } = await supabase.from("isletmeler2").update({ aktif: newStatus }).eq("id", business.id)

      if (error) throw error

      toast({
        title: "Başarılı!",
        description: `İşletme ${newStatus ? "aktif" : "pasif"} duruma getirildi.`,
      })

      fetchBusinesses()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata!",
        description: "İşletme durumu güncellenirken hata oluştu: " + error.message,
      })
      console.error("İşletme durumu güncellenirken hata oluştu:", error)
    }
  }

  const handleToggleFeatured = async (business: Business) => {
    try {
      const newFeatured = business.one_cikan ? false : true
      const { error } = await supabase.from("isletmeler2").update({ one_cikan: newFeatured }).eq("id", business.id)

      if (error) throw error

      toast({
        title: "Başarılı!",
        description: `İşletme ${newFeatured ? "öne çıkarıldı" : "öne çıkarılması kaldırıldı"}.`,
      })

      fetchBusinesses()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Hata!",
        description: "İşletme öne çıkarma durumu güncellenirken hata oluştu: " + error.message,
      })
      console.error("İşletme öne çıkarma durumu güncellenirken hata oluştu:", error)
    }
  }

  // Filtreleme ve sıralama
  const filteredBusinesses = businesses
    .filter((business) => {
      // Arama filtresi
      const matchesSearch =
        !searchTerm ||
        business.isletme_adi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.kategori?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.sehir?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        business.ilce?.toLowerCase().includes(searchTerm.toLowerCase())

      // Kategori filtresi
      const matchesKategori = !kategoriFilter || kategoriFilter === "all" || business.kategori === kategoriFilter

      // Şehir filtresi
      const matchesSehir = !sehirFilter || sehirFilter === "all" || business.sehir === sehirFilter

      // Durum filtresi
      const matchesDurum =
        !durumFilter ||
        durumFilter === "all" ||
        (durumFilter === "aktif" && business.aktif) ||
        (durumFilter === "pasif" && !business.aktif) ||
        (durumFilter === "one_cikan" && business.one_cikan)

      return matchesSearch && matchesKategori && matchesSehir && matchesDurum
    })
    .sort((a, b) => {
      const fieldA = a[sortField as keyof Business] || ""
      const fieldB = b[sortField as keyof Business] || ""

      if (typeof fieldA === "string" && typeof fieldB === "string") {
        return sortDirection === "asc" ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA)
      }

      return 0
    })

  // Sıralama değiştir
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Filtreleri temizle
  const handleClearFilters = () => {
    setSearchTerm("")
    setKategoriFilter("all")
    setSehirFilter("all")
    setDurumFilter("all")
  }

  // Sayfalama
  const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredBusinesses.slice(startIndex, endIndex)

  // URL slug'ı veya ID'yi al
  const getEditUrl = (business: Business) => {
    return `/admin/isletme-duzenle/${business.url_slug || business.id}`
  }

  if (loading) {
    return <LoadingOverlay message="İşletmeler yükleniyor..." />
  }

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">İşletme Listesi</h1>
          <p className="text-muted-foreground">
            Toplam {businesses.length} işletme, filtrelenmiş {filteredBusinesses.length} sonuç
          </p>
        </div>

        <Link href="/admin/isletme-kayit">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Yeni İşletme Ekle
          </Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtreler</CardTitle>
          <CardDescription>İşletmeleri filtrelemek için aşağıdaki seçenekleri kullanın.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="İşletme adı, adres veya telefon ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={kategoriFilter} onValueChange={setKategoriFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Kategori seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Kategoriler</SelectItem>
                {kategoriler.map((kategori) => (
                  <SelectItem key={kategori} value={kategori}>
                    {kategori}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sehirFilter} onValueChange={setSehirFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Şehir seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Şehirler</SelectItem>
                {sehirler.map((sehir) => (
                  <SelectItem key={sehir} value={sehir}>
                    {sehir}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={durumFilter} onValueChange={setDurumFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Durum seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="pasif">Pasif</SelectItem>
                <SelectItem value="one_cikan">Öne Çıkan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(searchTerm || kategoriFilter !== "all" || sehirFilter !== "all" || durumFilter !== "all") && (
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Aktif filtreler:{" "}
                  {[
                    searchTerm && "Arama",
                    kategoriFilter !== "all" && `Kategori: ${kategoriFilter}`,
                    sehirFilter !== "all" && `Şehir: ${sehirFilter}`,
                    durumFilter !== "all" &&
                      `Durum: ${durumFilter === "aktif" ? "Aktif" : durumFilter === "pasif" ? "Pasif" : "Öne Çıkan"}`,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </span>
              </div>

              <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                <X className="mr-2 h-4 w-4" />
                Filtreleri Temizle
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="kart" className="mb-6">
        <TabsList>
          <TabsTrigger value="tablo">Tablo Görünümü</TabsTrigger>
          <TabsTrigger value="kart">Kart Görünümü</TabsTrigger>
        </TabsList>

        <TabsContent value="tablo" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <button className="flex items-center gap-1" onClick={() => handleSort("isletme_adi")}>
                          İşletme Adı
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button className="flex items-center gap-1" onClick={() => handleSort("kategori")}>
                          Kategori
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </TableHead>
                      <TableHead>
                        <button className="flex items-center gap-1" onClick={() => handleSort("sehir")}>
                          Konum
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Öne Çıkan</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4">
                          İşletme bulunamadı
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentItems.map((business) => (
                        <TableRow key={business.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Building className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{business.isletme_adi}</p>
                                {business.one_cikan && (
                                  <div className="flex items-center gap-1 text-amber-500 text-xs">
                                    <Star className="h-3 w-3" />
                                    <span>Öne Çıkan</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{business.kategori || "-"}</TableCell>
                          <TableCell>
                            {business.sehir} {business.ilce ? `/ ${business.ilce}` : ""}
                          </TableCell>
                          <TableCell>
                            <Badge variant={business.aktif ? "success" : "destructive"}>
                              {business.aktif ? "Aktif" : "Pasif"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={business.one_cikan ? "default" : "outline"}>
                              {business.one_cikan ? "Evet" : "Hayır"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" onClick={() => handleToggleStatus(business)}>
                                {business.aktif ? "Pasif Yap" : "Aktif Yap"}
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => handleToggleFeatured(business)}>
                                {business.one_cikan ? "Öne Çıkarma" : "Öne Çıkar"}
                              </Button>
                              <Link href={getEditUrl(business)}>
                                <Button variant="outline" size="sm">
                                  Düzenle
                                </Button>
                              </Link>
                              <Button variant="destructive" size="sm" onClick={() => handleDeleteBusiness(business.id)}>
                                Sil
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                Toplam {filteredBusinesses.length} işletme, {currentPage}/{totalPages} sayfa
              </div>

              <div className="flex items-center gap-2">
                <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="Sayfa başına" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <span className="text-sm w-12 text-center">
                    {currentPage}/{totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="kart" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentItems.length > 0 ? (
              currentItems.map((business) => (
                <Card key={business.id} className="overflow-hidden h-full transition-all duration-200 hover:shadow-lg">
                  <div className="h-48 bg-muted relative">
                    {business.fotograf_url ? (
                      <img
                        src={business.fotograf_url || "/placeholder.svg"}
                        alt={business.isletme_adi}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <Building className="h-16 w-16 text-muted-foreground/30" />
                      </div>
                    )}

                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                      {business.one_cikan && (
                        <Badge variant="default" className="bg-amber-500 border-amber-500">
                          <Star className="h-3 w-3 mr-1 fill-white" />
                          Öne Çıkan
                        </Badge>
                      )}

                      <Badge variant={business.aktif ? "success" : "destructive"} className="border">
                        {business.aktif ? "Aktif" : "Pasif"}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="pt-4">
                    <h3 className="font-bold text-lg mb-2 line-clamp-1">{business.isletme_adi}</h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="line-clamp-1">{business.kategori || "-"}</span>
                        {business.alt_kategori && (
                          <span className="text-xs text-muted-foreground line-clamp-1">({business.alt_kategori})</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="line-clamp-1">
                          {business.sehir || "-"}
                          {business.ilce && `, ${business.ilce}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="line-clamp-1">{business.telefon || "-"}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="line-clamp-1">
                          {business.created_at
                            ? `Eklenme: ${new Date(business.created_at).toLocaleDateString("tr-TR")}`
                            : "Eklenme tarihi yok"}
                        </span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col gap-2 pt-0">
                    <div className="flex justify-between w-full gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => router.push(getEditUrl(business))}>
                        <Edit className="mr-2 h-4 w-4" />
                        Düzenle
                      </Button>

                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => window.open(`/isletme/${business.url_slug || business.id}`, "_blank")}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Görüntüle
                      </Button>
                    </div>

                    <div className="flex justify-between w-full gap-2">
                      <Button
                        variant={business.aktif ? "outline" : "default"}
                        size="sm"
                        className="flex-1"
                        onClick={() => handleToggleStatus(business)}
                      >
                        {business.aktif ? (
                          <>
                            <ToggleLeft className="mr-2 h-4 w-4" />
                            Pasif Yap
                          </>
                        ) : (
                          <>
                            <ToggleRight className="mr-2 h-4 w-4" />
                            Aktif Yap
                          </>
                        )}
                      </Button>

                      <Button
                        variant={business.one_cikan ? "outline" : "secondary"}
                        size="sm"
                        className="flex-1"
                        onClick={() => handleToggleFeatured(business)}
                      >
                        {business.one_cikan ? (
                          <>
                            <Star className="mr-2 h-4 w-4" />
                            Öne Çıkarma
                          </>
                        ) : (
                          <>
                            <Star className="mr-2 h-4 w-4" />
                            Öne Çıkar
                          </>
                        )}
                      </Button>
                    </div>

                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full mt-1"
                      onClick={() => handleDeleteBusiness(business.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Sil
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-muted-foreground">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Search className="h-10 w-10 text-muted-foreground/30" />
                  <h3 className="text-lg font-medium">Filtrelere uygun işletme bulunamadı</h3>
                  <p className="text-sm text-muted-foreground">Lütfen filtreleri değiştirerek tekrar deneyin.</p>
                  <Button variant="outline" size="sm" onClick={handleClearFilters} className="mt-2">
                    <X className="mr-2 h-4 w-4" />
                    Filtreleri Temizle
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 bg-muted/30 p-4 rounded-lg">
            <div className="text-sm text-muted-foreground">
              Toplam <span className="font-medium">{filteredBusinesses.length}</span> işletme,{" "}
              <span className="font-medium">{currentPage}</span>/<span className="font-medium">{totalPages}</span> sayfa
            </div>

            <div className="flex items-center gap-2">
              <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Sayfa başına" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12</SelectItem>
                  <SelectItem value="24">24</SelectItem>
                  <SelectItem value="36">36</SelectItem>
                  <SelectItem value="48">48</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <span className="text-sm w-12 text-center">
                  {currentPage}/{totalPages}
                </span>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
