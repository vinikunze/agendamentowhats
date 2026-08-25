'use client'

import Image from 'next/image'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useRef } from 'react'
import { EASE } from '@/lib/motion'
import { blurFor, heroImage } from '@/content/images'
import { bookingHref, bookingLabel, draftCopy, person, social } from '@/content/site'

const { hero } = draftCopy

/**
 * O hero.
 *
 * A página acorda em ordem: fundo, fotografia, cidade, nome, headline,
 * chamada, metadados. Nada entra ao mesmo tempo — cada elemento tem seu
 * lugar na sequência, e a última linha da headline invade a fotografia.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()

  // Parallax de amplitude mínima. Só o suficiente para a imagem parecer
  // respirar atrás do texto — nunca a ponto de virar efeito.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '8%'])
  const textY = useTransform(scrollYProgress, [0, 1], ['0%', '22%'])
  const textOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0])

  /**
   * Tempos da sequência de entrada.
   *
   * Curtos de propósito: no mobile a headline é o elemento LCP, e cada
   * décimo a mais de espera antes de ela sair de trás da máscara entra
   * direto na métrica. A página acorda em ~1,5s, não em 3.
   */
  const t = (delay: number) => ({
    duration: reduced ? 0 : 0.6,
    ease: EASE,
    delay: reduced ? 0 : delay,
  })

  const media = (
    <motion.div
      initial={reduced ? false : { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.08 }}
      animate={{ clipPath: 'inset(0% 0% 0% 0%)', scale: 1 }}
      transition={{ duration: reduced ? 0 : 1, ease: EASE, delay: 0 }}
      className="grain relative h-full w-full overflow-hidden"
    >
      <motion.div style={reduced ? undefined : { y: imageY }} className="relative h-[112%] w-full">
        <Image
          src={heroImage.src}
          alt={heroImage.alt}
          fill
          // LCP: nunca lazy, e servida no tamanho certo por breakpoint.
          priority
          fetchPriority="high"
          sizes="(min-width: 1024px) 55vw, 100vw"
          placeholder={blurFor(heroImage.src) ? 'blur' : 'empty'}
          blurDataURL={blurFor(heroImage.src)}
          className="object-cover"
        />
      </motion.div>
    </motion.div>
  )

  return (
    <section
      id="top"
      ref={ref}
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden lg:block"
    >
      {/* ---------- Fotografia: metade direita no desktop ---------- */}
      <div className="absolute inset-y-0 right-0 z-0 hidden w-[55%] lg:block">
        {media}
        {/*
          Degradê que costura a fotografia ao fundo e sustenta a headline
          quando ela avança sobre a imagem. Estreito de propósito: escurecer
          demais o lado direito apagaria justamente o que interessa.
        */}
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-[38%] bg-gradient-to-r from-background via-background/60 to-transparent"
        />
      </div>

      {/* ---------- Mobile: a fotografia vem primeiro, inteira ---------- */}
      <div className="relative h-[44svh] min-h-[240px] w-full shrink-0 lg:hidden">
        {media}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent"
        />
      </div>

      {/* ---------- Tipografia ---------- */}
      <motion.div
        style={reduced ? undefined : { y: textY, opacity: textOpacity }}
        className="relative z-10 flex flex-1 flex-col justify-center lg:min-h-[100svh]"
      >
        <div className="shell w-full pb-10 pt-8 lg:py-0">
          <div className="lg:max-w-[58%]">
            <motion.p
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={t(0.2)}
              className="label mb-6 lg:mb-8"
            >
              {hero.eyebrow}
            </motion.p>

            <h1 className="display text-hero">
              <span className="sr-only">{hero.headline.join(' ')}</span>
              {hero.headline.map((line, i) => (
                <span
                  key={line}
                  aria-hidden="true"
                  className="block overflow-hidden pb-[0.1em] -mb-[0.1em]"
                >
                  <motion.span
                    // `nowrap` só a partir de lg, onde a coluna comporta a
                    // linha inteira: as quebras são decisões de composição,
                    // definidas linha a linha no conteúdo. No mobile a quebra
                    // natural é preferível a uma linha estourando a tela.
                    className={`block lg:whitespace-nowrap ${
                      i === hero.headline.length - 1 ? 'text-accent' : ''
                    }`}
                    initial={reduced ? false : { y: '110%' }}
                    animate={{ y: '0%' }}
                    transition={{
                      duration: reduced ? 0 : 0.85,
                      ease: EASE,
                      delay: reduced ? 0 : 0.3 + i * 0.07,
                    }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={t(0.5)}
              className="measure mt-8 text-lead leading-[1.5] text-muted lg:mt-10"
            >
              {hero.standfirst}
            </motion.p>

            <motion.div
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={t(0.62)}
              className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-4 lg:mt-12"
            >
              <a
                href={bookingHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group/cta inline-flex items-center gap-3 border-b border-foreground pb-2 label text-foreground transition-colors duration-[var(--dur)] ease-[var(--ease-editorial)] hover:border-accent hover:text-accent"
              >
                {bookingLabel}
                <span aria-hidden="true" className="arrow-slide text-base leading-none">
                  &#8594;
                </span>
              </a>

              <a
                href={social.personal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline label text-muted"
              >
                {social.personal.handle}
              </a>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ---------- Rodapé do hero: credencial real + convite ao scroll ---------- */}
      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={t(0.75)}
        className="relative z-10 lg:absolute lg:inset-x-0 lg:bottom-0"
      >
        <div className="shell flex items-end justify-between gap-6 border-t border-line py-5 lg:border-t-0 lg:py-8">
          {/*
            No mobile os três créditos empilham; a partir de sm voltam a
            correr numa linha só, separados pela barra em bronze.
          */}
          <p className="label flex flex-col gap-1 sm:flex-row sm:gap-0">
            <span>{person.role}</span>
            <span aria-hidden="true" className="hidden text-accent sm:inline sm:mx-2">
              /
            </span>
            <span>{person.discipline}</span>
            <span aria-hidden="true" className="hidden text-accent sm:inline sm:mx-2">
              /
            </span>
            <span>
              {person.credential.label} {person.credential.brand}
            </span>
          </p>

          <div aria-hidden="true" className="hidden shrink-0 items-center gap-3 lg:flex">
            <span className="label">{hero.scrollHint}</span>
            <span className="relative block h-10 w-px overflow-hidden bg-line-strong">
              <motion.span
                className="absolute inset-x-0 top-0 block h-1/2 bg-accent"
                animate={reduced ? undefined : { y: ['-100%', '200%'] }}
                transition={{ duration: 2.1, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.4 }}
              />
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
