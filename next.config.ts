import type { NextConfig } from 'next'

/**
 * O site tem dois modos de build.
 *
 * PADRÃO — desenvolvimento e qualquer host com Node (Vercel, Cloudflare,
 * um servidor próprio). O otimizador de imagens do Next trabalha em tempo de
 * requisição: AVIF, WebP, recorte por breakpoint, cache longo.
 *
 * ESTÁTICO (`GITHUB_PAGES=true`) — exporta HTML puro para o GitHub Pages,
 * que não roda Node. Sem otimizador em tempo de requisição, as variantes
 * responsivas são geradas antes, por `scripts/optimize-images.mjs`, e um
 * loader personalizado aponta o `srcset` para elas. O site continua servindo
 * imagem do tamanho certo; só o momento da geração muda.
 */
const estatico = process.env.GITHUB_PAGES === 'true'

/** No Pages o site vive em /bormannjrconcept, não na raiz do domínio. */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

const nextConfig: NextConfig = {
  ...(estatico
    ? {
        output: 'export',
        basePath,
        images: {
          loader: 'custom',
          loaderFile: './src/lib/image-loader.ts',
        },
      }
    : {
        images: {
          /**
           * AVIF primeiro, WebP como rede de segurança. Numa página em que a
           * fotografia é o conteúdo, é a economia que mais pesa no LCP.
           */
          formats: ['image/avif', 'image/webp'],

          /**
           * Larguras alinhadas aos breakpoints reais do layout, incluindo os
           * densos (2x) dos aparelhos testados.
           */
          deviceSizes: [390, 640, 750, 828, 1080, 1200, 1440, 1920, 2560],
          imageSizes: [128, 256, 384],

          /** Um ano de cache: os arquivos são versionados pelo próprio Next. */
          minimumCacheTTL: 31_536_000,
        },
      }),

  /** Sem o header `X-Powered-By`. */
  poweredByHeader: false,
}

export default nextConfig
