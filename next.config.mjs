/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      // Eski /isletme/[id] formatındaki URL'leri /isletme/[sehir]/[slug] formatına yönlendir
      {
        source: '/isletme/:id',
        destination: '/isletme/:sehir/:slug',
        permanent: true,
      },
      // Admin sayfasına erişim için yönlendirme
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
