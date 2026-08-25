import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    /**
     * AVIF primeiro, WebP como rede de segurança. Numa página em que a
     * fotografia é o conteúdo, é a economia que mais pesa no LCP.
     */
    formats: ['image/avif', 'image/webp'],

    /**
     * Larguras alinhadas aos breakpoints reais do layout, incluindo os
     * densos (2x) dos aparelhos testados. Cada entrada a mais é mais
     * trabalho de otimização no build — estas são as que o site usa.
     */
    deviceSizes: [390, 640, 750, 828, 1080, 1200, 1440, 1920, 2560],
    imageSizes: [128, 256, 384],

    /** Um ano de cache: os arquivos são versionados pelo próprio Next. */
    minimumCacheTTL: 31_536_000,
  },

  /** Sem o header `X-Powered-By`. */
  poweredByHeader: false,
}

export default nextConfig
