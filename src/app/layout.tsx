import type { Metadata, Viewport } from 'next'
import '@fontsource-variable/inter'
import './globals.css'

export const metadata: Metadata = {
  title: 'Agenda da Oficina — Tudo pelo WhatsApp',
  description:
    'Experimente uma rotina de agendamento por mensagem: confirme, avise a equipe e acompanhe os serviços da oficina. Demonstração interativa.',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: '#173e34',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <a href="#inicio" className="skip-link">
          Pular para o conteúdo
        </a>
        {children}
      </body>
    </html>
  )
}
