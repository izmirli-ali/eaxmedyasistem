import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { PricingSection } from "@/components/pricing-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { SonEklenenIsletmeler } from "@/components/son-eklenen-isletmeler"

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <SonEklenenIsletmeler />
      <FeaturesSection />
      <PricingSection />
      <ContactSection />
      <Footer />
      <WhatsAppButton />
    </main>
  )
}
