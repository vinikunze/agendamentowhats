import { WorkGallery } from '@/components/gallery/WorkGallery'
import { Reveal } from '@/components/motion/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { draftCopy, sectionIndex } from '@/content/site'

const { work } = draftCopy

export function Work() {
  return (
    <section id="trabalho" className="relative pb-[clamp(4rem,10vh,8rem)] pt-[var(--section-y)]">
      <div className="shell">
        <SectionHeading index={sectionIndex.trabalho} label={work.label} />

        <div className="mt-12 grid grid-cols-12 items-end gap-x-6 gap-y-6 lg:mt-16">
          <Reveal className="col-span-12 lg:col-span-6">
            <h2 className="display text-display">{work.title}</h2>
          </Reveal>

          <Reveal className="col-span-12 lg:col-span-4 lg:col-start-9" delay={0.1}>
            <p className="measure text-body leading-[1.75] text-muted">{work.intro}</p>
          </Reveal>
        </div>
      </div>

      <div className="mt-[clamp(3rem,7vw,6rem)]">
        <WorkGallery />
      </div>
    </section>
  )
}
