/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  // Use absolute paths for Electron http:// server (only in production)
  basePath: '',
  assetPrefix: isProd ? '' : undefined,
  // Ensure proper routing in static exports
  trailingSlash: true,
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
}

export default nextConfig
