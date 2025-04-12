import type React from "react"
import type { Metadata, Viewport } from "next"
import { ClientLayout } from "./ClientLayout"

// Google Analytics ve diğer izleme kodlarını ekleyelim
import { Analytics } from "@/components/analytics"

// SEO için metadata tanımlamaları
export const metadata: Metadata = {
  title: "İşletmeni Öne Çıkar | Google Haritalar Optimizasyonu",
  description:
    "İşletmenizi Google Haritalar'da üst sıralara taşıyarak müşteri sayınızı artırın. 4-6 hafta içinde sonuç garantili Google Haritalar SEO hizmeti.",
  keywords:
    "Google Haritalar, Google Maps SEO, işletme optimizasyonu, yerel SEO, Google Business Profile, Google İşletme Profili, işletme sıralaması",
  authors: [{ name: "EAX Medya" }],
  creator: "EAX Medya",
  publisher: "EAX Medya",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://isletmenionecikar.com",
    title: "İşletmeni Öne Çıkar | Google Haritalar Optimizasyonu",
    description:
      "İşletmenizi Google Haritalar'da üst sıralara taşıyarak müşteri sayınızı artırın. 4-6 hafta içinde sonuç garantili Google Haritalar SEO hizmeti.",
    siteName: "İşletmeni Öne Çıkar",
    images: [
      {
        url: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-fblEIMxD80mshsVigb7iElAB5Mhkyp.png",
        width: 1200,
        height: 630,
        alt: "İşletmeni Öne Çıkar",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "İşletmeni Öne Çıkar | Google Haritalar Optimizasyonu",
    description:
      "İşletmenizi Google Haritalar'da üst sıralara taşıyarak müşteri sayınızı artırın. 4-6 hafta içinde sonuç garantili Google Haritalar SEO hizmeti.",
    images: ["https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-fblEIMxD80mshsVigb7iElAB5Mhkyp.png"],
    creator: "@eaxmedya",
  },
  alternates: {
    canonical: "https://isletmenionecikar.com",
  },
    generator: 'v0.dev'
}

// Viewport ayarları
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#4f46e5",
}

// Layout içine Analytics bileşenini ekleyelim
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClientLayout>
      {children}
      <Analytics />
    </ClientLayout>
  )
}


import './globals.css'