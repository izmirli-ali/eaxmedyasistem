import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Star, Users, MapPin } from "lucide-react"

// Başarı hikayesi tipi
type SuccessStory = {
  id: string
  businessName: string
  category: string
  location: string
  image: string
  logo?: string
  before: {
    ranking: number
    reviews: number
    visitors: number
  }
  after: {
    ranking: number
    reviews: number
    visitors: number
  }
  testimonial: string
  personName: string
  personTitle: string
}

// Örnek başarı hikayeleri
const successStories: SuccessStory[] = [
  {
    id: "1",
    businessName: "Cafe Aroma",
    category: "Kafe",
    location: "İstanbul, Kadıköy",
    image: "/placeholder.svg?height=400&width=600",
    logo: "/placeholder.svg?height=80&width=80",
    before: {
      ranking: 15,
      reviews: 23,
      visitors: 450,
    },
    after: {
      ranking: 3,
      reviews: 78,
      visitors: 1250,
    },
    testimonial:
      "İşletmeni Öne Çıkar ile çalışmaya başladıktan sadece 5 hafta sonra Google Haritalar'da ilk 3'e yükseldik. Müşteri sayımız neredeyse 3 katına çıktı!",
    personName: "Ahmet Yılmaz",
    personTitle: "İşletme Sahibi",
  },
  {
    id: "2",
    businessName: "Derman Eczanesi",
    category: "Eczane",
    location: "Ankara, Çankaya",
    image: "/placeholder.svg?height=400&width=600",
    logo: "/placeholder.svg?height=80&width=80",
    before: {
      ranking: 12,
      reviews: 31,
      visitors: 320,
    },
    after: {
      ranking: 2,
      reviews: 95,
      visitors: 870,
    },
    testimonial:
      "Eczanemiz için yaptıkları optimizasyon çalışmaları sayesinde hem Google'da üst sıralara çıktık hem de hasta sayımızda ciddi bir artış yaşadık. Profesyonel ekibe teşekkürler!",
    personName: "Zeynep Kaya",
    personTitle: "Eczacı",
  },
  {
    id: "3",
    businessName: "Öztürk Mobilya",
    category: "Mobilya Mağazası",
    location: "İzmir, Bornova",
    image: "/placeholder.svg?height=400&width=600",
    logo: "/placeholder.svg?height=80&width=80",
    before: {
      ranking: 20,
      reviews: 15,
      visitors: 280,
    },
    after: {
      ranking: 4,
      reviews: 67,
      visitors: 920,
    },
    testimonial:
      "Google Haritalar'da görünürlüğümüz arttıkça mağazamıza gelen müşteri sayısı da arttı. Yatırımımızın karşılığını fazlasıyla aldık.",
    personName: "Mehmet Öztürk",
    personTitle: "Mağaza Müdürü",
  },
]

export function SuccessStories() {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <Badge className="mb-4">Başarı Hikayeleri</Badge>
          <h2 className="text-3xl font-bold mb-4">Müşterilerimizin Başarıları</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            İşletmeni Öne Çıkar ile çalışan işletmelerin Google Haritalar'daki başarı hikayelerini keşfedin. İşte gerçek
            sonuçlar ve gerçek rakamlar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {successStories.map((story) => (
            <Card key={story.id} className="overflow-hidden border border-gray-200 transition-all hover:shadow-md">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={story.image || "/placeholder.svg"}
                  alt={story.businessName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant="secondary" className="bg-white/90 text-gray-800">
                    {story.category}
                  </Badge>
                </div>
                <div className="absolute bottom-4 left-4 flex items-center">
                  <MapPin className="h-4 w-4 text-white mr-1" />
                  <span className="text-white text-sm font-medium drop-shadow-md">{story.location}</span>
                </div>
              </div>

              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">{story.businessName}</h3>
                  {story.logo && (
                    <img
                      src={story.logo || "/placeholder.svg"}
                      alt={`${story.businessName} logo`}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <div className="flex flex-col items-center">
                      <TrendingUp className="h-5 w-5 text-primary mb-1" />
                      <div className="text-xs text-gray-500 mb-1">Sıralama</div>
                      <div className="flex items-center gap-1">
                        <span className="text-red-500 line-through text-sm">{story.before.ranking}.</span>
                        <span className="text-green-600 font-bold">{story.after.ranking}.</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="flex flex-col items-center">
                      <Star className="h-5 w-5 text-yellow-500 mb-1" />
                      <div className="text-xs text-gray-500 mb-1">Değerlendirme</div>
                      <div className="flex items-center gap-1">
                        <span className="text-red-500 line-through text-sm">{story.before.reviews}</span>
                        <span className="text-green-600 font-bold">{story.after.reviews}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="flex flex-col items-center">
                      <Users className="h-5 w-5 text-blue-500 mb-1" />
                      <div className="text-xs text-gray-500 mb-1">Ziyaretçi</div>
                      <div className="flex items-center gap-1">
                        <span className="text-red-500 line-through text-sm">{story.before.visitors}</span>
                        <span className="text-green-600 font-bold">{story.after.visitors}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-600 italic text-sm">"{story.testimonial}"</p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{story.personName}</p>
                    <p className="text-gray-500 text-xs">{story.personTitle}</p>
                  </div>
                  <div className="bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded">
                    {Math.round((story.after.visitors / story.before.visitors) * 100 - 100)}% Artış
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
