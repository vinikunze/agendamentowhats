'use client'

import { ReactLenis } from 'lenis/react'
import type { ReactNode } from 'react'

/**
 * Scroll suave — sem sequestrar nada.
 *
 * Decisões:
 * · `syncTouch` fica desligado (padrão). No celular o scroll é o nativo,
 *   com o momentum do sistema. Lenis só atua em ponteiro/roda.
 * · `respectReducedMotion` é `true` por padrão no Lenis: quem pede menos
 *   movimento recebe scroll 1:1, sem interpolação.
 * · `anchors` cuida dos links internos com o deslocamento do header fixo,
 *   então nenhum destino aparece escondido atrás da barra.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        wheelMultiplier: 1,
        anchors: { offset: -96 },
        allowNestedScroll: true,
      }}
    >
      {children}
    </ReactLenis>
  )
}
