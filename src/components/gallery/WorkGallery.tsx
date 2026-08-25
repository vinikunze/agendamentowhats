'use client'

import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { useEffect, useRef, useState } from 'react'
import { EditorialFigure } from '@/components/gallery/EditorialFigure'
import { MaskReveal } from '@/components/motion/MaskReveal'
import { Reveal } from '@/components/motion/Reveal'
import { workImages } from '@/content/images'
import { social } from '@/content/site'

/**
 * Alturas alternadas: cada imagem ocupa uma fatia diferente da altura da
 * tela e se alinha num eixo diferente. É o que quebra a leitura de "fileira
 * de miniaturas" e devolve ritmo de página dupla de revista.
 */
const RHYTHM = [
  { h: '62vh', align: 'items-start' },
  { h: '48vh', align: 'items-end' },
  { h: '72vh', align: 'items-center' },
  { h: '52vh', align: 'items-start' },
  { h: '64vh', align: 'items-end' },
  { h: '56vh', align: 'items-center' },
] as const

/**
 * Galeria de trabalho.
 *
 * Desktop: a seção prende na tela e as fotografias correm na horizontal,
 * conduzidas pelo próprio scroll — nada de sequestro, o gesto é o mesmo
 * de sempre e a barra de rolagem continua honesta.
 *
 * Mobile e movimento reduzido: lista vertical editorial, com larguras e
 * recuos variados. O scroll é o nativo, sem exceção.
 */
export function WorkGallery() {
  const reduced = useReducedMotion()
  const [horizontal, setHorizontal] = useState(false)

  // O modo horizontal só existe em telas largas, com ponteiro fino e sem
  // preferência por movimento reduzido. A decisão acontece depois da
  // montagem, então o HTML servido é sempre o da lista vertical.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px) and (pointer: fine)')
    const sync = () => setHorizontal(mq.matches && !reduced)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [reduced])

  return horizontal ? <HorizontalTrack /> : <VerticalList />
}

/* -------------------------------------------------------------------------- */
/* Desktop                                                                     */
/* -------------------------------------------------------------------------- */

function HorizontalTrack() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const [distance, setDistance] = useState(0)

  // Mede o quanto a fita precisa andar. Refaz a conta quando a fita ou a
  // janela mudam de tamanho — inclusive quando as fontes terminam de carregar.
  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    const measure = () => {
      setDistance(Math.max(0, track.scrollWidth - window.innerWidth))
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(track)
    window.addEventListener('resize', measure)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })

  const x = useTransform(scrollYProgress, [0, 1], [0, -distance])
  const progress = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    <div
      ref={sectionRef}
      className="relative"
      // A altura da seção é o curso horizontal + uma tela. É isso que dá ao
      // scroll vertical exatamente o percurso necessário, sem sobra.
      style={{ height: `calc(100svh + ${distance}px)` }}
    >
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        <motion.div
          ref={trackRef}
          style={{ x }}
          className="flex w-max items-stretch gap-[clamp(2rem,4vw,5rem)] px-[var(--gutter)] will-change-transform"
        >
          {workImages.map((image, i) => {
            const { h, align } = RHYTHM[i % RHYTHM.length]
            return (
              <div key={image.src} className={`flex ${align}`}>
                <EditorialFigure
                  image={image}
                  index={i}
                  eager={i < 2}
                  sizes="45vw"
                  // A altura manda; a largura vem da proporção da foto.
                  mediaHeight={h}
                />
              </div>
            )
          })}

          {/* Fecho da fita: leva ao Instagram, onde o trabalho continua. */}
          <div className="flex items-center pr-[var(--gutter)]">
            <a
              href={social.personal.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group/cta flex w-[38vw] max-w-[420px] flex-col gap-4 border-t border-line-strong pt-6"
            >
              <span className="label text-accent">Continua</span>
              <span className="display-sm text-title">
                Ver tudo em {social.personal.handle}
                <span aria-hidden="true" className="arrow-slide ml-3 inline-block">
                  &#8594;
                </span>
              </span>
            </a>
          </div>
        </motion.div>

        {/* Indicador de percurso — dois filetes, nada mais. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-10 mx-auto h-px w-[calc(100%-2*var(--gutter))] max-w-[var(--container)] bg-line"
        >
          <motion.span style={{ width: progress }} className="block h-px bg-accent" />
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Mobile / movimento reduzido                                                 */
/* -------------------------------------------------------------------------- */

/** Larguras e recuos alternados: a coluna nunca fica simétrica. */
const COLUMN = [
  'w-full',
  'w-[78%] ml-auto',
  'w-[88%]',
  'w-[70%] ml-auto',
  'w-full',
  'w-[80%]',
] as const

function VerticalList() {
  return (
    <div className="shell mt-14 flex flex-col gap-[clamp(3.5rem,9vw,7rem)]">
      {workImages.map((image, i) => (
        <MaskReveal key={image.src} loose className={COLUMN[i % COLUMN.length]}>
          <EditorialFigure
            image={image}
            index={i}
            eager={i === 0}
            sizes="(min-width: 1024px) 60vw, 90vw"
          />
        </MaskReveal>
      ))}

      <Reveal loose>
        <a
          href={social.personal.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group/cta flex flex-col gap-3 border-t border-line-strong pt-6"
        >
          <span className="label text-accent">Continua</span>
          <span className="display-sm text-title">
            Ver tudo em {social.personal.handle}
            <span aria-hidden="true" className="arrow-slide ml-3 inline-block">
              &#8594;
            </span>
          </span>
        </a>
      </Reveal>
    </div>
  )
}
