import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { PricingSection } from "@/components/pricing-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { SonEklenenIsletmeler } from "@/components/son-eklenen-isletmeler"
import { EnhancedSeoScripts } from "@/components/enhanced-seo-scripts"
import { Suspense } from "react"
import type { Metadata } from "next"

// Anasayfaya özel metadata tanımlama
export const metadata: Metadata = {
  title: "İşletmeni Öne Çıkar | Google Haritalar'da Üst Sıralara Çık",
  description:
    "İşletmenizi Google Haritalar'da üst sıralara taşıyın. Profesyonel SEO ve yerel pazarlama çözümleriyle müşteri sayınızı artırın. Yerel işletmeniz için en iyi Google Maps optimizasyonu.",
  keywords: [
    "Google Haritalar SEO",
    "işletme optimizasyonu",
    "yerel SEO",
    "Google Business Profile",
    "işletme kaydı",
    "müşteri artırma",
    "yerel işletme pazarlama",
    "Google sıralaması yükseltme",
    "Google Maps optimizasyonu",
    "yerel işletme rehberi",
    "işletme listesi",
    "işletme tanıtımı",
    "Google Haritalar sıralama",
    "yerel arama optimizasyonu",
  ],
  alternates: {
    canonical: "/",
  },
}

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <Suspense fallback={<div className="container mx-auto p-4 text-center">İşletmeler yükleniyor...</div>}>
        <SonEklenenIsletmeler />
      </Suspense>
      <FeaturesSection />
      <PricingSection />
      <ContactSection />
      <Footer />
      <WhatsAppButton />

      {/* Gelişmiş SEO scriptleri */}
      <EnhancedSeoScripts />
    </main>
  )
}
