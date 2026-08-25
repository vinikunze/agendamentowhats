'use client'

import { motion, useReducedMotion } from 'motion/react'
import type { ElementType } from 'react'
import { lineUp, stagger, still, viewport } from '@/lib/motion'

type LineRevealProps = {
  /** Cada string é uma linha. A quebra é editorial, não automática. */
  lines: readonly string[]
  as?: ElementType
  className?: string
  /** Classe aplicada a cada linha (tamanho, peso, alinhamento). */
  lineClassName?: string
  /**
   * Destaca a última linha no acento.
   * Existe como prop porque a variante `last:` do Tailwind não serve aqui —
   * cada linha é filha única do próprio invólucro, então `last:` acertaria
   * todas elas.
   */
  accentLastLine?: boolean
  delay?: number
  gap?: number
  /** Anima na montagem em vez de esperar o scroll. Usado no hero. */
  immediate?: boolean
}

/**
 * Headline em que cada linha sobe por trás da linha de base.
 *
 * O texto é um único elemento semântico com as linhas dentro — leitores de
 * tela recebem a frase inteira, não fragmentos soltos.
 */
export function LineReveal({
  lines,
  as = 'h2',
  className,
  lineClassName,
  accentLastLine = false,
  delay = 0,
  gap = 0.09,
  immediate = false,
}: LineRevealProps) {
  const reduced = useReducedMotion()
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.h2

  const animation = immediate
    ? { animate: 'show' as const }
    : { whileInView: 'show' as const, viewport }

  return (
    <MotionTag
      className={className}
      variants={reduced ? still : stagger(delay, gap)}
      initial="hidden"
      {...animation}
    >
      {lines.map((line, i) => (
        // `pb` dá folga para as descendentes (g, y, p) não serem cortadas
        // pela máscara; o `mb` negativo devolve o espaço ao ritmo vertical.
        <span
          key={i}
          className="block overflow-hidden pb-[0.12em] -mb-[0.12em]"
        >
          <motion.span
            className={`block ${
              accentLastLine && i === lines.length - 1 ? 'text-accent' : ''
            } ${lineClassName ?? ''}`}
            variants={reduced ? still : lineUp}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  )
}
