/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Configuración para Cloudflare Pages con @cloudflare/next-on-pages
  images: {
    unoptimized: true,
  },
  // Variables de entorno del backend API
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  },
}

export default nextConfig
