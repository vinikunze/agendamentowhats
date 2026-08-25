import { LineReveal } from '@/components/motion/LineReveal'
import { Reveal } from '@/components/motion/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Cta } from '@/components/ui/Cta'
import {
  bookingHref,
  bookingLabel,
  concept,
  draftCopy,
  sectionIndex,
  social,
} from '@/content/site'

const { finalCta } = draftCopy

/**
 * Encerramento.
 *
 * Uma headline grande, dois caminhos e nada mais. O convite é confiante,
 * não insistente — sem urgência fabricada, sem promessa que a marca não
 * tenha feito publicamente.
 */
export function FinalCta() {
  return (
    <section id="contato" className="relative pb-[clamp(3rem,8vh,6rem)] pt-[var(--section-y)]">
      <div className="shell">
        <SectionHeading index={sectionIndex.contato} label={finalCta.label} />

        <div className="mt-14 grid grid-cols-12 gap-x-6 gap-y-12 lg:mt-20">
          <div className="col-span-12 lg:col-span-8">
            <LineReveal
              as="h2"
              lines={finalCta.headline}
              className="display text-hero"
              accentLastLine
            />
          </div>

          <div className="col-span-12 flex flex-col gap-10 lg:col-span-4 lg:justify-end lg:pb-4">
            <Reveal>
              <p className="measure text-lead leading-[1.55] text-muted">{finalCta.body}</p>
            </Reveal>

            <Reveal delay={0.1} className="flex flex-wrap items-center gap-x-8 gap-y-5">
              <Cta href={bookingHref} external variant="solid">
                {bookingLabel}
              </Cta>

              <a
                href={social.personal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline label text-foreground"
              >
                {finalCta.secondary}
              </a>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="label">
                {concept.city} — {concept.stateFull}
              </p>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
