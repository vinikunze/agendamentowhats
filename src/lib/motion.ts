import type { Transition, Variants } from 'motion/react'

/**
 * Vocabulário de movimento do projeto.
 *
 * Regras: só `opacity`, `transform` e `clip-path` — propriedades que o
 * compositor resolve sem layout nem repaint. Nada de bounce, spring elástico
 * ou overshoot: a curva é uma expo-out, que chega rápido e assenta devagar.
 */

/** Expo-out. Entra com energia, pousa sem barulho. */
export const EASE = [0.16, 1, 0.3, 1] as const

/** Simétrica — para o que sai e volta (menus, hovers). */
export const EASE_INOUT = [0.65, 0, 0.35, 1] as const

export const DUR = {
  fast: 0.24,
  base: 0.52,
  slow: 0.9,
  reveal: 1.1,
} as const

export const transition = {
  base: { duration: DUR.base, ease: EASE },
  slow: { duration: DUR.slow, ease: EASE },
  reveal: { duration: DUR.reveal, ease: EASE },
} satisfies Record<string, Transition>

/** Quanto do elemento precisa entrar em cena antes de disparar. */
export const viewport = { once: true, amount: 0.25 } as const

/** Viewport frouxo — para blocos altos que nunca cabem inteiros na tela. */
export const viewportLoose = { once: true, amount: 0.12 } as const

/* -------------------------------------------------------------------------- */
/* Variantes                                                                  */
/* -------------------------------------------------------------------------- */

/** Sobe e aparece. O gesto padrão do site. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: transition.slow },
}

/** Só opacidade — para o que não deve se mexer (imagens já posicionadas). */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: transition.slow },
}

/** Contêiner que escalona os filhos. */
export const stagger = (delayChildren = 0, staggerChildren = 0.08): Variants => ({
  hidden: {},
  show: { transition: { delayChildren, staggerChildren } },
})

/**
 * Linha de texto que sobe por trás de uma máscara.
 * Precisa de um pai com `overflow: hidden`.
 */
export const lineUp: Variants = {
  hidden: { y: '110%' },
  show: { y: '0%', transition: transition.reveal },
}

/**
 * Fotografia revelada por clip-path, de baixo para cima.
 *
 * ATENÇÃO: use sempre pelo componente `<MaskReveal>`, ou como filho de um
 * `<StaggerGroup>`. Nunca passe estas variantes para um elemento que seja
 * ele próprio o alvo de `whileInView`: recortado a zero, ele nunca é
 * considerado visível pelo IntersectionObserver e a revelação trava.
 */
export const maskReveal: Variants = {
  hidden: { clipPath: 'inset(100% 0% 0% 0%)' },
  show: {
    clipPath: 'inset(0% 0% 0% 0%)',
    transition: { duration: 1.25, ease: EASE },
  },
}

/** Filete que se desenha da esquerda para a direita. */
export const drawLine: Variants = {
  hidden: { scaleX: 0 },
  show: {
    scaleX: 1,
    transition: { duration: DUR.reveal, ease: EASE },
  },
}

/**
 * Versão neutra: quando o usuário pede movimento reduzido, os elementos
 * já nascem no estado final. O conteúdo aparece, apenas sem coreografia.
 */
export const still: Variants = {
  hidden: { opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)', scaleX: 1 },
  show: { opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)', scaleX: 1 },
}
