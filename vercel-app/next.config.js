/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: ['stripe']
  },
  env: {
    CUSTOM_KEY: 'songo-enterprise',
    APP_VERSION: '1.0.0'
  },
  images: {
    domains: [
      'localhost',
      'songo-enterprise.vercel.app',
      'images.unsplash.com',
      'via.placeholder.com',
      'maps.googleapis.com',
      'maps.gstatic.com',
      'lh3.googleusercontent.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '**.stripe.com',
      }
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60
  },
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
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ]
      },
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: process.env.NODE_ENV === 'production' ? 'https://songo-enterprise.vercel.app' : '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ]
      }
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/carriers/:path*',
        destination: '/api/shipping/carriers/:path*'
      },
      {
        source: '/api/tracking/:path*',
        destination: '/api/shipping/tracking/:path*'
      }
    ]
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Custom webpack configuration
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    return config;
  },

  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  },
  // Additional redirects
  async redirects() {
    return [
      {
        source: '/track',
        destination: '/tracking',
        permanent: true
      },
      {
        source: '/quote',
        destination: '/get-quote',
        permanent: true
      },
      {
        source: '/pay',
        destination: '/checkout',
        permanent: true
      }
    ]
  },
  // Output configuration
  output: 'standalone',
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  trailingSlash: false,
  typescript: {
    ignoreBuildErrors: false
  },
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['src', 'pages', 'components', 'lib', 'utils']
  }
}

module.exports = nextConfig
