/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  // Use relative paths for Electron file:// protocol (only in production)
  basePath: '',
  assetPrefix: isProd ? './' : undefined,
  // Ensure proper routing in static exports
  trailingSlash: true,
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
}

export default nextConfig
