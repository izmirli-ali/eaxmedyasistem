"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { LoadingOverlay } from "@/components/ui/loading-overlay"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/supabase"
import type { Business } from "@/types"
import IsletmeDuzenleForm from "@/components/isletme-duzenle-form"

export default function IsletmeDuzenleSayfasi() {
  const router = useRouter()
  const { slug } = useParams<{ slug: string }>()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [business, setBusiness] = useState<Business | null>(null)

  useEffect(() => {
    const fetchIsletme = async () => {
      try {
        setIsLoading(true)

        // URL slug ile işletmeyi getir - isletmeler2 tablosundan
        const { data, error } = await supabase
          .from("isletmeler2")
          .select("*")
          .eq("url_slug", decodeURIComponent(slug as string))
          .single()

        if (error) {
          // Eğer slug ile bulunamazsa, ID ile deneyelim (geriye dönük uyumluluk için)
          const { data: dataById, error: errorById } = await supabase
            .from("isletmeler2")
            .select("*")
            .eq("id", slug)
            .single()

          if (errorById) {
            throw new Error("İşletme bulunamadı")
          }

          setBusiness(dataById)
          return
        }

        setBusiness(data)
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Hata!",
          description: error.message,
        })
        console.error("İşletme bilgileri alınırken hata oluştu:", error)
        router.push("/admin/isletme-listesi")
      } finally {
        setIsLoading(false)
      }
    }

    if (slug) {
      fetchIsletme()
    }
  }, [slug, toast, router])

  if (isLoading) {
    return <LoadingOverlay message="İşletme bilgileri yükleniyor..." />
  }

  if (!business) {
    return (
      <div className="container py-6 text-center">
        <h1 className="text-2xl font-bold mb-4">İşletme Bulunamadı</h1>
        <p className="mb-4">İstediğiniz işletme bulunamadı veya erişim izniniz yok.</p>
        <button
          onClick={() => router.push("/admin/isletme-listesi")}
          className="px-4 py-2 bg-primary text-white rounded-md"
        >
          İşletme Listesine Dön
        </button>
      </div>
    )
  }

  return <IsletmeDuzenleForm business={business} />
}
