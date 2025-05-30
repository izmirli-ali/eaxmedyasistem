import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = createClient()
  const baseUrl = "https://isletmenionecikar.com"

  // Sitemap başlangıcı
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">`

  // Statik sayfalar
  const staticPages = [
    { url: "/", changefreq: "daily", priority: "1.0" },
    { url: "/hakkimizda", changefreq: "monthly", priority: "0.8" },
    { url: "/iletisim", changefreq: "monthly", priority: "0.8" },
    { url: "/gizlilik-politikasi", changefreq: "monthly", priority: "0.5" },
    { url: "/kullanim-kosullari", changefreq: "monthly", priority: "0.5" },
    { url: "/isletmeler", changefreq: "daily", priority: "0.9" },
    { url: "/one-cikan-isletmeler", changefreq: "daily", priority: "0.9" },
  ]

  // Tüm aktif işletmeleri getir
  const { data: isletmeler, error: isletmelerError } = await supabase
    .from("isletmeler")
    .select("*")
    .eq("aktif", true)
    .eq("onay_durumu", "onaylandi")

  if (isletmelerError) {
    console.error("İşletmeler getirilirken hata:", isletmelerError)
  }

  // Tüm kategorileri getir
  const { data: kategoriler, error: kategorilerError } = await supabase
    .from("kategoriler")
    .select("slug")
    .eq("aktif", true)

  if (kategorilerError) {
    console.error("Kategoriler getirilirken hata:", kategorilerError)
  }

  // Tüm şehirleri getir
  const { data: sehirler, error: sehirlerError } = await supabase
    .from("sehirler")
    .select("slug")
    .eq("aktif", true)

  if (sehirlerError) {
    console.error("Şehirler getirilirken hata:", sehirlerError)
  }

  // Statik sayfaları ekle
  staticPages.forEach((page) => {
    sitemap += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  })

  // İşletme sayfaları
  if (isletmeler) {
    isletmeler.forEach((isletme) => {
      if (!isletme.url_slug) return

      const lastmod = isletme.updated_at ? new Date(isletme.updated_at).toISOString() : new Date().toISOString()
      const priority = isletme.one_cikan ? "0.9" : "0.8"

      sitemap += `
  <url>
    <loc>${baseUrl}/isletme/${isletme.url_slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>`

      // İşletme için görsel varsa ekle
      if (isletme.fotograf_url) {
        sitemap += `
    <image:image>
      <image:loc>${isletme.fotograf_url}</image:loc>
      <image:title>${isletme.isletme_adi || "İşletme Görseli"}</image:title>
      <image:caption>${isletme.seo_aciklama || isletme.aciklama || ""}</image:caption>
    </image:image>`
      }

      sitemap += `
  </url>`
    })
  }

  // Kategori sayfaları
  if (kategoriler) {
    kategoriler.forEach((kategori) => {
      if (!kategori.slug) return

      sitemap += `
  <url>
    <loc>${baseUrl}/kategori/${kategori.slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    })
  }

  // Şehir sayfaları
  if (sehirler) {
    sehirler.forEach((sehir) => {
      if (!sehir.slug) return

      sitemap += `
  <url>
    <loc>${baseUrl}/sehir/${sehir.slug}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    })
  }

  // XML sonlandırma
  sitemap += `
</urlset>`

  // XML içeriğini döndür
  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  })
}
