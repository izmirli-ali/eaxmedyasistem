"use client"

import type React from "react"

import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr">
      <head>
        {/* Yapılandırılmış veri (Schema.org) */}
        {/*
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
           })
         }}
       />
        */}

        {/* Ek SEO meta etiketleri */}
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="google" content="notranslate" />
        <meta property="og:site_name" content="İşletmeni Öne Çıkar" />
        <meta name="application-name" content="İşletmeni Öne Çıkar" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
