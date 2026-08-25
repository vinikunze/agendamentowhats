import Image from 'next/image'
import { LineReveal } from '@/components/motion/LineReveal'
import { MaskReveal } from '@/components/motion/MaskReveal'
import { Reveal, RevealItem, StaggerGroup } from '@/components/motion/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { blurFor, signatureImage } from '@/content/images'
import { draftCopy, person, sectionIndex } from '@/content/site'

const { manifesto } = draftCopy

/**
 * Assinatura — a seção de respiração.
 *
 * Uma frase grande, muito espaço vazio, um texto pequeno deslocado e uma
 * fotografia que sobe por cima da grade. É o contraponto de densidade
 * entre o hero e a galeria.
 */
export function Manifesto() {
  return (
    <section id="assinatura" className="section-y relative">
      <div className="shell">
        <SectionHeading index={sectionIndex.assinatura} label={manifesto.label} />

        <div className="mt-14 grid grid-cols-12 gap-x-6 gap-y-14 lg:mt-24">
          {/* --- A frase --- */}
          <div className="col-span-12 lg:col-span-8">
            <LineReveal
              as="h2"
              // A quebra é manual: cada linha é uma decisão de composição.
              lines={['Não existe', 'referência que sirva', 'em todo mundo.']}
              className="display text-display"
              lineClassName="text-balance"
            />
          </div>

          {/* --- A fotografia, deslocada para cima e para fora da grade --- */}
          <MaskReveal
            fill
            className="col-span-8 col-start-3 aspect-[4/5] sm:col-span-6 sm:col-start-6 lg:col-span-3 lg:col-start-10 lg:-mt-40 lg:aspect-[3/4]"
          >
            <Image
              src={signatureImage.src}
              alt={signatureImage.alt}
              fill
              loading="lazy"
              sizes="(min-width: 1024px) 24vw, (min-width: 640px) 45vw, 66vw"
              placeholder={blurFor(signatureImage.src) ? 'blur' : 'empty'}
              blurDataURL={blurFor(signatureImage.src)}
              className="object-cover"
            />
          </MaskReveal>

          {/* --- O texto pequeno, recuado --- */}
          <StaggerGroup
            className="col-span-12 flex flex-col gap-6 sm:col-span-10 lg:col-span-5 lg:col-start-3 lg:-mt-16"
            gap={0.1}
          >
            {manifesto.body.map((paragraph) => (
              <RevealItem
                as="p"
                key={paragraph.slice(0, 24)}
                className="measure text-body leading-[1.75] text-muted"
              >
                {paragraph}
              </RevealItem>
            ))}
          </StaggerGroup>

          {/* --- Credencial: fato verificado, apresentado sem adjetivo --- */}
          <Reveal
            className="col-span-12 lg:col-span-3 lg:col-start-10"
            loose
          >
            <div className="hairline pt-5">
              <p className="label text-accent">{person.credential.label}</p>
              <a
                href={person.credential.url}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline mt-2 inline-block font-display text-[1.375rem] leading-tight"
                style={{ fontVariationSettings: "'opsz' 24" }}
              >
                {person.credential.brand}
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
