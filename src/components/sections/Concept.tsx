import Image from 'next/image'
import { LineReveal } from '@/components/motion/LineReveal'
import { MaskReveal } from '@/components/motion/MaskReveal'
import { Reveal, RevealItem, StaggerGroup } from '@/components/motion/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Cta } from '@/components/ui/Cta'
import { blurFor, conceptImages } from '@/content/images'
import {
  bookingHref,
  bookingLabel,
  concept,
  contact,
  draftCopy,
  hasAddress,
  hasHours,
  person,
  sectionIndex,
  social,
} from '@/content/site'

const { concept: copy } = draftCopy

/**
 * Bormann Jr Concept.
 *
 * A virada do site: daqui em diante a superfície é clara. O corte é seco,
 * como a virada de caderno de uma revista — e a fotografia larga atravessa
 * a fronteira, metade no preto, metade no papel. É a transição que anuncia
 * a mudança de assunto: da pessoa para o lugar.
 */
export function Concept() {
  return (
    <section
      id="concept"
      data-surface="light"
      className="relative z-10 bg-background pb-[var(--section-y)] text-foreground"
    >
      {/* --- A fotografia que atravessa a fronteira --- */}
      <div className="shell">
        <MaskReveal
          fill
          className="-mt-[clamp(3rem,11vh,9rem)] aspect-[16/10] sm:aspect-[16/9]"
        >
          <Image
            src={conceptImages.wide.src}
            alt={conceptImages.wide.alt}
            fill
            loading="lazy"
            sizes="(min-width: 1600px) 1520px, 92vw"
            placeholder={blurFor(conceptImages.wide.src) ? 'blur' : 'empty'}
            blurDataURL={blurFor(conceptImages.wide.src)}
            className="object-cover"
          />
        </MaskReveal>
      </div>

      <div className="shell pt-[clamp(3.5rem,8vh,6rem)]">
        <SectionHeading index={sectionIndex.concept} label={copy.label} />

        <div className="mt-12 grid grid-cols-12 gap-x-6 gap-y-12 lg:mt-20">
          {/* --- Título --- */}
          <div className="col-span-12 lg:col-span-7">
            <LineReveal
              as="h2"
              lines={copy.title}
              className="display text-display"
            />

            <Reveal className="mt-8 lg:mt-12" delay={0.12}>
              <p className="label">
                {concept.city} — {concept.stateFull}
                <span aria-hidden="true" className="mx-2 text-accent">
                  /
                </span>
                {person.title}: {person.name}
              </p>
            </Reveal>
          </div>

          {/* --- Detalhe do espaço --- */}
          <MaskReveal
            fill
            className="col-span-7 col-start-6 aspect-[4/5] sm:col-span-5 sm:col-start-8 lg:col-span-3 lg:col-start-10 lg:-mt-32"
          >
            <Image
              src={conceptImages.detail.src}
              alt={conceptImages.detail.alt}
              fill
              loading="lazy"
              sizes="(min-width: 1024px) 24vw, 50vw"
              placeholder={blurFor(conceptImages.detail.src) ? 'blur' : 'empty'}
              blurDataURL={blurFor(conceptImages.detail.src)}
              className="object-cover"
            />
          </MaskReveal>

          {/* --- Texto --- */}
          <StaggerGroup className="col-span-12 flex flex-col gap-6 sm:col-span-10 lg:col-span-5" gap={0.1}>
            {copy.body.map((paragraph) => (
              <RevealItem
                as="p"
                key={paragraph.slice(0, 24)}
                className="measure text-body leading-[1.75] text-muted"
              >
                {paragraph}
              </RevealItem>
            ))}
          </StaggerGroup>

          {/* --- Ficha técnica: só o que está confirmado --- */}
          <div className="col-span-12 lg:col-span-4 lg:col-start-9">
            <StaggerGroup as="dl" className="flex flex-col" gap={0.07}>
              <RevealItem className="hairline flex items-baseline justify-between gap-4 py-4">
                <dt className="label">Instagram</dt>
                <dd>
                  <a
                    href={social.concept.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline label text-foreground"
                  >
                    {social.concept.handle}
                  </a>
                </dd>
              </RevealItem>

              {hasAddress && contact.address && (
                <RevealItem className="hairline flex items-baseline justify-between gap-4 py-4">
                  <dt className="label">Endereço</dt>
                  <dd className="label max-w-[22ch] text-right text-foreground">
                    {contact.address.street}, {contact.address.district}
                    <br />
                    {contact.address.city} — {contact.address.state}
                  </dd>
                </RevealItem>
              )}

              {hasHours && (
                <RevealItem className="hairline flex items-baseline justify-between gap-4 py-4">
                  <dt className="label">Horários</dt>
                  <dd className="label text-right text-foreground">
                    {contact.hours.map((h) => (
                      <span key={h.days} className="block">
                        {h.days}: {h.hours}
                      </span>
                    ))}
                  </dd>
                </RevealItem>
              )}

              {contact.phoneDisplay && (
                <RevealItem className="hairline flex items-baseline justify-between gap-4 py-4">
                  <dt className="label">Telefone</dt>
                  <dd className="label text-foreground">{contact.phoneDisplay}</dd>
                </RevealItem>
              )}
            </StaggerGroup>

            <Reveal className="mt-10">
              <Cta href={bookingHref} external variant="outline">
                {bookingLabel}
              </Cta>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  )
}
