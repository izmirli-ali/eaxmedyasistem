// Öne çıkan işletmeler bileşeni
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function FeaturedBusinesses({ businesses, loading, error }) {
  if (loading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Öne Çıkan İşletmeler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-1" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Öne Çıkan İşletmeler</h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-center">
            <AlertCircle className="text-red-500 mr-2" />
            <p className="text-red-700">İşletmeler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.</p>
          </div>
        </div>
      </section>
    )
  }

  if (!businesses || businesses.length === 0) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Öne Çıkan İşletmeler</h2>
          <p className="text-center text-gray-500">Henüz öne çıkan işletme bulunmamaktadır.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Öne Çıkan İşletmeler</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.map((business) => (
            <Link
              key={business.id}
              href={`/isletme/${business.id}`}
              className="block transition-transform hover:scale-105"
            >
              <Card className="overflow-hidden h-full">
                <div className="relative h-48">
                  <Image
                    src={business.fotograf_url || "/placeholder.svg?height=192&width=384"}
                    alt={business.isletme_adi}
                    fill
                    className="object-cover"
                  />
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold text-lg mb-1">{business.isletme_adi}</h3>
                  <p className="text-sm text-gray-500 mb-1">{business.kategori}</p>
                  <p className="text-sm text-gray-700 truncate">{business.adres}</p>
                  {business.sehir && <p className="text-xs text-gray-500 mt-1">{business.sehir}</p>}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
