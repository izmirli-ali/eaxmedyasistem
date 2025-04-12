import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Search, Zap } from "lucide-react"

const features = [
  {
    title: "Google Haritalar Entegrasyonu",
    description:
      "İşletmenizin Google Haritalar'da daha üst sıralarda çıkması için gerekli tüm SEO optimizasyonlarını otomatik olarak yapar.",
    icon: MapPin,
    color: "bg-blue-100 text-blue-700",
  },
  {
    title: "SEO Odaklı İçerik Yönetimi",
    description:
      "İşletmeniz için en uygun anahtar kelimeleri kullanarak, arama motorlarında daha iyi sıralamalara ulaşmanızı sağlar.",
    icon: Search,
    color: "bg-green-100 text-green-700",
  },
  {
    title: "Hızlı Kurulum",
    description:
      "Sadece birkaç dakika içinde işletmenizi sisteme ekleyin ve hemen Google Haritalar'da görünürlük kazanmaya başlayın.",
    icon: Zap,
    color: "bg-orange-100 text-orange-700",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-16 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Neden Bizi Tercih Etmelisiniz?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            İşletmenizi Google Haritalar'da üst sıralara taşıyacak güçlü özelliklerimiz
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border border-gray-200 hover:shadow-md transition-all hover:translate-y-[-5px]"
            >
              <CardContent className="p-6 text-center">
                <div className={`mx-auto w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
