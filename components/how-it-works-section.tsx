"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback } from "react"
import Image from "next/image"

// Export ifadesini default export olarak değiştirin
export default function HowItWorksSection() {
  const router = useRouter()

  // Router işlemini optimize etmek için useCallback kullanımı
  const handleButtonClick = useCallback(() => {
    router.push("/iletisim")
  }, [router])

  return (
    <section className="py-16 px-4 bg-white" id="how-it-works">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Nasıl Çalışır?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Sadece üç adımda işletmenizi Google Haritalar'da üst sıralara taşıyın
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Bağlantı çizgisi */}
          <div className="hidden md:block absolute top-24 left-0 w-full h-0.5 bg-gray-200 z-0"></div>

          {/* Adım 1 */}
          <div className="relative z-10">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mb-4">
                1
              </div>
              <div className="bg-white p-4 rounded-lg text-center">
                <h3 className="text-xl font-bold mb-2">İşletmenizi Analiz Edelim</h3>
                <p className="text-gray-600">
                  İşletmenizin mevcut durumunu analiz eder, rakiplerinizi inceler ve size özel bir strateji oluştururuz.
                </p>
                <p className="text-sm text-primary mt-2 font-medium">Süre: 1-2 gün</p>
              </div>
              <div className="mt-6 rounded-lg shadow-md w-full max-w-xs overflow-hidden">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-qWRFRgl5BZEKFuaWJ2esZszzmAeUHU.png"
                  alt="İşletme Analizi"
                  width={300}
                  height={300}
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            </div>
          </div>

          {/* Adım 2 */}
          <div className="relative z-10">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mb-4">
                2
              </div>
              <div className="bg-white p-4 rounded-lg text-center">
                <h3 className="text-xl font-bold mb-2">SEO Optimizasyonu</h3>
                <p className="text-gray-600">
                  Yapay zeka destekli anahtar kelime analizi ve Google Haritalar optimizasyonu ile işletmenizi üst
                  sıralara taşırız.
                </p>
                <p className="text-sm text-primary mt-2 font-medium">Süre: 2-3 hafta</p>
              </div>
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-onOPvETBPbbzqeRG6NxC9RneUFUN4A.png"
                alt="SEO Optimizasyonu"
                width={300}
                height={300}
                className="mt-6 rounded-lg shadow-md w-full max-w-xs"
                loading="lazy"
              />
            </div>
          </div>

          {/* Adım 3 */}
          <div className="relative z-10">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mb-4">
                3
              </div>
              <div className="bg-white p-4 rounded-lg text-center">
                <h3 className="text-xl font-bold mb-2">Sonuçları Görün</h3>
                <p className="text-gray-600">
                  Google Haritalar'da üst sıralara çıkın, müşteri sayınızın artışını izleyin ve düzenli raporlarla
                  gelişimi takip edin.
                </p>
                <p className="text-sm text-primary mt-2 font-medium">Süre: 4-6 hafta</p>
              </div>
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-CZHsNaGXzVlewIUi3VXTzpWhkNKx5F.png"
                alt="Google Haritalar'da Üst Sıralara Çıkma ve Performans Artışı"
                width={300}
                height={300}
                className="mt-6 rounded-lg shadow-md w-full max-w-xs"
                loading="lazy"
              />
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Button size="lg" onClick={handleButtonClick}>
            Hemen Başlayın <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  )
}
