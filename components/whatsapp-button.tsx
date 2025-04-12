"use client"

import { MessageCircle } from "lucide-react"

export function WhatsAppButton() {
  // WhatsApp yönlendirme URL'si
  const whatsappUrl =
    "https://wa.me/905377781883?text=Merhaba,%20Google%20Haritalar%20optimizasyonu%20hakkında%20bilgi%20almak%20istiyorum."

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700 transition-all duration-300 flex items-center justify-center"
      aria-label="WhatsApp ile iletişime geçin"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  )
}
