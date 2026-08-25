/**
 * Monograma da marca — o "JB" dentro do retângulo, como no logotipo do
 * Bormann Jr Concept.
 *
 * É uma reconstrução tipográfica, feita com a fonte do próprio site: fiel ao
 * arranjo (moldura, letras entrelaçadas, traço fino) sem ser um decalque do
 * desenho original.
 *
 * QUANDO O ARQUIVO OFICIAL CHEGAR: salve o SVG em
 * `public/images/brand/monograma.svg` e troque o corpo deste componente por
 * um `<img>` ou pelo SVG inline. Só este arquivo muda — header e rodapé
 * continuam iguais.
 */
export function BrandMark({
  className = '',
  title,
}: {
  className?: string
  /** Se informado, o monograma vira imagem com nome acessível. */
  title?: string
}) {
  return (
    <svg
      viewBox="0 0 44 56"
      className={`block ${className}`}
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : 'true'}
      focusable="false"
    >
      {/* Moldura de traço fino. */}
      <rect
        x="0.6"
        y="0.6"
        width="42.8"
        height="54.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />

      {/*
        J e B entrelaçados: o B avança sobre a haste do J, que é o que dá ao
        monograma a leitura de peça única em vez de duas letras vizinhas.
      */}
      <text
        x="13"
        y="38"
        textAnchor="middle"
        fill="currentColor"
        style={{ fontFamily: 'var(--font-sans)', fontSize: '30px', fontWeight: 300 }}
      >
        J
      </text>
      <text
        x="27"
        y="38"
        textAnchor="middle"
        fill="currentColor"
        style={{ fontFamily: 'var(--font-sans)', fontSize: '30px', fontWeight: 300 }}
      >
        B
      </text>
    </svg>
  )
}

/**
 * Assinatura completa: monograma + wordmark + tagline, empilhados como no
 * logotipo. Usada no rodapé; o header usa só o monograma com o nome ao lado.
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
        <p className="font-sans text-[clamp(0.9rem,2.4vw,1.25rem)] font-light uppercase leading-none tracking-[0.2em]">
          {wordmark}
        </p>
        <p className="label mt-2 tracking-[0.34em]">{tagline}</p>
      </div>
    </div>
  )
}
