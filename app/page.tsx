import { HeroSection } from "@/components/hero-section"
import { FeaturesSection } from "@/components/features-section"
import { PricingSection } from "@/components/pricing-section"
import { SuccessStories } from "@/components/success-stories"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"
import { WhatsAppButton } from "@/components/whatsapp-button"

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <SuccessStories />
      <PricingSection />
      <ContactSection />
      <Footer />
      <WhatsAppButton />
    </main>
  )
}
