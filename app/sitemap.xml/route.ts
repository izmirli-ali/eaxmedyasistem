import { createClient } from "@/lib/supabase/server"

export async function GET(): Promise<Response> {
  const supabase = createClient()

  const { data: isletmeler } = await supabase.from("isletmeler").select("url_slug, updated_at")

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://isletmenionecikar.com"

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${baseUrl}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>`

  isletmeler.forEach((isletme) => {
    sitemap += `
      <url>
        <loc>${baseUrl}/isletme/${isletme.url_slug}</loc>
        <lastmod>${new Date(isletme.updated_at).toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>`
  })

  sitemap += `</urlset>`

  return new Response(sitemap, {
    headers: { "Content-Type": "application/xml" },
  })
}
