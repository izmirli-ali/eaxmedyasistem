import { createClient } from "@/lib/supabase/server"

export async function GET(): Promise<Response> {
  const supabase = createClient()

  // İşletmeleri ve kategorileri çekelim
  const { data: isletmeler } = await supabase.from("isletmeler").select("id, url_slug, updated_at, kategori, sehir")

  // Benzersiz kategorileri ve şehirleri alalım
  const kategoriler = [...new Set(isletmeler.map((i) => i.kategori).filter(Boolean))]
  const sehirler = [...new Set(isletmeler.map((i) => i.sehir).filter(Boolean))]

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://isletmenionecikar.com"

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${baseUrl}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
      <url>
        <loc>${baseUrl}/isletme-listesi</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
      </url>`

  // İşletme sayfaları
  isletmeler.forEach((isletme) => {
    sitemap += `
      <url>
        <loc>${baseUrl}/isletme/${isletme.id}</loc>
        <lastmod>${new Date(isletme.updated_at).toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>`
  })

  // Kategori sayfaları
  kategoriler.forEach((kategori) => {
    sitemap += `
      <url>
        <loc>${baseUrl}/isletme-listesi?kategori=${encodeURIComponent(kategori)}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
      </url>`
  })

  // Şehir sayfaları
  sehirler.forEach((sehir) => {
    sitemap += `
      <url>
        <loc>${baseUrl}/isletme-listesi?sehir=${encodeURIComponent(sehir)}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
      </url>`
  })

  sitemap += `</urlset>`

  return new Response(sitemap, {
    headers: { "Content-Type": "application/xml" },
  })
}
