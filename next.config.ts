import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  poweredByHeader: false,
  ...(process.env.GITHUB_PAGES === 'true'
    ? {
        output: 'export',
        basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? '',
        trailingSlash: true,
      }
    : {}),
}

export default nextConfig
