"use client"

import { useEffect } from "react"
import Script from "next/script"
import { createWebsiteSchema, createOrganizationSchema } from "@/lib/seo-helpers"

export function EnhancedSeoScripts() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://isletmenionecikar.com"
  const siteName = "İşletmeni Öne Çıkar"
  const logoUrl = `${siteUrl}/logo.png`

  // Website Schema
  const websiteSchema = createWebsiteSchema(siteUrl, siteName)

  // Organization Schema
  const organizationSchema = createOrganizationSchema(
    siteUrl,
    siteName,
    logoUrl,
    [
      "https://facebook.com/isletmenionecikar",
      "https://twitter.com/isletmenionecikar",
      "https://instagram.com/isletmenionecikar",
      "https://linkedin.com/company/isletmenionecikar",
    ],
    {
      telephone: "+905001234567",
      contactType: "customer service",
      email: "info@isletmenionecikar.com",
      availableLanguage: ["Turkish"],
    },
  )

  // Core Web Vitals ve SEO iyileştirmeleri
  useEffect(() => {
    // Sayfa yükleme performansını ölçme
    if (typeof window !== "undefined") {
      // LCP (Largest Contentful Paint) ölçümü
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        const lastEntry = entries[entries.length - 1]
        console.log("LCP:", lastEntry.startTime)
        // Analytics'e gönderme işlemi burada yapılabilir
      }).observe({ type: "largest-contentful-paint", buffered: true })

      // FID (First Input Delay) ölçümü
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        entries.forEach((entry) => {
          console.log("FID:", entry.processingStart - entry.startTime)
          // Analytics'e gönderme işlemi burada yapılabilir
        })
      }).observe({ type: "first-input", buffered: true })

      // CLS (Cumulative Layout Shift) ölçümü
      let clsValue = 0
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries()
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
            console.log("CLS:", clsValue)
            // Analytics'e gönderme işlemi burada yapılabilir
          }
        })
      }).observe({ type: "layout-shift", buffered: true })
    }
  }, [])

  return (
    <>
      {/* Website Schema */}
      <Script id="website-schema" type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </Script>

      {/* Organization Schema */}
      <Script id="organization-schema" type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </Script>

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
    </>
  )
}
