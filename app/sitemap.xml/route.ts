import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = createClient()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://isletmenionecikar.com"

  try {
    // İşletmeleri ve kategorileri çekelim
    const { data: isletmeler, error: isletmelerError } = await supabase
      .from("isletmeler2")
      .select("id, url_slug, updated_at, kategori, sehir, aktif, isletme_adi, fotograf_url, seo_baslik, seo_aciklama")
      .eq("aktif", true)
      .order("updated_at", { ascending: false })

    if (isletmelerError) {
      console.error("İşletmeler çekilirken hata:", isletmelerError)
      return new NextResponse("İşletmeler çekilirken hata oluştu", { status: 500 })
    }

    // Benzersiz kategorileri ve şehirleri alalım
    const kategoriler = [...new Set(isletmeler.map((i) => i.kategori).filter(Boolean))]
    const sehirler = [...new Set(isletmeler.map((i) => i.sehir).filter(Boolean))]

    // XML başlangıcı
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
                            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">`

    // Statik sayfalar
    const staticPages = [
      { url: "", lastmod: new Date().toISOString(), changefreq: "daily", priority: "1.0" },
      { url: "/isletme-listesi", lastmod: new Date().toISOString(), changefreq: "daily", priority: "0.9" },
      { url: "/isletme-kayit", lastmod: new Date().toISOString(), changefreq: "monthly", priority: "0.8" },
      { url: "/hakkimizda", lastmod: new Date().toISOString(), changefreq: "monthly", priority: "0.7" },
      { url: "/iletisim", lastmod: new Date().toISOString(), changefreq: "monthly", priority: "0.7" },
    ]

    // Statik sayfaları ekle
    staticPages.forEach((page) => {
      sitemap += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
    })

    // İşletme sayfaları
    isletmeler.forEach((isletme) => {
      if (!isletme.url_slug) return

      const lastmod = isletme.updated_at ? new Date(isletme.updated_at).toISOString() : new Date().toISOString()
      const title = isletme.seo_baslik || isletme.isletme_adi
      const description = isletme.seo_aciklama || ""

      sitemap += `
  <url>
    <loc>${baseUrl}/isletme/${isletme.url_slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <news:news>
      <news:publication>
        <news:name>İşletme Yönetim Sistemi</news:name>
        <news:language>tr</news:language>
      </news:publication>
      <news:publication_date>${lastmod}</news:publication_date>
      <news:title>${title}</news:title>
      <news:keywords>${isletme.kategori}, ${isletme.sehir}, işletme</news:keywords>
    </news:news>`

      // İşletme için görsel varsa ekle
      if (isletme.fotograf_url) {
        sitemap += `
    <image:image>
      <image:loc>${isletme.fotograf_url}</image:loc>
      <image:title>${title}</image:title>
      <image:caption>${description}</image:caption>
    </image:image>`
      }

      sitemap += `
  </url>`
    })

    // Kategori sayfaları
    kategoriler.forEach((kategori) => {
      if (!kategori) return

      sitemap += `
  <url>
    <loc>${baseUrl}/isletme-listesi?kategori=${encodeURIComponent(kategori)}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <news:news>
      <news:publication>
        <news:name>İşletme Yönetim Sistemi</news:name>
        <news:language>tr</news:language>
      </news:publication>
      <news:publication_date>${new Date().toISOString()}</news:publication_date>
      <news:title>${kategori} İşletmeleri</news:title>
      <news:keywords>${kategori}, işletme, ${sehirler.join(", ")}</news:keywords>
    </news:news>
  </url>`
    })

    // Şehir sayfaları
    sehirler.forEach((sehir) => {
      if (!sehir) return

      sitemap += `
  <url>
    <loc>${baseUrl}/isletme-listesi?sehir=${encodeURIComponent(sehir)}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <news:news>
      <news:publication>
        <news:name>İşletme Yönetim Sistemi</news:name>
        <news:language>tr</news:language>
      </news:publication>
      <news:publication_date>${new Date().toISOString()}</news:publication_date>
      <news:title>${sehir} İşletmeleri</news:title>
      <news:keywords>${sehir}, işletme, ${kategoriler.join(", ")}</news:keywords>
    </news:news>
  </url>`
    })

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
  } catch (error) {
    console.error("Sitemap oluşturulurken hata:", error)
    return new NextResponse("Sitemap oluşturulurken hata oluştu", { status: 500 })
  }
}
