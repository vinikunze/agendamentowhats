import type { Metadata, Viewport } from 'next'
import { Bodoni_Moda, Inter_Tight } from 'next/font/google'
import { Header } from '@/components/layout/Header'
import { SmoothScroll } from '@/components/layout/SmoothScroll'
import { buildSchema } from '@/lib/schema'
import { seo } from '@/content/site'
import './globals.css'

/**
 * Duas famílias, não seis.
 *
 * Bodoni Moda — didone de alto contraste, com eixo óptico variável: é o
 * registro de revista de moda, e o `opsz` deixa os corpos grandes afinarem
 * como devem.
 *
 * Inter Tight — grotesca contemporânea, ligeiramente estreita. Carrega os
 * metadados em caixa alta sem ocupar meia linha.
 */
const bodoni = Bodoni_Moda({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bodoni',
  axes: ['opsz'],
})

const inter = Inter_Tight({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL(seo.siteUrl),
  title: {
    default: seo.title,
    template: seo.titleTemplate,
  },
  description: seo.description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: seo.locale,
    url: seo.siteUrl,
    siteName: seo.title,
    title: seo.title,
    description: seo.description,
    images: [
      {
        url: `${seo.siteUrl}/og.jpg`,
        width: 1200,
        height: 630,
        alt: `${seo.title} — cartão de compartilhamento`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: seo.title,
    description: seo.description,
    images: [`${seo.siteUrl}/og.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  themeColor: '#080808',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  // O usuário pode ampliar. Sempre.
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={seo.lang} className={`${bodoni.variable} ${inter.variable}`}>
      <body>
        <script
          type="application/ld+json"
          // Montado a partir de `content/site.ts` — só dado confirmado.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildSchema()) }}
        />
        <SmoothScroll>
          <Header />
          {children}
        </SmoothScroll>
      </body>
    </html>
  )
}
