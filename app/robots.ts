import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/admin/",
        "/private/",
        "/*.json$",
        "/*.xml$",
        "/*.txt$",
      ],
    },
    sitemap: "https://isletmenionecikar.com/sitemap.xml",
    host: "https://isletmenionecikar.com",
  }
}
