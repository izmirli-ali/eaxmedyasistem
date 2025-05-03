"use client"
import { MapPin, Phone, Mail, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

// Modal bileşeninin içerik kısmını güncelle - daha koyu ve görünür renkler ekle
function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg max-w-3xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-8rem)] text-gray-900 dark:text-gray-100">{children}</div>
      </div>
    </div>
  )
}

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
                  className="text-gray-400 hover:text-white transition-colors cursor-pointer text-left"
                >
                  Gizlilik Politikası
                </button>
              </li>
              <li>
                <button
                  onClick={() => setShowTermsModal(true)}
                  className="text-gray-400 hover:text-white transition-colors cursor-pointer text-left"
                >
                  Kullanım Koşulları
                </button>
              </li>
              <li>
                <button
                  onClick={() => setShowCookiesModal(true)}
                  className="text-gray-400 hover:text-white transition-colors cursor-pointer text-left"
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
            <p className="text-gray-400 text-sm">
              &copy; {currentYear} EAX Medya - işletmenionecikar. Tüm hakları saklıdır.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <button
                onClick={() => setShowPrivacyModal(true)}
                className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer"
              >
                Gizlilik Politikası
              </button>
              <button
                onClick={() => setShowTermsModal(true)}
                className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer"
              >
                Kullanım Koşulları
              </button>
              <button
                onClick={() => setShowCookiesModal(true)}
                className="text-gray-400 hover:text-white text-sm transition-colors cursor-pointer"
              >
                Çerez Politikası
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modallar */}

      <Modal isOpen={showPrivacyModal} onClose={() => setShowPrivacyModal(false)} title="Gizlilik Politikası">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Son güncelleme: {new Date().toLocaleDateString("tr-TR")}
          </p>

          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">1. Giriş</h4>
          <p className="text-gray-800 dark:text-gray-200">
            EAX Medya olarak kişisel verilerinizin güvenliği konusunda büyük hassasiyet gösteriyoruz. Bu Gizlilik
            Politikası, işletmenionecikar.com platformunu kullanırken toplanan, işlenen ve saklanan kişisel
            verilerinizle ilgili uygulamalarımızı açıklamaktadır.
          </p>

          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">2. Toplanan Veriler</h4>
          <p className="text-gray-800 dark:text-gray-200">Platformumuzda aşağıdaki kişisel verileri toplayabiliriz:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-800 dark:text-gray-200">
            <li>İsim, e-posta adresi, telefon numarası gibi iletişim bilgileri</li>
            <li>İşletme adı, adresi, çalışma saatleri gibi işletme bilgileri</li>
            <li>Kullanıcı hesabı oluşturulurken sağlanan bilgiler</li>
            <li>Platform kullanımınızla ilgili log verileri ve çerezler</li>
            <li>İşletmenizle ilgili yüklediğiniz fotoğraflar ve diğer medya içerikleri</li>
          </ul>

          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">3. Verilerin Kullanımı</h4>
          <p className="text-gray-800 dark:text-gray-200">Topladığımız verileri aşağıdaki amaçlarla kullanıyoruz:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-800 dark:text-gray-200">
            <li>İşletmenizi Google Haritalar ve diğer platformlarda optimize etmek</li>
            <li>Size daha iyi hizmet sunmak ve platformumuzu geliştirmek</li>
            <li>Talep ettiğiniz hizmetleri sağlamak</li>
            <li>Sizinle iletişim kurmak ve destek sağlamak</li>
            <li>Yasal yükümlülüklerimizi yerine getirmek</li>
          </ul>

          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">4. Veri Güvenliği</h4>
          <p className="text-gray-800 dark:text-gray-200">
            Kişisel verilerinizi korumak için endüstri standardı güvenlik önlemleri uyguluyoruz. Verileriniz şifreleme,
            güvenli sunucular ve düzenli güvenlik denetimleri ile korunmaktadır.
          </p>

          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">5. Veri Paylaşımı</h4>
          <p className="text-gray-800 dark:text-gray-200">
            Kişisel verilerinizi aşağıdaki durumlar dışında üçüncü taraflarla paylaşmıyoruz:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-800 dark:text-gray-200">
            <li>Açık rızanız olduğunda</li>
            <li>Hizmet sağlayıcılarımızla (örn. hosting, ödeme işlemcileri)</li>
            <li>Yasal zorunluluk durumunda</li>
          </ul>

          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">6. Haklarınız</h4>
          <p className="text-gray-800 dark:text-gray-200">KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-800 dark:text-gray-200">
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
            <li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme</li>
            <li>Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme</li>
            <li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme</li>
            <li>Kişisel verilerinizin silinmesini veya yok edilmesini isteme</li>
          </ul>

          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">7. İletişim</h4>
          <p className="text-gray-800 dark:text-gray-200">
            Gizlilik politikamızla ilgili sorularınız için eaxmedya@gmail.com adresinden bizimle iletişime
            geçebilirsiniz.
          </p>
        </div>
      </Modal>

      <Modal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} title="Kullanım Koşulları">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Son güncelleme: {new Date().toLocaleDateString("tr-TR")}
          </p>

          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">1. Kabul Edilen Şartlar</h4>
          <p className="text-gray-800 dark:text-gray-200">
            İşletmenionecikar.com web sitesini veya mobil uygulamasını kullanarak, bu Kullanım Koşulları'nı kabul etmiş
            sayılırsınız. Bu koşulları kabul etmiyorsanız, lütfen platformumuzu kullanmayınız.
          </p>

          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">2. Hizmet Tanımı</h4>
          <p className="text-gray-800 dark:text-gray-200">
            EAX Medya, işletmelerin Google Haritalar ve diğer dijital platformlarda daha iyi görünürlük kazanmasına
            yardımcı olan bir hizmet sunmaktadır. Platformumuz, işletme bilgilerinin yönetimi, optimizasyonu ve tanıtımı
            için çeşitli araçlar sağlar.
          </p>

          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">3. Kullanıcı Hesapları</h4>
          <p className="text-gray-800 dark:text-gray-200">
            Platformumuzun bazı özelliklerini kullanabilmek için bir hesap oluşturmanız gerekebilir. Hesap
            bilgilerinizin gizliliğini korumak ve hesabınızla gerçekleştirilen tüm etkinliklerden sorumlu olmak sizin
            sorumluluğunuzdadır.
          </p>

          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">4. Kullanıcı İçeriği</h4>
          <p className="text-gray-800 dark:text-gray-200">
            Platformumuza yüklediğiniz tüm içeriklerden (fotoğraflar, metinler, videolar vb.) siz sorumlusunuz. Bu
            içeriklerin yasal olduğunu ve üçüncü tarafların haklarını ihlal etmediğini garanti etmelisiniz.
          </p>

          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">5. Yasaklanan Kullanımlar</h4>
          <p className="text-gray-800 dark:text-gray-200">Platformumuzda aşağıdaki faaliyetler kesinlikle yasaktır:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-800 dark:text-gray-200">
            <li>Yasadışı, zararlı, tehditkar, taciz edici, iftira niteliğinde içerik paylaşmak</li>
            <li>Başkalarının fikri mülkiyet haklarını ihlal eden içerik paylaşmak</li>
            <li>Platformun normal işleyişini bozan veya aşırı yük bindiren faaliyetlerde bulunmak</li>
            <li>Platformun güvenlik önlemlerini atlatmaya çalışmak</li>
            <li>Diğer kullanıcıların kişisel bilgilerini toplamak veya saklamak</li>
          </ul>

          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">6. Fikri Mülkiyet Hakları</h4>
          <p className="text-gray-800 dark:text-gray-200">
            Platform ve içeriğindeki tüm fikri mülkiyet hakları EAX Medya'ya aittir. Kullanıcılar, platformda
            paylaştıkları içeriklerin kullanım, çoğaltma ve dağıtım haklarını EAX Medya'ya vermiş sayılırlar.
          </p>

          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">7. Sorumluluk Reddi</h4>
          <p className="text-gray-800 dark:text-gray-200">
            Platformumuz "olduğu gibi" sunulmaktadır. EAX Medya, platformun kesintisiz veya hatasız çalışacağını garanti
            etmez. Platformun kullanımından doğabilecek herhangi bir zarardan sorumlu değiliz.
          </p>

          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">8. Değişiklikler</h4>
          <p className="text-gray-800 dark:text-gray-200">
            Bu Kullanım Koşulları'nı herhangi bir zamanda değiştirme hakkını saklı tutarız. Değişiklikler, platformda
            yayınlandıktan sonra geçerli olacaktır.
          </p>

          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">9. İletişim</h4>
          <p className="text-gray-800 dark:text-gray-200">
            Kullanım Koşulları ile ilgili sorularınız için eaxmedya@gmail.com adresinden bizimle iletişime
            geçebilirsiniz.
          </p>
        </div>
      </Modal>

      <Modal isOpen={showCookiesModal} onClose={() => setShowCookiesModal(false)} title="Çerez Politikası">
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Son güncelleme: {new Date().toLocaleDateString("tr-TR")}
          </p>

          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">1. Çerezler Nedir?</h4>
          <p className="text-gray-800 dark:text-gray-200">
            Çerezler (cookies), web siteleri tarafından bilgisayarınıza, telefonunuza veya tabletinize yerleştirilen
            küçük metin dosyalarıdır. Bu dosyalar, web sitesinin ziyaretinizle ilgili bilgileri saklar ve sonraki
            ziyaretlerinizde size daha iyi bir deneyim sunmak için kullanılır.
          </p>

          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">2. Kullandığımız Çerez Türleri</h4>
          <p className="text-gray-800 dark:text-gray-200">
            İşletmenionecikar.com platformunda aşağıdaki çerez türlerini kullanıyoruz:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-800 dark:text-gray-200">
            <li>
              <strong className="text-gray-900 dark:text-white">Zorunlu Çerezler:</strong> Platformun temel işlevlerini
              yerine getirmek için gerekli olan çerezlerdir.
            </li>
            <li>
              <strong className="text-gray-900 dark:text-white">Performans Çerezleri:</strong> Platformun performansını
              ölçmek ve iyileştirmek için kullanılan çerezlerdir.
            </li>
            <li>
              <strong className="text-gray-900 dark:text-white">İşlevsellik Çerezleri:</strong> Size daha gelişmiş ve
              kişiselleştirilmiş bir deneyim sunmak için kullanılan çerezlerdir.
            </li>
            <li>
              <strong className="text-gray-900 dark:text-white">Hedefleme/Reklam Çerezleri:</strong> İlgi alanlarınıza
              göre size özel reklamlar göstermek için kullanılan çerezlerdir.
            </li>
          </ul>

          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">3. Çerezlerin Kullanım Amaçları</h4>
          <p className="text-gray-800 dark:text-gray-200">Çerezleri aşağıdaki amaçlarla kullanıyoruz:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-800 dark:text-gray-200">
            <li>Platformumuzun düzgün çalışmasını sağlamak</li>
            <li>Kullanıcı deneyimini iyileştirmek ve kişiselleştirmek</li>
            <li>Platform kullanımı hakkında istatistiksel veriler toplamak</li>
            <li>Güvenlik önlemlerini güçlendirmek</li>
            <li>İlgi alanlarınıza göre size özel içerik ve reklamlar sunmak</li>
          </ul>

          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">4. Çerez Yönetimi</h4>
          <p className="text-gray-800 dark:text-gray-200">
            Çoğu web tarayıcısı, çerezleri otomatik olarak kabul edecek şekilde ayarlanmıştır. Ancak, tarayıcı
            ayarlarınızı değiştirerek çerezleri reddedebilir veya çerez kullanıldığında uyarı verecek şekilde
            ayarlayabilirsiniz.
          </p>
          <p className="text-gray-800 dark:text-gray-200">
            Çerezleri devre dışı bırakmak, platformumuzun bazı özelliklerinin düzgün çalışmamasına neden olabilir.
          </p>

          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">5. Üçüncü Taraf Çerezleri</h4>
          <p className="text-gray-800 dark:text-gray-200">
            Platformumuzda, Google Analytics, Facebook Pixel gibi üçüncü taraf hizmetlerin çerezleri de kullanılabilir.
            Bu çerezler, ilgili üçüncü tarafların gizlilik politikalarına tabidir.
          </p>

          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">6. Değişiklikler</h4>
          <p className="text-gray-800 dark:text-gray-200">
            Bu Çerez Politikası'nı herhangi bir zamanda değiştirme hakkını saklı tutarız. Değişiklikler, platformda
            yayınlandıktan sonra geçerli olacaktır.
          </p>

          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">7. İletişim</h4>
          <p className="text-gray-800 dark:text-gray-200">
            Çerez Politikası ile ilgili sorularınız için eaxmedya@gmail.com adresinden bizimle iletişime geçebilirsiniz.
          </p>
        </div>
      </Modal>
    </footer>
  )
}
