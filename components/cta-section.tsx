"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Phone, MessageCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BasvuruModal } from "@/components/basvuru-modal"

export function CTASection() {
  const [basvuruModalOpen, setBasvuruModalOpen] = useState(false)
  const [selectedPaket, setSelectedPaket] = useState("")

  const handleBasvuruClick = (paketTipi: string) => {
    setSelectedPaket(paketTipi)
    setBasvuruModalOpen(true)
  }

  // WhatsApp yönlendirme URL'si
  const whatsappUrl =
    "https://wa.me/905377781883?text=Merhaba,%20Google%20Haritalar%20optimizasyonu%20hakkında%20bilgi%20almak%20istiyorum."

  return (
    <section className="py-16 px-4 bg-primary/5 relative overflow-hidden">
      {/* Dekoratif arka plan elementleri */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-10 right-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="bg-white rounded-xl p-8 md:p-12 shadow-xl border border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">İşletmenizi Bugün Google Haritalar'da Üst Sıralara Taşıyın</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              İki farklı ödeme seçeneğimizden size uygun olanı seçin ve işletmenizin Google Haritalar'daki performansını
              artırın.
            </p>
          </div>

          <Tabs defaultValue="single" className="w-full max-w-md mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="single">Tek Seferlik</TabsTrigger>
              <TabsTrigger value="monthly">Aylık Abonelik</TabsTrigger>
            </TabsList>

            <TabsContent value="single">
              <div className="text-center mb-6">
                <p className="font-medium text-lg">2.000₺ + KDV</p>
                <p className="text-sm text-gray-500">Tek seferlik ödeme, tek işletme için</p>
              </div>
              <Button
                size="lg"
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => handleBasvuruClick("tek-seferlik")}
              >
                Hemen Başvurun <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </TabsContent>

            <TabsContent value="monthly">
              <div className="text-center mb-6">
                <p className="font-medium text-lg">Aylık 1.000₺ + KDV</p>
                <p className="text-sm text-gray-500">Sürekli destek ve yapay zeka optimizasyonu</p>
              </div>
              <Button
                size="lg"
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => handleBasvuruClick("aylik")}
              >
                Planları İnceleyin <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </TabsContent>
          </Tabs>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 mb-4">Kredi kartı gerekmez. İstediğiniz zaman iptal edebilirsiniz.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
              <a
                href="tel:+905377781883"
                className="inline-flex items-center justify-center gap-2 text-primary hover:text-primary/80"
              >
                <Phone className="h-5 w-5" />
                <span>0537 778 1883</span>
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 text-green-600 hover:text-green-700"
              >
                <MessageCircle className="h-5 w-5" />
                <span>WhatsApp'tan Yazın</span>
              </a>
            </div>
          </div>
        </div>
      </div>
      <BasvuruModal open={basvuruModalOpen} onOpenChange={setBasvuruModalOpen} paketTipi={selectedPaket} />
    </section>
  )
}
