import blurData from './blur-data.json'

/**
 * ============================================================================
 * CATÁLOGO DE IMAGENS
 * ============================================================================
 *
 * As imagens hoje em `/public/images/` são CHAPAS DE TOM geradas por
 * `scripts/generate-placeholders.mjs` — estudos de luz abstratos na paleta do
 * projeto. Elas seguram a composição; não fingem ser fotografia.
 *
 * PARA COLOCAR A FOTOGRAFIA REAL:
 *   1. salve o arquivo no mesmo caminho e com o mesmo nome;
 *   2. atualize `width`/`height` para as dimensões reais do arquivo;
 *   3. reescreva o `alt` descrevendo o que a foto mostra de fato;
 *   4. rode `node scripts/generate-placeholders.mjs` apenas se quiser
 *      regenerar as chapas restantes — ele não sobrescreve o que você
 *      remover do catálogo daquele script.
 *
 * O `alt` é obrigatório e precisa descrever a imagem. Os textos atuais
 * descrevem as chapas, porque é isso que está na tela.
 * ============================================================================
 */

export type Img = {
  src: string
  width: number
  height: number
  alt: string
  /** Legenda editorial opcional, exibida no hover/rodapé da imagem. */
  caption?: string
  /** Link externo — usado na fita do Instagram. */
  href?: string
}

const blur = blurData as Record<string, string>

/** blurDataURL correspondente, quando existir. */
export function blurFor(src: string): string | undefined {
  return blur[src]
}

/* -------------------------------------------------------------------------- */

export const heroImage: Img = {
  src: '/images/bormann/hero-portrait.jpg',
  width: 1600,
  height: 2133,
  // TODO cliente — trocar por retrato editorial do Bormann Jr.
  alt: 'Estudo de luz em tons de grafite e bronze, no lugar do retrato editorial de Bormann Jr.',
}

export const signatureImage: Img = {
  src: '/images/bormann/signature-01.jpg',
  width: 1200,
  height: 1500,
  alt: 'Estudo de luz em preto profundo, no lugar da fotografia de bastidor.',
}

/**
 * A galeria de trabalho. As proporções são intencionalmente diferentes:
 * é o que separa uma galeria editorial de uma grade de Instagram.
 */
export const workImages: Img[] = [
  {
    src: '/images/bormann/work-01.jpg',
    width: 1200,
    height: 1500,
    alt: 'Estudo de luz em bronze quente, no lugar de um trabalho de cor.',
    caption: 'Cor',
  },
  {
    src: '/images/bormann/work-02.jpg',
    width: 1400,
    height: 1050,
    alt: 'Estudo de luz horizontal em grafite, no lugar de um trabalho de corte.',
    caption: 'Corte',
  },
  {
    src: '/images/bormann/work-03.jpg',
    width: 1100,
    height: 1650,
    alt: 'Estudo de luz vertical em preto profundo, no lugar de um retrato de resultado.',
    caption: 'Retrato',
  },
  {
    src: '/images/bormann/work-04.jpg',
    width: 1300,
    height: 1300,
    alt: 'Estudo de luz quadrado em cinza quente, no lugar de um detalhe de acabamento.',
    caption: 'Acabamento',
  },
  {
    src: '/images/bormann/work-05.jpg',
    width: 1500,
    height: 1000,
    alt: 'Estudo de luz panorâmico em bronze, no lugar de uma composição de estúdio.',
    caption: 'Estúdio',
  },
  {
    src: '/images/bormann/work-06.jpg',
    width: 1200,
    height: 1600,
    alt: 'Estudo de luz em grafite frio, no lugar de um trabalho de construção de imagem.',
    caption: 'Imagem',
  },
]

export const conceptImages = {
  wide: {
    src: '/images/concept/space-wide.jpg',
    width: 2000,
    height: 1125,
    alt: 'Estudo de luz claro, no lugar da fotografia ampla do espaço do Bormann Jr Concept.',
  } satisfies Img,
  detail: {
    src: '/images/concept/space-detail.jpg',
    width: 1100,
    height: 1375,
    alt: 'Estudo de luz claro em formato vertical, no lugar de um detalhe do interior do salão.',
  } satisfies Img,
}

/**
 * Fita do Instagram — imagens locais, não embed.
 * Nenhum widget, nenhuma dependência da API, nenhuma URL frágil do Instagram
 * como fonte permanente. Cada item leva ao perfil correspondente.
 *
 * TODO cliente: substituir por 6 publicações reais e, se quiser, apontar
 * cada `href` para o permalink específico do post.
 */
export const feedImages: Img[] = [
  { src: '/images/bormann/feed-01.jpg', width: 900, height: 1125, alt: 'Estudo de luz, no lugar de uma publicação do Instagram.' },
  { src: '/images/bormann/feed-02.jpg', width: 900, height: 1125, alt: 'Estudo de luz em bronze, no lugar de uma publicação do Instagram.' },
  { src: '/images/bormann/feed-03.jpg', width: 900, height: 1125, alt: 'Estudo de luz em grafite, no lugar de uma publicação do Instagram.' },
  { src: '/images/bormann/feed-04.jpg', width: 900, height: 1125, alt: 'Estudo de luz em cinza quente, no lugar de uma publicação do Instagram.' },
  { src: '/images/bormann/feed-05.jpg', width: 900, height: 1125, alt: 'Estudo de luz em preto profundo, no lugar de uma publicação do Instagram.' },
  { src: '/images/bormann/feed-06.jpg', width: 900, height: 1125, alt: 'Estudo de luz em bronze escuro, no lugar de uma publicação do Instagram.' },
]
