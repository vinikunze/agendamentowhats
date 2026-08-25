/**
 * Auditoria de acessibilidade (axe-core) e de métricas de campo
 * (LCP, CLS, tamanho transferido) contra o build de produção.
 *
 *   npm run build && npm run start
 *   node scripts/audit.mjs
 */

import { chromium } from '@playwright/test'
import { AxeBuilder } from '@axe-core/playwright'

const URL = process.argv[2] ?? 'http://localhost:3000/'

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: process.getuid?.() === 0 ? ['--no-sandbox'] : [],
})

const VIEWPORTS = [
  { name: 'mobile 390×844', width: 390, height: 844 },
  { name: 'desktop 1440×900', width: 1440, height: 900 },
]

let failures = 0

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    locale: 'pt-BR',
  })
  const page = await context.newPage()

  // --- Peso transferido -----------------------------------------------------
  let bytes = 0
  let requests = 0
  page.on('response', async (r) => {
    requests++
    const len = r.headers()['content-length']
    if (len) bytes += Number(len)
  })

  /*
   * O observador precisa existir ANTES da navegação. Instalado depois, com
   * `buffered: true`, ele às vezes replica só parte das entradas e a métrica
   * sai otimista demais — foi assim que um LCP de 1,8s apareceu como 0,3s.
   */
  await page.addInitScript(() => {
    window.__lcp = 0
    window.__lcpEl = ''
    window.__cls = 0

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.__lcp = entry.startTime
        window.__lcpEl = entry.element
          ? entry.element.tagName + '.' + String(entry.element.className).slice(0, 44)
          : entry.url || '?'
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true })

    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Só deslocamentos sem interação do usuário contam.
        if (!entry.hadRecentInput) window.__cls += entry.value ?? 0
      }
    }).observe({ type: 'layout-shift', buffered: true })
  })

  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60_000 })
  await page.waitForTimeout(3000) // deixa a sequência de entrada terminar

  const metrics = await page.evaluate(() => ({
    lcp: Math.round(window.__lcp),
    lcpEl: window.__lcpEl,
    domContentLoaded: Math.round(
      performance.getEntriesByType('navigation')[0]?.domContentLoadedEventEnd ?? 0,
    ),
  }))

  // Um scroll completo para provocar qualquer deslocamento tardio.
  const height = await page.evaluate(() => document.documentElement.scrollHeight)
  for (let y = 0; y < height; y += vp.height) {
    await page.evaluate((v) => window.scrollTo(0, v), y)
    await page.waitForTimeout(140)
  }

  const clsFinal = await page.evaluate(() => Number(window.__cls.toFixed(4)))

  // --- axe-core -------------------------------------------------------------
  await page.evaluate(() => window.scrollTo(0, 0))
  const axe = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
    .analyze()

  const serious = axe.violations.filter((v) =>
    ['critical', 'serious'].includes(v.impact ?? ''),
  )

  console.log(`\n── ${vp.name} ────────────────────────────────`)
  console.log(
    `  LCP ${metrics.lcp}ms (${metrics.lcpEl}) · CLS ${clsFinal} · DCL ${metrics.domContentLoaded}ms`,
  )
  console.log(`  ${requests} requisições · ~${Math.round(bytes / 1024)} KB declarados`)
  console.log(
    `  axe: ${axe.violations.length} violação(ões) (${serious.length} grave/crítica)`,
  )

  for (const v of axe.violations) {
    console.log(`    [${v.impact}] ${v.id} — ${v.help}`)
    for (const node of v.nodes.slice(0, 3)) {
      console.log(`        ${node.target.join(' ')}`)
      if (node.failureSummary) {
        console.log(`        ${node.failureSummary.split('\n').join(' / ').slice(0, 160)}`)
      }
    }
  }

  if (serious.length > 0) failures += serious.length
  if (clsFinal > 0.1) {
    console.log(`  ✗ CLS acima de 0.1`)
    failures++
  }

  await context.close()
}

await browser.close()

console.log(
  `\n${failures === 0 ? '✓ Nada grave.' : `✗ ${failures} problema(s) a corrigir.`}`,
)
