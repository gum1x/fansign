/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['blob.v0.dev', 'hebbkx1anhila5yf.public.blob.vercel-storage.com', 'v0.blob.com'],
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'v0.blob.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Use standalone output for Railway
  output: 'standalone',
  trailingSlash: true,
  
  // Webpack configuration for better builds
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      }
    }
    
    // Ignore critical dependency warnings
    config.ignoreWarnings = [
      { module: /@supabase\/realtime-js/ },
      { module: /bcryptjs/ },
      /Critical dependency/,
    ]
    
    // Handle bcryptjs properly
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push('bcryptjs')
    }
    
    return config
  },
  
  // Experimental features for better build performance
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs'],
    esmExternals: 'loose',
  },
  
  // Environment variables available at build time
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Disable static optimization for dynamic routes
  generateStaticParams: false,
  
  // Handle redirects and rewrites
  async redirects() {
    return []
  },
  
  async rewrites() {
    return []
  },
}

export default nextConfig