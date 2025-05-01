"use client"

import { useState, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { CheckCircle } from "lucide-react"
import { BasvuruForm } from "@/components/basvuru-form"

export function HeroSection() {
  const [basvuruYapildi, setBasvuruYapildi] = useState(false)
  const [paketTipi, setPaketTipi] = useState("")

  const handlePackagesClick = useCallback(() => {
    const pricingSection = document.getElementById("pricing-section")
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: "smooth" })
    }
  }, [])

  const handleBasvuruSuccess = () => {
    setBasvuruYapildi(true)
    setTimeout(() => {
      setBasvuruYapildi(false)
    }, 3000)
  }

  return (
    <section
      id="hero-section"
      aria-label="Ana Bölüm"
      className="py-20 px-4 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden"
    >
      {/* Dekoratif arka plan elementleri */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-10 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <Badge className="px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
              Google Haritalar Optimizasyonu
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              İşletmenizi Google Haritalar'da <span className="text-primary">Üst Sıralara</span> Taşıyın
            </h1>
            <p className="text-lg text-gray-600">
              SEO odaklı işletme yönetim sistemimiz ile Google Haritalar'da daha fazla görünürlük kazanın, müşteri
              sayınızı artırın ve işletmenizi büyütün. Ortalama 4-6 hafta içinde sonuçları görmeye başlayın!
            </p>

            <div className="pt-2 space-y-3">
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <p className="text-gray-700">Google Haritalar'da üst sıralarda yer alın (4-6 hafta)</p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <p className="text-gray-700">Müşteri sayınızı %150'ye kadar artırın (2-3 ay)</p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <p className="text-gray-700">Yapay zeka destekli anahtar kelime optimizasyonu</p>
              </div>
              <div className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <p className="text-gray-700">7/24 WhatsApp desteği ile hızlı çözümler</p>
              </div>
            </div>
          </div>
          <div className="flex-1 relative">
            <div className="absolute -top-4 -left-4 w-full h-full bg-gray-200 rounded-lg transform rotate-3"></div>
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-fblEIMxD80mshsVigb7iElAB5Mhkyp.png"
              alt="Google Haritalar'da üst sıralara çıkan işletme gösterimi"
              className="w-full h-auto rounded-lg shadow-lg relative z-10 border border-gray-100"
              width="500"
              height="400"
              loading="eager"
            />
            <div className="absolute -bottom-3 -right-3 bg-white p-3 rounded-lg shadow-lg z-20 border border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <p className="text-sm font-medium">%135 daha fazla görüntülenme</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16">
          <BasvuruForm paketTipi={paketTipi} onSuccess={handleBasvuruSuccess} />
        </div>
      </div>
    </section>
  )
}
