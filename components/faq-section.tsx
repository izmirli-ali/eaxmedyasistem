import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "İşletme Yönetim Sistemi tam olarak ne sağlar?",
    answer:
      "İşletme Yönetim Sistemi, işletmenizin Google Haritalar'da daha üst sıralarda yer almasını sağlayan SEO odaklı bir platformdur. Sistemimiz, işletme bilgilerinizi Google'ın arama algoritmasına uygun şekilde optimize eder, anahtar kelime analizleri yapar ve müşteri değerlendirmelerinizi yönetmenize yardımcı olur.",
  },
  {
    question: "Tek seferlik paket ile aylık abonelik arasındaki fark nedir?",
    answer:
      "Tek seferlik paket, işletmeniz için bir kerelik SEO optimizasyonu ve Google Haritalar entegrasyonu sağlar. Bu, temel bir başlangıç için idealdir. Aylık abonelik ise sürekli optimizasyon, düzenli içerik güncellemeleri, performans raporları ve daha fazla özellik sunar. Sürekli rekabet avantajı ve güncel kalmanız için aylık abonelik önerilir.",
  },
  {
    question: "Ne kadar sürede sonuç alabilirim?",
    answer:
      "Sonuçlar işletmenizin sektörüne, rekabet durumuna ve mevcut SEO durumuna göre değişiklik gösterebilir. Ancak, çoğu müşterimiz ilk 30 gün içinde Google Haritalar sıralamalarında iyileşme görmeye başlıyor. Tam optimizasyon ve en iyi sonuçlar genellikle 2-3 ay içinde elde edilir.",
  },
  {
    question: "Birden fazla işletmem var, hepsini ekleyebilir miyim?",
    answer:
      "Tek seferlik paketimiz sadece bir işletme için geçerlidir. Birden fazla işletmeniz varsa, aylık abonelik paketlerimizi tercih edebilirsiniz. Başlangıç planımız 1 işletme, Profesyonel planımız 3 işletme ve Kurumsal planımız sınırsız işletme kaydı sunmaktadır.",
  },
  {
    question: "Aylık aboneliği istediğim zaman iptal edebilir miyim?",
    answer:
      "Evet, herhangi bir zamanda aboneliğinizi iptal edebilirsiniz. Uzun vadeli sözleşme zorunluluğumuz yoktur. Ancak, SEO çalışmalarının uzun vadeli bir strateji olduğunu ve en iyi sonuçları almak için en az 3-6 ay kullanmanızı öneririz.",
  },
  {
    question: "Teknik destek sağlıyor musunuz?",
    answer:
      "Evet, tüm planlarımızda e-posta desteği sunuyoruz. Profesyonel ve Kurumsal aylık abonelik planlarımızda ise öncelikli destek ve daha hızlı yanıt süreleri mevcuttur. Kurumsal müşterilerimiz için 7/24 telefon desteği de sağlıyoruz.",
  },
  {
    question: "Google Haritalar dışında başka platformlarda da optimizasyon yapıyor musunuz?",
    answer:
      "Sistemimiz öncelikle Google Haritalar optimizasyonuna odaklanmıştır, ancak yaptığımız SEO çalışmaları Google aramalarda da işletmenizin görünürlüğünü artıracaktır. Ayrıca, Kurumsal aylık abonelik planımızda Yandex ve Bing gibi diğer arama motorları için de optimizasyon desteği sunuyoruz.",
  },
  {
    question: "Tek seferlik paketi satın aldıktan sonra aylık aboneliğe geçebilir miyim?",
    answer:
      "Evet, tek seferlik paketi satın aldıktan sonra istediğiniz zaman aylık abonelik planlarımıza geçiş yapabilirsiniz. Geçiş yaptığınızda, tek seferlik pakette yapılan çalışmalar korunur ve aylık abonelik ile sürekli optimizasyon ve ek özelliklerden yararlanmaya başlarsınız.",
  },
]

export function FAQSection() {
  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Sıkça Sorulan Sorular</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            İşletme Yönetim Sistemi hakkında en çok sorulan sorular ve yanıtları
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left font-medium">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-gray-600">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Başka sorularınız mı var?{" "}
            <a href="/iletisim" className="text-primary font-medium hover:underline">
              Bizimle iletişime geçin
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
