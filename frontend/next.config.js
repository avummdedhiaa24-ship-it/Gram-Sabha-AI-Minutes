/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Suppress lint checks during production builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Suppress type checks during production builds for deployment ease
    ignoreBuildErrors: true,
  }
}

module.exports = nextConfig
