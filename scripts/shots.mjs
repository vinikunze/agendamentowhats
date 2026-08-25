/**
 * Capturas por seção, para julgar composição fora do navegador.
 *
 *   node scripts/shots.mjs [largura] [altura]
 *
 * Salva em `.qa/sec-<largura>-<seção>.png`.
 */
import { mkdir } from 'node:fs/promises'
import { chromium } from '@playwright/test'

const [, , widthArg, heightArg] = process.argv
const width = Number(widthArg ?? 1440)
const height = Number(heightArg ?? 900)

await mkdir('.qa', { recursive: true })

const b = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: process.getuid?.() === 0 ? ['--no-sandbox'] : [],
})
const p = await b.newPage({ viewport: { width, height }, deviceScaleFactor: 1 })
await p.goto('http://localhost:3000/', { waitUntil: 'networkidle' })
await p.waitForTimeout(1500)

const sections = ['assinatura', 'trabalho', 'concept', 'cursos', 'instagram', 'contato']

for (const id of sections) {
  await p.evaluate((sel) => {
    document.querySelector(`#${sel}`)?.scrollIntoView({ block: 'start' })
  }, id)
  await p.waitForTimeout(1400)
  await p.screenshot({ path: `.qa/sec-${width}-${id}.png` })
}

// Meio da galeria horizontal (só existe no desktop).
if (width >= 1024) {
  await p.evaluate(() => {
    const el = document.querySelector('#trabalho')
    if (el) window.scrollTo(0, el.offsetTop + el.offsetHeight * 0.55)
  })
  await p.waitForTimeout(1400)
  await p.screenshot({ path: `.qa/sec-${width}-galeria-meio.png` })
}

await b.close()
console.log('ok')
