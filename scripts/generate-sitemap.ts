import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

interface Business {
  url_slug: string
  updated_at: string | null
}

// Supabase bağlantısı
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL ve Service Role Key gerekli')
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function generateSitemap() {
  try {
    // Tüm aktif işletmeleri getir
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('url_slug, updated_at')
      .eq('aktif', true)
      .eq('onay_durumu', 'onaylandi')

    if (error) throw error

    // Sitemap başlangıcı
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Ana Sayfa -->
  <url>
    <loc>https://isletmenionecikar.com</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Statik Sayfalar -->
  <url>
    <loc>https://isletmenionecikar.com/hakkimizda</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://isletmenionecikar.com/iletisim</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://isletmenionecikar.com/gizlilik-politikasi</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://isletmenionecikar.com/kullanim-kosullari</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>

  <!-- İşletme Listeleme Sayfaları -->
  <url>
    <loc>https://isletmenionecikar.com/isletmeler</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://isletmenionecikar.com/one-cikan-isletmeler</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <!-- Kategori Sayfaları -->
  <url>
    <loc>https://isletmenionecikar.com/kategori/restoranlar</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://isletmenionecikar.com/kategori/kafeler</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://isletmenionecikar.com/kategori/otel-ve-konaklama</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://isletmenionecikar.com/kategori/eglence</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://isletmenionecikar.com/kategori/spor-ve-saglik</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://isletmenionecikar.com/kategori/alisveris</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://isletmenionecikar.com/kategori/hizmetler</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Şehir Bazlı Sayfalar -->
  <url>
    <loc>https://isletmenionecikar.com/sehir/istanbul</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://isletmenionecikar.com/sehir/ankara</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://isletmenionecikar.com/sehir/izmir</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://isletmenionecikar.com/sehir/bursa</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://isletmenionecikar.com/sehir/antalya</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- İşletme Detay Sayfaları -->`

    // İşletme detay sayfalarını ekle
    businesses.forEach((business: Business) => {
      const lastmod = business.updated_at
        ? new Date(business.updated_at).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0]

      sitemap += `
  <url>
    <loc>https://isletmenionecikar.com/isletme/${business.url_slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`
    })

    // Sitemap sonu
    sitemap += '\n</urlset>'

    // Sitemap dosyasını kaydet
    const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml')
    fs.writeFileSync(sitemapPath, sitemap)

    console.log('Sitemap başarıyla oluşturuldu!')
  } catch (error) {
    console.error('Sitemap oluşturulurken hata:', error)
  }
}

generateSitemap()
