'use client'

import { motion, useReducedMotion, type Variants } from 'motion/react'
import type { ElementType, ReactNode } from 'react'
import { fadeUp, stagger, still, viewport, viewportLoose } from '@/lib/motion'

type RevealProps = {
  /** Opcional: elementos puramente gráficos (um filete, por exemplo) não têm conteúdo. */
  children?: ReactNode
  /** Elemento renderizado. Mantém o HTML semântico correto. */
  as?: ElementType
  className?: string
  /** Atraso antes de iniciar, em segundos. */
  delay?: number
  /** Variante própria. Por padrão, o fade-up da casa. */
  variants?: Variants
  /** Blocos altos disparam com menos área visível. */
  loose?: boolean
}

/**
 * Envelope de entrada. Anima uma vez, quando entra em cena.
 *
 * Com `prefers-reduced-motion`, troca as variantes por um estado estático:
 * o conteúdo aparece imediatamente, no lugar certo, sem animação alguma.
 */
export function Reveal({
  children,
  as = 'div',
  className,
  delay = 0,
  variants,
  loose = false,
}: RevealProps) {
  const reduced = useReducedMotion()
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div

  return (
    <MotionTag
      className={className}
      variants={reduced ? still : (variants ?? fadeUp)}
      initial="hidden"
      whileInView="show"
      viewport={loose ? viewportLoose : viewport}
      transition={reduced ? undefined : { delay }}
    >
      {children}
    </MotionTag>
  )
}

type StaggerProps = {
  children: ReactNode
  as?: ElementType
  className?: string
  delay?: number
  /** Intervalo entre os filhos, em segundos. */
  gap?: number
  loose?: boolean
}

/**
 * Contêiner que escalona os filhos. Cada filho deve ser um
 * `<RevealItem>` (ou qualquer motion component com as variantes hidden/show).
 */
export function StaggerGroup({
  children,
  as = 'div',
  className,
  delay = 0,
  gap = 0.08,
  loose = false,
}: StaggerProps) {
  const reduced = useReducedMotion()
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div

  return (
    <MotionTag
      className={className}
      variants={reduced ? still : stagger(delay, gap)}
      initial="hidden"
      whileInView="show"
      viewport={loose ? viewportLoose : viewport}
    >
      {children}
    </MotionTag>
  )
}

type ItemProps = {
  children: ReactNode
  as?: ElementType
  className?: string
  variants?: Variants
}

/** Filho de um `StaggerGroup`. Herda o timing do pai. */
export function RevealItem({
  children,
  as = 'div',
  className,
  variants,
}: ItemProps) {
  const reduced = useReducedMotion()
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div

  return (
    <MotionTag className={className} variants={reduced ? still : (variants ?? fadeUp)}>
      {children}
    </MotionTag>
  )
}
