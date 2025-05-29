"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Building } from "lucide-react"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { handleError } from "@/lib/error-handler"
import Script from "next/script"

export function SonEklenenIsletmeler() {
  const [isletmeler, setIsletmeler] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchIsletmeler() {
      try {
        setLoading(true)
        setError(null)

        const supabase = createClient()
        const { data, error } = await supabase
          .from("isletmeler2")
          .select("id, isletme_adi, kategori, sehir, slug, adres, fotograf_url, url_slug")
          .order("created_at", { ascending: false })
          .limit(6)

        if (error) {
          throw error
        }

        setIsletmeler(data || [])
      } catch (err) {
        const errorResponse = handleError(err, "son-eklenen-isletmeler")
        setError(errorResponse.message)
        console.error("İşletmeler çekilirken hata:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchIsletmeler()
  }, [])

  // ItemList Schema oluşturma
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: isletmeler.map((isletme, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "LocalBusiness",
        name: isletme.isletme_adi,
        image: isletme.fotograf_url || "/placeholder.jpg",
        address: {
          "@type": "PostalAddress",
          addressLocality: isletme.sehir || "Belirtilmemiş",
          addressCountry: "Türkiye",
        },
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/isletme/${isletme.url_slug || isletme.slug}`,
        description: `${isletme.isletme_adi} - ${isletme.kategori || "İşletme"}`,
        category: isletme.kategori || "İşletme",
      },
    })),
  }

  return (
    <section className="py-12 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl font-bold text-center mb-8">Son Eklenen İşletmeler</h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner text="İşletmeler yükleniyor..." />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
          </div>
        ) : isletmeler.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Henüz işletme bulunmuyor.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isletmeler.map((isletme) => (
                <Link
                  key={isletme.id}
                  href={`/isletme/${isletme.url_slug || isletme.slug}`}
                  className="block transition-transform hover:scale-105"
                >
                  <Card className="overflow-hidden h-full">
                    <div className="h-48 overflow-hidden">
                      {isletme.fotograf_url ? (
                        <img
                          src={isletme.fotograf_url || "/placeholder.svg"}
                          alt={isletme.isletme_adi}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
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
                        <p className="text-sm text-gray-600 line-clamp-2">{isletme.adres || "Adres belirtilmemiş"}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link
                href="/isletme-listesi"
                className="inline-block px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
              >
                Tüm İşletmeleri Gör
              </Link>
            </div>

            {/* ItemList Schema */}
            {isletmeler.length > 0 && (
              <Script id="itemlist-schema" type="application/ld+json">
                {JSON.stringify(itemListSchema)}
              </Script>
            )}
          </>
        )}
      </div>
    </section>
  )
}
