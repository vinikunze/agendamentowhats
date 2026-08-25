'use client'

import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react'
import { useLenis } from 'lenis/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { BrandMark } from '@/components/ui/BrandMark'
import { EASE, EASE_INOUT } from '@/lib/motion'
import { bookingHref, bookingLabel, nav, person, social } from '@/content/site'

/**
 * Header minimalista.
 *
 * Transparente sobre o hero; depois do primeiro scroll ganha um fundo
 * translúcido com um filete embaixo. Ele nunca some — some apenas a
 * moldura, para que a fotografia do hero chegue inteira ao olho.
 */
export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { scrollY } = useScroll()
  const lenis = useLenis()
  const reduced = useReducedMotion()

  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useMotionValueEvent(scrollY, 'change', (y) => {
    setScrolled(y > 40)
  })

  const close = useCallback(() => setOpen(false), [])

  /* --- Enquanto o menu está aberto, a página atrás dele não rola. ------- */
  useEffect(() => {
    if (!open) return

    lenis?.stop()
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'

    return () => {
      lenis?.start()
      document.body.style.overflow = overflow
    }
  }, [open, lenis])

  /* --- Teclado: Esc fecha, Tab circula dentro do painel. ---------------- */
  useEffect(() => {
    if (!open) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close()
        triggerRef.current?.focus()
        return
      }

      if (e.key !== 'Tab' || !panelRef.current) return

      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      )
      if (focusables.length === 0) return

      const first = focusables[0]
      const last = focusables[focusables.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, close])

  /* --- Ao abrir, o foco entra no painel. -------------------------------- */
  useEffect(() => {
    if (!open) return
    const id = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLElement>('a[href], button')?.focus()
    }, 60)
    return () => window.clearTimeout(id)
  }, [open])

  return (
    <>
      <a
        href="#conteudo"
        className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-6 focus-visible:top-6 focus-visible:z-[60] focus-visible:bg-foreground focus-visible:px-4 focus-visible:py-3 focus-visible:text-background focus-visible:text-label focus-visible:uppercase focus-visible:tracking-[0.18em]"
      >
        Ir para o conteúdo
      </a>

      <motion.header
        initial={reduced ? false : { opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE, delay: reduced ? 0 : 0.15 }}
        className="fixed inset-x-0 top-0 z-50"
        data-scrolled={scrolled}
      >
        {/* Fundo que só aparece depois do scroll. */}
        <div
          aria-hidden="true"
          className={`absolute inset-0 border-b transition-[opacity,backdrop-filter] duration-[var(--dur)] ease-[var(--ease-editorial)] ${
            // O header é sempre escuro, inclusive sobre a seção clara do
            // Concept: é cromo fixo, com identidade própria. A opacidade é
            // alta o bastante para não virar borrão sobre o off-white.
            scrolled
              ? 'border-line bg-background/90 opacity-100 backdrop-blur-lg'
              : 'border-transparent opacity-0'
          }`}
        />

        <div className="shell relative flex items-center justify-between py-5 md:py-6">
          <a
            href="#top"
            // `tap-none`: já tem altura de toque suficiente com o py próprio,
            // e o respiro extra empurraria o header inteiro para baixo.
            className="tap-none -my-2 flex items-center gap-3 py-2"
            aria-label={`${person.name} — início`}
          >
            {/* Só aparece quando o arquivo real do monograma existir. */}
            <BrandMark className="h-7 w-auto shrink-0 md:h-8" />
            <span className="link-underline font-sans text-[0.8125rem] font-light uppercase tracking-[0.22em] md:text-sm">
              Bormann Jr.
            </span>
          </a>

          {/* --- Navegação desktop --- */}
          <nav aria-label="Principal" className="hidden lg:block">
            {/*
              Em 1024 a linha inteira — logotipo, seis itens e botão — fica no
              limite. O respiro cheio volta em 1280, e o Instagram (que já
              aparece em três outros pontos da página) sai da barra até lá.
            */}
            <ul className="flex items-center gap-6 xl:gap-9">
              {nav.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="link-underline label text-foreground">
                    {item.label}
                  </a>
                </li>
              ))}
              <li className="hidden xl:block">
                <a
                  href={social.personal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline label text-foreground"
                >
                  Instagram
                </a>
              </li>
            </ul>
          </nav>

          <div className="flex items-center gap-4 xl:gap-5">
            <a
              href={bookingHref}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden border border-line-strong px-5 py-2.5 label text-foreground transition-colors duration-[var(--dur)] ease-[var(--ease-editorial)] hover:border-accent hover:text-accent lg:inline-block"
            >
              Agendar
            </a>

            {/* --- Botão do menu mobile --- */}
            <button
              ref={triggerRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="menu-mobile"
              className="relative z-[70] -mr-1 flex h-10 w-10 items-center justify-center lg:hidden"
            >
              <span className="sr-only">{open ? 'Fechar menu' : 'Abrir menu'}</span>
              {/* Duas linhas que viram um X. Sem hamburger de três traços. */}
              <span aria-hidden="true" className="relative block h-3 w-7">
                <motion.span
                  className="absolute left-0 block h-px w-full bg-foreground"
                  animate={open ? { top: 5, rotate: 45 } : { top: 0, rotate: 0 }}
                  transition={{ duration: reduced ? 0 : 0.42, ease: EASE_INOUT }}
                />
                <motion.span
                  className="absolute left-0 block h-px w-full bg-foreground"
                  animate={open ? { top: 5, rotate: -45 } : { top: 10, rotate: 0 }}
                  transition={{ duration: reduced ? 0 : 0.42, ease: EASE_INOUT }}
                />
              </span>
            </button>
          </div>
        </div>
      </motion.header>

      {/* --- Painel mobile em tela cheia --- */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-mobile"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={reduced ? { opacity: 0 } : { clipPath: 'inset(0% 0% 100% 0%)' }}
            animate={reduced ? { opacity: 1 } : { clipPath: 'inset(0% 0% 0% 0%)' }}
            exit={reduced ? { opacity: 0 } : { clipPath: 'inset(0% 0% 100% 0%)' }}
            transition={{ duration: reduced ? 0.15 : 0.72, ease: EASE }}
            className="fixed inset-0 z-[60] flex flex-col justify-between bg-background lg:hidden"
            style={{
              paddingTop: 'max(6.5rem, env(safe-area-inset-top))',
              paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
            }}
          >
            <nav aria-label="Menu" className="shell">
              <ul>
                {nav.map((item, i) => (
                  <li key={item.href} className="overflow-hidden border-b border-line">
                    <motion.a
                      href={item.href}
                      onClick={close}
                      initial={reduced ? false : { y: '110%', opacity: 0 }}
                      animate={{ y: '0%', opacity: 1 }}
                      transition={{
                        duration: reduced ? 0 : 0.7,
                        ease: EASE,
                        delay: reduced ? 0 : 0.16 + i * 0.06,
                      }}
                      className="display-sm block py-5 text-[clamp(2rem,10vw,3rem)] text-foreground"
                    >
                      {item.label}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </nav>

            <motion.div
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduced ? 0 : 0.6, ease: EASE, delay: reduced ? 0 : 0.42 }}
              className="shell flex flex-col gap-6"
            >
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                <a
                  href={social.personal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline label text-foreground"
                >
                  {social.personal.handle}
                </a>
                <a
                  href={social.concept.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline label text-foreground"
                >
                  {social.concept.handle}
                </a>
              </div>

              <a
                href={bookingHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={close}
                className="flex items-center justify-between border-t border-line-strong pt-5 label text-foreground"
              >
                {bookingLabel}
                <span aria-hidden="true" className="text-lg leading-none">
                  &#8594;
                </span>
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
