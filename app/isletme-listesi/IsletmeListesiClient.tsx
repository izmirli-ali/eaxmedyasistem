"use client"

// İşletme listesi client bileşenini güncelleyelim - filtreleme desteği ekleyelim
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MapPin, Search } from "lucide-react"
import Link from "next/link"

interface IsletmeListesiClientProps {
  sehirFilter?: string
  kategoriFilter?: string
  searchQuery?: string
}

export default function IsletmeListesiClient({ sehirFilter, kategoriFilter, searchQuery }: IsletmeListesiClientProps) {
  const [isletmeler, setIsletmeler] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState(searchQuery || "")

  const supabase = createClient()

  useEffect(() => {
    async function fetchIsletmeler() {
      try {
        setLoading(true)

        let query = supabase.from("isletmeler").select("*")

        // Filtreler uygula
        if (sehirFilter) {
          query = query.eq("sehir", sehirFilter)
        }

        if (kategoriFilter) {
          query = query.eq("kategori", kategoriFilter)
        }

        if (searchTerm) {
          query = query.ilike("isletme_adi", `%${searchTerm}%`)
        }

        const { data, error } = await query.order("created_at", { ascending: false })

        if (error) throw error

        setIsletmeler(data || [])
      } catch (error) {
        console.error("İşletmeler yüklenirken hata:", error.message)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchIsletmeler()
  }, [supabase, sehirFilter, kategoriFilter, searchTerm])

  const handleSearch = (e) => {
    e.preventDefault()
    // Arama işlemi burada yapılır
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-2">Hata</h2>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">
          {sehirFilter
            ? `${sehirFilter} İşletmeleri`
            : kategoriFilter
              ? `${kategoriFilter} İşletmeleri`
              : "Tüm İşletmeler"}
        </h1>

        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <Input
            type="text"
            placeholder="İşletme ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" />
            Ara
          </Button>
        </form>

        {(sehirFilter || kategoriFilter) && (
          <div className="flex gap-2 mb-4">
            {sehirFilter && <Badge variant="outline">Şehir: {sehirFilter}</Badge>}
            {kategoriFilter && <Badge variant="outline">Kategori: {kategoriFilter}</Badge>}
            <Link href="/isletme-listesi">
              <Button variant="ghost" size="sm">
                Filtreleri Temizle
              </Button>
            </Link>
          </div>
        )}
      </div>

      {isletmeler.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold mb-2">İşletme Bulunamadı</h2>
            <p className="text-gray-600">Arama kriterlerinize uygun işletme bulunamadı.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isletmeler.map((isletme) => (
            <Link href={`/isletme/${isletme.id}`} key={isletme.id}>
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="aspect-video bg-gray-100 rounded-md mb-4 overflow-hidden">
                    {isletme.fotograf_url ? (
                      <img
                        src={isletme.fotograf_url || "/placeholder.svg"}
                        alt={isletme.isletme_adi}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <span className="text-gray-400">Fotoğraf Yok</span>
                      </div>
                    )}
                  </div>

                  <h2 className="text-xl font-bold mb-2">{isletme.isletme_adi}</h2>

                  <div className="flex gap-2 mb-2">
                    {isletme.kategori && <Badge variant="outline">{isletme.kategori}</Badge>}
                  </div>

                  <div className="flex items-center text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="text-sm">
                      {isletme.ilce}
                      {isletme.sehir ? `, ${isletme.sehir}` : ""}
                    </span>
                  </div>

                  <p className="text-gray-600 line-clamp-2 text-sm">
                    {isletme.aciklama || "İşletme açıklaması bulunmuyor."}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
