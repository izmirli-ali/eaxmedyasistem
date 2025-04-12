"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [mapLoaded, setMapLoaded] = useState(false)

  useEffect(() => {
    if (!window.google && !document.getElementById("google-maps-script")) {
      const script = document.createElement("script")
      script.id = "google-maps-script"
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => setMapLoaded(true)
      document.head.appendChild(script)
    } else if (window.google) {
      setMapLoaded(true)
    }
  }, [])

  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        {/* Yapılandırılmış veri (Schema.org) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "İşletmeni Öne Çıkar",
              description:
                "İşletmenizi Google Haritalar'da üst sıralara taşıyarak müşteri sayınızı artırın. 4-6 hafta içinde sonuç garantili Google Haritalar SEO hizmeti.",
              url: "https://isletmenionecikar.com",
              logo: "https://isletmenionecikar.com/logo.png",
              image: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-fblEIMxD80mshsVigb7iElAB5Mhkyp.png",
              telephone: "+905377781883",
              email: "eaxmedya@gmail.com",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Afyonkarahisar",
                addressRegion: "Merkez",
                addressCountry: "TR",
              },
              priceRange: "₺₺",
              openingHours: "Mo-Su 09:00-18:00",
              sameAs: [
                "https://facebook.com/eaxmedya",
                "https://instagram.com/eaxmedya",
                "https://twitter.com/eaxmedya",
              ],
            }),
          }}
        />

        {/* Ek SEO meta etiketleri */}
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="google" content="notranslate" />
        <meta property="og:site_name" content="İşletmeni Öne Çıkar" />
        <meta name="application-name" content="İşletmeni Öne Çıkar" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {mapLoaded ? children : <div>Harita Yükleniyor...</div>}
        </ThemeProvider>
      </body>
    </html>
  )
}
