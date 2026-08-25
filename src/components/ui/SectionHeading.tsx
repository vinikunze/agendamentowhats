import { Reveal } from '@/components/motion/Reveal'
import { drawLine } from '@/lib/motion'

type Props = {
  /** Numeração editorial: 01, 02, 03… */
  index: string
  /** Rótulo curto da seção. */
  label: string
  className?: string
}

/**
 * Cabeçalho de seção: índice, filete que se desenha, rótulo.
 * A mesma marca métrica repetida em todas as seções — é o que dá ao
 * conjunto a leitura de sumário de revista.
 */
export function SectionHeading({ index, label, className = '' }: Props) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <Reveal as="span" className="label text-accent">
        {index}
      </Reveal>
      {/* filete que se desenha da esquerda para a direita */}
      <Reveal
        as="span"
        variants={drawLine}
        className="h-px w-10 origin-left bg-line-strong sm:w-16"
      />
      <Reveal as="span" className="label" delay={0.08}>
        {label}
      </Reveal>
    </div>
  )
}
