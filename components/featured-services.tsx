import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, ExternalLink } from "lucide-react"
import Image from "next/image"

interface Service {
  id: string
  baslik: string
  aciklama: string
  fiyat: string
  gorsel_url: string
  sure?: string
  link?: string
}

interface FeaturedServicesProps {
  services: Service[]
  title?: string
  className?: string
}

export function FeaturedServices({ services, title = "Öne Çıkan Hizmetler", className }: FeaturedServicesProps) {
  if (!services || services.length === 0) return null

  return (
    <div className={className}>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <Card key={service.id} className="overflow-hidden h-full flex flex-col">
            <div className="relative aspect-[4/3]">
              <Image
                src={service.gorsel_url || "/placeholder.svg?height=300&width=400"}
                alt={service.baslik}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <CardContent className="p-4 flex-grow flex flex-col">
              <h3 className="font-bold text-lg mb-1">{service.baslik}</h3>
              <p className="text-gray-600 text-sm mb-3 flex-grow">{service.aciklama}</p>
              <div className="flex flex-wrap items-center justify-between gap-2 mt-auto">
                <Badge variant="outline" className="text-lg font-semibold">
                  {service.fiyat} ₺
                </Badge>
                {service.sure && (
                  <Badge variant="secondary" className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {service.sure}
                  </Badge>
                )}
                {service.link && (
                  <Button size="sm" variant="outline" asChild className="ml-auto">
                    <a href={service.link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Detaylar
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
