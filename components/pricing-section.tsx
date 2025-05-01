"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, X } from "lucide-react"

// Fiyatlandırma paketleri
const pricingPlans = [
  {
    id: "yillik",
    name: "Yıllık Paket",
    price: "₺2,000",
    period: "yıllık",
    description: "Tek seferlik SEO optimizasyonu ile işletmenizi üst sıralara taşıyın",
    features: [
      { text: "Google Haritalar kaydı ve optimizasyonu", available: true },
      { text: "İlk başvuruda 1 kere SEO optimizasyonu", available: true },
      { text: "İşletme bilgilerinin düzenlenmesi", available: true },
      { text: "Google İşletme Profili tam optimizasyonu", available: true },
      { text: "Anahtar kelime araştırması", available: true },
      { text: "Rakip analizi", available: true },
      { text: "Haftalık SEO güncellemeleri", available: false },
      { text: "Aylık performans raporu", available: true },
      { text: "E-posta ve WhatsApp desteği", available: true },
    ],
    popular: false,
    note: "* Fiyata KDV dahil değildir. Yıllık ödeme planı.",
  },
  {
    id: "aylik",
    name: "Aylık Paket",
    price: "₺1,000",
    period: "aylık",
    description: "Sürekli güncellenen SEO optimizasyonu ile kalıcı üst sıra",
    features: [
      { text: "Google Haritalar kaydı ve optimizasyonu", available: true },
      { text: "Haftalık SEO optimizasyonu güncellemeleri", available: true },
      { text: "İşletme bilgilerinin düzenlenmesi", available: true },
      { text: "Google İşletme Profili tam optimizasyonu", available: true },
      { text: "Anahtar kelime araştırması", available: true },
      { text: "Rakip analizi", available: true },
      { text: "Haftalık içerik güncellemeleri", available: true },
      { text: "Haftalık performans raporu", available: true },
      { text: "Öncelikli E-posta ve WhatsApp desteği", available: true },
    ],
    popular: true,
    note: "* Fiyata KDV dahil değildir. Aylık ödeme planı.",
  },
]

export function PricingSection() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const handleBasvuruClick = (planId: string) => {
    // Başvuru formuna yönlendir ve sayfayı yukarı kaydır
    const basvuruForm = document.querySelector("#hero-section")
    if (basvuruForm) {
      basvuruForm.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section id="pricing-section" className="py-20 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Fiyatlandırma Planları</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            İşletmenizin ihtiyaçlarına uygun paketi seçin ve Google Haritalar'da üst sıralara çıkma yolculuğuna
            başlayın. Tüm paketlerimiz sonuç odaklıdır.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`flex flex-col h-full ${
                plan.popular ? "border-primary shadow-lg shadow-primary/10" : "border-gray-200"
              }`}
            >
              {plan.popular && (
                <div className="bg-primary text-white text-center py-1 text-sm font-medium">En Çok Tercih Edilen</div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-gray-500 ml-2">/ {plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      {feature.available ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300 mr-2 flex-shrink-0" />
                      )}
                      <span className={feature.available ? "" : "text-gray-400"}>{feature.text}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-gray-500 mt-4">{plan.note}</p>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => handleBasvuruClick(plan.id)}
                  className={`w-full ${plan.popular ? "bg-primary hover:bg-primary/90" : ""}`}
                >
                  Hemen Başvur
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            * Sonuçlar işletmenizin sektörüne ve rekabet durumuna göre değişiklik gösterebilir.
          </p>
          <p className="text-gray-500 text-sm mt-1">
            * Minimum sözleşme süresi aylık paket için 3 ay, yıllık paket için 12 aydır.
          </p>
        </div>
      </div>
    </section>
  )
}
