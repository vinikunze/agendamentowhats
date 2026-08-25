import blurData from './blur-data.json'
import variantes from './image-variants.json'

/**
 * ============================================================================
 * CATÁLOGO DE IMAGENS
 * ============================================================================
 *
 * As imagens hoje em `/public/images/` são CHAPAS DE TOM geradas por
 * `scripts/generate-placeholders.mjs` — estudos de luz abstratos na paleta do
 * projeto. Elas seguram a composição; não fingem ser fotografia.
 *
 * PARA COLOCAR A FOTOGRAFIA REAL — dois passos:
 *
 *   1. salve o arquivo no MESMO caminho e com o MESMO nome da chapa atual;
 *   2. rode `npm run images:web` — largura, altura e as variantes
 *      responsivas se atualizam sozinhas.
 *
 * Depois, reescreva o `alt` descrevendo o que a foto realmente mostra. Esse
 * passo é manual de propósito: só quem viu a foto sabe descrevê-la, e é o
 * texto que uma pessoa cega vai ouvir no lugar da imagem.
 * ============================================================================
 */

export type Img = {
  src: string
  width: number
  height: number
  alt: string
  /** Legenda editorial opcional, exibida no rodapé da imagem. */
  caption?: string
  /** Link externo — usado na fita do Instagram. */
  href?: string
}

type Variante = { base: string; larguras: number[]; width: number; height: number }

const blur = blurData as Record<string, string>
const MANIFESTO = variantes as Record<string, Variante>

/** blurDataURL correspondente, quando existir. */
export function blurFor(src: string): string | undefined {
  return blur[src]
}

/**
 * Monta uma entrada do catálogo lendo as dimensões REAIS do arquivo, que
 * `npm run images:web` grava no manifesto. Assim ninguém precisa manter
 * número em dois lugares — e trocar a foto nunca deixa uma proporção velha
 * para trás, que é o tipo de erro que só aparece depois de publicado.
 *
 * O fallback existe só para o caso de uma imagem entrar no catálogo antes de
 * o script rodar.
 */
function img(
  src: string,
  alt: string,
  extra: { caption?: string; href?: string; fallback?: [number, number] } = {},
): Img {
  const m = MANIFESTO[src]
  const [fw, fh] = extra.fallback ?? [1200, 1500]

  return {
    src,
    width: m?.width ?? fw,
    height: m?.height ?? fh,
    alt,
    caption: extra.caption,
    href: extra.href,
  }
}

/* -------------------------------------------------------------------------- */

// TODO cliente — trocar pelo retrato editorial do Bormann Jr.
export const heroImage = img(
  '/images/bormann/hero-portrait.jpg',
  'Estudo de luz em tons de grafite e bronze, no lugar do retrato editorial de Bormann Jr.',
)

export const signatureImage = img(
  '/images/bormann/signature-01.jpg',
  'Estudo de luz em preto profundo, no lugar da fotografia de bastidor.',
)

/**
 * A galeria de trabalho. As proporções são intencionalmente diferentes:
 * é o que separa uma galeria editorial de uma grade de Instagram. Ao
 * substituir, prefira manter essa variação de formato.
 */
export const workImages: Img[] = [
  img(
    '/images/bormann/work-01.jpg',
    'Estudo de luz em bronze quente, no lugar de um trabalho de cor.',
    { caption: 'Cor' },
  ),
  img(
    '/images/bormann/work-02.jpg',
    'Estudo de luz horizontal em grafite, no lugar de um trabalho de corte.',
    { caption: 'Corte' },
  ),
  img(
    '/images/bormann/work-03.jpg',
    'Estudo de luz vertical em preto profundo, no lugar de um retrato de resultado.',
    { caption: 'Retrato' },
  ),
  img(
    '/images/bormann/work-04.jpg',
    'Estudo de luz quadrado em cinza quente, no lugar de um detalhe de acabamento.',
    { caption: 'Acabamento' },
  ),
  img(
    '/images/bormann/work-05.jpg',
    'Estudo de luz panorâmico em bronze, no lugar de uma composição de estúdio.',
    { caption: 'Estúdio' },
  ),
  img(
    '/images/bormann/work-06.jpg',
    'Estudo de luz em grafite frio, no lugar de um trabalho de construção de imagem.',
    { caption: 'Imagem' },
  ),
]

export const conceptImages = {
  wide: img(
    '/images/concept/space-wide.jpg',
    'Estudo de luz claro, no lugar da fotografia ampla do espaço do Bormann Jr Concept.',
  ),
  detail: img(
    '/images/concept/space-detail.jpg',
    'Estudo de luz claro em formato vertical, no lugar de um detalhe do interior do salão.',
  ),
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
  img('/images/bormann/feed-01.jpg', 'Estudo de luz, no lugar de uma publicação do Instagram.'),
  img('/images/bormann/feed-02.jpg', 'Estudo de luz em bronze, no lugar de uma publicação do Instagram.'),
  img('/images/bormann/feed-03.jpg', 'Estudo de luz em grafite, no lugar de uma publicação do Instagram.'),
  img('/images/bormann/feed-04.jpg', 'Estudo de luz em cinza quente, no lugar de uma publicação do Instagram.'),
  img('/images/bormann/feed-05.jpg', 'Estudo de luz em preto profundo, no lugar de uma publicação do Instagram.'),
  img('/images/bormann/feed-06.jpg', 'Estudo de luz em bronze escuro, no lugar de uma publicação do Instagram.'),
]
