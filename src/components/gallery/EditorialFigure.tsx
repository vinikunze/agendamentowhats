import Image from 'next/image'
import { blurFor, type Img } from '@/content/images'

type Props = {
  image: Img
  index: number
  sizes: string
  className?: string
  /** Prioriza a primeira imagem visível da galeria. */
  eager?: boolean
  /**
   * Altura fixa da mídia (ex.: '62vh'). Quando definida, a largura passa a
   * derivar da proporção da foto — é assim que a fita horizontal consegue
   * alinhar imagens de formatos diferentes num mesmo eixo.
   * Sem ela, a imagem ocupa a largura do contêiner.
   */
  mediaHeight?: string
}

/**
 * Uma fotografia da galeria.
 *
 * Sem card, sem borda, sem sombra: a imagem é o objeto. Os metadados
 * (índice e legenda) ficam abaixo, em corpo pequeno, como numa ficha
 * técnica — e o hover apenas aproxima a imagem 2%.
 */
export function EditorialFigure({
  image,
  index,
  sizes,
  className = '',
  eager,
  mediaHeight,
}: Props) {
  return (
    <figure className={`group/fig ${className}`}>
      <div
        className="grain relative overflow-hidden"
        style={{
          aspectRatio: `${image.width} / ${image.height}`,
          ...(mediaHeight ? { height: mediaHeight, width: 'auto' } : undefined),
        }}
      >
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          loading={eager ? 'eager' : 'lazy'}
          placeholder={blurFor(image.src) ? 'blur' : 'empty'}
          blurDataURL={blurFor(image.src)}
          className="object-cover transition-transform duration-[900ms] ease-[var(--ease-editorial)] group-hover/fig:scale-[1.02] motion-reduce:transition-none motion-reduce:group-hover/fig:scale-100"
        />
      </div>

      <figcaption className="mt-4 flex items-baseline gap-3">
        <span className="label text-accent">
          {String(index + 1).padStart(2, '0')}
        </span>
        {image.caption && <span className="label">{image.caption}</span>}
      </figcaption>
    </figure>
  )
}
