import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import Image from "next/image"

interface Product {
  id: string
  baslik: string
  aciklama: string
  fiyat: string
  gorsel_url: string
  link?: string
}

interface FeaturedProductsProps {
  products: Product[]
  title?: string
  className?: string
}

export function FeaturedProducts({ products, title = "Öne Çıkan Ürünler", className }: FeaturedProductsProps) {
  if (!products || products.length === 0) return null

  return (
    <div className={className}>
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden h-full flex flex-col">
            <div className="relative aspect-[4/3]">
              <Image
                src={product.gorsel_url || "/placeholder.svg?height=300&width=400"}
                alt={product.baslik}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <CardContent className="p-4 flex-grow flex flex-col">
              <h3 className="font-bold text-lg mb-1">{product.baslik}</h3>
              <p className="text-gray-600 text-sm mb-3 flex-grow">{product.aciklama}</p>
              <div className="flex items-center justify-between mt-auto">
                <Badge variant="outline" className="text-lg font-semibold">
                  {product.fiyat} ₺
                </Badge>
                {product.link && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={product.link} target="_blank" rel="noopener noreferrer">
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
