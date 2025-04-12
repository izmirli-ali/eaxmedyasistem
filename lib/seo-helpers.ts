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
}: {
  title: string
  description: string
  keywords?: string[]
  image?: string
  path?: string
}): Metadata {
  const fullTitle = createTitle(title)
  const url = `https://isletmenionecikar.com${path}`

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
      type: "website",
      locale: "tr_TR",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
    alternates: {
      canonical: url,
    },
  }
}

// Yapılandırılmış veri oluşturmak için yardımcı fonksiyon
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
  }
  priceRange: string
  openingHours: string
  socialLinks: string[]
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
    },
    priceRange: businessData.priceRange,
    openingHours: businessData.openingHours,
    sameAs: businessData.socialLinks,
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
