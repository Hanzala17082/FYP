/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  // SEO optimizations
  compress: true,
  poweredByHeader: false,
  // Enable static exports for better performance (only in production)
  // output: 'standalone', // Commented out for development
}

module.exports = nextConfig
