"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { CheckCircle, HelpCircle, AlertCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { BasvuruModal } from "@/components/basvuru-modal"

export function PricingSection() {
  const [basvuruModalOpen, setBasvuruModalOpen] = useState(false)
  const [selectedPaket, setSelectedPaket] = useState("")

  const handleBasvuruClick = (paketTipi: string) => {
    setSelectedPaket(paketTipi)
    setBasvuruModalOpen(true)
  }

  const singleTimePackage = {
    name: "Tek Seferlik Paket",
    price: "2.000",
    description: "Tek işletme için tek seferlik ödeme",
    features: [
      "1 işletme kaydı",
      "Google Haritalar entegrasyonu",
      "Temel SEO optimizasyonu",
      "İşletme bilgilerinin düzenlenmesi",
      "Anahtar kelime optimizasyonu",
      "Meta etiketleri optimizasyonu",
      "Google My Business profil optimizasyonu",
      "Yerel arama sıralaması iyileştirmesi",
      "Müşteri değerlendirme stratejisi",
      "30 gün WhatsApp desteği",
      "Temel performans raporu",
    ],
    tooltips: {
      "Temel SEO optimizasyonu": "İşletmenizin Google Haritalar'da daha iyi sıralanması için temel SEO çalışmaları",
      "Anahtar kelime optimizasyonu": "İşletmeniz için en uygun anahtar kelimelerin belirlenmesi ve kullanılması",
      "Google My Business profil optimizasyonu":
        "Google My Business profilinizin eksiksiz ve etkili bir şekilde düzenlenmesi",
      "Yerel arama sıralaması iyileştirmesi": "Yerel aramalarda üst sıralarda çıkmanız için gerekli optimizasyonlar",
      "Müşteri değerlendirme stratejisi": "Olumlu müşteri değerlendirmeleri almanız için stratejiler",
    },
  }

  const monthlyPackage = {
    name: "Aylık Abonelik",
    price: "1.000",
    description: "Tek işletme için aylık abonelik",
    features: [
      "1 işletme kaydı",
      "Gelişmiş Google Haritalar entegrasyonu",
      "Kapsamlı SEO optimizasyonu",
      "Haftalık içerik güncellemeleri",
      "Yapay zeka destekli anahtar kelime analizi",
      "Haftalık anahtar kelime güncellemesi",
      "Müşteri değerlendirme yönetimi",
      "7/24 WhatsApp desteği",
      "Haftalık performans raporu",
      "Rakip analizi",
      "Sosyal medya entegrasyonu",
      "Google Ads entegrasyonu desteği",
      "Trafik artışı garantisi",
    ],
    popular: true,
    tooltips: {
      "Kapsamlı SEO optimizasyonu": "Gelişmiş anahtar kelime analizi, içerik optimizasyonu ve yerel SEO stratejileri",
      "Yapay zeka destekli anahtar kelime analizi":
        "Yapay zeka teknolojisi ile işletmeniz için en etkili anahtar kelimelerin belirlenmesi",
      "Haftalık anahtar kelime güncellemesi": "Anahtar kelimelerinizin haftalık olarak güncellenmesi ve optimizasyonu",
      "Rakip analizi": "Rakiplerinizin Google Haritalar'daki performansını analiz ederek stratejinizi geliştirme",
      "Sosyal medya entegrasyonu": "Google işletme profilinizin sosyal medya hesaplarınızla entegrasyonu",
      "Trafik artışı garantisi": "İlk 3 ay içinde trafik artışı göremezseniz, bir sonraki ay ücretsiz",
    },
  }

  return (
    <section id="pricing-section" className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Şeffaf Fiyatlandırma</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            İşletmenizin ihtiyaçlarına uygun planı seçin ve hemen Google Haritalar'da üst sıralara çıkmaya başlayın
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tek Seferlik Paket */}
          <TooltipProvider>
            <Card className="border-2 border-gray-200 shadow-lg h-full">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                Tek Seferlik Ödeme
              </div>
              <CardHeader className="pb-0 pt-6">
                <h3 className="text-xl font-bold">{singleTimePackage.name}</h3>
                <div className="mt-4 mb-2">
                  <span className="text-4xl font-bold">{singleTimePackage.price}₺</span>
                  <span className="text-gray-500 ml-2">+ KDV</span>
                </div>
                <p className="text-gray-600">{singleTimePackage.description}</p>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {singleTimePackage.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        {feature}
                        {singleTimePackage.tooltips && singleTimePackage.tooltips[feature] && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 inline-block ml-1 text-gray-400 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-60">{singleTimePackage.tooltips[feature]}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-blue-700 font-medium">Sonuçlar ne zaman görülür?</p>
                      <p className="text-sm text-blue-600">
                        Google Haritalar'da görünürlük artışı genellikle 4-6 hafta içinde başlar. Tam etki için 2-3 ay
                        sürebilir. Tek seferlik paket ile işletmeniz için temel SEO optimizasyonu yapılır ve Google
                        Haritalar'da görünürlüğünüz artırılır.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="mt-auto">
                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() => handleBasvuruClick("tek-seferlik")}
                >
                  Hemen Başvurun
                </Button>
              </CardFooter>
            </Card>
          </TooltipProvider>

          {/* Aylık Abonelik */}
          <TooltipProvider>
            <Card className="border-2 border-primary shadow-lg relative h-full">
              {monthlyPackage.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                  Önerilen
                </div>
              )}
              <CardHeader className="pb-0 pt-6">
                <Badge variant="outline" className="mb-2 self-start">
                  Aylık Abonelik
                </Badge>
                <h3 className="text-xl font-bold">{monthlyPackage.name}</h3>
                <div className="mt-4 mb-2">
                  <span className="text-4xl font-bold">{monthlyPackage.price}₺</span>
                  <span className="text-gray-500 ml-2">/ aylık + KDV</span>
                </div>
                <p className="text-gray-600">{monthlyPackage.description}</p>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {monthlyPackage.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span>
                        {feature}
                        {monthlyPackage.tooltips && monthlyPackage.tooltips[feature] && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <HelpCircle className="h-4 w-4 inline-block ml-1 text-gray-400 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="w-60">{monthlyPackage.tooltips[feature]}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-green-700 font-medium">Aylık abonelik avantajı</p>
                      <p className="text-sm text-green-600">
                        Aylık abonelik ile işletmenizin trafiği sürekli artar. Yapay zeka destekli anahtar kelime
                        analizleri haftalık olarak güncellenir ve işletmeniz için en etkili stratejiler uygulanır.
                        Sonuçlar genellikle 4-6 hafta içinde görülmeye başlar ve zamanla artarak devam eder.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="mt-auto">
                <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => handleBasvuruClick("aylik")}>
                  Hemen Başlayın
                </Button>
              </CardFooter>
            </Card>
          </TooltipProvider>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Özel ihtiyaçlarınız mı var?{" "}
            <Button
              variant="outline"
              className="text-primary font-medium hover:underline"
              onClick={() => {
                const contactSection = document.getElementById("contact-section")
                if (contactSection) {
                  contactSection.scrollIntoView({ behavior: "smooth" })
                }
              }}
            >
              Bizimle İletişime Geçin
            </Button>
            ve size özel bir teklif alalım.
          </p>
        </div>
      </div>
      <BasvuruModal open={basvuruModalOpen} onOpenChange={setBasvuruModalOpen} paketTipi={selectedPaket} />
    </section>
  )
}
