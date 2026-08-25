'use client'

import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { Reveal, RevealItem, StaggerGroup } from '@/components/motion/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { EASE } from '@/lib/motion'
import { blurFor } from '@/content/images'
import { hasServices, sectionIndex, services } from '@/content/site'

/**
 * Serviços.
 *
 * Só existe se a lista real tiver sido confirmada em `content/site.ts`.
 * Enquanto `services` estiver vazio, a seção não é renderizada — nenhum
 * serviço é inventado, e o site segue coerente sem ela.
 *
 * Sem cards: numeração, filete e nome. A fotografia contextual, quando
 * existir, aparece no hover — no desktop, onde há ponteiro e espaço.
 */
export function Services() {
  const [active, setActive] = useState<number | null>(null)
  const reduced = useReducedMotion()

  if (!hasServices) return null

  const preview = active !== null ? services[active] : null

  return (
    <section id="servicos" className="section-y relative">
      <div className="shell">
        <SectionHeading index={sectionIndex.servicos} label="Serviços" />

        <div className="relative mt-12 grid grid-cols-12 gap-x-6 lg:mt-16">
          <StaggerGroup as="ol" className="col-span-12 lg:col-span-7" gap={0.06}>
            {services.map((service, i) => (
              <RevealItem
                as="li"
                key={service.name}
                className="hairline"
                // O hover só arma a prévia; nada aqui depende dele para funcionar.
                {...{
                  onMouseEnter: () => setActive(i),
                  onMouseLeave: () => setActive(null),
                }}
              >
                <div className="group/row flex items-baseline gap-6 py-6 transition-colors duration-[var(--dur)] ease-[var(--ease-editorial)] hover:text-accent lg:py-8">
                  <span className="label shrink-0 text-accent">
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <h3 className="display-sm text-title">{service.name}</h3>

                  {service.description && (
                    <p className="ml-auto hidden max-w-[28ch] text-body text-muted lg:block">
                      {service.description}
                    </p>
                  )}
                </div>

                {/* No mobile a descrição fica visível: não há hover para revelar. */}
                {service.description && (
                  <p className="measure -mt-3 pb-6 text-body text-muted lg:hidden">
                    {service.description}
                  </p>
                )}
              </RevealItem>
            ))}
          </StaggerGroup>

          {/* --- Prévia fotográfica, presa à coluna direita --- */}
          <div className="pointer-events-none relative col-span-4 col-start-9 hidden lg:block">
            <div className="sticky top-32 aspect-[3/4]">
              <AnimatePresence mode="wait">
                {preview?.image && (
                  <motion.div
                    key={preview.image}
                    initial={reduced ? { opacity: 0 } : { opacity: 0, clipPath: 'inset(100% 0% 0% 0%)' }}
                    animate={reduced ? { opacity: 1 } : { opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: reduced ? 0.15 : 0.7, ease: EASE }}
                    className="grain absolute inset-0 overflow-hidden"
                  >
                    <Image
                      src={preview.image}
                      alt=""
                      fill
                      loading="lazy"
                      sizes="24vw"
                      placeholder={blurFor(preview.image) ? 'blur' : 'empty'}
                      blurDataURL={blurFor(preview.image)}
                      className="object-cover"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <Reveal className="mt-10">
          <p className="label max-w-[46ch] leading-[1.8]">
            Valores e duração variam conforme a leitura de cada cabelo.
          </p>
        </Reveal>
      </div>
    </section>
  )
}
