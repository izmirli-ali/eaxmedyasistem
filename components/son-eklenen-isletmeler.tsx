"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { MapPin, Building } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { handleError } from "@/lib/error-handler"

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
      } finally {
        setLoading(false)
      }
    }

    fetchIsletmeler()
  }, [])

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isletmeler.map((isletme) => (
              <Link
                key={isletme.id}
                href={`/isletme/${isletme.url_slug}`}
                className="block transition-transform hover:scale-105"
              >
                <Card className="overflow-hidden h-full">
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
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
