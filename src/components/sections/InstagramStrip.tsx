import Image from 'next/image'
import { Reveal, RevealItem, StaggerGroup } from '@/components/motion/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { maskReveal } from '@/lib/motion'
import { blurFor, feedImages } from '@/content/images'
import { draftCopy, social } from '@/content/site'

const { instagram } = draftCopy

/** Deslocamento vertical alternado — a fita não se lê como grade. */
const OFFSET = ['', 'translate-y-8 lg:translate-y-14', 'lg:translate-y-6', 'translate-y-8 lg:translate-y-20', '', 'translate-y-8 lg:translate-y-10']

/**
 * Instagram.
 *
 * Imagens locais, sem embed e sem API: nenhum widget de terceiros entra no
 * caminho crítico, e nenhuma URL do Instagram vira fonte permanente de
 * arquivo. Cada peça leva ao perfil de origem.
 */
export function InstagramStrip() {
  return (
    <section id="instagram" className="section-y relative">
      <div className="shell">
        <SectionHeading index={instagram.index} label={instagram.label} />

        <div className="mt-12 grid grid-cols-12 items-end gap-x-6 gap-y-6 lg:mt-16">
          <Reveal className="col-span-12 lg:col-span-6">
            <h2 className="display text-display text-balance">{instagram.title}</h2>
          </Reveal>

          <Reveal className="col-span-12 lg:col-span-4 lg:col-start-9" delay={0.1}>
            <p className="measure text-body leading-[1.75] text-muted">{instagram.body}</p>
          </Reveal>
        </div>

        <StaggerGroup
          as="ul"
          loose
          gap={0.07}
          className="mt-16 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 lg:mt-24 lg:grid-cols-6 lg:gap-x-6"
        >
          {feedImages.map((image, i) => (
            <RevealItem
              as="li"
              key={image.src}
              variants={maskReveal}
              className={OFFSET[i % OFFSET.length]}
            >
              <a
                href={image.href ?? social.personal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group/fig block"
              >
                <div className="grain relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    loading="lazy"
                    sizes="(min-width: 1024px) 16vw, (min-width: 640px) 31vw, 46vw"
                    placeholder={blurFor(image.src) ? 'blur' : 'empty'}
                    blurDataURL={blurFor(image.src)}
                    className="object-cover transition-transform duration-[900ms] ease-[var(--ease-editorial)] group-hover/fig:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover/fig:scale-100"
                  />
                </div>
                <span className="label mt-3 block opacity-0 transition-opacity duration-[var(--dur)] group-hover/fig:opacity-100 group-focus-visible/fig:opacity-100 max-lg:opacity-100">
                  Ver no Instagram
                </span>
              </a>
            </RevealItem>
          ))}
        </StaggerGroup>

        <Reveal className="mt-14 flex flex-wrap items-center gap-x-10 gap-y-4" loose>
          <a
            href={social.personal.url}
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline display-sm text-title"
          >
            {social.personal.handle}
          </a>
          <a
            href={social.concept.url}
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline display-sm text-title text-muted"
          >
            {social.concept.handle}
          </a>
        </Reveal>
      </div>
    </section>
  )
}
