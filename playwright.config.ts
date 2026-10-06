import { defineConfig, devices } from '@playwright/test'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

/**
 * O Chromium deste ambiente é uma build diferente da que o @playwright/test
 * baixaria sozinho, então o caminho vem por variável de ambiente.
 * Em máquina local, basta `npx playwright install chromium` e ignorar a var.
 */
const executablePath = process.env.CHROMIUM_PATH || undefined

/** Contêineres que rodam como root precisam do sandbox desligado. */
const args = process.getuid?.() === 0 ? ['--no-sandbox'] : []

/**
 * Por padrão sobe o servidor de desenvolvimento. Com `PLAYWRIGHT_BASE_URL`
 * apontado para outro endereço, testa o que já estiver no ar — é assim que a
 * mesma suíte roda contra o export estático do GitHub Pages.
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'
const servidorExterno = Boolean(process.env.PLAYWRIGHT_BASE_URL)

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  outputDir: join(tmpdir(), 'agenda-da-oficina-playwright'),
  workers: 2,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',

  use: {
    baseURL,
    trace: 'on-first-retry',
    locale: 'pt-BR',
  },

  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: { executablePath, args },
      },
    },
    {
      // Emulação de iPhone sobre Chromium. O descritor `iPhone 13` do
      // Playwright pede WebKit, que não está instalado neste ambiente.
      name: 'mobile',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        launchOptions: { executablePath, args },
      },
    },
  ],

  webServer: servidorExterno
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: true,
        timeout: 120_000,
      },
})
