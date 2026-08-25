import { LineReveal } from '@/components/motion/LineReveal'
import { Reveal } from '@/components/motion/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Cta } from '@/components/ui/Cta'
import {
  courses,
  draftCopy,
  hasCourses,
  person,
  sectionIndex,
  whatsappCoursesUrl,
} from '@/content/site'

const { courses: copy } = draftCopy

/**
 * Cursos VIPs.
 *
 * A bio de @bormannjr anuncia os cursos, mas não publica formato, datas,
 * conteúdo nem preço — então o site anuncia a existência e leva à conversa.
 * Nada de carga horária, número de vagas ou promessa de resultado inventados.
 *
 * É também a seção que sustenta a autoridade da marca pessoal: quem ensina
 * ocupa um lugar diferente de quem só executa.
 */
export function Courses() {
  if (!hasCourses || !whatsappCoursesUrl) return null

  return (
    // Faixa compacta entre filetes, não uma seção cheia: o conteúdo público
    // sobre os cursos é curto, e esticá-lo em meia tela abriria um vazio que
    // pareceria seção faltando conteúdo em vez de respiro deliberado.
    <section id="cursos" className="relative py-[clamp(3.5rem,8vh,6rem)]">
      <div className="shell">
        <div className="hairline pt-[clamp(2.5rem,6vh,4.5rem)]">
          <SectionHeading index={sectionIndex.cursos} label={copy.label} />

          <div className="mt-10 grid grid-cols-12 items-end gap-x-6 gap-y-8 lg:mt-12">
            <div className="col-span-12 lg:col-span-7">
              <LineReveal
                as="h2"
                lines={[courses.name]}
                className="display text-display"
              />

            {/* Credencial real, repetida aqui porque é o que dá lastro ao curso. */}
              <Reveal className="mt-6" delay={0.1}>
                <p className="label">
                  {person.credential.label} {person.credential.brand}
                  <span aria-hidden="true" className="mx-2 text-accent">
                    /
                  </span>
                  {person.title}
                </p>
              </Reveal>
            </div>

            <div className="col-span-12 flex flex-col gap-7 lg:col-span-4 lg:col-start-9">
              <Reveal>
                <p className="measure text-body leading-[1.75] text-muted">
                  {courses.detail ?? copy.body}
                </p>
              </Reveal>

              <Reveal delay={0.1}>
                <Cta href={whatsappCoursesUrl} external variant="outline">
                  {copy.cta}
                </Cta>
              </Reveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
