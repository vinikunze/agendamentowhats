/**
 * Auditoria visual e técnica em Chromium.
 *
 * Percorre a página inteira em cada viewport, coleta erros de console e de
 * rede, mede overflow horizontal, procura elementos que estouram a tela e
 * salva as capturas em `.qa/`.
 *
 *   node scripts/qa.mjs [url]
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { chromium, devices } from '@playwright/test'

const URL = process.argv[2] ?? 'http://localhost:3000/'
const OUT = join(process.cwd(), '.qa')

const VIEWPORTS = [
  { name: '375x812-iphone-se', width: 375, height: 812, mobile: true },
  { name: '390x844-iphone-14', width: 390, height: 844, mobile: true },
  { name: '430x932-iphone-max', width: 430, height: 932, mobile: true },
  { name: '768x1024-ipad', width: 768, height: 1024, mobile: true },
  { name: '1440x900-laptop', width: 1440, height: 900, mobile: false },
  { name: '1920x1080-desktop', width: 1920, height: 1080, mobile: false },
]

await mkdir(OUT, { recursive: true })

// O Chromium do ambiente é uma build diferente da que este @playwright/test
// baixaria; aponta-se direto para o binário já instalado.
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
})
const report = []

for (const vp of VIEWPORTS) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: vp.mobile ? 2 : 1,
    isMobile: vp.mobile,
    hasTouch: vp.mobile,
    userAgent: vp.mobile ? devices['iPhone 13'].userAgent : undefined,
    locale: 'pt-BR',
  })

  const page = await context.newPage()
  const consoleErrors = []
  const pageErrors = []
  const failedRequests = []

  page.on('console', (m) => {
    if (m.type() === 'error') consoleErrors.push(m.text())
  })
  page.on('pageerror', (e) => pageErrors.push(e.message))
  page.on('requestfailed', (r) =>
    failedRequests.push(`${r.url()} — ${r.failure()?.errorText}`),
  )

  await page.goto(URL, { waitUntil: 'networkidle', timeout: 60_000 })
  await page.waitForTimeout(1800) // deixa a sequência de entrada terminar

  // --- Captura do topo -----------------------------------------------------
  await page.screenshot({ path: join(OUT, `${vp.name}--01-hero.png`) })

  // --- Percorre a página inteira, disparando os reveals --------------------
  const height = await page.evaluate(() => document.documentElement.scrollHeight)
  const steps = Math.min(28, Math.ceil(height / vp.height))

  for (let i = 1; i <= steps; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), i * vp.height * 0.9)
    await page.waitForTimeout(320)
  }

  await page.waitForTimeout(900)
  await page.screenshot({ path: join(OUT, `${vp.name}--02-fim.png`) })

  // --- Overflow horizontal -------------------------------------------------
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement
    const offenders = []

    /**
     * Um elemento recortado por um ancestral com `overflow` escondido não
     * vaza para a tela — é o caso da fita horizontal, que é larga de
     * propósito e vive dentro de um contêiner que a corta. Só interessa o
     * que realmente ultrapassa a viewport.
     */
    const isClipped = (el) => {
      let node = el.parentElement
      while (node && node !== document.body) {
        const o = getComputedStyle(node)
        if (['hidden', 'clip', 'auto', 'scroll'].includes(o.overflowX)) return true
        node = node.parentElement
      }
      return false
    }

    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect()
      if (r.width === 0 && r.height === 0) continue
      const style = getComputedStyle(el)
      if (style.position === 'fixed') continue
      if (isClipped(el)) continue
      if (r.right > doc.clientWidth + 1 || r.left < -1) {
        offenders.push({
          tag: el.tagName.toLowerCase(),
          cls: (el.getAttribute('class') ?? '').slice(0, 90),
          left: Math.round(r.left),
          right: Math.round(r.right),
        })
      }
    }

    return {
      docScrollWidth: doc.scrollWidth,
      docClientWidth: doc.clientWidth,
      horizontalScroll: doc.scrollWidth > doc.clientWidth + 1,
      offenders: offenders.slice(0, 12),
      offenderCount: offenders.length,
    }
  })

  // --- Texto pequeno demais ------------------------------------------------
  const tinyText = await page.evaluate(() => {
    const found = []
    for (const el of document.querySelectorAll('p, span, a, li, dt, dd, h1, h2, h3')) {
      if (!el.textContent?.trim()) continue
      const size = parseFloat(getComputedStyle(el).fontSize)
      if (size > 0 && size < 11) {
        found.push({ size, text: el.textContent.trim().slice(0, 40) })
      }
    }
    return found.slice(0, 10)
  })

  // --- Alvos de toque pequenos demais (mobile) -----------------------------
  const smallTargets = vp.mobile
    ? await page.evaluate(() => {
        const found = []
        for (const el of document.querySelectorAll('a[href], button')) {
          const r = el.getBoundingClientRect()
          if (r.width === 0 || r.height === 0) continue
          // O link de pular para o conteúdo fica escondido até receber foco,
          // quando então ganha tamanho normal.
          if (el.classList.contains('sr-only')) continue
          if (r.height < 32) {
            found.push({
              tag: el.tagName.toLowerCase(),
              h: Math.round(r.height),
              text: (el.textContent ?? '').trim().slice(0, 30),
            })
          }
        }
        return found.slice(0, 10)
      })
    : []

  report.push({
    viewport: vp.name,
    ...overflow,
    tinyText,
    smallTargets,
    consoleErrors,
    pageErrors,
    failedRequests,
    documentHeight: height,
  })

  await context.close()
}

/* --- Passada extra: movimento reduzido ------------------------------------ */
const reducedContext = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: 'reduce',
  locale: 'pt-BR',
})
const reducedPage = await reducedContext.newPage()
const reducedErrors = []
reducedPage.on('pageerror', (e) => reducedErrors.push(e.message))
await reducedPage.goto(URL, { waitUntil: 'networkidle', timeout: 60_000 })
await reducedPage.waitForTimeout(1200)
await reducedPage.screenshot({ path: join(OUT, 'reduced-motion--01-hero.png') })

// Com movimento reduzido, nada pode ficar invisível esperando animação.
const hiddenContent = await reducedPage.evaluate(() => {
  const hidden = []
  for (const el of document.querySelectorAll('h1, h2, h3, p, figure')) {
    const style = getComputedStyle(el)
    if (parseFloat(style.opacity) < 0.05 && el.textContent?.trim()) {
      hidden.push((el.textContent ?? '').trim().slice(0, 40))
    }
  }
  return hidden.slice(0, 10)
})

await reducedPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
await reducedPage.waitForTimeout(800)
await reducedPage.screenshot({ path: join(OUT, 'reduced-motion--02-fim.png') })

report.push({
  viewport: 'reduced-motion-1440',
  hiddenContent,
  pageErrors: reducedErrors,
})

await reducedContext.close()
await browser.close()

await writeFile(join(OUT, 'report.json'), `${JSON.stringify(report, null, 2)}\n`)

/* --- Resumo no terminal --------------------------------------------------- */
let problems = 0
for (const r of report) {
  const issues = []
  if (r.horizontalScroll) issues.push(`SCROLL HORIZONTAL (${r.docScrollWidth} > ${r.docClientWidth})`)
  if (r.offenderCount) issues.push(`${r.offenderCount} elemento(s) fora da viewport`)
  if (r.tinyText?.length) issues.push(`${r.tinyText.length} texto(s) < 11px`)
  if (r.smallTargets?.length) issues.push(`${r.smallTargets.length} alvo(s) de toque < 32px`)
  if (r.consoleErrors?.length) issues.push(`${r.consoleErrors.length} erro(s) de console`)
  if (r.pageErrors?.length) issues.push(`${r.pageErrors.length} exceção(ões)`)
  if (r.failedRequests?.length) issues.push(`${r.failedRequests.length} requisição(ões) falha(s)`)
  if (r.hiddenContent?.length) issues.push(`${r.hiddenContent.length} bloco(s) invisível(is) com motion reduzido`)

  problems += issues.length
  console.log(`${issues.length ? '✗' : '✓'} ${r.viewport}${issues.length ? `  →  ${issues.join(' · ')}` : ''}`)
}

console.log(`\n${problems === 0 ? 'Nenhum problema.' : `${problems} problema(s).`} Detalhes em .qa/report.json`)
