import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Ahmet Yılmaz",
    role: "Cafe Manzara, İşletme Sahibi",
    content:
      "Google'da görünürlüğümüz %150 arttı ve müşteri sayımız iki katına çıktı. Artık her gün yeni müşteriler bizi Google Haritalar'dan bularak geliyor.",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    company: "Cafe Manzara",
  },
  {
    name: "Ayşe Kaya",
    role: "Anadolu Restaurant, Genel Müdür",
    content:
      "Sistemde yer aldıktan sonra rezervasyon sayımız %80 arttı. Özellikle turistler artık bizi kolayca buluyor ve işletmemize geliyor.",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    company: "Anadolu Restaurant",
  },
  {
    name: "Mehmet Demir",
    role: "Mavi Butik Otel, İşletme Sahibi",
    content:
      "Artık Google aramalarda ilk sayfada çıkıyoruz ve doluluk oranımız %90'a ulaştı. Yatırımımızın karşılığını fazlasıyla aldık.",
    avatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    company: "Mavi Butik Otel",
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Müşterilerimiz Ne Diyor?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            İşletme sahiplerinin sistemimiz hakkındaki gerçek deneyimleri ve başarı hikayeleri
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>

                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>

                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-lg font-medium text-gray-700">
            <span className="text-primary font-bold">500+</span> işletme sistemimizi kullanıyor
          </p>
          <div className="flex justify-center items-center mt-6 space-x-8">
            <img src="/placeholder.svg?height=30&width=120" alt="Marka 1" className="h-8 opacity-70" />
            <img src="/placeholder.svg?height=30&width=120" alt="Marka 2" className="h-8 opacity-70" />
            <img src="/placeholder.svg?height=30&width=120" alt="Marka 3" className="h-8 opacity-70" />
            <img src="/placeholder.svg?height=30&width=120" alt="Marka 4" className="h-8 opacity-70" />
          </div>
        </div>
      </div>
    </section>
  )
}
