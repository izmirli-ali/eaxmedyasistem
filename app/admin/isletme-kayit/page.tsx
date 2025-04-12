"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Trash2, Wand2, Facebook, Instagram, Twitter, Linkedin, Youtube } from "lucide-react"
import { validateFormData } from "@/utils/validation-helpers"
import { generateSeoSuggestions } from "@/utils/seo-helpers"
import { validatePhone } from "@/utils/phone-validation-helper"

export default function IsletmeKayitPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("temel-bilgiler")
  const [fotograf, setFotograf] = useState(null)
  const [fotografPreview, setFotografPreview] = useState("")
  const [selectedHizmetler, setSelectedHizmetler] = useState([])
  const [formData, setFormData] = useState({
    isletme_adi: "",
    kategori: "",
    alt_kategori: "",
    telefon: "",
    email: "",
    website: "",
    adres: "",
    sehir: "",
    ilce: "",
    koordinatlar: "",
    aciklama: "",
    calisma_saatleri: "",
    sunulan_hizmetler: "",
    sosyal_medya: "",
    instagram_url: "",
    facebook_url: "",
    twitter_url: "",
    linkedin_url: "",
    youtube_url: "",
    seo_baslik: "",
    seo_aciklama: "",
    seo_anahtar_kelimeler: "",
    url_slug: "",
    fotograf_url: "",
  })

  // Supabase istemcisini oluştur
  const supabase = createClient()

  // Form değişikliklerini işle
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Select değişikliklerini işle
  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Hizmet seçimlerini işle
  const handleHizmetChange = (hizmet) => {
    setSelectedHizmetler((prev) => {
      if (prev.includes(hizmet)) {
        return prev.filter((item) => item !== hizmet)
      } else {
        return [...prev, hizmet]
      }
    })
  }

  // Fotoğraf yükleme işlemi
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFotograf(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setFotografPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  // Fotoğraf kaldırma işlemi
  const handleRemoveImage = () => {
    setFotograf(null)
    setFotografPreview("")
    setFormData((prev) => ({ ...prev, fotograf_url: "" }))
  }

  // Fotoğraf yükleme fonksiyonu
  const handleImageUpload = async (file) => {
    try {
      if (!file) return null

      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `isletme-fotograflari/${fileName}`

      // Storage'a yükle
      const { error: uploadError, data } = await supabase.storage.from("isletme-fotograflari").upload(filePath, file)

      if (uploadError) throw uploadError

      // Public URL al
      const { data: publicUrlData } = supabase.storage.from("isletme-fotograflari").getPublicUrl(filePath)

      return publicUrlData.publicUrl
    } catch (error) {
      console.error("Görsel yükleme hatası:", error)
      return null
    }
  }

  // Form gönderimi
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setIsSubmitting(true)

    try {
      console.log("Form gönderimi başlatıldı", formData)
      toast({
        title: "İşlem başlatıldı",
        description: "İşletme kaydediliyor, lütfen bekleyin...",
      })

      // Koordinat alanını temizle eğer boşsa
      const updatedFormData = {
        ...formData,
        koordinatlar: formData.koordinatlar?.trim() || "",
      }

      // Telefon numarasını ön işleme tabi tutalım
      const phoneResult = validatePhone(updatedFormData.telefon)
      if (!phoneResult.valid) {
        throw new Error(`Lütfen form hatalarını düzeltin:\n${phoneResult.message}`)
      }

      // Sunulan hizmetleri birleştir
      const hizmetlerString = selectedHizmetler.join(", ")

      // Telefon numarasını formatlanmış haliyle güncelleyelim
      updatedFormData.telefon = phoneResult.formatted
      updatedFormData.sunulan_hizmetler = hizmetlerString

      // Form verilerini doğrula
      const { isValid, errors, formattedData } = validateFormData(updatedFormData)

      if (!isValid) {
        // Hataları göster
        const errorMessages = Object.values(errors).join("\n")
        throw new Error(`Lütfen form hatalarını düzeltin:\n${errorMessages}`)
      }

      // Doğrulanmış verileri kullan
      const validatedFormData = formattedData

      // Şehir kontrolü - eğer şehir seçilmediyse hata ver
      if (!validatedFormData.sehir) {
        throw new Error("Lütfen bir şehir seçin")
      }

      // Fotoğraf yükleme işlemi
      let imageUrl = validatedFormData.fotograf_url

      if (fotograf && !imageUrl) {
        console.log("Fotoğraf yükleniyor...")
        imageUrl = await handleImageUpload(fotograf)

        if (!imageUrl) {
          throw new Error("Görsel yüklenemedi. Lütfen tekrar deneyin.")
        }
        console.log("Fotoğraf yüklendi:", imageUrl)
      }

      // SEO alanları boşsa otomatik öneriler oluştur
      if (
        !validatedFormData.seo_baslik ||
        !validatedFormData.seo_aciklama ||
        !validatedFormData.seo_anahtar_kelimeler
      ) {
        const seoSuggestions = generateSeoSuggestions(validatedFormData)

        // Boş alanları doldur
        if (!validatedFormData.seo_baslik) {
          validatedFormData.seo_baslik = seoSuggestions.title
        }

        if (!validatedFormData.seo_aciklama) {
          validatedFormData.seo_aciklama = seoSuggestions.description
        }

        if (!validatedFormData.seo_anahtar_kelimeler) {
          validatedFormData.seo_anahtar_kelimeler = seoSuggestions.keywords.join(", ")
        }

        // URL slug önerisi
        if (!validatedFormData.url_slug && seoSuggestions.slug) {
          validatedFormData.url_slug = seoSuggestions.slug
        }
      }

      // Kullanıcı ID'sini al
      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData.session?.user.id

      if (!userId) {
        throw new Error("Oturum bilgisi alınamadı. Lütfen tekrar giriş yapın.")
      }

      // Veritabanına gönderilmeyecek alanları çıkar
      const {
        instagram_url,
        facebook_url,
        twitter_url,
        linkedin_url,
        youtube_url,
        alt_kategori,
        ilce,
        sosyal_medya, // Bu alanı çıkarıyoruz
        ...dbFormData
      } = validatedFormData

      // Alt kategori ve ilçe bilgilerini ekle
      if (alt_kategori) {
        dbFormData.alt_kategori = alt_kategori
      }

      if (ilce) {
        dbFormData.ilce = ilce
      }

      // Sosyal medya verilerini JSON olarak birleştir
      // Boş değerleri filtreleyelim
      const sosyalMedyaData = {}

      if (instagram_url) sosyalMedyaData.instagram = instagram_url
      if (facebook_url) sosyalMedyaData.facebook = facebook_url
      if (twitter_url) sosyalMedyaData.twitter = twitter_url
      if (linkedin_url) sosyalMedyaData.linkedin = linkedin_url
      if (youtube_url) sosyalMedyaData.youtube = youtube_url

      // Sosyal medya verilerini JSON string'e dönüştür
      // Eğer hiçbir sosyal medya bilgisi yoksa null gönderelim
      const sosyalMedyaJSON = Object.keys(sosyalMedyaData).length > 0 ? JSON.stringify(sosyalMedyaData) : null

      // İşletmeyi ekle
      const { data, error } = await supabase
        .from("isletmeler")
        .insert([
          {
            ...dbFormData,
            fotograf_url: imageUrl,
            kullanici_id: userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sosyal_medya: sosyalMedyaJSON, // Sosyal medya verilerini JSON olarak ekle
          },
        ])
        .select()

      if (error) {
        console.error("İşletme eklenirken hata:", error)
        throw new Error(`İşletme eklenirken bir hata oluştu: ${error.message}`)
      }

      if (!data || data.length === 0) {
        throw new Error("İşletme kaydedildi ancak veri döndürülemedi.")
      }

      console.log("İşletme başarıyla eklendi:", data)

      // Form verilerini temizle
      setFormData({
        isletme_adi: "",
        kategori: "",
        alt_kategori: "",
        telefon: "",
        email: "",
        website: "",
        adres: "",
        sehir: "",
        ilce: "",
        koordinatlar: "",
        aciklama: "",
        calisma_saatleri: "",
        sunulan_hizmetler: "",
        sosyal_medya: "",
        instagram_url: "",
        facebook_url: "",
        twitter_url: "",
        linkedin_url: "",
        youtube_url: "",
        seo_baslik: "",
        seo_aciklama: "",
        seo_anahtar_kelimeler: "",
        url_slug: "",
        fotograf_url: "",
      })
      setFotograf(null)
      setFotografPreview("")
      setSelectedHizmetler([])

      // Başarılı kayıt mesajı
      toast({
        title: "İşletme başarıyla eklendi",
        description: "İşletme kaydı başarıyla oluşturuldu. İşletme listesine yönlendiriliyorsunuz.",
        duration: 5000, // 5 saniye göster
      })

      // Kısa bir gecikme ekle - kullanıcının mesajı görmesi için
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // İşletme listesi sayfasına yönlendir
      router.push("/admin/isletme-listesi")
    } catch (error) {
      console.error("İşletme eklenirken hata oluştu:", error)

      // Daha detaylı hata mesajı göster
      toast({
        title: "Hata",
        description: `İşletme eklenirken bir hata oluştu: ${error.message}`,
        variant: "destructive",
        duration: 10000, // 10 saniye göster
      })
    } finally {
      setLoading(false)
      setIsSubmitting(false)
    }
  }

  // Kategori seçenekleri - daha kapsamlı
  const kategoriler = [
    "Yeme & İçme",
    "Konaklama",
    "Sağlık",
    "Güzellik & Bakım",
    "Eğitim",
    "Alışveriş",
    "Hizmet",
    "Eğlence & Aktivite",
    "Spor & Fitness",
    "Otomotiv",
    "Emlak",
    "Finans & Sigorta",
    "Teknoloji",
    "Medya & Reklam",
    "Hukuk",
    "İnşaat & Yapı",
    "Üretim & Sanayi",
    "Tarım & Hayvancılık",
    "Taşımacılık & Lojistik",
    "Turizm & Seyahat",
    "Diğer",
  ]

  // Alt kategori seçenekleri - kategori seçimine göre dinamik
  const getAltKategoriler = (kategori) => {
    const altKategoriMap = {
      "Yeme & İçme": [
        "Restoran",
        "Kafe",
        "Pastane",
        "Fast Food",
        "Kahvaltı Salonu",
        "Bar",
        "Pub",
        "Nargile Kafe",
        "Çay Bahçesi",
        "Tatlıcı",
        "Dondurma",
        "Büfe",
        "Catering",
        "Yöresel Mutfak",
        "Dünya Mutfağı",
      ],
      Konaklama: [
        "Otel",
        "Pansiyon",
        "Butik Otel",
        "Apart Otel",
        "Tatil Köyü",
        "Motel",
        "Hostel",
        "Kamp Alanı",
        "Karavan Parkı",
        "Villa Kiralama",
        "Dağ Evi",
        "Yayla Evi",
      ],
      Sağlık: [
        "Hastane",
        "Klinik",
        "Poliklinik",
        "Diş Hekimi",
        "Eczane",
        "Fizik Tedavi Merkezi",
        "Psikolog",
        "Diyetisyen",
        "Veteriner",
        "Medikal Ürünler",
        "Optik",
        "Laboratuvar",
      ],
      "Güzellik & Bakım": [
        "Kuaför",
        "Berber",
        "Güzellik Salonu",
        "SPA",
        "Masaj Salonu",
        "Cilt Bakım Merkezi",
        "Manikür & Pedikür",
        "Epilasyon Merkezi",
        "Solaryum",
        "Kalıcı Makyaj",
      ],
      Eğitim: [
        "Okul",
        "Üniversite",
        "Anaokulu",
        "Kreş",
        "Dil Kursu",
        "Sürücü Kursu",
        "Sanat Kursu",
        "Müzik Kursu",
        "Dans Kursu",
        "Özel Ders",
        "Etüt Merkezi",
        "Kişisel Gelişim",
      ],
      Alışveriş: [
        "Giyim",
        "Ayakkabı",
        "Aksesuar",
        "Elektronik",
        "Mobilya",
        "Ev Dekorasyon",
        "Market",
        "Bakkal",
        "Şarküteri",
        "Kasap",
        "Manav",
        "Kırtasiye",
        "Kitapçı",
        "Oyuncak",
        "Hediyelik Eşya",
      ],
      Hizmet: [
        "Temizlik",
        "Tamir",
        "Tadilat",
        "Nakliyat",
        "Organizasyon",
        "Danışmanlık",
        "Tercüme",
        "Matbaa",
        "Kuru Temizleme",
        "Terzi",
        "Çilingir",
        "Teknik Servis",
        "Fotoğrafçı",
        "Çiçekçi",
      ],
      "Eğlence & Aktivite": [
        "Sinema",
        "Tiyatro",
        "Konser Salonu",
        "Müze",
        "Sanat Galerisi",
        "Lunapark",
        "Oyun Salonu",
        "Bowling",
        "Bilardo",
        "Paintball",
        "Escape Room",
        "Gece Kulübü",
        "Eğlence Merkezi",
      ],
      "Spor & Fitness": [
        "Spor Salonu",
        "Fitness Merkezi",
        "Yüzme Havuzu",
        "Tenis Kortu",
        "Futbol Sahası",
        "Basketbol Sahası",
        "Voleybol Sahası",
        "Pilates & Yoga",
        "Dans Stüdyosu",
        "Spor Kulübü",
      ],
      Otomotiv: [
        "Galeri",
        "Servis",
        "Yedek Parça",
        "Lastik",
        "Oto Yıkama",
        "Oto Kiralama",
        "Oto Ekspertiz",
        "Oto Kaporta & Boya",
        "Oto Elektrik",
        "Oto Cam",
        "Oto Döşeme",
        "Motosiklet",
      ],
      Emlak: [
        "Emlak Ofisi",
        "Müteahhit",
        "Gayrimenkul Danışmanlığı",
        "Emlak Yatırım",
        "Kiralama",
        "Satış",
        "Değerleme",
        "Site Yönetimi",
        "Konut Projeleri",
        "Ticari Gayrimenkul",
      ],
      "Finans & Sigorta": [
        "Banka",
        "Sigorta Acentesi",
        "Finans Danışmanlığı",
        "Muhasebe",
        "Mali Müşavirlik",
        "Döviz Bürosu",
        "Faktoring",
        "Leasing",
        "Yatırım Danışmanlığı",
        "Emeklilik",
      ],
      Teknoloji: [
        "Bilgisayar",
        "Telefon",
        "Yazılım",
        "Donanım",
        "Web Tasarım",
        "Mobil Uygulama",
        "Dijital Pazarlama",
        "E-ticaret",
        "Bilişim Hizmetleri",
        "Veri Merkezi",
        "Güvenlik Sistemleri",
      ],
      "Medya & Reklam": [
        "Reklam Ajansı",
        "Medya Planlama",
        "Grafik Tasarım",
        "Video Prodüksiyon",
        "Fotoğrafçılık",
        "Sosyal Medya Ajansı",
        "PR Ajansı",
        "Matbaa",
        "Dijital Baskı",
        "Promosyon Ürünleri",
      ],
      Hukuk: [
        "Avukatlık Bürosu",
        "Hukuk Danışmanlığı",
        "Noter",
        "Arabuluculuk",
        "Bilirkişi",
        "Patent & Marka Tescil",
        "Hukuki Tercüme",
        "Adli Sicil",
        "Tapu İşlemleri",
      ],
      "İnşaat & Yapı": [
        "Müteahhitlik",
        "Mimarlık",
        "Mühendislik",
        "İç Mimari",
        "Peyzaj",
        "Yapı Malzemeleri",
        "Boya & Badana",
        "Elektrik",
        "Tesisat",
        "Dekorasyon",
        "Mobilya",
        "Mutfak & Banyo",
      ],
      "Üretim & Sanayi": [
        "Tekstil",
        "Gıda",
        "Makine",
        "Metal",
        "Plastik",
        "Kimya",
        "Elektronik",
        "Otomotiv",
        "Mobilya",
        "İnşaat",
        "Ambalaj",
        "Kağıt",
        "Cam",
        "Seramik",
        "Deri",
      ],
      "Tarım & Hayvancılık": [
        "Çiftlik",
        "Sera",
        "Tohum",
        "Gübre",
        "Zirai İlaç",
        "Sulama Sistemleri",
        "Hayvancılık",
        "Süt Ürünleri",
        "Et Ürünleri",
        "Organik Tarım",
        "Arıcılık",
        "Balıkçılık",
      ],
      "Taşımacılık & Lojistik": [
        "Kargo",
        "Kurye",
        "Nakliye",
        "Depolama",
        "Gümrükleme",
        "Uluslararası Taşımacılık",
        "Yük Taşımacılığı",
        "Yolcu Taşımacılığı",
        "Taksi",
        "Servis",
        "Rent a Car",
      ],
      "Turizm & Seyahat": [
        "Seyahat Acentesi",
        "Tur Operatörü",
        "Rehberlik",
        "Vize İşlemleri",
        "Uçak Bileti",
        "Otel Rezervasyon",
        "Tatil Paketi",
        "Kültür Turu",
        "Doğa Turu",
        "Gemi Turu",
      ],
      Diğer: ["Diğer Hizmetler"],
    }

    return altKategoriMap[kategori] || []
  }

  // Şehir seçenekleri
  const sehirler = [
    "Adana",
    "Adıyaman",
    "Afyonkarahisar",
    "Ağrı",
    "Amasya",
    "Ankara",
    "Antalya",
    "Artvin",
    "Aydın",
    "Balıkesir",
    "Bilecik",
    "Bingöl",
    "Bitlis",
    "Bolu",
    "Burdur",
    "Bursa",
    "Çanakkale",
    "Çankırı",
    "Çorum",
    "Denizli",
    "Diyarbakır",
    "Edirne",
    "Elazığ",
    "Erzincan",
    "Erzurum",
    "Eskişehir",
    "Gaziantep",
    "Giresun",
    "Gümüşhane",
    "Hakkari",
    "Hatay",
    "Isparta",
    "Mersin",
    "İstanbul",
    "İzmir",
    "Kars",
    "Kastamonu",
    "Kayseri",
    "Kırklareli",
    "Kırşehir",
    "Kocaeli",
    "Konya",
    "Kütahya",
    "Malatya",
    "Manisa",
    "Kahramanmaraş",
    "Mardin",
    "Muğla",
    "Muş",
    "Nevşehir",
    "Niğde",
    "Ordu",
    "Rize",
    "Sakarya",
    "Samsun",
    "Siirt",
    "Sinop",
    "Sivas",
    "Tekirdağ",
    "Tokat",
    "Trabzon",
    "Tunceli",
    "Şanlıurfa",
    "Uşak",
    "Van",
    "Yozgat",
    "Zonguldak",
    "Aksaray",
    "Bayburt",
    "Karaman",
    "Kırıkkale",
    "Batman",
    "Şırnak",
    "Bartın",
    "Ardahan",
    "Iğdır",
    "Yalova",
    "Karabük",
    "Kilis",
    "Osmaniye",
    "Düzce",
  ]

  // İlçe seçenekleri - şehir seçimine göre dinamik
  const getIlceler = (sehir) => {
    // Örnek olarak İstanbul ilçeleri
    if (sehir === "İstanbul") {
      return [
        "Adalar",
        "Arnavutköy",
        "Ataşehir",
        "Avcılar",
        "Bağcılar",
        "Bahçelievler",
        "Bakırköy",
        "Başakşehir",
        "Bayrampaşa",
        "Beşiktaş",
        "Beykoz",
        "Beylikdüzü",
        "Beyoğlu",
        "Büyükçekmece",
        "Çatalca",
        "Çekmeköy",
        "Esenler",
        "Esenyurt",
        "Eyüpsultan",
        "Fatih",
        "Gaziosmanpaşa",
        "Güngören",
        "Kadıköy",
        "Kağıthane",
        "Kartal",
        "Küçükçekmece",
        "Maltepe",
        "Pendik",
        "Sancaktepe",
        "Sarıyer",
        "Silivri",
        "Sultanbeyli",
        "Sultangazi",
        "Şile",
        "Şişli",
        "Tuzla",
        "Ümraniye",
        "Üsküdar",
        "Zeytinburnu",
      ]
    }
    // Örnek olarak Ankara ilçeleri
    else if (sehir === "Ankara") {
      return [
        "Akyurt",
        "Altındağ",
        "Ayaş",
        "Balâ",
        "Beypazarı",
        "Çamlıdere",
        "Çankaya",
        "Çubuk",
        "Elmadağ",
        "Etimesgut",
        "Evren",
        "Gölbaşı",
        "Güdül",
        "Haymana",
        "Kalecik",
        "Kahramankazan",
        "Keçiören",
        "Kızılcahamam",
        "Mamak",
        "Nallıhan",
        "Polatlı",
        "Pursaklar",
        "Sincan",
        "Şereflikoçhisar",
        "Yenimahalle",
      ]
    }
    // Örnek olarak İzmir ilçeleri
    else if (sehir === "İzmir") {
      return [
        "Aliağa",
        "Balçova",
        "Bayındır",
        "Bayraklı",
        "Bergama",
        "Beydağ",
        "Bornova",
        "Buca",
        "Çeşme",
        "Çiğli",
        "Dikili",
        "Foça",
        "Gaziemir",
        "Güzelbahçe",
        "Karabağlar",
        "Karaburun",
        "Karşıyaka",
        "Kemalpaşa",
        "Kınık",
        "Kiraz",
        "Konak",
        "Menderes",
        "Menemen",
        "Narlıdere",
        "Ödemiş",
        "Seferihisar",
        "Selçuk",
        "Tire",
        "Torbalı",
        "Urla",
      ]
    }
    // Diğer şehirler için boş dizi döndür
    return []
  }

  // Sunulan hizmetler seçenekleri - kategori seçimine göre dinamik
  const getHizmetler = (kategori) => {
    const hizmetlerMap = {
      "Yeme & İçme": [
        "Wi-Fi",
        "Paket Servis",
        "Rezervasyon",
        "Canlı Müzik",
        "Açık Alan",
        "Bahçe",
        "Teras",
        "Manzara",
        "Otopark",
        "Vale",
        "Çocuk Oyun Alanı",
        "Çocuk Menüsü",
        "Vejetaryen Menü",
        "Vegan Menü",
        "Glutensiz Menü",
        "Alkollü İçecek",
        "Nargile",
        "TV",
        "Maç Yayını",
        "Doğum Günü Organizasyonu",
        "Özel Etkinlik",
        "Kahvaltı",
        "Brunch",
        "Öğle Yemeği",
        "Akşam Yemeği",
        "Geç Saate Kadar Açık",
        "24 Saat Açık",
        "Kredi Kartı",
        "Online Ödeme",
        "Sodexo",
        "Multinet",
        "Setcard",
        "Ticket",
      ],
      Konaklama: [
        "Wi-Fi",
        "Otopark",
        "Vale",
        "Havuz",
        "Spa",
        "Sauna",
        "Hamam",
        "Fitness",
        "Restoran",
        "Bar",
        "Oda Servisi",
        "Kahvaltı Dahil",
        "Klima",
        "TV",
        "Minibar",
        "Kasa",
        "Çamaşırhane",
        "Ütü Servisi",
        "Toplantı Salonu",
        "Konferans Salonu",
        "İş Merkezi",
        "Havaalanı Transferi",
        "Tur Servisi",
        "Bisiklet Kiralama",
        "Araç Kiralama",
        "Evcil Hayvan Dostu",
        "Engelli Dostu",
        "Denize Sıfır",
        "Kayak Merkezi",
        "Doğa Manzarası",
        "Şehir Manzarası",
        "Balayı Paketi",
      ],
      Sağlık: [
        "Acil Servis",
        "7/24 Hizmet",
        "Randevu",
        "Online Randevu",
        "Ev Ziyareti",
        "Ambulans",
        "Laboratuvar",
        "Röntgen",
        "Ultrason",
        "MR",
        "Tomografi",
        "Fizik Tedavi",
        "Diş Tedavisi",
        "Estetik Cerrahi",
        "Göz Tedavisi",
        "Cilt Bakımı",
        "Saç Ekimi",
        "Psikoterapi",
        "Diyetisyen",
        "Çocuk Sağlığı",
        "Kadın Hastalıkları",
        "Doğum",
        "Kalp Sağlığı",
        "Ortopedi",
        "Nöroloji",
      ],
      "Güzellik & Bakım": [
        "Saç Kesimi",
        "Saç Boyama",
        "Fön",
        "Manikür",
        "Pedikür",
        "Oje",
        "Kalıcı Oje",
        "Protez Tırnak",
        "Kaş Tasarımı",
        "Kirpik Lifting",
        "Kirpik Perması",
        "Makyaj",
        "Kalıcı Makyaj",
        "Cilt Bakımı",
        "Lazer Epilasyon",
        "Ağda",
        "Sir Ağda",
        "İpek Kirpik",
        "Microblading",
        "Masaj",
        "SPA",
        "Solaryum",
        "Zayıflama",
        "Selülit Tedavisi",
        "Saç Bakımı",
        "Sakal Tıraşı",
        "Erkek Bakımı",
      ],
      Eğitim: [
        "Özel Ders",
        "Grup Dersi",
        "Online Eğitim",
        "Yabancı Dil",
        "Matematik",
        "Fen Bilimleri",
        "Sosyal Bilimler",
        "Müzik Eğitimi",
        "Resim Eğitimi",
        "Dans Eğitimi",
        "Spor Eğitimi",
        "Bilgisayar Eğitimi",
        "Programlama",
        "Robotik",
        "Kodlama",
        "Sınava Hazırlık",
        "YKS",
        "LGS",
        "KPSS",
        "YDS",
        "TOEFL",
        "IELTS",
        "Yaz Okulu",
        "Etüt Merkezi",
        "Kütüphane",
        "Laboratuvar",
      ],
      Alışveriş: [
        "Online Satış",
        "Kapıda Ödeme",
        "Kredi Kartı",
        "Taksit",
        "Ücretsiz Kargo",
        "Aynı Gün Teslimat",
        "İade Garantisi",
        "Değişim",
        "Toptan Satış",
        "İndirim",
        "Kampanya",
        "Sezon Sonu",
        "Outlet",
        "Özel Tasarım",
        "Kişiye Özel",
        "Hediye Paketi",
        "Marka Ürünler",
        "İthal Ürünler",
        "Yerli Üretim",
        "Organik Ürünler",
        "Doğal Ürünler",
        "El Yapımı",
        "Vintage",
        "İkinci El",
        "Tamir",
        "Tadilat",
      ],
      Hizmet: [
        "Ev Temizliği",
        "Ofis Temizliği",
        "Halı Yıkama",
        "Koltuk Yıkama",
        "Perde Yıkama",
        "Ev Taşıma",
        "Ofis Taşıma",
        "Nakliyat",
        "Kurye",
        "Kargo",
        "Tadilat",
        "Boya",
        "Elektrik",
        "Su Tesisatı",
        "Klima Servisi",
        "Kombi Servisi",
        "Beyaz Eşya Servisi",
        "Bilgisayar Tamiri",
        "Telefon Tamiri",
        "Mobilya Montaj",
        "Bahçe Bakımı",
        "Havuz Bakımı",
        "Haşere İlaçlama",
        "Organizasyon",
        "Danışmanlık",
      ],
      Diğer: [
        "Wi-Fi",
        "Otopark",
        "Engelli Erişimi",
        "Evcil Hayvan Dostu",
        "Çocuk Dostu",
        "Rezervasyon",
        "Online Randevu",
        "Kredi Kartı",
        "Taksit",
        "Ücretsiz Danışma",
        "7/24 Hizmet",
        "Evden Servis",
        "Yerinde Hizmet",
        "Mobil Hizmet",
        "Kurumsal Hizmet",
        "Bireysel Hizmet",
        "Toplu Hizmet",
        "Abonelik",
        "Üyelik",
        "Garanti",
        "Sigorta",
        "Sertifikalı Hizmet",
        "Lisanslı Hizmet",
      ],
    }

    return hizmetlerMap[kategori] || hizmetlerMap["Diğer"]
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">İşletme Ekle</h1>
        <Button variant="outline" onClick={() => router.push("/admin/isletme-listesi")}>
          İşletme Listesine Dön
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
            <TabsTrigger value="temel-bilgiler">Temel Bilgiler</TabsTrigger>
            <TabsTrigger value="detay-bilgiler">Detay Bilgiler</TabsTrigger>
            <TabsTrigger value="seo-bilgileri">SEO Bilgileri</TabsTrigger>
            <TabsTrigger value="gorsel-bilgileri">Görsel</TabsTrigger>
          </TabsList>

          {/* Temel Bilgiler */}
          <TabsContent value="temel-bilgiler">
            <Card>
              <CardHeader>
                <CardTitle>Temel Bilgiler</CardTitle>
                <CardDescription>İşletmenin temel bilgilerini girin.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="isletme_adi">
                      İşletme Adı <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="isletme_adi"
                      name="isletme_adi"
                      value={formData.isletme_adi}
                      onChange={handleChange}
                      placeholder="İşletme adını girin"
                      required
                      className={!formData.isletme_adi ? "border-red-300" : ""}
                    />
                    {!formData.isletme_adi && <p className="text-xs text-red-500">İşletme adı zorunludur</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kategori">
                      Kategori <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.kategori}
                      onValueChange={(value) => handleSelectChange("kategori", value)}
                      required
                    >
                      <SelectTrigger className={!formData.kategori ? "text-muted-foreground" : ""}>
                        <SelectValue placeholder="Kategori seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {kategoriler.map((kategori) => (
                          <SelectItem key={kategori} value={kategori}>
                            {kategori}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-red-500">{!formData.kategori && "Kategori seçimi zorunludur"}</p>
                  </div>
                  {formData.kategori && (
                    <div className="space-y-2">
                      <Label htmlFor="alt_kategori">Alt Kategori</Label>
                      <Select
                        value={formData.alt_kategori}
                        onValueChange={(value) => handleSelectChange("alt_kategori", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Alt kategori seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {getAltKategoriler(formData.kategori).map((altKategori) => (
                            <SelectItem key={altKategori} value={altKategori}>
                              {altKategori}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="telefon">
                      Telefon <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="telefon"
                      name="telefon"
                      value={formData.telefon}
                      onChange={handleChange}
                      placeholder="0555 555 5555"
                      required
                      className={!formData.telefon ? "border-red-300" : ""}
                    />
                    <p className="text-xs text-muted-foreground">Örnek format: 0555 555 5555 veya 555 555 5555</p>
                    {!formData.telefon && <p className="text-xs text-red-500">Telefon numarası zorunludur</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">E-posta</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="ornek@mail.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Web Sitesi</Label>
                    <Input
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://www.example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sehir">
                      Şehir <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.sehir}
                      onValueChange={(value) => handleSelectChange("sehir", value)}
                      required
                    >
                      <SelectTrigger className={!formData.sehir ? "text-muted-foreground" : ""}>
                        <SelectValue placeholder="Şehir seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {sehirler.map((sehir) => (
                          <SelectItem key={sehir} value={sehir}>
                            {sehir}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-red-500">{!formData.sehir && "Şehir seçimi zorunludur"}</p>
                  </div>
                  {formData.sehir && getIlceler(formData.sehir).length > 0 && (
                    <div className="space-y-2">
                      <Label htmlFor="ilce">İlçe</Label>
                      <Select value={formData.ilce} onValueChange={(value) => handleSelectChange("ilce", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="İlçe seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {getIlceler(formData.sehir).map((ilce) => (
                            <SelectItem key={ilce} value={ilce}>
                              {ilce}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adres">Adres</Label>
                  <Textarea
                    id="adres"
                    name="adres"
                    value={formData.adres}
                    onChange={handleChange}
                    placeholder="İşletme adresini girin"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="koordinatlar">Koordinatlar (Opsiyonel)</Label>
                  <Input
                    id="koordinatlar"
                    name="koordinatlar"
                    value={formData.koordinatlar}
                    onChange={handleChange}
                    placeholder="41.0082,28.9784 (Enlem,Boylam)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Google Haritalar'dan alınan enlem ve boylam değerlerini virgülle ayırarak girin.
                  </p>
                </div>
                <div className="flex justify-end">
                  <Button type="button" onClick={() => setActiveTab("detay-bilgiler")}>
                    İleri
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Detay Bilgiler */}
          <TabsContent value="detay-bilgiler">
            <Card>
              <CardHeader>
                <CardTitle>Detay Bilgiler</CardTitle>
                <CardDescription>İşletmenin detay bilgilerini girin.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="aciklama">İşletme Açıklaması</Label>
                  <Textarea
                    id="aciklama"
                    name="aciklama"
                    value={formData.aciklama}
                    onChange={handleChange}
                    placeholder="İşletmeniz hakkında kısa bir açıklama yazın"
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="calisma_saatleri">Çalışma Saatleri</Label>
                  <Textarea
                    id="calisma_saatleri"
                    name="calisma_saatleri"
                    value={formData.calisma_saatleri}
                    onChange={handleChange}
                    placeholder="Pazartesi-Cuma: 09:00-18:00, Cumartesi: 10:00-15:00, Pazar: Kapalı"
                    rows={2}
                  />
                </div>

                {/* Sunulan Hizmetler - Seçilebilir Checkbox'lar */}
                <div className="space-y-2">
                  <Label>Sunulan Hizmetler</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-2">
                    {formData.kategori &&
                      getHizmetler(formData.kategori).map((hizmet) => (
                        <div key={hizmet} className="flex items-center space-x-2">
                          <Checkbox
                            id={`hizmet-${hizmet}`}
                            checked={selectedHizmetler.includes(hizmet)}
                            onCheckedChange={() => handleHizmetChange(hizmet)}
                          />
                          <label
                            htmlFor={`hizmet-${hizmet}`}
                            className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {hizmet}
                          </label>
                        </div>
                      ))}
                  </div>
                  {!formData.kategori && (
                    <p className="text-xs text-muted-foreground">Hizmetleri görmek için önce kategori seçin.</p>
                  )}
                </div>

                {/* Sosyal Medya Hesapları - Ayrı Kutucuklar */}
                <div className="space-y-4">
                  <Label>Sosyal Medya Hesapları</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Instagram className="h-5 w-5 text-pink-600" />
                      <Input
                        id="instagram_url"
                        name="instagram_url"
                        value={formData.instagram_url}
                        onChange={handleChange}
                        placeholder="Instagram URL"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Facebook className="h-5 w-5 text-blue-600" />
                      <Input
                        id="facebook_url"
                        name="facebook_url"
                        value={formData.facebook_url}
                        onChange={handleChange}
                        placeholder="Facebook URL"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Twitter className="h-5 w-5 text-blue-400" />
                      <Input
                        id="twitter_url"
                        name="twitter_url"
                        value={formData.twitter_url}
                        onChange={handleChange}
                        placeholder="Twitter URL"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Linkedin className="h-5 w-5 text-blue-700" />
                      <Input
                        id="linkedin_url"
                        name="linkedin_url"
                        value={formData.linkedin_url}
                        onChange={handleChange}
                        placeholder="LinkedIn URL"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Youtube className="h-5 w-5 text-red-600" />
                      <Input
                        id="youtube_url"
                        name="youtube_url"
                        value={formData.youtube_url}
                        onChange={handleChange}
                        placeholder="YouTube URL"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("temel-bilgiler")}>
                    Geri
                  </Button>
                  <Button type="button" onClick={() => setActiveTab("seo-bilgileri")}>
                    İleri
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Bilgileri */}
          <TabsContent value="seo-bilgileri">
            <Card>
              <CardHeader>
                <CardTitle>SEO Bilgileri</CardTitle>
                <CardDescription>
                  İşletmenizin arama motorlarında daha iyi sıralanması için SEO bilgilerini girin.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="mb-4">
                  <Button
                    type="button"
                    variant="default"
                    onClick={() => {
                      const seoSuggestions = generateSeoSuggestions(formData)
                      setFormData((prev) => ({
                        ...prev,
                        seo_baslik: seoSuggestions.title,
                        seo_aciklama: seoSuggestions.description,
                        seo_anahtar_kelimeler: seoSuggestions.keywords.join(", "),
                        url_slug: seoSuggestions.slug || prev.url_slug,
                      }))

                      toast({
                        title: "SEO Önerileri Uygulandı",
                        description: "SEO alanları için otomatik öneriler uygulandı.",
                      })
                    }}
                    className="w-full md:w-auto"
                  >
                    <Wand2 className="mr-2 h-4 w-4" />
                    SEO Önerileri Oluştur
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    İşletme bilgilerine göre otomatik SEO önerileri oluşturur. Temel bilgileri doldurduktan sonra
                    kullanın.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seo_baslik">SEO Başlığı</Label>
                  <Input
                    id="seo_baslik"
                    name="seo_baslik"
                    value={formData.seo_baslik}
                    onChange={handleChange}
                    placeholder="SEO başlığı girin (60 karakter önerilir)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Karakter sayısı: {formData.seo_baslik?.length || 0}/60
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seo_aciklama">SEO Açıklaması</Label>
                  <Textarea
                    id="seo_aciklama"
                    name="seo_aciklama"
                    value={formData.seo_aciklama}
                    onChange={handleChange}
                    placeholder="SEO açıklaması girin (160 karakter önerilir)"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Karakter sayısı: {formData.seo_aciklama?.length || 0}/160
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seo_anahtar_kelimeler">SEO Anahtar Kelimeleri</Label>
                  <Textarea
                    id="seo_anahtar_kelimeler"
                    name="seo_anahtar_kelimeler"
                    value={formData.seo_anahtar_kelimeler}
                    onChange={handleChange}
                    placeholder="Anahtar kelimeleri virgülle ayırarak girin"
                    rows={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url_slug">URL Slug (Opsiyonel)</Label>
                  <Input
                    id="url_slug"
                    name="url_slug"
                    value={formData.url_slug}
                    onChange={handleChange}
                    placeholder="ornek-isletme-adi"
                  />
                  <p className="text-xs text-muted-foreground">
                    Boş bırakırsanız, işletme adı ve şehir bilgisinden otomatik oluşturulur.
                  </p>
                </div>
                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("detay-bilgiler")}>
                    Geri
                  </Button>
                  <Button type="button" onClick={() => setActiveTab("gorsel-bilgileri")}>
                    İleri
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Görsel Bilgileri */}
          <TabsContent value="gorsel-bilgileri">
            <Card>
              <CardHeader>
                <CardTitle>Görsel</CardTitle>
                <CardDescription>İşletmenize ait bir görsel yükleyin.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="fotograf">İşletme Fotoğrafı</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="fotograf"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full"
                      />
                      {fotografPreview && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={handleRemoveImage}
                          className="flex-shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Önerilen boyut: 1200x800 piksel, maksimum dosya boyutu: 5MB
                    </p>
                    <p className="text-xs text-blue-500">
                      İşletmenizi en iyi şekilde temsil eden bir görsel yükleyin. Kaliteli görseller, müşterilerin
                      ilgisini çekmede önemli rol oynar.
                    </p>
                  </div>

                  {fotografPreview && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Önizleme:</p>
                      <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border border-gray-200">
                        <img
                          src={fotografPreview || "/placeholder.svg"}
                          alt="Önizleme"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {formData.fotograf_url && !fotografPreview && (
                    <div className="mt-4">
                      <p className="text-sm font-medium mb-2">Mevcut Görsel:</p>
                      <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border border-gray-200">
                        <img
                          src={formData.fotograf_url || "/placeholder.svg"}
                          alt="Mevcut Görsel"
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setActiveTab("seo-bilgileri")}>
                    Geri
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Kaydediliyor...
                      </>
                    ) : (
                      "İşletmeyi Kaydet"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  )
}
