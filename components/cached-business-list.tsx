"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import OptimizedBusinessCard from "@/components/optimized-business-card"
import { Skeleton } from "@/components/ui/skeleton"

interface Business {
  id: string
  isletme_adi: string
  kategori: string
  adres: string
  telefon: string
  website?: string
  fotograf_url?: string
  sehir: string
  url_slug: string
  fiyat_araligi?: string
  one_cikan?: boolean
  goruntulenme_sayisi?: number
}

interface CachedBusinessListProps {
  category?: string
  city?: string
  limit?: number
  featured?: boolean
}

export function CachedBusinessList({ category, city, limit = 6, featured = false }: CachedBusinessListProps) {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        setLoading(true)
        const supabase = createClient()
        let query = supabase
          .from("isletmeler2")
          .select("*")
          .eq("aktif", true)
          .order("created_at", { ascending: false })
          .limit(limit)

        if (category) {
          query = query.eq("kategori", category)
        }

        if (city) {
          query = query.eq("sehir", city)
        }

        if (featured) {
          query = query.eq("one_cikan", true)
        }

        const { data, error } = await query

        if (error) {
          throw new Error(`Veri çekme hatası: ${error.message}`)
        }

        setBusinesses(data as Business[])
      } catch (err: any) {
        console.error("İşletme listesi yüklenirken hata:", err)
        setError(err.message || "İşletmeler yüklenirken bir hata oluştu")
      } finally {
        setLoading(false)
      }
    }

    fetchBusinesses()
  }, [category, city, limit, featured])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(limit)
          .fill(0)
          .map((_, index) => (
            <div key={index} className="h-[400px] rounded-lg overflow-hidden">
              <Skeleton className="h-40 w-full" />
              <div className="p-4 space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
                <div className="space-y-2 mt-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            </div>
          ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        <p>Hata: {error}</p>
        <button className="mt-2 text-sm underline" onClick={() => window.location.reload()}>
          Yeniden Dene
        </button>
      </div>
    )
  }

  if (businesses.length === 0) {
    return (
      <div className="p-6 text-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">Bu kriterlere uygun işletme bulunamadı.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {businesses.map((business) => (
        <OptimizedBusinessCard key={business.id} business={business} showActions={false} />
      ))}
    </div>
  )
}
