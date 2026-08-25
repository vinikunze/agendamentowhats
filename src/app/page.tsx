import { Footer } from '@/components/layout/Footer'
import { Concept } from '@/components/sections/Concept'
import { Courses } from '@/components/sections/Courses'
import { FinalCta } from '@/components/sections/FinalCta'
import { Hero } from '@/components/sections/Hero'
import { InstagramStrip } from '@/components/sections/InstagramStrip'
import { Manifesto } from '@/components/sections/Manifesto'
import { Services } from '@/components/sections/Services'
import { Testimonials } from '@/components/sections/Testimonials'
import { Work } from '@/components/sections/Work'

/**
 * A homepage.
 *
 * O ritmo é deliberado: impacto, respiro, densidade, virada de superfície,
 * respiro, fecho.
 *
 *   HERO          fotografia em escala, tipografia grande
 *   ASSINATURA    espaço negativo, uma frase
 *   TRABALHO      densidade máxima — a galeria
 *   CONCEPT       vira para o claro; o espaço
 *   SERVIÇOS      só aparece com dados confirmados
 *   CURSOS        formação — o que sustenta a autoridade da marca pessoal
 *   DEPOIMENTOS   só aparece com dados confirmados
 *   INSTAGRAM     respiro, volta ao escuro
 *   CONTATO       fecho
 */
export default function Home() {
  return (
    <>
      <main id="conteudo">
        <Hero />
        <Manifesto />
        <Work />

        {/* A virada para a superfície clara acontece aqui. */}
        <Concept />
        <Services />
        <Courses />
        <Testimonials />

        <InstagramStrip />
        <FinalCta />
      </main>
      <Footer />
    </>
  )
}
