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
import Script from "next/script"

// Font optimizasyonu
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  preload: true,
})

export const metadata: Metadata = {
  title: {
    default: "İşletmeni Öne Çıkar | İşletme Yönetim Platformu",
    template: "%s | İşletmeni Öne Çıkar",
  },
  description: "İşletmenizi dijital dünyada öne çıkarın. Profesyonel işletme yönetim platformu ile müşterilerinize ulaşın, işletmenizi büyütün.",
  keywords: ["işletme yönetimi", "dijital pazarlama", "müşteri yönetimi", "işletme büyütme", "online işletme"],
  authors: [{ name: "İşletmeni Öne Çıkar" }],
  creator: "İşletmeni Öne Çıkar",
  publisher: "İşletmeni Öne Çıkar",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://isletmenionecikar.com"),
  alternates: {
    canonical: "/",
    languages: {
      "tr-TR": "/tr",
    },
  },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://isletmenionecikar.com",
    title: "İşletmeni Öne Çıkar | İşletme Yönetim Platformu",
    description: "İşletmenizi dijital dünyada öne çıkarın. Profesyonel işletme yönetim platformu ile müşterilerinize ulaşın, işletmenizi büyütün.",
    siteName: "İşletmeni Öne Çıkar",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "İşletmeni Öne Çıkar",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "İşletmeni Öne Çıkar | İşletme Yönetim Platformu",
    description: "İşletmenizi dijital dünyada öne çıkarın. Profesyonel işletme yönetim platformu ile müşterilerinize ulaşın, işletmenizi büyütün.",
    images: ["/twitter-image.jpg"],
    creator: "@isletmenionecikar",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "google-site-verification-code",
    yandex: "yandex-verification-code",
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
        
        {/* Google Tag Manager */}
        <Script id="gtm" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-XXXXXXX');
          `}
        </Script>
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
            <Suspense fallback={<div className="p-4 text-center">Yükleniyor...</div>}>
              {children}
            </Suspense>
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
