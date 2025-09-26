/** @type {import('next').NextConfig} */
const nextConfig = {
  // ENTERPRISE: Performance Optimization
  images: {
    domains: ['localhost'],
    unoptimized: false,
    formats: ['image/webp', 'image/avif']
  },
  
  compress: true,
  
  // ENTERPRISE: Security & Performance headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy', 
            value: 'strict-origin-when-cross-origin'
          }
        ]
      }
    ]
  },
  
  // ENTERPRISE: SEO redirects
  async redirects() {
    return [
      {
        source: '/ear',
        destination: '/essen-auf-raedern',
        permanent: true
      },
      {
        source: '/kitchen',
        destination: '/kuechenmanager', 
        permanent: true
      },
      {
        source: '/webmenu',
        destination: '/webmenue',
        permanent: true
      }
    ]
  },
  
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig