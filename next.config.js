/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  // Use relative paths for Electron file:// protocol
  basePath: '',
  assetPrefix: './',
  // Ensure proper routing in static exports
  trailingSlash: true,
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
}

export default nextConfig
