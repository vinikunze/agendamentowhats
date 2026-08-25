'use client'

import { motion, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { EASE, maskReveal, still, viewport, viewportLoose } from '@/lib/motion'

type Props = {
  children: ReactNode
  className?: string
  delay?: number
  loose?: boolean
  /**
   * Para `next/image` com `fill`: o invólucro externo recebe `relative` e o
   * interno vira `absolute inset-0`, dando à imagem uma caixa dimensionada.
   * Sem isto, o interno é um bloco comum que apenas envolve o conteúdo.
   */
  fill?: boolean
}

/**
 * Fotografia revelada por uma cortina que sobe (clip-path).
 *
 * São DOIS elementos, e isso é essencial: o de fora é observado, o de dentro
 * é recortado.
 *
 * Um elemento recortado em `inset(100%)` tem área visível zero, e o
 * IntersectionObserver — que é o que faz o `whileInView` funcionar — calcula
 * a interseção já considerando esse recorte. Resultado: a razão de
 * interseção é sempre 0, o gatilho nunca dispara e a imagem fica escondida
 * para sempre. A animação impediria a si mesma de começar.
 *
 * Separando os papéis, o observado nunca é recortado, e a cortina roda no
 * filho por propagação de variantes.
 */
export function MaskReveal({
  children,
  className = '',
  delay = 0,
  loose = false,
  fill = false,
}: Props) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      className={`${fill ? 'relative ' : ''}${className}`}
      initial="hidden"
      whileInView="show"
      viewport={loose ? viewportLoose : viewport}
    >
      <motion.div
        // O grão e o recorte só entram no modo `fill`, onde o interno é a
        // própria caixa da imagem. No modo bloco o filho traz os seus.
        className={fill ? 'grain absolute inset-0 overflow-hidden' : ''}
        variants={reduced ? still : maskReveal}
        transition={
          reduced ? undefined : { duration: 1.25, ease: EASE, delay }
        }
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
