import { Reveal, RevealItem, StaggerGroup } from '@/components/motion/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { hasTestimonials, testimonials } from '@/content/site'

/**
 * Prova social.
 *
 * Só existe com depoimentos reais e autorizados em `content/site.ts`.
 * Sem eles, a seção não é renderizada. Nenhum número de clientes, nenhum
 * tempo de mercado, nenhum superlativo: é preferível não ter a seção a
 * ter uma seção inventada.
 */
export function Testimonials() {
  if (!hasTestimonials) return null

  return (
    <section id="depoimentos" className="section-y relative">
      <div className="shell">
        <SectionHeading index="06" label="Depoimentos" />

        <StaggerGroup
          className="mt-14 grid grid-cols-12 gap-x-6 gap-y-12 lg:mt-20"
          gap={0.1}
        >
          {testimonials.map((item) => (
            <RevealItem
              as="figure"
              key={item.quote.slice(0, 32)}
              className="col-span-12 sm:col-span-6 lg:col-span-4"
            >
              <blockquote className="display-sm text-[clamp(1.25rem,2vw,1.625rem)] leading-[1.35]">
                &ldquo;{item.quote}&rdquo;
              </blockquote>
              <figcaption className="hairline mt-6 pt-4 label">
                {item.author}
                {item.context && (
                  <span className="text-muted"> — {item.context}</span>
                )}
              </figcaption>
            </RevealItem>
          ))}
        </StaggerGroup>
      </div>

      <Reveal className="sr-only">
        <span>Depoimentos publicados com autorização.</span>
      </Reveal>
    </section>
  )
}
