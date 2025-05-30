"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { LoadingOverlay } from "@/components/ui/loading-overlay"
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
} from "lucide-react"

interface Isletme {
  id: string
  isletme_adi: string
  slug?: string
  kategori?: string
  alt_kategori?: string
  adres?: string
  sehir?: string
  ilce?: string
  telefon?: string
  fotograf_url?: string
  aktif?: boolean
  one_cikan?: boolean
  created_at?: string
  updated_at?: string
}

export default function IsletmelerSayfasi() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isletmeler, setIsletmeler] = useState<Isletme[]>([])
  const [filteredIsletmeler, setFilteredIsletmeler] = useState<Isletme[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [kategoriFilter, setKategoriFilter] = useState("")
  const [sehirFilter, setSehirFilter] = useState("")
  const [durumFilter, setDurumFilter] = useState("")
  const [kategoriler, setKategoriler] = useState<string[]>([])
  const [sehirler, setSehirler] = useState<string[]>([])
  const [sortField, setSortField] = useState("isletme_adi")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)

  // İşletmeleri getir
  useEffect(() => {
    const fetchIsletmeler = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/isletmeler2")
        if (!response.ok) {
          throw new Error("İşletmeler alınamadı")
        }
        const data = await response.json()
        setIsletmeler(data)

        // Kategorileri ve şehirleri çıkar
        const uniqueKategoriler = Array.from(new Set(data.map((i: Isletme) => i.kategori).filter(Boolean)))
        const uniqueSehirler = Array.from(new Set(data.map((i: Isletme) => i.sehir).filter(Boolean)))

        setKategoriler(uniqueKategoriler as string[])
        setSehirler(uniqueSehirler as string[])
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Hata!",
          description: error.message,
        })
        console.error("İşletmeler alınırken hata oluştu:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchIsletmeler()
  }, [toast])

  // Filtreleme ve sıralama
  useEffect(() => {
    let filtered = [...isletmeler]

    // Arama filtresi
    if (searchTerm) {
      filtered = filtered.filter(
        (isletme) =>
          isletme.isletme_adi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          isletme.adres?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          isletme.telefon?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Kategori filtresi
    if (kategoriFilter) {
      filtered = filtered.filter((isletme) => isletme.kategori === kategoriFilter)
    }

    // Şehir filtresi
    if (sehirFilter) {
      filtered = filtered.filter((isletme) => isletme.sehir === sehirFilter)
    }

    // Durum filtresi
    if (durumFilter) {
      if (durumFilter === "aktif") {
        filtered = filtered.filter((isletme) => isletme.aktif === true)
      } else if (durumFilter === "pasif") {
        filtered = filtered.filter((isletme) => isletme.aktif === false)
      } else if (durumFilter === "one_cikan") {
        filtered = filtered.filter((isletme) => isletme.one_cikan === true)
      }
    }

    // Sıralama
    filtered.sort((a, b) => {
      const fieldA = a[sortField as keyof Isletme] || ""
      const fieldB = b[sortField as keyof Isletme] || ""

      if (typeof fieldA === "string" && typeof fieldB === "string") {
        return sortDirection === "asc" ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA)
      }

      return 0
    })

    setFilteredIsletmeler(filtered)
    setCurrentPage(1) // Filtreleme yapıldığında ilk sayfaya dön
  }, [isletmeler, searchTerm, kategoriFilter, sehirFilter, durumFilter, sortField, sortDirection])

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
    setKategoriFilter("")
    setSehirFilter("")
    setDurumFilter("")
  }

  // Sayfalama
  const totalPages = Math.ceil(filteredIsletmeler.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredIsletmeler.slice(startIndex, endIndex)

  if (isLoading) {
    return <LoadingOverlay message="İşletmeler yükleniyor..." />
  }

  return (
    <div className="container py-6 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold">İşletme Listesi</h1>
          <p className="text-muted-foreground">
            Toplam {isletmeler.length} işletme, filtrelenmiş {filteredIsletmeler.length} sonuç
          </p>
        </div>

        <Button onClick={() => router.push("/dashboard/isletme-ekle")}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni İşletme Ekle
        </Button>
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
                <SelectItem value="">Tüm Şehirler</SelectItem>
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

          {(searchTerm || kategoriFilter || sehirFilter || durumFilter) && (
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Aktif filtreler:{" "}
                  {[
                    searchTerm && "Arama",
                    kategoriFilter && `Kategori: ${kategoriFilter}`,
                    sehirFilter && `Şehir: ${sehirFilter}`,
                    durumFilter &&
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
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="py-3 px-4 text-left font-medium text-sm">
                        <button className="flex items-center gap-1" onClick={() => handleSort("isletme_adi")}>
                          İşletme Adı
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                      <th className="py-3 px-4 text-left font-medium text-sm">
                        <button className="flex items-center gap-1" onClick={() => handleSort("kategori")}>
                          Kategori
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                      <th className="py-3 px-4 text-left font-medium text-sm">
                        <button className="flex items-center gap-1" onClick={() => handleSort("sehir")}>
                          Şehir
                          <ArrowUpDown className="h-3 w-3" />
                        </button>
                      </th>
                      <th className="py-3 px-4 text-left font-medium text-sm">Telefon</th>
                      <th className="py-3 px-4 text-left font-medium text-sm">Durum</th>
                      <th className="py-3 px-4 text-left font-medium text-sm">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.length > 0 ? (
                      currentItems.map((isletme) => (
                        <tr key={isletme.id} className="border-b hover:bg-muted/50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Building className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{isletme.isletme_adi}</p>
                                {isletme.one_cikan && (
                                  <div className="flex items-center gap-1 text-amber-500 text-xs">
                                    <Star className="h-3 w-3" />
                                    <span>Öne Çıkan</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <p>{isletme.kategori || "-"}</p>
                              {isletme.alt_kategori && (
                                <p className="text-xs text-muted-foreground">{isletme.alt_kategori}</p>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span>{isletme.sehir || "-"}</span>
                              {isletme.ilce && <span className="text-xs text-muted-foreground">({isletme.ilce})</span>}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span>{isletme.telefon || "-"}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={isletme.aktif ? "success" : "secondary"}>
                              {isletme.aktif ? "Aktif" : "Pasif"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => router.push(`/dashboard/isletme-duzenle/${isletme.id}`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => window.open(`/isletme/${isletme.slug || isletme.id}`, "_blank")}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-muted-foreground">
                          Filtrelere uygun işletme bulunamadı.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                Toplam {filteredIsletmeler.length} işletme, {currentPage}/{totalPages} sayfa
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
              currentItems.map((isletme) => (
                <Card key={isletme.id} className="overflow-hidden h-full transition-all duration-200 hover:shadow-lg">
                  <div className="h-48 bg-muted relative">
                    {isletme.fotograf_url ? (
                      <img
                        src={isletme.fotograf_url || "/placeholder.svg"}
                        alt={isletme.isletme_adi}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                        <Building className="h-16 w-16 text-muted-foreground/30" />
                      </div>
                    )}

                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                      {isletme.one_cikan && (
                        <Badge variant="default" className="bg-amber-500 border-amber-500">
                          <Star className="h-3 w-3 mr-1 fill-white" />
                          Öne Çıkan
                        </Badge>
                      )}

                      <Badge variant={isletme.aktif ? "success" : "secondary"} className="border">
                        {isletme.aktif ? "Aktif" : "Pasif"}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="pt-4">
                    <h3 className="font-bold text-lg mb-2 line-clamp-1">{isletme.isletme_adi}</h3>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Building className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="line-clamp-1">{isletme.kategori || "-"}</span>
                        {isletme.alt_kategori && (
                          <span className="text-xs text-muted-foreground line-clamp-1">({isletme.alt_kategori})</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="line-clamp-1">
                          {isletme.sehir || "-"}
                          {isletme.ilce && `, ${isletme.ilce}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="line-clamp-1">{isletme.telefon || "-"}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="line-clamp-1">
                          {isletme.created_at
                            ? `Eklenme: ${new Date(isletme.created_at).toLocaleDateString("tr-TR")}`
                            : "Eklenme tarihi yok"}
                        </span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="flex justify-between pt-0 gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => router.push(`/dashboard/isletme-duzenle/${isletme.id}`)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Düzenle
                    </Button>

                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => window.open(`/isletme/${isletme.slug || isletme.id}`, "_blank")}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Görüntüle
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
              Toplam <span className="font-medium">{filteredIsletmeler.length}</span> işletme,
              <span className="font-medium"> {currentPage}</span>/<span className="font-medium">{totalPages}</span>{" "}
              sayfa
            </div>

            <div className="flex items-center gap-2">
              <Select value={itemsPerPage.toString()} onValueChange={(value) => setItemsPerPage(Number(value))}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Sayfa başına" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8">8 işletme</SelectItem>
                  <SelectItem value="12">12 işletme</SelectItem>
                  <SelectItem value="24">24 işletme</SelectItem>
                  <SelectItem value="48">48 işletme</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center mx-2">
                  <span className="text-sm font-medium w-8 text-center">{currentPage}</span>
                  <span className="text-muted-foreground mx-1">/</span>
                  <span className="text-sm text-muted-foreground w-8 text-center">{totalPages || 1}</span>
                </div>

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
