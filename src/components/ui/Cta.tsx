import type { ReactNode } from 'react'

type Variant = 'solid' | 'outline' | 'bare'

type CtaProps = {
  href: string
  children: ReactNode
  variant?: Variant
  /** Abre em nova aba com rel de segurança. */
  external?: boolean
  className?: string
  /** Texto extra só para leitor de tela, quando o rótulo visível é curto. */
  srSuffix?: string
}

/**
 * Chamada para ação. Retângulo, não pílula — o raio é 0 de propósito.
 * O preenchimento entra por baixo, com uma cortina que sobe: o mesmo gesto
 * das máscaras do resto do site, em escala de botão.
 */
export function Cta({
  href,
  children,
  variant = 'solid',
  external = false,
  className = '',
  srSuffix,
}: CtaProps) {
  const base =
    'group/cta relative inline-flex items-center gap-3 overflow-hidden px-7 py-4 font-sans text-label uppercase tracking-[0.18em] font-medium transition-colors duration-[var(--dur)] ease-[var(--ease-editorial)]'

  const skins: Record<Variant, string> = {
    solid:
      'bg-foreground text-background hover:text-background border border-foreground',
    outline:
      'border border-line-strong text-foreground hover:text-background',
    bare: 'px-0 py-2 border-b border-line-strong text-foreground hover:text-accent',
  }

  const external_props = external
    ? { target: '_blank', rel: 'noopener noreferrer' }
    : {}

  return (
    <a href={href} className={`${base} ${skins[variant]} ${className}`} {...external_props}>
      {/* Cortina de hover — só no outline, onde há fundo a preencher. */}
      {variant === 'outline' && (
        <span
          aria-hidden="true"
          className="absolute inset-0 -z-0 origin-bottom scale-y-0 bg-foreground transition-transform duration-[var(--dur)] ease-[var(--ease-editorial)] group-hover/cta:scale-y-100"
        />
      )}
      <span className="relative z-10">{children}</span>
      {srSuffix && <span className="sr-only">{srSuffix}</span>}
      <span aria-hidden="true" className="arrow-slide relative z-10 text-[1.1em] leading-none">
        &#8594;
      </span>
    </a>
  )
}
