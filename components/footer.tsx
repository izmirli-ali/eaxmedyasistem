"use client"

import { Button } from "@/components/ui/button"
import { MapPin, Phone, Mail } from "lucide-react"
import { SystemVersion } from "@/components/system-version"
import { useState } from "react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  // Modal durumları için state'ler
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showCookiesModal, setShowCookiesModal] = useState(false)

  return (
    <footer className="bg-gray-900 text-gray-200">
      <div className="container mx-auto max-w-6xl py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Hakkımızda */}
          <div>
            <h3 className="text-xl font-bold mb-4">EAX Medya</h3>
            <p className="text-gray-400 mb-4">
              İşletmenizi Google Haritalar'da daha üst sıralarda yer almasını sağlayan SEO odaklı bir platform.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h3 className="text-xl font-bold mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setShowPrivacyModal(true)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Gizlilik Politikası
                </button>
              </li>
              <li>
                <button
                  onClick={() => setShowTermsModal(true)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Kullanım Koşulları
                </button>
              </li>
              <li>
                <button
                  onClick={() => setShowCookiesModal(true)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Çerez Politikası
                </button>
              </li>
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h3 className="text-xl font-bold mb-4">İletişim</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span className="text-gray-400">Afyonkarahisar / merkez</span>
              </li>
              <li className="flex items-start">
                <Phone className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span className="text-gray-400">0537 778 1883</span>
              </li>
              <li className="flex items-start">
                <Mail className="h-5 w-5 text-primary mr-2 mt-0.5" />
                <span className="text-gray-400">eaxmedya@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center justify-center gap-2">
              <p className="text-gray-400 text-sm">
                &copy; {currentYear} EAX Medya - işletmenionecikar. Tüm hakları saklıdır.
              </p>
              <SystemVersion />
            </div>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <button
                onClick={() => setShowPrivacyModal(true)}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Gizlilik Politikası
              </button>
              <button
                onClick={() => setShowTermsModal(true)}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Kullanım Koşulları
              </button>
              <button
                onClick={() => setShowCookiesModal(true)}
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                Çerez Politikası
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Politika Modalları */}
      {showPrivacyModal && <PrivacyPolicyModal onClose={() => setShowPrivacyModal(false)} />}
      {showTermsModal && <TermsOfServiceModal onClose={() => setShowTermsModal(false)} />}
      {showCookiesModal && <CookiePolicyModal onClose={() => setShowCookiesModal(false)} />}
    </footer>
  )
}

// Gizlilik Politikası Modalı
function PrivacyPolicyModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Gizlilik Politikası</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
        <div className="p-6">
          <p className="mb-4 text-gray-800">
            İşletmeni Öne Çıkar platformu olarak, hizmetlerimizi sunmak ve geliştirmek amacıyla aşağıdaki bilgileri
            toplayabiliriz:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-800">
            <li>
              Ad, soyad, e-posta adresi, telefon numarası gibi kişisel bilgiler: Bu bilgileri, sizinle iletişim kurmak,
              hesabınızı yönetmek, size kişiselleştirilmiş hizmetler sunmak, kampanyalarımız hakkında sizi
              bilgilendirmek ve yasal yükümlülüklerimizi yerine getirmek için kullanırız.
            </li>
            <li>
              İşletme adı, adresi, telefon numarası, web sitesi gibi işletme bilgileri: Bu bilgileri, işletmenizi Google
              Haritalar'da optimize etmek, size özel SEO stratejileri oluşturmak, işletmenizin performansını analiz
              etmek ve size daha iyi hizmet sunmak için kullanırız.
            </li>
            <li>
              IP adresi, tarayıcı türü, ziyaret edilen sayfalar gibi kullanım verileri: Bu bilgileri, platformumuzun
              performansını analiz etmek, hataları gidermek, kullanıcı deneyimini iyileştirmek, güvenliği sağlamak ve
              dolandırıcılığı önlemek için kullanırız.
            </li>
            <li>
              Çerezler ve benzer teknolojiler aracılığıyla toplanan bilgiler: Bu bilgileri, tercihlerinizi hatırlamak,
              size kişiselleştirilmiş içerik sunmak, reklamları hedeflemek, platformumuzu analiz etmek ve size daha iyi
              bir deneyim sunmak için kullanırız.
            </li>
          </ul>

          <h3 className="text-lg font-semibold mb-3 text-gray-800">2. Bilgilerin Kullanımı</h3>
          <p className="mb-4 text-gray-800">Topladığımız bilgileri aşağıdaki amaçlarla kullanırız:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-800">
            <li>Hizmetlerimizi sunmak ve yönetmek</li>
            <li>Müşteri desteği sağlamak</li>
            <li>Hizmetlerimizi geliştirmek ve kişiselleştirmek</li>
            <li>Güvenlik ve dolandırıcılık önleme</li>
            <li>Yasal yükümlülüklere uymak</li>
          </ul>

          <h3 className="text-lg font-semibold mb-3 text-gray-800">3. Bilgi Paylaşımı</h3>
          <p className="mb-4 text-gray-800">Bilgilerinizi aşağıdaki durumlar dışında üçüncü taraflarla paylaşmayız:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-800">
            <li>Açık izniniz olduğunda</li>
            <li>Hizmet sağlayıcılarımızla (örn. hosting, ödeme işlemcileri)</li>
            <li>Yasal zorunluluk durumunda (mahkeme kararı vb.)</li>
            <li>Şirket birleşmesi veya satın alınması durumunda</li>
          </ul>

          <h3 className="text-lg font-semibold mb-3 text-gray-800">4. Veri Güvenliği</h3>
          <p className="mb-4 text-gray-800">
            Bilgilerinizi korumak için endüstri standardı güvenlik önlemleri uyguluyoruz. Ancak, internet üzerinden
            hiçbir veri iletiminin %100 güvenli olmadığını unutmayın.
          </p>

          <h3 className="text-lg font-semibold mb-3 text-gray-800">5. Veri Saklama</h3>
          <p className="mb-4 text-gray-800">
            Kişisel verilerinizi hizmetlerimizi sunmak için gerekli olduğu sürece veya yasal yükümlülüklerimizi yerine
            getirmek için saklarız.
          </p>

          <h3 className="text-lg font-semibold mb-3 text-gray-800">6. Haklarınız</h3>
          <p className="mb-4 text-gray-800">KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-800">
            <li>Verilerinize erişim ve düzeltme hakkı</li>
            <li>Verilerinizin silinmesini talep etme hakkı</li>
            <li>Veri işlemeye itiraz etme hakkı</li>
            <li>Veri taşınabilirliği hakkı</li>
          </ul>

          <h3 className="text-lg font-semibold mb-3 text-gray-800">7. İletişim</h3>
          <p className="mb-4 text-gray-800">
            Gizlilik politikamızla ilgili sorularınız için eaxmedya@gmail.com adresinden bizimle iletişime
            geçebilirsiniz.
          </p>

          <h3 className="text-lg font-semibold mb-3 text-gray-800">8. Değişiklikler</h3>
          <p className="text-gray-800">
            Bu gizlilik politikasını zaman zaman güncelleyebiliriz. Önemli değişiklikler olması durumunda sizi
            bilgilendireceğiz.
          </p>
          <p className="mt-4 text-sm text-gray-500">Son güncelleme: Nisan 2024</p>
        </div>
        <div className="border-t p-4 flex justify-end">
          <Button onClick={onClose}>Kapat</Button>
        </div>
      </div>
    </div>
  )
}

// Kullanım Koşulları Modalı
function TermsOfServiceModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-100 p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Kullanım Koşulları</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
        <div className="p-6">
          <p className="mb-4 text-gray-800">
            İşletmeni Öne Çıkar platformunu kullanarak aşağıdaki kullanım koşullarını kabul etmiş olursunuz. Lütfen bu
            koşulları dikkatlice okuyun.
          </p>

          <h3 className="text-lg font-semibold mb-3 text-gray-800">1. Hizmet Tanımı</h3>
          <p className="mb-4 text-gray-800">
            İşletmeni Öne Çıkar, işletmelerin Google Haritalar'da daha üst sıralarda yer almasını sağlamak için SEO
            optimizasyonu hizmetleri sunan bir platformdur. Hizmetlerimiz, işletme profillerinin optimizasyonu, anahtar
            kelime analizi, içerik oluşturma ve performans takibi gibi çeşitli SEO stratejilerini içerir.
          </p>

          <h3 className="text-lg font-semibold mb-3 text-gray-800">2. Hesap Oluşturma ve Güvenlik</h3>
          <p className="mb-4 text-gray-800">
            Platformumuzu kullanmak için bir hesap oluşturmanız gerekebilir. Hesap bilgilerinizin gizliliğini korumak ve
            yetkisiz erişimleri önlemek sizin sorumluluğunuzdadır. Hesabınızla ilgili tüm etkinliklerden siz
            sorumlusunuz.
          </p>

          <h3 className="text-lg font-semibold mb-3 text-gray-800">3. Ödeme ve Abonelikler</h3>
          <p className="mb-4 text-gray-800">
            Hizmetlerimiz için ödeme yapmanız gerekebilir. Ödeme koşulları, seçtiğiniz plana göre değişiklik
            gösterebilir. Abonelik planları, aksi belirtilmedikçe otomatik olarak yenilenir. Aboneliğinizi istediğiniz
            zaman iptal edebilirsiniz.
          </p>

          <h3 className="text-lg font-semibold mb-3 text-gray-800">4. Kullanıcı İçeriği</h3>
          <p className="mb-4 text-gray-800">
            Platformumuza yüklediğiniz veya gönderdiğiniz tüm içeriklerden (işletme bilgileri, görseller, yorumlar vb.)
            siz sorumlusunuz. Bu içeriklerin yasal olması ve üçüncü tarafların haklarını ihlal etmemesi gerekmektedir.
          </p>

          <h3 className="text-lg font-semibold mb-3 text-gray-800">5. Fikri Mülkiyet Hakları</h3>
          <p className="mb-4 text-gray-800">
            Platformumuz ve içeriği, fikri mülkiyet hakları ile korunmaktadır. Platformumuzu kullanmanız, size bu haklar
            üzerinde herhangi bir sahiplik veya lisans vermez. Kullanıcı içeriğinizin fikri mülkiyet hakları size
            aittir.
          </p>

          <h3 className="text-lg font-semibold mb-3 text-gray-800">6. Hizmet Garantisi ve Sorumluluk Reddi</h3>
          <p className="mb-4 text-gray-800">
            Hizmetlerimizi "olduğu gibi" sunuyoruz ve belirli sonuçlar garanti etmiyoruz. Google Haritalar sıralamaları,
            Google'ın algoritmaları ve politikaları tarafından belirlenir ve kontrolümüz dışındadır. En iyi sonuçları
            elde etmek için çaba göstermekle birlikte, belirli bir sıralama veya trafik artışı garanti edemeyiz.
          </p>

          <h3 className="text-lg font-semibold mb-3 text-gray-800">7. Sorumluluk Sınırlaması</h3>
          <p className="mb-4 text-gray-800">
            Yasaların izin verdiği ölçüde, İşletmeni Öne Çıkar ve bağlı kuruluşları, hizmetlerimizin kullanımından
            kaynaklanan doğrudan, dolaylı, arızi, özel veya sonuç olarak ortaya çıkan zararlardan sorumlu değildir.
          </p>

          <h3 className="text-lg font-semibold mb-3 text-gray-800">8. Değişiklikler</h3>
          <p className="mb-4 text-gray-800">
            Bu kullanım koşullarını zaman zaman güncelleyebiliriz. Değişiklikler, web sitemizde yayınlandıktan sonra
            geçerli olacaktır. Önemli değişiklikler olması durumunda sizi bilgilendireceğiz.
          </p>

          <h3 className="text-lg font-semibold mb-3 text-gray-800">9. Fesih</h3>
          <p className="mb-4 text-gray-800">
            Bu koşulları ihlal etmeniz durumunda, hesabınızı askıya alabilir veya sonlandırabiliriz. Ayrıca, istediğiniz
            zaman hesabınızı kapatabilirsiniz.
          </p>

          <h3 className="text-lg font-semibold mb-3 text-gray-800">10. Geçerli Yasa ve Yargı Yetkisi</h3>
          <p className="mb-4 text-gray-800">
            Bu koşullar Türkiye Cumhuriyeti yasalarına tabidir ve bu yasalara göre yorumlanacaktır. Bu koşullardan
            kaynaklanan herhangi bir anlaşmazlık, Türkiye Cumhuriyeti mahkemelerinin münhasır yargı yetkisine tabi
            olacaktır.
          </p>

          <p className="mt-4 text-sm text-gray-500">Son güncelleme: Nisan 2024</p>
        </div>
        <div className="border-t p-4 flex justify-end">
          <Button onClick={onClose}>Kapat</Button>
        </div>
      </div>
    </div>
  )
}

// Çerez Politikası Modalı
function CookiePolicyModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-gray-100 p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Çerez Politikası</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
        <div className="p-6">
          <p className="mb-4 text-gray-800">
            Bu Çerez Politikası, İşletmeni Öne Çıkar platformunda çerezleri ve benzer teknolojileri nasıl kullandığımızı
            açıklamaktadır.
          </p>

          <h3 className="text-lg font-semibold mb-3 text-gray-800">1. Çerez Nedir?</h3>
          <p className="mb-4 text-gray-800">
            Çerezler, web sitelerinin bilgisayarınızda veya mobil cihazınızda depoladığı küçük metin dosyalarıdır.
            Çerezler, web sitelerinin cihazınızı tanımasına ve oturum bilgilerinizi, tercihlerinizi ve kullanım
            alışkanlıklarınızı hatırlamasına yardımcı olur.
          </p>

          <h3 className="text-lg font-semibold mb-3 text-gray-800">2. Kullandığımız Çerez Türleri</h3>
          <p className="mb-4 text-gray-800">Platformumuzda aşağıdaki çerez türlerini kullanıyoruz:</p>

          <h4 className="font-medium mb-2 text-gray-800">2.1 Zorunlu Çerezler</h4>
          <p className="mb-3 text-gray-800">
            Bu çerezler, platformumuzun temel işlevlerini yerine getirmesi için gereklidir. Bunlar olmadan, platformumuz
            düzgün çalışmaz. Bu çerezleri devre dışı bırakamazsınız.
          </p>

          <h4 className="font-medium mb-2 text-gray-800">2.2 Performans Çerezleri</h4>

          <p className="mb-3 text-gray-800">
            Bu çerezler, ziyaretçilerin platformumuzu nasıl kullandığı hakkında bilgi toplar. Bu bilgiler,
            platformumuzun performansını iyileştirmemize ve kullanıcı deneyimini geliştirmemize yardımcı olur.
          </p>

          <h4 className="font-medium mb-2 text-gray-800">2.3 İşlevsellik Çerezleri</h4>
          <p className="mb-3 text-gray-800">
            Bu çerezler, platformumuzun tercihlerinizi hatırlamasına ve size kişiselleştirilmiş bir deneyim sunmasına
            olanak tanır.
          </p>

          <h4 className="font-medium mb-2 text-gray-800">2.4 Hedefleme/Reklam Çerezleri</h4>
          <p className="mb-4 text-gray-800">
            Bu çerezler, ilgi alanlarınıza göre size özel reklamlar göstermek için kullanılır. Ayrıca, bir reklamı görme
            sayınızı sınırlamaya ve reklam kampanyalarının etkinliğini ölçmeye yardımcı olur.
          </p>

          <h3 className="text-lg font-semibold mb-3 text-gray-800">3. Üçüncü Taraf Çerezleri</h3>
          <p className="mb-4 text-gray-800">
            Platformumuzda, üçüncü taraf hizmet sağlayıcılarının çerezlerini de kullanabiliriz. Bu çerezler, analiz,
            reklam ve sosyal medya entegrasyonu gibi amaçlar için kullanılır. Bu üçüncü tarafların çerez kullanımları,
            kendi gizlilik politikalarına tabidir.
          </p>

          <h3 className="text-lg font-semibold mb-3 text-gray-800">4. Çerezleri Yönetme</h3>
          <p className="mb-4 text-gray-800">
            Çoğu web tarayıcısı, çerezleri kabul etmeyi veya reddetmeyi seçmenize olanak tanır. Tarayıcınızın ayarlarını
            değiştirerek çerezleri yönetebilirsiniz. Ancak, çerezleri devre dışı bırakırsanız, platformumuzun bazı
            özellikleri düzgün çalışmayabilir.
          </p>

          <h3 className="text-lg font-semibold mb-3 text-gray-800">5. Değişiklikler</h3>
          <p className="mb-4 text-gray-800">
            Bu Çerez Politikasını zaman zaman güncelleyebiliriz. Değişiklikler, web sitemizde yayınlandıktan sonra
            geçerli olacaktır.
          </p>

          <h3 className="text-lg font-semibold mb-3 text-gray-800">6. İletişim</h3>
          <p className="mb-4 text-gray-800">
            Çerez politikamızla ilgili sorularınız için eaxmedya@gmail.com adresinden bizimle iletişime geçebilirsiniz.
          </p>

          <p className="mt-4 text-sm text-gray-500">Son güncelleme: Nisan 2024</p>
        </div>
        <div className="border-t p-4 flex justify-end">
          <Button onClick={onClose}>Kapat</Button>
        </div>
      </div>
    </div>
  )
}
