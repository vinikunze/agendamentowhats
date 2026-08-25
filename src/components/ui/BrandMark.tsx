import Image from 'next/image'
import { brand } from '@/content/site'

/**
 * A marca no site.
 *
 * POR QUE NÃO HÁ UM MONOGRAMA DESENHADO AQUI
 * O logotipo do Bormann Jr Concept tem um monograma "JB" entrelaçado dentro
 * de uma moldura — um desenho de letras específico, registrado. Redesenhá-lo
 * de olho, a partir de uma imagem, produz algo *parecido* e errado: proporção,
 * entrelaçamento e espessura nunca batem. Um logotipo quase certo passa pior
 * impressão do que logotipo nenhum.
 *
 * Então, enquanto o arquivo original não chega, a marca aparece só como
 * assinatura tipográfica — que é fiel, porque é o nome dele na tipografia do
 * site.
 *
 * PARA COLOCAR O LOGOTIPO REAL
 *   1. salve o arquivo em `public/images/brand/` (SVG de preferência; PNG com
 *      fundo transparente também serve);
 *   2. preencha `brand.monogram` / `brand.logo` em `src/content/site.ts`.
 * O monograma volta a aparecer no header e no rodapé, sem mexer em mais nada.
 */

type MarkProps = {
  className?: string
  /** Nome acessível. Sem ele, a marca é tratada como decorativa. */
  title?: string
}

/**
 * Monograma. Só renderiza se o arquivo real tiver sido configurado —
 * caso contrário devolve `null` e quem chama simplesmente não mostra nada.
 */
export function BrandMark({ className = '', title }: MarkProps) {
  if (!brand.monogram) return null

  return (
    <Image
      src={brand.monogram.src}
      alt={title ?? ''}
      width={brand.monogram.width}
      height={brand.monogram.height}
      priority
      className={className}
      aria-hidden={title ? undefined : 'true'}
    />
  )
}

/**
 * Assinatura da marca: monograma (quando existir) + wordmark + tagline.
 * Usada no rodapé.
 */
export function BrandLockup({
  wordmark,
  tagline,
  className = '',
}: {
  wordmark: string
  tagline: string
  className?: string
}) {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <BrandMark className="h-12 w-auto shrink-0" />

      <div className="min-w-0">
        <p className="font-sans text-[clamp(0.95rem,2.4vw,1.2rem)] font-light uppercase leading-none tracking-[0.2em]">
          {wordmark}
        </p>
        {/* Assinatura confirmada no logotipo — texto, não desenho. */}
        <p className="label mt-2.5 tracking-[0.32em]">{tagline}</p>
      </div>
    </div>
  )
}
