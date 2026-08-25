/**
 * Gera o favicon e o ícone do iOS: a inicial em Bodoni sobre preto profundo,
 * com o filete de bronze da identidade.
 *
 *   node scripts/generate-icons.mjs
 */

import { join } from 'node:path'
import sharp from 'sharp'

const APP = join(process.cwd(), 'src', 'app')

const mark = (size, fontSize, ruleY, ruleW) => Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="#080808"/>
  <text x="50%" y="${fontSize * 0.86 + (size - fontSize) / 2 - fontSize * 0.12}"
        text-anchor="middle" font-family="Bodoni Moda" font-size="${fontSize}"
        fill="#f1eee8">B</text>
  <rect x="${(size - ruleW) / 2}" y="${ruleY}" width="${ruleW}" height="${Math.max(1, size * 0.018)}" fill="#b99a6b"/>
</svg>`)

// 512px — o Next reduz para os tamanhos que o navegador pedir.
await sharp(mark(512, 340, 404, 150)).png().toFile(join(APP, 'icon.png'))

// 180px — tela de início do iOS, com respiro maior nas bordas.
await sharp(mark(180, 108, 140, 54)).png().toFile(join(APP, 'apple-icon.png'))

console.log('✓ src/app/icon.png (512)  ·  src/app/apple-icon.png (180)')
