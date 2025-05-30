import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import IsletmeDetayClient from "./IsletmeDetayClient"
import { parseHizmetler } from "@/lib/supabase-utils"

// Dinamik metadata
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createClient()

  // İşletmeyi getir - isletmeler2 tablosundan
  const { data: isletme, error } = await supabase.from("isletmeler2").select("*").eq("url_slug", params.slug).single()

  if (error || !isletme) {
    return {
      title: "İşletme Bulunamadı",
      description: "Aradığınız işletme bulunamadı.",
    }
  }

  return {
    title: isletme.seo_baslik || isletme.isletme_adi,
    description: isletme.seo_aciklama || (isletme.aciklama ? isletme.aciklama.substring(0, 160) : ""),
    keywords: isletme.seo_anahtar_kelimeler,
    openGraph: {
      title: isletme.seo_baslik || isletme.isletme_adi,
      description: isletme.seo_aciklama || (isletme.aciklama ? isletme.aciklama.substring(0, 160) : ""),
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/isletme/${params.slug}`,
      siteName: "İşletme Yönetim Sistemi",
      images: [
        {
          url: isletme.fotograf_url || "/placeholder.jpg",
          width: 1200,
          height: 630,
          alt: isletme.isletme_adi,
        },
      ],
      locale: "tr_TR",
      type: "website",
    },
  }
}

export default async function IsletmeDetaySayfasi({ params }: { params: { slug: string } }) {
  const supabase = createClient()

  // İşletmeyi getir - isletmeler2 tablosundan
  const { data: isletme, error } = await supabase.from("isletmeler2").select("*").eq("url_slug", params.slug).single()

  if (error || !isletme) {
    console.error("İşletme bulunamadı:", error)
    notFound()
  }

  try {
    // Görüntülenme sayısını artır
    await supabase
      .from("isletmeler2")
      .update({
        goruntulenme_sayisi: (isletme.goruntulenme_sayisi || 0) + 1,
      })
      .eq("id", isletme.id)
  } catch (updateError) {
    console.error("Görüntülenme sayısı güncellenemedi:", updateError)
    // Görüntülenme sayısı güncellenemese bile devam et
  }

  // Sunulan hizmetleri parse et
  const hizmetler = parseHizmetler(isletme.sunulan_hizmetler)

  return <IsletmeDetayClient isletme={isletme} hizmetler={hizmetler} />
}
