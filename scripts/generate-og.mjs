/**
 * Gera a imagem de compartilhamento (OpenGraph / Twitter) como arquivo
 * estático em `public/og.jpg`.
 *
 * Estática de propósito: nada é renderizado em runtime, o compartilhamento
 * não depende de função serverless e o arquivo entra no CDN como qualquer
 * outro asset.
 *
 * Só usa texto confirmado. Se mudar o posicionamento em `content/site.ts`,
 * rode de novo:  node scripts/generate-og.mjs
 */

import { join } from 'node:path'
import sharp from 'sharp'

const W = 1200
const H = 630

// Espelha content/site.ts — apenas dados confirmados publicamente.
const WORDMARK = 'BORMANN JR.'
const ROLE = 'HAIR STYLIST  ·  VISAGISTA'
const CREDENTIAL = 'EXPERT TEAM WELLA PROFESSIONALS BRASIL'
const PLACE = 'SINOP — MATO GROSSO'

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#080808"/>
      <stop offset="60%"  stop-color="#141310"/>
      <stop offset="100%" stop-color="#2b2419"/>
    </linearGradient>
    <radialGradient id="light" cx="72%" cy="18%" r="70%">
      <stop offset="0%"   stop-color="#b99a6b" stop-opacity="0.20"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#light)"/>
  <rect width="${W}" height="${H}" filter="url(#grain)" opacity="0.06"/>

  <!-- filete superior -->
  <rect x="80" y="86" width="72" height="1.5" fill="#b99a6b"/>

  <text x="80" y="132" font-family="Inter Tight" font-size="17" letter-spacing="3.4"
        fill="#aaa39a">${PLACE}</text>

  <text x="80" y="330" font-family="Bodoni Moda" font-size="118" letter-spacing="-1"
        fill="#f1eee8">${WORDMARK}</text>

  <rect x="80" y="392" width="1040" height="1" fill="#f1eee8" opacity="0.16"/>

  <text x="80" y="446" font-family="Inter Tight" font-size="19" letter-spacing="3.6"
        fill="#f1eee8">${ROLE}</text>

  <text x="80" y="524" font-family="Inter Tight" font-size="15" letter-spacing="2.8"
        fill="#b99a6b">${CREDENTIAL}</text>
</svg>`

const out = join(process.cwd(), 'public', 'og.jpg')

await sharp(Buffer.from(svg))
  .jpeg({ quality: 90, mozjpeg: true })
  .toFile(out)

console.log(`✓ public/og.jpg  ${W}×${H}`)
