// İşletme listesi sayfasını güncelleyelim - filtreleme desteği ekleyelim
import { Suspense } from "react"
import IsletmeListesiClientComponent from "./IsletmeListesiClient"
import { Skeleton } from "@/components/ui/skeleton"

export default function IsletmeListesi({
  searchParams,
}: {
  searchParams?: {
    sehir?: string
    kategori?: string
    q?: string
  }
}) {
  return (
    <Suspense fallback={<IsletmeListesiSkeleton />}>
      <IsletmeListesiClientComponent
        sehirFilter={searchParams?.sehir}
        kategoriFilter={searchParams?.kategori}
        searchQuery={searchParams?.q}
      />
    </Suspense>
  )
}

function IsletmeListesiSkeleton() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Skeleton className="h-10 w-64" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
      </div>
    </div>
  )
}
;("use client")

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Building, Search, Filter, ChevronRight } from "lucide-react"
import Link from "next/link"

export default function IsletmeListesiClientComponent({sehirFilter, kategoriFilter, searchQuery}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isletmeler, setIsletmeler] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(searchQuery || "")
  const [selectedCity, setSelectedCity] = useState(sehirFilter || "")
  const [selectedCategory, setSelectedCategory] = useState(kategoriFilter || "")
  const [cities, setCities] = useState([])
  const [categories, setCategories] = useState([])
  const [showFilters, setShowFilters] = useState(false)

  const supabase = createClient()

  // Şehirleri ve kategorileri yükle
  useEffect(() => {
    async function fetchFilters() {
      try {
        // Şehirleri çek
        const { data: sehirData } = await supabase
          .from("isletmeler")
          .select("sehir")
          .not("sehir", "is", null)
          .order("sehir")

        if (sehirData) {
          const uniqueCities = [...new Set(sehirData.map((item) => item.sehir).filter(Boolean))]
          setCities(uniqueCities)
        }

        // Kategorileri çek
        const { data: kategoriData } = await supabase
          .from("isletmeler")
          .select("kategori")
          .not("kategori", "is", null)
          .order("kategori")

        if (kategoriData) {
          const uniqueCategories = [...new Set(kategoriData.map((item) => item.kategori).filter(Boolean))]
          setCategories(uniqueCategories)
        }
      } catch (error) {
        console.error("Filtreler yüklenirken hata:", error.message)
      }
    }

    fetchFilters()
  }, [])

  // İşletmeleri yükle
  useEffect(() => {
    async function fetchIsletmeler() {
      try {
        setLoading(true)

        let query = supabase
          .from("isletmeler")
          .select("id, isletme_adi, kategori, adres, fotograf_url, sehir, url_slug")
          .order("isletme_adi")

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
      } catch (error) {
        console.error("İşletmeler yüklenirken hata:", error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchIsletmeler()
  }, [searchTerm, selectedCity, selectedCategory])

  // Arama işlemi
  const handleSearch = (e) => {
    e.preventDefault()

    const params = new URLSearchParams()
    if (searchTerm) params.append("q", searchTerm)
    if (selectedCity && selectedCity !== "all") params.append("sehir", selectedCity)
    if (selectedCategory && selectedCategory !== "all") params.append("kategori", selectedCategory)

    router.push(`/isletme-listesi?${params.toString()}`)
  }

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">İşletme Listesi</h1>
        <p className="text-gray-600">Sistemimizde kayıtlı olan tüm işletmeleri görüntüleyin ve filtreleme yapın.</p>
      </div>

      {/* Arama ve Filtreler */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="İşletme adı veya anahtar kelime..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button type="submit">
                <Search className="mr-2 h-4 w-4" />
                Ara
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="mr-2 h-4 w-4" />
                Filtreler
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Şehir</label>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Şehir seçin" />
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori seçin" />
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
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* İşletme Listesi */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isletmeler.length > 0 ? (
            isletmeler.map((isletme) => (
              <Link key={isletme.id} href={`/isletme/${isletme.url_slug}`} className="block group">
                <Card className="overflow-hidden h-full transition-all duration-300 hover:shadow-lg">
                  <div className="h-48 overflow-hidden">
                    {isletme.fotograf_url ? (
                      <img
                        src={isletme.fotograf_url || "/placeholder.svg"}
                        alt={isletme.isletme_adi}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Building className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-5">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-red-600 transition-colors">
                      {isletme.isletme_adi}
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      {isletme.kategori && (
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">{isletme.kategori}</Badge>
                      )}
                      {isletme.sehir && <Badge variant="outline">{isletme.sehir}</Badge>}
                    </div>
                    <div className="flex items-start mt-2">
                      <MapPin className="h-4 w-4 mr-2 mt-1 text-gray-500" />
                      <p className="text-sm text-gray-600 line-clamp-2">{isletme.adres}</p>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <span className="text-red-600 text-sm font-medium flex items-center group-hover:underline">
                        Detayları Görüntüle
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <h3 className="text-xl font-bold mb-2">Sonuç Bulunamadı</h3>
              <p className="text-gray-600 mb-6">
                Arama kriterlerinize uygun işletme bulunamadı. Lütfen farklı anahtar kelimeler veya filtreler deneyin.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedCity("")
                  setSelectedCategory("")
                  router.push("/isletme-listesi")
                }}
              >
                Filtreleri Temizle
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
