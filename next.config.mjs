/** @type {import('next').NextConfig} */
const nextConfig = {
  // Supabase ve diğer modüller için yol eşleştirmeleri
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  images: {
    domains: ['localhost', 'isletmenionecikar.com'],
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
