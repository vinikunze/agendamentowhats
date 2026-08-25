/**
 * Gera as chapas de tom que ocupam os lugares da fotografia real.
 *
 * NÃO são imagens de banco e não fingem ser fotos: são estudos de luz
 * abstratos, na paleta do projeto, para que a composição editorial possa ser
 * avaliada e testada antes de a fotografia definitiva chegar.
 *
 * Para substituir: coloque o arquivo real no mesmo caminho, com o mesmo nome,
 * e a página não precisa de nenhuma outra alteração.
 *
 *   node scripts/generate-placeholders.mjs
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import sharp from 'sharp'

const ROOT = join(process.cwd(), 'public', 'images')

/**
 * Paleta do projeto.
 *
 * Os tons escuros são deliberadamente mais claros que o fundo da página
 * (#080808): uma chapa que se confunde com o fundo desaparece, e a
 * composição fica impossível de avaliar. A fotografia real terá densidade
 * própria — estes tons existem para que o lugar dela seja visível.
 */
const TONES = {
  ink: ['#1a1917', '#2e2a25', '#4a4239'],
  ash: ['#22201d', '#3a352f', '#5c554a'],
  bronze: ['#1d1813', '#453522', '#8a6b45'],
  // Mais escuro que o off-white da seção clara, pelo mesmo motivo: uma
  // chapa cor de fundo não se lê como imagem.
  paper: ['#8c8579', '#b3aa9c', '#d8d1c4'],
  stone: ['#4a453d', '#7d766b', '#b3aa9d'],
}

/**
 * Uma chapa: gradiente linear em ângulo + vinheta radial + grão fino.
 * O ângulo e o ponto de luz variam por imagem para que duas chapas
 * vizinhas nunca pareçam a mesma textura repetida.
 */
function plate({ w, h, tone, angle, lightX, lightY }) {
  const [a, b, c] = TONES[tone]
  const rad = (angle * Math.PI) / 180
  const x2 = (50 + Math.cos(rad) * 50).toFixed(2)
  const y2 = (50 + Math.sin(rad) * 50).toFixed(2)

  return Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="g" x1="${(100 - x2).toFixed(2)}%" y1="${(100 - y2).toFixed(2)}%" x2="${x2}%" y2="${y2}%">
      <stop offset="0%"   stop-color="${a}"/>
      <stop offset="55%"  stop-color="${b}"/>
      <stop offset="100%" stop-color="${c}"/>
    </linearGradient>

    <radialGradient id="light" cx="${lightX}%" cy="${lightY}%" r="72%">
      <stop offset="0%"   stop-color="#ffffff" stop-opacity="0.22"/>
      <stop offset="45%"  stop-color="#ffffff" stop-opacity="0.06"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.32"/>
    </radialGradient>

    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  </defs>

  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect width="100%" height="100%" fill="url(#light)"/>
  <rect width="100%" height="100%" filter="url(#grain)" opacity="0.09"/>
</svg>`)
}

/**
 * Catálogo. Proporções deliberadamente diferentes entre si — a galeria
 * editorial depende dessa variação para não virar grade de Instagram.
 */
const IMAGES = [
  // Hero — retrato alto, o LCP da página. Tom mais claro que os demais:
  // simula um retrato iluminado, para que a composição possa ser julgada.
  { path: 'bormann/hero-portrait.jpg', w: 1600, h: 2133, tone: 'stone', angle: 115, lightX: 38, lightY: 22 },

  // Assinatura / manifesto.
  { path: 'bormann/signature-01.jpg', w: 1200, h: 1500, tone: 'ink', angle: 200, lightX: 70, lightY: 30 },

  // Trabalho — a galeria. Proporções variadas de propósito.
  { path: 'bormann/work-01.jpg', w: 1200, h: 1500, tone: 'bronze', angle: 145, lightX: 30, lightY: 25 },
  { path: 'bormann/work-02.jpg', w: 1400, h: 1050, tone: 'ash', angle: 25, lightX: 62, lightY: 40 },
  { path: 'bormann/work-03.jpg', w: 1100, h: 1650, tone: 'ink', angle: 250, lightX: 48, lightY: 18 },
  { path: 'bormann/work-04.jpg', w: 1300, h: 1300, tone: 'stone', angle: 70, lightX: 35, lightY: 55 },
  { path: 'bormann/work-05.jpg', w: 1500, h: 1000, tone: 'bronze', angle: 190, lightX: 72, lightY: 34 },
  { path: 'bormann/work-06.jpg', w: 1200, h: 1600, tone: 'ash', angle: 300, lightX: 44, lightY: 28 },

  // Concept — o espaço. Seção clara, chapas em papel.
  { path: 'concept/space-wide.jpg', w: 2000, h: 1125, tone: 'paper', angle: 160, lightX: 30, lightY: 30 },
  { path: 'concept/space-detail.jpg', w: 1100, h: 1375, tone: 'paper', angle: 40, lightX: 66, lightY: 42 },

  // Instagram — a fita final.
  { path: 'bormann/feed-01.jpg', w: 900, h: 1125, tone: 'ink', angle: 130, lightX: 40, lightY: 30 },
  { path: 'bormann/feed-02.jpg', w: 900, h: 1125, tone: 'bronze', angle: 210, lightX: 58, lightY: 26 },
  { path: 'bormann/feed-03.jpg', w: 900, h: 1125, tone: 'ash', angle: 60, lightX: 34, lightY: 46 },
  { path: 'bormann/feed-04.jpg', w: 900, h: 1125, tone: 'stone', angle: 280, lightX: 64, lightY: 36 },
  { path: 'bormann/feed-05.jpg', w: 900, h: 1125, tone: 'ink', angle: 95, lightX: 46, lightY: 20 },
  { path: 'bormann/feed-06.jpg', w: 900, h: 1125, tone: 'bronze', angle: 340, lightX: 52, lightY: 48 },
]

/** Miniatura 20px de largura → blurDataURL do next/image. */
async function blurDataUrl(buffer) {
  const tiny = await sharp(buffer)
    .resize(20, null, { fit: 'inside' })
    .webp({ quality: 45 })
    .toBuffer()
  return `data:image/webp;base64,${tiny.toString('base64')}`
}

// Regenerar só algumas chapas: `node scripts/generate-placeholders.mjs hero`
// O mapa de blur é sempre reconstruído por inteiro, lendo o que já existe.
const filter = process.argv[2]

const blurMap = {}

for (const img of IMAGES) {
  if (filter && !img.path.includes(filter)) {
    // Mantém o blur da chapa já gravada em disco.
    const existing = await sharp(join(ROOT, img.path)).toBuffer().catch(() => null)
    if (existing) blurMap[`/images/${img.path}`] = await blurDataUrl(existing)
    continue
  }

  const out = join(ROOT, img.path)
  await mkdir(dirname(out), { recursive: true })

  const svg = plate(img)
  const jpeg = await sharp(svg, { density: 144 })
    .jpeg({ quality: 88, chromaSubsampling: '4:4:4', mozjpeg: true })
    .toBuffer()

  await writeFile(out, jpeg)
  blurMap[`/images/${img.path}`] = await blurDataUrl(jpeg)

  console.log(`  ✓ ${img.path}  ${img.w}×${img.h}`)
}

// Os placeholders de blur ficam num JSON gerado para não poluir o código.
await writeFile(
  join(process.cwd(), 'src', 'content', 'blur-data.json'),
  `${JSON.stringify(blurMap, null, 2)}\n`,
)

console.log(`\n${IMAGES.length} chapas geradas + blur placeholders.`)
