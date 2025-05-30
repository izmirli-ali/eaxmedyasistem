import { MetadataRoute } from "next"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Statik sayfalar
  const staticPages = [
    {
      url: "https://isletmenionecikar.com",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://isletmenionecikar.com/hakkimizda",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://isletmenionecikar.com/iletisim",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: "https://isletmenionecikar.com/blog",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ]

  // Dinamik işletme sayfaları
  // Burada veritabanından işletme listesini çekebilirsiniz
  const businessPages = [
    {
      url: "https://isletmenionecikar.com/isletme/ornek-isletme-1",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: "https://isletmenionecikar.com/isletme/ornek-isletme-2",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
  ]

  // Blog yazıları
  // Burada veritabanından blog yazılarını çekebilirsiniz
  const blogPosts = [
    {
      url: "https://isletmenionecikar.com/blog/ornek-blog-yazisi-1",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: "https://isletmenionecikar.com/blog/ornek-blog-yazisi-2",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ]

  return [...staticPages, ...businessPages, ...blogPosts]
}
