import variantes from '@/content/image-variants.json'

type Variante = { base: string; larguras: number[] }

const MANIFESTO = variantes as Record<string, Variante>

/**
 * Prefixo do site quando ele não vive na raiz do domínio — o caso do GitHub
 * Pages, que serve em `/bormannjrconcept/`. Um loader personalizado devolve
 * a URL final, então o prefixo precisa entrar aqui: o Next não o acrescenta.
 */
const PREFIXO = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

/**
 * Loader de imagens do build estático.
 *
 * Aponta cada largura do `srcset` para a variante WebP correspondente,
 * gerada por `scripts/optimize-images.mjs`. É o que mantém as imagens
 * responsivas num host que não tem otimizador em tempo de requisição.
 *
 * Usado apenas quando `GITHUB_PAGES=true`; em desenvolvimento e em qualquer
 * host com Node, o otimizador nativo do Next continua no comando.
 */
export default function imageLoader({
  src,
  width,
}: {
  src: string
  width: number
  quality?: number
}): string {
  const entrada = MANIFESTO[src]

  // Sem variante gerada, serve o arquivo original — melhor uma imagem grande
  // do que uma imagem quebrada.
  if (!entrada) return `${PREFIXO}${src}`

  // A menor variante que ainda cobre a largura pedida; se nenhuma cobrir,
  // a maior disponível.
  const escolhida =
    entrada.larguras.find((w) => w >= width) ??
    entrada.larguras[entrada.larguras.length - 1]

  return `${PREFIXO}${entrada.base}-${escolhida}.webp`
}
