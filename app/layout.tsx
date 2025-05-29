import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SkipLink } from "@/components/ui/skip-link"
import { UserFeedbackSystem } from "@/components/feedback/user-feedback-system"
import "./globals.css"
import { Suspense } from "react"

// Font optimizasyonu
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://isletmenionecikar.com"),
  title: {
    default: "İşletmeni Öne Çıkar | Google Haritalar'da Üst Sıralara Çık",
    template: "%s | İşletmeni Öne Çıkar",
  },
  description:
    "İşletmenizi Google Haritalar'da üst sıralara taşıyın. Profesyonel SEO ve yerel pazarlama çözümleriyle müşteri sayınızı artırın.",
  keywords: [
    "Google Haritalar SEO",
    "işletme optimizasyonu",
    "yerel SEO",
    "Google Business Profile",
    "işletme kaydı",
    "müşteri artırma",
    "yerel işletme pazarlama",
    "Google sıralaması yükseltme",
  ],
  authors: [{ name: "İşletmeni Öne Çıkar Ekibi" }],
  creator: "İşletmeni Öne Çıkar",
  publisher: "İşletmeni Öne Çıkar",
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  alternates: {
    canonical: "/",
    languages: {
      "tr-TR": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "/",
    title: "İşletmeni Öne Çıkar | Google Haritalar'da Üst Sıralara Çık",
    description:
      "İşletmenizi Google Haritalar'da üst sıralara taşıyın. Profesyonel SEO ve yerel pazarlama çözümleriyle müşteri sayınızı artırın.",
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
    title: "İşletmeni Öne Çıkar | Google Haritalar'da Üst Sıralara Çık",
    description:
      "İşletmenizi Google Haritalar'da üst sıralara taşıyın. Profesyonel SEO ve yerel pazarlama çözümleriyle müşteri sayınızı artırın.",
    images: ["https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-fblEIMxD80mshsVigb7iElAB5Mhkyp.png"],
    creator: "@isletmenionecikar",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  verification: {
    google: "G-VERIFICATION-CODE-123456",
    yandex: "yandex-verification-code-123456",
    other: {
      "facebook-domain-verification": "facebook-domain-verification-code-123456",
      "baidu-site-verification": "baidu-verification-code-123456",
    },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  category: "business",
  applicationName: "İşletmeni Öne Çıkar",
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "İşletmeni Öne Çıkar",
    "msapplication-TileColor": "#ffffff",
    "msapplication-TileImage": "/mstile-144x144.png",
    "msapplication-config": "/browserconfig.xml",
    "theme-color": "#ffffff",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" className={inter.variable}>
      <head>
        {/* Kritik CSS'leri önden yükle */}
        <link rel="preload" href="/globals.css" as="style" />
        {/* Kritik JS'leri önden yükle */}
        <link rel="modulepreload" href="/_next/static/chunks/main.js" />
        {/* Preconnect ile kritik domainlere bağlantı kurma */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-XXXXXXX"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="Google Tag Manager"
          />
        </noscript>

        <SkipLink href="#main-content">İçeriğe geç</SkipLink>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {/* Ana içerik */}
          <main id="main-content" className="relative">
            <Suspense fallback={<div className="p-4 text-center">Yükleniyor...</div>}>{children}</Suspense>
          </main>

          {/* Analitik ve performans izleme - defer ile gecikmeli yükleme */}
          <Suspense>
            <Analytics />
            <SpeedInsights />
          </Suspense>
          <Toaster />
          <UserFeedbackSystem />
        </ThemeProvider>
      </body>
    </html>
  )
}
