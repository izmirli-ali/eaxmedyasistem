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
  // Yönlendirmeler ekleyelim
  async redirects() {
    return [
      // Eski /isletme/[sehir] formatındaki URL'leri /sehir/[sehir] formatına yönlendir
      {
        source: '/isletme/:path*',
        destination: '/isletme/:path*',
        permanent: false,
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
