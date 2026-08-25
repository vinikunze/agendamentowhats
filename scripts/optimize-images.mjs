/**
 * Gera as variantes responsivas em WebP usadas pelo build estático.
 *
 * POR QUE ISTO EXISTE
 * O otimizador de imagens do Next.js é um serviço em tempo de requisição.
 * Num host estático (GitHub Pages) ele não existe, e o caminho fácil seria
 * `images.unoptimized: true` — que serve o JPEG original, do tamanho que for,
 * para qualquer tela. Num site em que a fotografia É o conteúdo, isso joga
 * fora justamente o que mais pesa no carregamento.
 *
 * Então as variantes são geradas aqui, no build, e um loader personalizado
 * (`src/lib/image-loader.ts`) escolhe a largura certa por breakpoint. O
 * `srcset` continua existindo; só o momento da geração muda.
 *
 * WebP, e não AVIF: comprime quase tão bem e é suportado em praticamente
 * todo lugar. Com um loader personalizado o `srcset` carrega um formato só,
 * sem o `<picture>` de fallback — então o formato escolhido precisa ser o
 * seguro.
 *
 *   node scripts/optimize-images.mjs
 */

import { mkdir, readdir, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import sharp from 'sharp'

const RAIZ = process.cwd()
const ORIGEM = join(RAIZ, 'public', 'images')
const DESTINO = join(RAIZ, 'public', 'otimizadas')

/**
 * Escada de larguras. Alinhada aos breakpoints reais do layout e às telas
 * densas dos aparelhos testados. Larguras acima do arquivo original são
 * descartadas — ampliar não acrescenta detalhe, só bytes.
 */
const ESCADA = [390, 640, 828, 1080, 1440, 1920]

/** Lista recursiva dos arquivos de imagem. */
async function listar(dir) {
  const entradas = await readdir(dir, { withFileTypes: true })
  const arquivos = []

  for (const entrada of entradas) {
    const caminho = join(dir, entrada.name)
    if (entrada.isDirectory()) arquivos.push(...(await listar(caminho)))
    else if (/\.(jpe?g|png)$/i.test(entrada.name)) arquivos.push(caminho)
  }

  return arquivos
}

await mkdir(DESTINO, { recursive: true })

const arquivos = await listar(ORIGEM)
const manifesto = {}
let geradas = 0

for (const arquivo of arquivos) {
  // '/images/bormann/hero-portrait.jpg'
  const src = `/${relative(join(RAIZ, 'public'), arquivo).split(/[\\/]/).join('/')}`

  const imagem = sharp(arquivo)
  const { width: larguraOriginal } = await imagem.metadata()
  if (!larguraOriginal) continue

  // A largura original entra na lista para que telas muito largas ainda
  // recebam o arquivo em resolução máxima.
  const larguras = [
    ...new Set(
      [...ESCADA.filter((w) => w < larguraOriginal), larguraOriginal].sort(
        (a, b) => a - b,
      ),
    ),
  ]

  // 'bormann__hero-portrait'
  const base = src
    .replace('/images/', '')
    .replace(/\.(jpe?g|png)$/i, '')
    .split('/')
    .join('__')

  for (const largura of larguras) {
    await sharp(arquivo)
      .resize(largura, null, { withoutEnlargement: true })
      .webp({ quality: 82, effort: 5 })
      .toFile(join(DESTINO, `${base}-${largura}.webp`))
    geradas++
  }

  manifesto[src] = { base: `/otimizadas/${base}`, larguras }
}

await writeFile(
  join(RAIZ, 'src', 'content', 'image-variants.json'),
  `${JSON.stringify(manifesto, null, 2)}\n`,
)

console.log(
  `✓ ${geradas} variantes WebP de ${arquivos.length} imagens → public/otimizadas/`,
)
