"use client"

import { useState, useEffect, useRef } from "react"
import { Badge } from "@/components/ui/badge"
import { MapPin, Info, Star, MapIcon, Calendar, Award, CheckCircle } from "lucide-react"
import dynamic from "next/dynamic"
import { SectionHeading } from "@/components/section-heading"
import { InfoCard } from "@/components/info-card"
import { StickyNav } from "@/components/sticky-nav"
import { InstagramSimple } from "@/components/instagram-simple"
import { cn } from "@/lib/utils"
import type { Business } from "@/types"

// Dinamik içe aktarmalar
const IsletmeHaritasi = dynamic(() => import("@/components/isletme-haritasi"), {
  loading: () => <div className="h-[400px] bg-gray-100 animate-pulse rounded-lg"></div>,
  ssr: false,
})

const VideoPlayer = dynamic(() => import("@/components/video-player").then((mod) => ({ default: mod.VideoPlayer })), {
  loading: () => <div className="aspect-video bg-gray-100 animate-pulse rounded-lg"></div>,
})

const FeaturedProducts = dynamic(
  () => import("@/components/featured-products").then((mod) => ({ default: mod.FeaturedProducts })),
  {
    loading: () => <div className="h-[300px] bg-gray-100 animate-pulse rounded-lg"></div>,
  },
)

const FeaturedServices = dynamic(
  () => import("@/components/featured-services").then((mod) => ({ default: mod.FeaturedServices })),
  {
    loading: () => <div className="h-[300px] bg-gray-100 animate-pulse rounded-lg"></div>,
  },
)

const MobileActionButtons = dynamic(
  () => import("@/components/mobile-action-buttons").then((mod) => ({ default: mod.MobileActionButtons })),
  {
    ssr: false,
  },
)

const ImageSlider = dynamic(() => import("@/components/image-slider").then((mod) => ({ default: mod.ImageSlider })), {
  loading: () => <div className="h-[400px] bg-gray-100 animate-pulse rounded-lg"></div>,
})

const EnhancedSchemaOrg = dynamic(
  () => import("@/components/enhanced-schema-org").then((mod) => ({ default: mod.EnhancedSchemaOrg })),
  {
    ssr: false,
  },
)

interface IsletmeDetayClientProps {
  isletme: Business
  hizmetler: string[]
}

export default function IsletmeDetayClient({ isletme, hizmetler }: IsletmeDetayClientProps) {
  const [isClient, setIsClient] = useState(false)
  const [oneCikanUrunler, setOneCikanUrunler] = useState<any[]>([])
  const [oneCikanHizmetler, setOneCikanHizmetler] = useState<any[]>([])
  const [sliderImages, setSliderImages] = useState<{ url: string; alt?: string }[]>([])
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const heroRef = useRef<HTMLDivElement>(null)

  // Debug için konsola yazdır
  useEffect(() => {
    console.log("CLIENT COMPONENT'E GELEN İŞLETME VERİLERİ:", isletme)
    console.log("FOTOĞRAFLAR:", isletme.fotograflar)
    console.log("SOSYAL MEDYA:", isletme.sosyal_medya)
    console.log("ÇALIŞMA SAATLERİ:", isletme.calisma_saatleri)
    console.log("ÖNE ÇIKAN ÜRÜNLER:", isletme.one_cikan_urunler)
    console.log("ÖNE ÇIKAN HİZMETLER:", isletme.one_cikan_hizmetler)
    console.log("BOOLEAN ÖZELLİKLER:", {
      wifi: isletme.wifi,
      otopark: isletme.otopark,
      kredi_karti: isletme.kredi_karti,
      rezervasyon: isletme.rezervasyon,
      paket_servis: isletme.paket_servis,
      engelli_erisim: isletme.engelli_erisim,
      bebek_dostu: isletme.bebek_dostu,
      evcil_hayvan_dostu: isletme.evcil_hayvan_dostu,
      sigara_alani: isletme.sigara_alani,
      canli_muzik: isletme.canli_muzik,
      kahvalti: isletme.kahvalti,
      aksam_yemegi: isletme.aksam_yemegi,
      tv: isletme.tv,
      ucretsiz_teslimat: isletme.ucretsiz_teslimat,
      nakit_odeme: isletme.nakit_odeme,
      online_odeme: isletme.online_odeme,
      temassiz_odeme: isletme.temassiz_odeme,
      organik_urunler: isletme.organik_urunler,
      glutensiz_secenekler: isletme.glutensiz_secenekler,
      vegan_secenekler: isletme.vegan_secenekler,
    })
  }, [isletme])

  // Sık sorulan sorular
  const faqs = [
    {
      question: "Rezervasyon nasıl yapabilirim?",
      answer:
        "Rezervasyon için sayfamızdaki iletişim formunu doldurabilir veya doğrudan telefonla iletişime geçebilirsiniz.",
    },
    {
      question: "Otopark imkanı var mı?",
      answer: isletme.otopark
        ? "Evet, işletmemizde misafirlerimiz için ücretsiz otopark hizmeti sunulmaktadır."
        : "Maalesef işletmemizde otopark bulunmamaktadır, ancak çevrede ücretli otoparklar mevcuttur.",
    },
    {
      question: "Çalışma saatleriniz nedir?",
      answer: "Çalışma saatlerimizi sayfamızdaki 'Çalışma Saatleri' bölümünden detaylı olarak inceleyebilirsiniz.",
    },
  ]

  // Bölüm navigasyonu için
  const sections = [
    { id: "hakkinda", label: "Hakkında" },
    { id: "ozellikler", label: "Özellikler" },
    { id: "urunler-hizmetler", label: "Ürünler & Hizmetler" },
    { id: "konum", label: "Konum" },
    { id: "instagram", label: "Instagram" },
    { id: "sss", label: "SSS" },
  ]

  // Client-side rendering için
  useEffect(() => {
    setIsClient(true)

    // Öne çıkan ürünler ve hizmetler
    setOneCikanUrunler(isletme.one_cikan_urunler || [])
    setOneCikanHizmetler(isletme.one_cikan_hizmetler || [])

    // Slider için görselleri hazırla
    const images = []

    // Ana görsel varsa ekle
    if (isletme.fotograf_url) {
      images.push({
        url: isletme.fotograf_url,
        alt: isletme.isletme_adi,
      })
    }

    // Diğer fotoğrafları ekle
    if (isletme.fotograflar && Array.isArray(isletme.fotograflar)) {
      isletme.fotograflar.forEach((foto: any, index: number) => {
        if (typeof foto === "string") {
          images.push({
            url: foto,
            alt: `${isletme.isletme_adi} - Fotoğraf ${index + 1}`,
          })
        } else if (foto && foto.url) {
          images.push({
            url: foto.url,
            alt: foto.alt || `${isletme.isletme_adi} - Fotoğraf ${index + 1}`,
          })
        }
      })
    }

    console.log("SLIDER İÇİN HAZIRLANAN GÖRSELLER:", images)
    setSliderImages(images)
  }, [isletme])

  // Paralaks efekti için
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrollPosition = window.scrollY
        const translateY = scrollPosition * 0.3
        heroRef.current.style.transform = `translateY(${translateY}px)`
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Instagram kullanıcı adını çıkar
  const extractInstagramUsername = (sosyalMedya: any): string | null => {
    if (!sosyalMedya) return null

    try {
      // Sosyal medya verisi artık obje olarak geliyor
      if (sosyalMedya.instagram) {
        const url = sosyalMedya.instagram
        // instagram.com/username formatından kullanıcı adını çıkar
        const match = url.match(/instagram\.com\/([^/?]+)/)
        return match ? match[1] : null
      }

      return null
    } catch (error) {
      console.error("Instagram kullanıcı adı çıkarılamadı:", error)
      return null
    }
  }

  // Sosyal medya ikonlarını göster
  const renderSosyalMedya = () => {
    if (!isletme.sosyal_medya) return null

    try {
      const sosyalMedyaData = isletme.sosyal_medya
      console.log("RENDER SOSYAL MEDYA:", sosyalMedyaData)

      const platforms = Object.entries(sosyalMedyaData).filter(([_, url]) => url)

      if (platforms.length === 0) return null

      return (
        <div className="flex flex-wrap gap-3 mt-4">
          {platforms.map(([platform, url]) => (
            <a
              key={platform}
              href={url as string}
              target="_blank"
              rel="noopener noreferrer"
              className={cn("text-gray-600 hover:scale-110 transition-all p-2 rounded-full", {
                "hover:text-[#1877F2]": platform === "facebook",
                "hover:text-[#E4405F]": platform === "instagram",
                "hover:text-[#1DA1F2]": platform === "twitter",
                "hover:text-[#FF0000]": platform === "youtube",
                "hover:text-[#0A66C2]": platform === "linkedin",
              })}
              aria-label={`${platform} sayfasını ziyaret et`}
            >
              <span className="sr-only">{platform}</span>
              {platform === "facebook" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-facebook"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              )}
              {platform === "instagram" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-instagram"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              )}
              {platform === "twitter" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-twitter"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              )}
              {platform === "youtube" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-youtube"
                >
                  <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                  <path d="m10 15 5-3-5-3z" />
                </svg>
              )}
              {platform === "linkedin" && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-linkedin"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect width="4" height="12" x="2" y="9" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              )}
            </a>
          ))}
        </div>
      )
    } catch (error) {
      console.error("Sosyal medya verileri işlenemedi:", error)
      return null
    }
  }

  // Çalışma saatleri render işlemini güncelle
  const renderCalismaSaatleri = () => {
    if (!isletme.calisma_saatleri) return <p className="text-gray-500">Çalışma saatleri belirtilmemiş.</p>

    try {
      // Çalışma saatleri artık obje olarak geliyor
      const calismaSaatleri = isletme.calisma_saatleri
      console.log("RENDER ÇALIŞMA SAATLERİ:", calismaSaatleri)

      const gunler = ["pazartesi", "sali", "carsamba", "persembe", "cuma", "cumartesi", "pazar"]
      const gunlerTurkce = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"]

      return (
        <div className="space-y-2">
          {gunler.map((gun, index) => {
            const gunData = calismaSaatleri[gun]
            if (!gunData) return null

            const acik = gunData.acik !== false
            const acilis = gunData.acilis || "00:00"
            const kapanis = gunData.kapanis || "00:00"

            return (
              <div key={gun} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
                <span className="font-medium">{gunlerTurkce[index]}</span>
                <span className={acik ? "text-green-600" : "text-red-500"}>
                  {acik ? `${acilis} - ${kapanis}` : "Kapalı"}
                </span>
              </div>
            )
          })}
        </div>
      )
    } catch (error) {
      console.error("Çalışma saatleri işlenemedi:", error)
      return <p className="text-gray-500">Çalışma saatleri belirtilmemiş.</p>
    }
  }

  // Özellikleri göster
  const renderOzellikler = () => {
    const ozellikler = [
      { key: "wifi", label: "Ücretsiz WiFi", icon: "wifi" },
      { key: "otopark", label: "Otopark", icon: "car" },
      { key: "kredi_karti", label: "Kredi Kartı", icon: "credit-card" },
      { key: "rezervasyon", label: "Rezervasyon", icon: "calendar" },
      { key: "paket_servis", label: "Paket Servis", icon: "package" },
      { key: "engelli_erisim", label: "Engelli Erişimi", icon: "wheelchair" },
      { key: "bebek_dostu", label: "Bebek Dostu", icon: "baby" },
      { key: "evcil_hayvan_dostu", label: "Evcil Hayvan Dostu", icon: "dog" },
      { key: "sigara_alani", label: "Sigara Alanı", icon: "cigarette" },
      { key: "canli_muzik", label: "Canlı Müzik", icon: "music" },
      { key: "kahvalti", label: "Kahvaltı", icon: "coffee" },
      { key: "aksam_yemegi", label: "Akşam Yemeği", icon: "utensils" },
      { key: "tv", label: "TV", icon: "tv" },
      { key: "ucretsiz_teslimat", label: "Ücretsiz Teslimat", icon: "truck" },
      { key: "nakit_odeme", label: "Nakit Ödeme", icon: "dollar-sign" },
      { key: "online_odeme", label: "Online Ödeme", icon: "credit-card" },
      { key: "temassiz_odeme", label: "Temassız Ödeme", icon: "smartphone" },
      { key: "organik_urunler", label: "Organik Ürünler", icon: "leaf" },
      { key: "glutensiz_secenekler", label: "Glutensiz Seçenekler", icon: "wheat-off" },
      { key: "vegan_secenekler", label: "Vegan Seçenekler", icon: "salad" },
    ]

    console.log("RENDER ÖZELLİKLER - İŞLETME:", isletme)

    const aktifOzellikler = ozellikler.filter((ozellik) => {
      const key = ozellik.key as keyof typeof isletme
      const value = isletme[key]
      console.log(`ÖZELLİK ${ozellik.key}:`, value, typeof value)
      return value === true || value === "true"
    })

    console.log("AKTİF ÖZELLİKLER:", aktifOzellikler)

    if (aktifOzellikler.length === 0) {
      return <p className="text-gray-500">Özellik belirtilmemiş.</p>
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {aktifOzellikler.map((ozellik) => (
          <Badge
            key={ozellik.key}
            variant="outline"
            className="flex items-center gap-1 py-2 px-3 text-sm bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <span>{ozellik.label}</span>
          </Badge>
        ))}
      </div>
    )
  }

  // Fiyat aralığı için güvenli dönüşüm
  const renderFiyatAraligi = () => {
    if (!isletme.fiyat_araligi) return null

    try {
      const fiyatSayisi = Number.parseInt(isletme.fiyat_araligi.toString())
      if (isNaN(fiyatSayisi) || fiyatSayisi <= 0 || fiyatSayisi > 5) return null

      return (
        <Badge variant="outline" className="ml-auto bg-gray-50">
          {"₺".repeat(fiyatSayisi)}
        </Badge>
      )
    } catch (error) {
      console.error("Fiyat aralığı işlenemedi:", error)
      return null
    }
  }

  // Sertifikalar ve ödüller
  const renderSertifikalarOduller = () => {
    const hasSertifikalar =
      isletme.sertifikalar && Array.isArray(isletme.sertifikalar) && isletme.sertifikalar.length > 0
    const hasOduller = isletme.odullar && Array.isArray(isletme.odullar) && isletme.odullar.length > 0

    if (!hasSertifikalar && !hasOduller) return null

    return (
      <div className="mt-6 space-y-6">
        {hasSertifikalar && (
          <div className="animate-fade-in fade-in-1">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Sertifikalar
            </h3>
            <div className="flex flex-wrap gap-2">
              {isletme.sertifikalar.map((sertifika, index) => (
                <Badge key={index} variant="outline" className="bg-green-50 text-green-800">
                  {sertifika}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {hasOduller && (
          <div className="animate-fade-in fade-in-2">
            <h3 className="text-lg font-semibold mb-3 flex items-center">
              <Award className="h-5 w-5 mr-2 text-amber-500" />
              Ödüller
            </h3>
            <div className="flex flex-wrap gap-2">
              {isletme.odullar.map((odul, index) => (
                <Badge key={index} variant="outline" className="bg-amber-50 text-amber-800">
                  {odul}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Kuruluş yılı
  const renderKurulusYili = () => {
    if (!isletme.kurulus_yili) return null

    return (
      <div className="flex items-center gap-2 mt-4">
        <Calendar className="h-4 w-4 text-primary-500" />
        <span className="text-gray-700">
          <strong>Kuruluş Yılı:</strong> {isletme.kurulus_yili}
        </span>
      </div>
    )
  }

  // Paylaşım fonksiyonu
  const handleShare = async () => {
    const shareData = {
      title: isletme.isletme_adi,
      text: isletme.aciklama?.substring(0, 100) || `${isletme.isletme_adi} - ${isletme.kategori || ""}`,
      url: window.location.href,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Paylaşım API'si yoksa kopyala
        await navigator.clipboard.writeText(window.location.href)
        alert("Bağlantı panoya kopyalandı!")
      }
    } catch (error) {
      console.error("Paylaşım hatası:", error)
    }
  }

  // SSS toggle
  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  // Harita iframe'i render et
  const renderHaritaIframe = () => {
    if (!isletme.harita_linki) return null

    try {
      // iframe HTML'ini güvenli bir şekilde işle
      return <div className="h-[400px] w-full" dangerouslySetInnerHTML={{ __html: isletme.harita_linki }} />
    } catch (error) {
      console.error("Harita iframe işlenemedi:", error)
      return <p className="text-gray-500">Harita görüntülenemiyor.</p>
    }
  }

  return (
    <>
      {/* SEO için yapısal veri */}
      {isClient && (
        <EnhancedSchemaOrg
          isletme={isletme}
          siteUrl={process.env.NEXT_PUBLIC_SITE_URL || "https://isletmenionecikar.com"}
        />
      )}

      <div className="bg-white min-h-screen">
        {/* Hero Bölümü */}
        <div className="relative h-[50vh] md:h-[60vh] overflow-hidden">
          {/* Paralaks Arkaplan */}
          <div
            ref={heroRef}
            className="absolute inset-0 bg-cover bg-center hero-parallax"
            style={{
              backgroundImage: `url(${isletme.fotograf_url || sliderImages[0]?.url || "/placeholder.svg?height=800&width=1200"})`,
            }}
          />

          {/* Gradient Overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-transparent z-10"
            aria-hidden="true"
          />

          {/* Hero İçeriği */}
          <div className="container relative z-20 h-full flex flex-col justify-end pb-16">
            <div className="animate-fade-in">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2 drop-shadow-md">
                {isletme.isletme_adi}
              </h1>

              <div className="flex flex-wrap gap-2 mb-4">
                {isletme.kategori && (
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm">
                    {isletme.kategori}
                  </Badge>
                )}
                {isletme.alt_kategori && (
                  <Badge variant="outline" className="text-white border-white/40">
                    {isletme.alt_kategori}
                  </Badge>
                )}
                {renderFiyatAraligi()}
              </div>

              <div className="flex items-center text-white/90 text-sm gap-4">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {isletme.ilce && `${isletme.ilce}, `}
                    {isletme.sehir}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Nav */}
        <StickyNav sections={sections} offset={80} />

        {/* Ana İçerik */}
        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sol Kolon */}
            <div className="lg:col-span-2 space-y-16">
              {/* Hakkında Bölümü */}
              <section id="hakkinda" className="scroll-mt-20">
                <SectionHeading title="Hakkında" icon={Info} className="animate-fade-in" />
                <InfoCard className="prose max-w-none">
                  <div className="whitespace-pre-line text-gray-700 leading-relaxed">{isletme.aciklama}</div>
                  {renderKurulusYili()}
                  {renderSertifikalarOduller()}
                </InfoCard>
              </section>

              {/* Özellikler Bölümü */}
              <section id="ozellikler" className="scroll-mt-20">
                <SectionHeading title="Özellikler" icon={CheckCircle} className="animate-fade-in" />
                <InfoCard>{renderOzellikler()}</InfoCard>
              </section>

              {/* Ürünler ve Hizmetler Bölümü */}
              <section id="urunler-hizmetler" className="scroll-mt-20">
                <SectionHeading title="Ürünler ve Hizmetler" icon={Star} className="animate-fade-in" />

                {/* Video */}
                {isletme.video_url && (
                  <div className="mb-8 animate-fade-in fade-in-1">
                    <h3 className="text-lg font-semibold mb-3">Tanıtım Videosu</h3>
                    <VideoPlayer
                      videoUrl={isletme.video_url}
                      title={isletme.video_baslik}
                      posterUrl={isletme.fotograf_url}
                    />
                  </div>
                )}

                {/* Öne Çıkan Ürünler */}
                {oneCikanUrunler.length > 0 && (
                  <div className="mb-8 animate-fade-in fade-in-2">
                    <h3 className="text-lg font-semibold mb-3">Öne Çıkan Ürünler</h3>
                    <FeaturedProducts products={oneCikanUrunler} title="" />
                  </div>
                )}

                {/* Öne Çıkan Hizmetler */}
                {oneCikanHizmetler.length > 0 && (
                  <div className="mb-8 animate-fade-in fade-in-3">
                    <h3 className="text-lg font-semibold mb-3">Öne Çıkan Hizmetler</h3>
                    <FeaturedServices services={oneCikanHizmetler} title="" />
                  </div>
                )}

                {/* Sunulan Hizmetler */}
                {hizmetler.length > 0 && (
                  <div className="animate-fade-in fade-in-4">
                    <h3 className="text-lg font-semibold mb-3">Sunulan Hizmetler</h3>
                    <InfoCard>
                      <div className="flex flex-wrap gap-2">
                        {hizmetler.map((hizmet, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="animate-fade-in"
                            style={{ animationDelay: `${index * 0.05}s` }}
                          >
                            {hizmet}
                          </Badge>
                        ))}
                      </div>
                    </InfoCard>
                  </div>
                )}
              </section>

              {/* Konum Bölümü */}
              <section id="konum" className="scroll-mt-20">
                <SectionHeading title="Konum" icon={MapIcon} className="animate-fade-in" />
                <InfoCard className="p-0 overflow-hidden">
                  {isletme.latitude && isletme.longitude ? (
                    <div className="h-[400px]">
                      <IsletmeHaritasi
                        isletmeler={[
                          {
                            id: isletme.id,
                            isletme_adi: isletme.isletme_adi,
                            latitude: Number.parseFloat(isletme.latitude.toString()),
                            longitude: Number.parseFloat(isletme.longitude.toString()),
                            adres: isletme.adres,
                            kategori: isletme.kategori,
                          },
                        ]}
                        center={[
                          Number.parseFloat(isletme.latitude.toString()),
                          Number.parseFloat(isletme.longitude.toString()),
                        ]}
                        zoom={15}
                      />
                    </div>
                  ) : isletme.harita_linki ? (
                    renderHaritaIframe()
                  ) : (
                    <div className="p-6">
                      <p className="text-gray-500">Konum bilgisi belirtilmemiş.</p>
                    </div>
                  )}
                </InfoCard>
              </section>

              {/* Instagram Bölümü */}
              <section id="instagram" className="scroll-mt-20">
                <SectionHeading
                  title="Instagram"
                  description="İşletmenin Instagram hesabı"
                  className="animate-fade-in"
                />
                {isClient && extractInstagramUsername(isletme.sosyal_medya) ? (
                  <InstagramSimple username={extractInstagramUsername(isletme.sosyal_medya)} />
                ) : (
                  <InfoCard>
                    <div className="text-center py-6">
                      <p className="text-gray-500">Instagram bilgisi bulunamadı</p>
                    </div>
                  </InfoCard>
                )}
              </section>

              {/* SSS Bölümü */}
              <section id="sss" className="scroll-mt-20">
                <SectionHeading title="Sık Sorulan Sorular" className="animate-fade-in" />
                <InfoCard>
                  <div className="space-y-4">
                    {faqs.map((faq, index) => (
                      <div key={index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                        <button
                          onClick={() => toggleFaq(index)}
                          className="flex justify-between items-center w-full text-left font-medium py-2"
                        >
                          <span>{faq.question}</span>
                          <span
                            className={`text-primary-500 transition-transform ${openFaq === index ? "rotate-90" : ""}`}
                          >
                            &gt;
                          </span>
                        </button>
                        {openFaq === index && <div className="py-2 text-gray-600">{faq.answer}</div>}
                      </div>
                    ))}
                  </div>
                </InfoCard>
              </section>
            </div>

            {/* Sağ Kolon - Yan Bilgiler */}
            <div className="space-y-8">
              {/* İletişim Bilgileri */}
              <InfoCard>
                <h3 className="text-lg font-semibold mb-4">İletişim Bilgileri</h3>
                <div className="space-y-3">
                  {isletme.telefon && (
                    <div className="flex items-start gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mt-0.5 text-primary-500"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <span>{isletme.telefon}</span>
                    </div>
                  )}
                  {isletme.website && (
                    <div className="flex items-start gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mt-0.5 text-primary-500"
                      >
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="M22 17H2" />
                      </svg>
                      <a href={isletme.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {isletme.website}
                      </a>
                    </div>
                  )}
                  {isletme.eposta && (
                    <div className="flex items-start gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mt-0.5 text-primary-500"
                      >
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                      <a href={`mailto:${isletme.eposta}`} className="hover:underline">
                        {isletme.eposta}
                      </a>
                    </div>
                  )}
                  {isletme.adres && (
                    <div className="flex items-start gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mt-0.5 text-primary-500"
                      >
                        <path d="M20.42 10.18a8.32 8.32 0 0 0-12.24-8.36 8.32 8.32 0 0 0-8.36 12.24 8.32 8.32 0 0 0 12.24 8.36 8.32 8.32 0 0 0 8.36-12.24z" />
                        <path d="m12 13.5 4.5-4.5" />
                        <path d="M12 6v7.5" />
                      </svg>
                      <span>{isletme.adres}</span>
                    </div>
                  )}
                  {renderCalismaSaatleri()}
                </div>
              </InfoCard>

              {/* Sosyal Medya */}
              <InfoCard>
                <h3 className="text-lg font-semibold mb-4">Sosyal Medya</h3>
                {renderSosyalMedya()}
              </InfoCard>

              {/* Slider */}
              {sliderImages.length > 1 && (
                <InfoCard>
                  <h3 className="text-lg font-semibold mb-4">Fotoğraflar</h3>
                  <ImageSlider images={sliderImages} />
                </InfoCard>
              )}

              {/* Aksiyon Butonları (Mobil) */}
              {isClient && <MobileActionButtons isletme={isletme} onShare={handleShare} />}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
