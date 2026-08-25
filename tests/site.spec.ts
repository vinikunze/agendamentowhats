import { expect, test, type Page } from '@playwright/test'

/**
 * Testes funcionais da homepage, em desktop e mobile.
 *
 * Cobrem o que quebra silenciosamente: menu, âncoras, links externos,
 * conteúdo estourando a viewport e erros no console.
 */

/**
 * Espera a seção entrar em cena. É uma espera por condição, não por tempo:
 * o scroll do Lenis leva o que precisar, e um `waitForTimeout` fixo vira
 * teste instável assim que a máquina fica lenta.
 */
async function esperarSecaoVisivel(page: Page, id: string) {
  await expect
    .poll(
      () =>
        page.evaluate((sel) => {
          const el = document.querySelector(`#${sel}`)
          if (!el) return false
          const r = el.getBoundingClientRect()
          return r.top < window.innerHeight && r.bottom > 0
        }, id),
      { timeout: 10_000 },
    )
    .toBe(true)
}

/** Coleta erros de console e exceções durante o teste. */
function watchErrors(page: Page) {
  const errors: string[] = []
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text())
  })
  page.on('pageerror', (e) => errors.push(e.message))
  return errors
}

test.describe('homepage', () => {
  test('abre, renderiza o hero e não registra erros', async ({ page }) => {
    const errors = watchErrors(page)

    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page).toHaveTitle(/Bormann Jr/i)

    // O h1 precisa carregar a frase inteira para leitores de tela.
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Cabelo como forma de identidade.',
    )

    expect(errors).toEqual([])
  })

  test('expõe as seções principais', async ({ page }) => {
    await page.goto('/')

    for (const id of ['assinatura', 'trabalho', 'concept', 'instagram', 'contato']) {
      await expect(page.locator(`#${id}`)).toBeAttached()
    }
  })

  test('os links do Instagram apontam para os perfis reais', async ({ page }) => {
    await page.goto('/')

    const pessoal = page
      .locator('a[href="https://www.instagram.com/bormannjr/"]')
      .first()
    await expect(pessoal).toHaveAttribute('target', '_blank')
    await expect(pessoal).toHaveAttribute('rel', /noopener/)

    await expect(
      page.locator('a[href="https://www.instagram.com/bormannjrconcept/"]').first(),
    ).toBeAttached()
  })

  test('não inventa contato: sem telefone, endereço ou WhatsApp', async ({ page }) => {
    await page.goto('/')

    // Enquanto os dados não forem confirmados em content/site.ts, nada disso
    // pode aparecer na página.
    await expect(page.locator('a[href^="tel:"]')).toHaveCount(0)
    await expect(page.locator('a[href*="wa.me"]')).toHaveCount(0)
  })

  test('nenhum scroll horizontal em nenhum ponto da página', async ({ page }) => {
    await page.goto('/')

    const height = await page.evaluate(() => document.documentElement.scrollHeight)
    const step = 600

    for (let y = 0; y < height; y += step) {
      await page.evaluate((v) => window.scrollTo(0, v), y)
      await page.waitForTimeout(120)

      const overflows = await page.evaluate(() => {
        const doc = document.documentElement
        return doc.scrollWidth > doc.clientWidth + 1
      })

      expect(overflows, `scroll horizontal em y=${y}`).toBe(false)
    }
  })
})

test.describe('navegação desktop', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 1024, 'somente desktop')

  test('a âncora do menu leva à seção correspondente', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('link', { name: 'Concept', exact: true }).click()
    await esperarSecaoVisivel(page, 'concept')
  })

  test('o header ganha fundo depois do scroll', async ({ page }) => {
    await page.goto('/')

    const header = page.locator('header')
    await expect(header).toHaveAttribute('data-scrolled', 'false')

    await page.evaluate(() => window.scrollTo(0, 400))
    await expect(header).toHaveAttribute('data-scrolled', 'true')
  })
})

test.describe('navegação mobile', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) >= 1024, 'somente mobile')

  test('o menu abre, navega e fecha', async ({ page }) => {
    await page.goto('/')

    const abrir = page.getByRole('button', { name: 'Abrir menu' })
    await expect(abrir).toBeVisible()

    await abrir.click()

    const menu = page.getByRole('dialog', { name: 'Menu' })
    await expect(menu).toBeVisible()

    await menu.getByRole('link', { name: 'Trabalho' }).click()
    await expect(menu).toBeHidden()
    await esperarSecaoVisivel(page, 'trabalho')
  })

  test('a tecla Esc fecha o menu', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'Abrir menu' }).click()
    await expect(page.getByRole('dialog', { name: 'Menu' })).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog', { name: 'Menu' })).toBeHidden()
  })

  test('a galeria vira lista vertical, sem fita horizontal', async ({ page }) => {
    await page.goto('/')

    // A fita horizontal usa `w-max`; no mobile ela não deve existir.
    await expect(page.locator('#trabalho .w-max')).toHaveCount(0)
    await expect(page.locator('#trabalho figure')).toHaveCount(6)
  })
})

test.describe('movimento reduzido', () => {
  test('todo o conteúdo fica visível sem animação', async ({ browser, baseURL }) => {
    // Contexto próprio: a preferência precisa valer desde o primeiro paint.
    const context = await browser.newContext({ reducedMotion: 'reduce' })
    const page = await context.newPage()

    try {
      await page.goto(baseURL ?? '/')
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))

      // Nada pode ficar transparente nem recortado a zero esperando um
      // gatilho de animação que, sem movimento, nunca vai disparar.
      await expect
        .poll(
          () =>
            page.evaluate(() => {
              const out: string[] = []
              for (const el of document.querySelectorAll('h1, h2, h3, p, figure, img')) {
                const s = getComputedStyle(el)
                const semArea = s.clipPath.startsWith('inset(100%')
                if (parseFloat(s.opacity) < 0.05 || semArea) {
                  out.push(el.tagName + ':' + (el.textContent ?? '').trim().slice(0, 30))
                }
              }
              return out
            }),
          { timeout: 10_000 },
        )
        .toEqual([])
    } finally {
      await context.close()
    }
  })
})
