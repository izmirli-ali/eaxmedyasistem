"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, ArrowRight, Home } from "lucide-react"
import Link from "next/link"

interface BasvuruBasariProps {
  isletmeAdi: string
  onYeniBasvuru?: () => void
}

export function BasvuruBasari({ isletmeAdi, onYeniBasvuru }: BasvuruBasariProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg">
      <CardHeader className="text-center border-b">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <CardTitle className="text-2xl">Başvurunuz Başarıyla Alındı!</CardTitle>
        <CardDescription className="text-base mt-2">
          {isletmeAdi} işletmesi için başvurunuz sistemimize kaydedildi.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Bundan Sonra Ne Olacak?</h3>
          <ul className="space-y-2 text-blue-700">
            <li className="flex items-start">
              <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                1
              </span>
              <span>Başvurunuz 1-3 iş günü içerisinde incelenecektir.</span>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                2
              </span>
              <span>Verdiğiniz iletişim bilgileri üzerinden sizinle iletişime geçilecektir.</span>
            </li>
            <li className="flex items-start">
              <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">
                3
              </span>
              <span>Başvurunuz onaylandığında işletmeniz sistemimize eklenecektir.</span>
            </li>
          </ul>
        </div>

        <div className="text-center text-gray-600">
          <p>
            Başvurunuzla ilgili sorularınız için{" "}
            <a href="mailto:info@example.com" className="text-primary hover:underline">
              info@example.com
            </a>{" "}
            adresine e-posta gönderebilir veya{" "}
            <a href="tel:+902121234567" className="text-primary hover:underline">
              0212 123 45 67
            </a>{" "}
            numaralı telefondan bize ulaşabilirsiniz.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-center gap-4 border-t p-6">
        <Link href="/" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full">
            <Home className="mr-2 h-4 w-4" />
            Ana Sayfaya Dön
          </Button>
        </Link>
        {onYeniBasvuru && (
          <Button onClick={onYeniBasvuru} className="w-full sm:w-auto">
            Yeni Başvuru Yap
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
