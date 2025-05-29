import type { Metadata } from "next"

// Sayfa başlıklarını oluşturmak için yardımcı fonksiyon
export function createTitle(title: string): string {
  return `${title} | İşletmeni Öne Çıkar`
}

// Sayfa meta verilerini oluşturmak için yardımcı fonksiyon
export function createMetadata({
  title,
  description,
  keywords = [],
  image = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-fblEIMxD80mshsVigb7iElAB5Mhkyp.png",
  path = "",
  type = "website",
  locale = "tr_TR",
  publishedTime,
  modifiedTime,
  authors = [{ name: "İşletmeni Öne Çıkar Ekibi" }],
  noIndex = false,
  alternateUrls = {},
}: {
  title: string
  description: string
  keywords?: string[]
  image?: string
  path?: string
  type?: "website" | "article" | "profile" | "business.business"
  locale?: string
  publishedTime?: string
  modifiedTime?: string
  authors?: Array<{ name: string; url?: string }>
  noIndex?: boolean
  alternateUrls?: Record<string, string>
}): Metadata {
  const fullTitle = createTitle(title)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://isletmenionecikar.com"
  const url = `${siteUrl}${path}`

  // Alternatif dil URL'leri
  const languages: Record<string, string> = {}
  Object.entries(alternateUrls).forEach(([lang, langPath]) => {
    languages[lang] = `${siteUrl}${langPath}`
  })

  return {
    title: fullTitle,
    description,
    keywords: [
      "Google Haritalar",
      "Google Maps SEO",
      "işletme optimizasyonu",
      "yerel SEO",
      "Google Business Profile",
      ...keywords,
    ],
    authors,
    creator: "İşletmeni Öne Çıkar",
    publisher: "İşletmeni Öne Çıkar",
    openGraph: {
      title: fullTitle,
      description,
      url,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type,
      locale,
      siteName: "İşletmeni Öne Çıkar",
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
      creator: "@isletmenionecikar",
    },
    alternates: {
      canonical: url,
      languages,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    verification: {
      google: "G-VERIFICATION-CODE-123456",
      yandex: "yandex-verification-code-123456",
    },
    formatDetection: {
      email: true,
      address: true,
      telephone: true,
    },
    category: "business",
    other: {
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "black-translucent",
      "apple-mobile-web-app-title": "İşletmeni Öne Çıkar",
    },
  }
}

// Yapılandırılmış veri oluşturmak için yardımcı fonksiyon
// LocalBusiness şemasını daha kapsamlı hale getirelim
export function createLocalBusinessSchema(businessData: {
  name: string
  description: string
  image: string
  url: string
  telephone: string
  email: string
  address: {
    locality: string
    region: string
    country: string
    streetAddress?: string
    postalCode?: string
  }
  priceRange: string
  openingHours: string
  socialLinks: string[]
  geo?: {
    latitude: number
    longitude: number
  }
  // Yeni alanlar ekleyelim
  category?: string
  subCategory?: string
  services?: string[]
  paymentAccepted?: string[]
  hasMap?: string
  aggregateRating?: {
    ratingValue: number
    reviewCount: number
  }
  // Ek alanlar
  foundingDate?: string
  areaServed?: string[]
  slogan?: string
  logo?: string
  photos?: string[]
  currenciesAccepted?: string
  paymentAccepted?: string
  taxID?: string
  vatID?: string
  additionalType?: string
  disambiguatingDescription?: string
  knowsLanguage?: string[]
  keywords?: string[]
  accessibilityFeatures?: string[]
  amenityFeature?: string[]
  tourBookingPage?: string
  publicAccess?: boolean
  isAccessibleForFree?: boolean
  smokingAllowed?: boolean
  events?: Array<{
    name: string
    startDate: string
    endDate?: string
    description?: string
    url?: string
  }>
  specialOpeningHoursSpecification?: Array<{
    validFrom: string
    validThrough: string
    opens: string
    closes: string
    dayOfWeek: string[]
    description?: string
  }>
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: businessData.name,
    description: businessData.description,
    image: businessData.image,
    url: businessData.url,
    telephone: businessData.telephone,
    email: businessData.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: businessData.address.locality,
      addressRegion: businessData.address.region,
      addressCountry: businessData.address.country,
      streetAddress: businessData.address.streetAddress,
      postalCode: businessData.address.postalCode,
    },
    priceRange: businessData.priceRange,
    openingHours: businessData.openingHours,
    sameAs: businessData.socialLinks,
    // Yeni alanları ekleyelim
    ...(businessData.geo && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: businessData.geo.latitude,
        longitude: businessData.geo.longitude,
      },
    }),
    ...(businessData.category && { category: businessData.category }),
    ...(businessData.services && {
      makesOffer: businessData.services.map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service,
        },
      })),
    }),
    ...(businessData.paymentAccepted && { paymentAccepted: businessData.paymentAccepted.join(", ") }),
    ...(businessData.hasMap && { hasMap: businessData.hasMap }),
    ...(businessData.aggregateRating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: businessData.aggregateRating.ratingValue,
        reviewCount: businessData.aggregateRating.reviewCount,
      },
    }),
    // Ek alanlar
    ...(businessData.foundingDate && { foundingDate: businessData.foundingDate }),
    ...(businessData.areaServed && { areaServed: businessData.areaServed }),
    ...(businessData.slogan && { slogan: businessData.slogan }),
    ...(businessData.logo && { logo: businessData.logo }),
    ...(businessData.photos && { photo: businessData.photos }),
    ...(businessData.currenciesAccepted && { currenciesAccepted: businessData.currenciesAccepted }),
    ...(businessData.paymentAccepted && { paymentAccepted: businessData.paymentAccepted }),
    ...(businessData.taxID && { taxID: businessData.taxID }),
    ...(businessData.vatID && { vatID: businessData.vatID }),
    ...(businessData.additionalType && { additionalType: businessData.additionalType }),
    ...(businessData.disambiguatingDescription && {
      disambiguatingDescription: businessData.disambiguatingDescription,
    }),
    ...(businessData.knowsLanguage && { knowsLanguage: businessData.knowsLanguage }),
    ...(businessData.keywords && { keywords: businessData.keywords.join(", ") }),
    ...(businessData.accessibilityFeatures && {
      accessibilityFeature: businessData.accessibilityFeatures,
    }),
    ...(businessData.amenityFeature && { amenityFeature: businessData.amenityFeature }),
    ...(businessData.tourBookingPage && { tourBookingPage: businessData.tourBookingPage }),
    ...(businessData.publicAccess !== undefined && { publicAccess: businessData.publicAccess }),
    ...(businessData.isAccessibleForFree !== undefined && {
      isAccessibleForFree: businessData.isAccessibleForFree,
    }),
    ...(businessData.smokingAllowed !== undefined && { smokingAllowed: businessData.smokingAllowed }),
    ...(businessData.events && {
      event: businessData.events.map((event) => ({
        "@type": "Event",
        name: event.name,
        startDate: event.startDate,
        ...(event.endDate && { endDate: event.endDate }),
        ...(event.description && { description: event.description }),
        ...(event.url && { url: event.url }),
      })),
    }),
    ...(businessData.specialOpeningHoursSpecification && {
      specialOpeningHoursSpecification: businessData.specialOpeningHoursSpecification.map((spec) => ({
        "@type": "OpeningHoursSpecification",
        validFrom: spec.validFrom,
        validThrough: spec.validThrough,
        opens: spec.opens,
        closes: spec.closes,
        dayOfWeek: spec.dayOfWeek,
        ...(spec.description && { description: spec.description }),
      })),
    }),
  }
}

// Sayfa için JSON-LD yapılandırılmış veri oluşturmak için yardımcı fonksiyon
export function createFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  }
}

// Breadcrumb yapılandırılmış verisi oluşturmak için yardımcı fonksiyon
export function createBreadcrumbSchema(items: { name: string; item: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  }
}

// Website yapılandırılmış verisi oluşturmak için yardımcı fonksiyon
export function createWebsiteSchema(siteUrl: string, siteName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/isletme-listesi?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: "tr-TR",
    copyrightYear: new Date().getFullYear(),
    datePublished: "2023-01-01",
    dateModified: new Date().toISOString().split("T")[0],
    description:
      "İşletmenizi Google Haritalar'da üst sıralara taşıyın. Profesyonel SEO ve yerel pazarlama çözümleriyle müşteri sayınızı artırın.",
  }
}

// Organization yapılandırılmış verisi oluşturmak için yardımcı fonksiyon
export function createOrganizationSchema(
  siteUrl: string,
  name: string,
  logo: string,
  socialLinks: string[] = [],
  contactPoint: {
    telephone: string
    contactType: string
    email?: string
    availableLanguage?: string[]
  } = { telephone: "", contactType: "customer service" },
) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: logo,
      width: 192,
      height: 192,
    },
    sameAs: socialLinks,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: contactPoint.telephone,
      contactType: contactPoint.contactType,
      ...(contactPoint.email && { email: contactPoint.email }),
      ...(contactPoint.availableLanguage && { availableLanguage: contactPoint.availableLanguage }),
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "Türkiye",
      addressRegion: "İstanbul",
    },
    foundingDate: "2023-01-01",
    founders: [
      {
        "@type": "Person",
        name: "İşletmeni Öne Çıkar Kurucusu",
      },
    ],
    slogan: "Google Haritalar'da Üst Sıralara Çıkın",
    description:
      "İşletmenizi Google Haritalar'da üst sıralara taşıyın. Profesyonel SEO ve yerel pazarlama çözümleriyle müşteri sayınızı artırın.",
  }
}

// Ürün yapılandırılmış verisi oluşturmak için yardımcı fonksiyon
export function createProductSchema(productData: {
  name: string
  description: string
  image: string
  url: string
  brand?: string
  offers?: {
    price: number
    priceCurrency: string
    availability?: string
    validFrom?: string
    priceValidUntil?: string
  }
  aggregateRating?: {
    ratingValue: number
    reviewCount: number
  }
  category?: string
  sku?: string
  mpn?: string
  gtin?: string
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productData.name,
    description: productData.description,
    image: productData.image,
    url: productData.url,
    ...(productData.brand && {
      brand: {
        "@type": "Brand",
        name: productData.brand,
      },
    }),
    ...(productData.offers && {
      offers: {
        "@type": "Offer",
        price: productData.offers.price,
        priceCurrency: productData.offers.priceCurrency,
        ...(productData.offers.availability && { availability: productData.offers.availability }),
        ...(productData.offers.validFrom && { validFrom: productData.offers.validFrom }),
        ...(productData.offers.priceValidUntil && { priceValidUntil: productData.offers.priceValidUntil }),
        url: productData.url,
      },
    }),
    ...(productData.aggregateRating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: productData.aggregateRating.ratingValue,
        reviewCount: productData.aggregateRating.reviewCount,
      },
    }),
    ...(productData.category && { category: productData.category }),
    ...(productData.sku && { sku: productData.sku }),
    ...(productData.mpn && { mpn: productData.mpn }),
    ...(productData.gtin && { gtin: productData.gtin }),
  }
}
