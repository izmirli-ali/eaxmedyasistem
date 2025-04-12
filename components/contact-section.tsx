"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react"

export function ContactSection() {
  // WhatsApp yönlendirme URL'si
  const whatsappUrl =
    "https://wa.me/905377781883?text=Merhaba,%20Google%20Haritalar%20optimizasyonu%20hakkında%20bilgi%20almak%20istiyorum."

  return (
    <section id="contact-section" className="py-16 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        {/* Başlık kısmını güncelle */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Bize Ulaşın</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Sorularınız için EAX Medya'ya ulaşın, size en kısa sürede dönüş yapalım
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* WhatsApp İletişim Kartı - Form yerine WhatsApp odaklı kart */}
          <Card className="border border-green-200 bg-green-50">
            <CardContent className="p-6">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-white p-4 rounded-full shadow-md">
                  <MessageCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>

              <h3 className="text-xl font-bold mb-4 text-center">WhatsApp ile Hızlı İletişim</h3>

              <p className="text-gray-700 text-center mb-6">
                İşletmeniz için özel çözümler ve fiyatlandırma için hemen WhatsApp üzerinden bizimle iletişime geçin.
                Uzman ekibimiz size en kısa sürede dönüş yapacaktır.
              </p>

              <div className="flex justify-center mb-6">
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
                  onClick={() => window.open(whatsappUrl, "_blank")}
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  WhatsApp'tan Mesaj Gönderin
                </Button>
              </div>

              <div className="text-center text-gray-600 text-sm">
                <p>Telefon: 0537 778 1883</p>
                <p>7/24 WhatsApp desteği</p>
              </div>
            </CardContent>
          </Card>

          {/* İletişim Bilgileri */}
          <div className="space-y-6">
            <Card className="border border-gray-200">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">İletişim Bilgilerimiz</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-gray-100 p-2 rounded-full mr-3">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    {/* İletişim bilgilerini güncelle - Telefon */}
                    <div>
                      <h4 className="font-medium">Telefon</h4>
                      <p className="text-gray-600">0537 778 1883</p>
                      <a href="tel:+905377781883" className="text-primary text-sm hover:underline mt-1 inline-block">
                        Hemen Arayın
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-gray-100 p-2 rounded-full mr-3">
                      <MessageCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">WhatsApp</h4>
                      <p className="text-gray-600">0537 778 1883</p>
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 text-sm hover:underline mt-1 inline-block"
                      >
                        WhatsApp'tan Mesaj Gönderin
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-gray-100 p-2 rounded-full mr-3">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    {/* İletişim bilgilerini güncelle - E-posta */}
                    <div>
                      <h4 className="font-medium">E-posta</h4>
                      <p className="text-gray-600">eaxmedya@gmail.com</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-gray-100 p-2 rounded-full mr-3">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    {/* İletişim bilgilerini güncelle - Adres */}
                    <div>
                      <h4 className="font-medium">Adres</h4>
                      <p className="text-gray-600">Afyonkarahisar / merkez</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-gray-100 p-2 rounded-full mr-3">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Çalışma Saatleri</h4>
                      <p className="text-gray-600">Hergün: 09.00-18.00</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-primary/5">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-4">Neden Bizi Seçmelisiniz?</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <div className="bg-primary/10 p-1 rounded-full mr-2 mt-0.5">
                      <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-gray-700">4-6 hafta içinde görünür sonuçlar</p>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-primary/10 p-1 rounded-full mr-2 mt-0.5">
                      <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-gray-700">Yapay zeka destekli anahtar kelime optimizasyonu</p>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-primary/10 p-1 rounded-full mr-2 mt-0.5">
                      <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-gray-700">7/24 WhatsApp desteği</p>
                  </li>
                  <li className="flex items-start">
                    <div className="bg-primary/10 p-1 rounded-full mr-2 mt-0.5">
                      <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-gray-700">Şeffaf raporlama ve sonuç takibi</p>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
