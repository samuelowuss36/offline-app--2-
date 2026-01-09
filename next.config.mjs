/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: process.env.ELECTRON_BUILD === 'true' ? 'export' : undefined,
  basePath: process.env.ELECTRON_BUILD === 'true' ? '' : undefined,
}

export default nextConfig
