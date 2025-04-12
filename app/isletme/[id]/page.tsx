import IsletmeDetayClient from "./IsletmeDetayClient"
import { Skeleton } from "@/components/ui/skeleton"

interface Props {
  params: { id: string }
}

export default function IsletmeDetay({ params }: Props) {
  // Canonical URL'yi doğru şekilde ayarlayalım
  const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://isletmenionecikar.com"}/isletme/${params.id}`

  // Hreflang etiketleri ekleyelim
  const hreflangTags = [
    { lang: "tr", url: canonicalUrl },
    { lang: "en", url: `${canonicalUrl}?lang=en` },
  ]

  // Sayfa yüklenme performansını artırmak için
  const metadata = {
    other: {
      "google-site-verification": "YOUR_VERIFICATION_CODE",
    },
    // Meta etiketlerini güncelleyelim
    metadataBase: new URL(canonicalUrl),
    alternates: {
      canonical: canonicalUrl,
      languages: {
        tr: canonicalUrl,
        en: `${canonicalUrl}?lang=en`,
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  }

  // Sayfa yükleme durumunu iyileştirelim
  const loading = false // Replace with actual loading state

  // Yükleme durumu için daha iyi bir kullanıcı deneyimi
  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl py-12 px-4">
        <div className="flex flex-col space-y-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-[300px] w-full rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-[200px]" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <IsletmeDetayClient params={params} />
}
